import React, { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { UserInput, ApiResponse, BrandVoice, HistoryItem } from '../types';
import { generateContentStrategy, generateImage } from '../services/geminiService';
import InputForm from '../components/InputForm';
import OutputDisplay from '../components/OutputDisplay';
import SCAMPERModal from '../components/SCAMPERModal';

const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  return [storedValue, setValue];
};

const initialUserInput: UserInput = {
    user_idea: '',
    brand_voice: {
      tone: '',
      audience: '',
      keywords: '',
      goals: ''
    },
    context_vectors: ''
};

interface ContentGeneratorProps {
    setActiveView: (view: any, payload?: any) => void;
    initialIdea?: string;
    clearInitialIdea?: () => void;
}

const ContentGenerator: React.FC<ContentGeneratorProps> = ({ setActiveView, initialIdea, clearInitialIdea }) => {
  const [userInput, setUserInput] = useState<UserInput>(initialUserInput);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  
  const [isScamperModalOpen, setIsScamperModalOpen] = useState(false);
  const [scamperInputText, setScamperInputText] = useState('');


  const [savedVoices, setSavedVoices] = useLocalStorage<BrandVoice[]>('savedBrandVoices', []);
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('generationHistory', []);

  useEffect(() => {
    if (initialIdea && clearInitialIdea) {
        setUserInput(prev => ({ ...prev, user_idea: initialIdea }));
        clearInitialIdea();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [initialIdea, clearInitialIdea]);

  const handleSaveVoice = (name: string) => {
      const newVoice: BrandVoice = { ...userInput.brand_voice, id: uuidv4(), name: name };
      setSavedVoices(prev => [...prev, newVoice]);
  };
  
  const handleDeleteVoice = (id: string) => {
      setSavedVoices(prev => prev.filter(voice => voice.id !== id));
      if (userInput.brand_voice.id === id) {
          setUserInput(prev => ({ ...prev, brand_voice: initialUserInput.brand_voice }));
      }
  };

  const regenerateImage = useCallback(async () => {
    if (!apiResponse) return;
    setIsImageLoading(true);
    setGeneratedImage(null);
    try {
        const imageB64 = await generateImage(apiResponse.contentCreation.image_prompt);
        setGeneratedImage(imageB64);
        // Update history item with the new image
        setHistory(prev => prev.map(item => 
            item.apiResponse === apiResponse ? { ...item, generatedImage: imageB64 } : item
        ));
    } catch (err) {
        console.error("Failed to regenerate image", err);
        setError(prev => prev + ' (فشل توليد الصورة)');
    } finally {
        setIsImageLoading(false);
    }
  }, [apiResponse, setHistory]);


  const handleGenerateContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setApiResponse(null);
    setGeneratedImage(null);

    try {
      const response = await generateContentStrategy(userInput);
      setApiResponse(response);
      
      // Now generate image
      setIsImageLoading(true);
      try {
        const imageB64 = await generateImage(response.contentCreation.image_prompt);
        setGeneratedImage(imageB64);
        // Add to history with image
        const historyItem: HistoryItem = {
            id: uuidv4(),
            date: new Date().toISOString(),
            userInput,
            apiResponse: response,
            generatedImage: imageB64,
        };
        setHistory(prev => [historyItem, ...prev]);

      } catch (imageErr) {
          console.error("Image generation failed:", imageErr);
           // Add to history without image
            const historyItem: HistoryItem = {
                id: uuidv4(),
                date: new Date().toISOString(),
                userInput,
                apiResponse: response,
            };
            setHistory(prev => [historyItem, ...prev]);
      } finally {
          setIsImageLoading(false);
      }

    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء توليد المحتوى. الرجاء المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  }, [userInput, setHistory]);

  const handleOpenScamper = (postText: string) => {
    setScamperInputText(postText);
    setIsScamperModalOpen(true);
  };

  const handleIdeaSelectFromScamper = (idea: string) => {
    setUserInput(prev => ({ ...prev, user_idea: idea }));
    setIsScamperModalOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <InputForm
          userInput={userInput}
          setUserInput={setUserInput}
          onGenerate={handleGenerateContent}
          isLoading={isLoading || isImageLoading}
          savedVoices={savedVoices}
          onSaveVoice={handleSaveVoice}
          onDeleteVoice={handleDeleteVoice}
        />
        <OutputDisplay
          response={apiResponse}
          isLoading={isLoading}
          error={error}
          generatedImage={generatedImage}
          isImageLoading={isImageLoading}
          onRegenerateImage={regenerateImage}
          onScamperClick={handleOpenScamper}
        />
      </div>
      {isScamperModalOpen && (
        <SCAMPERModal
          isOpen={isScamperModalOpen}
          onClose={() => setIsScamperModalOpen(false)}
          originalPostText={scamperInputText}
          onIdeaSelect={handleIdeaSelectFromScamper}
        />
      )}
    </>
  );
};

export default ContentGenerator;