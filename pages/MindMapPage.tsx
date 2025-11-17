
import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { BrandVoice, MindMapNode, ApiResponse } from '../types';
import { generateMindMapSubTopics, generateContentIdeasForNode, generateContentStrategy, generateImage } from '../services/geminiService';
import { GitBranchIcon, SparklesIcon, BrainCircuitIcon, PenIcon, CameraIcon, PlusIcon, CloseIcon } from '../components/Icons';
import { CopyButton } from '../components/CopyButton';

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

const NodeComponent: React.FC<{ node: MindMapNode; onExpand: (node: MindMapNode) => void; onAction: (node: MindMapNode, action: 'content' | 'image') => void; level: number }> = ({ node, onExpand, onAction, level }) => {
    const isExpandable = node.type === 'sub-topic' && node.children.length === 0 && !node.isLoading;
    const colors = [
        'border-blue-500', // level 0
        'border-teal-500', // level 1
        'border-purple-500', // level 2
    ];
    const borderColor = colors[level % colors.length];

    return (
        <div className="flex items-center my-2">
            <div className={`relative glass-panel p-3 rounded-lg shadow-md flex-1 border-r-4 ${borderColor}`}>
                 <div className="flex justify-between items-center">
                    <p className="text-slate-200">{node.text}</p>
                    <div className="flex items-center gap-2 flex-shrink-0 mr-2">
                        {node.isLoading && <div className="w-4 h-4 border-2 border-slate-500 border-t-slate-200 rounded-full animate-spin"></div>}
                        {isExpandable && (
                            <button onClick={() => onExpand(node)} className="p-1 bg-slate-700/50 hover:bg-slate-600/50 rounded-full" title="توسيع الفكرة">
                                <PlusIcon className="w-4 h-4" />
                            </button>
                        )}
                        {node.type === 'idea' && (
                            <>
                                <button onClick={() => onAction(node, 'content')} className="p-1 bg-slate-700/50 hover:bg-slate-600/50 rounded-full" title="تحويل لمحتوى">
                                    <PenIcon className="w-4 h-4 text-blue-300" />
                                </button>
                                <button onClick={() => onAction(node, 'image')} className="p-1 bg-slate-700/50 hover:bg-slate-600/50 rounded-full" title="توليد صورة">
                                    <CameraIcon className="w-4 h-4 text-teal-300" />
                                </button>
                            </>
                        )}
                    </div>
                 </div>
            </div>
             {node.children.length > 0 && <div className={`w-8 h-px bg-slate-600`}></div>}
            {node.children.length > 0 && (
                <div className="pl-4 border-r-2 border-slate-600">
                    {node.children.map(child => <NodeComponent key={child.id} node={child} onExpand={onExpand} onAction={onAction} level={level + 1} />)}
                </div>
            )}
        </div>
    );
};

const ActionModal: React.FC<{ node: MindMapNode; action: 'content' | 'image'; brandVoice?: BrandVoice; onClose: () => void }> = ({ node, action, brandVoice, onClose }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [content, setContent] = useState<ApiResponse | null>(null);
    const [image, setImage] = useState<string | null>(null);

    React.useEffect(() => {
        const performAction = async () => {
            setIsLoading(true);
            setError(null);
            try {
                if (action === 'content') {
                     const response = await generateContentStrategy({
                        user_idea: node.text,
                        brand_voice: brandVoice || { tone: '', audience: '', keywords: '', goals: ''},
                        context_vectors: ''
                    });
                    setContent(response);
                } else if (action === 'image') {
                    const imgB64 = await generateImage(node.text);
                    setImage(imgB64);
                }
            } catch (err) {
                 setError(`فشل توليد ${action === 'content' ? 'المحتوى' : 'الصورة'}.`);
            } finally {
                setIsLoading(false);
            }
        };
        performAction();
    }, [node, action, brandVoice]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="glass-panel p-6 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-teal-300">
                        {action === 'content' ? 'المحتوى المولّد' : 'الصورة المولّدة'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700/50 rounded-full"><CloseIcon className="w-6 h-6"/></button>
                </div>
                {isLoading && <div className="flex justify-center p-8"><BrainCircuitIcon className="w-12 h-12 animate-pulse"/></div>}
                {error && <p className="text-red-400">{error}</p>}
                {content && (
                    <div className="space-y-4 glass-panel-darker p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                           <h4 className="font-bold text-blue-300">نص البوست:</h4>
                           <CopyButton textToCopy={content.contentCreation.post_text} />
                        </div>
                        <p className="whitespace-pre-wrap">{content.contentCreation.post_text}</p>
                        <h4 className="font-bold text-teal-300 pt-2">الهاشتاقات:</h4>
                        <div className="flex flex-wrap gap-2">
                           {content.contentCreation.hashtags.map(tag => <span key={tag} className="bg-blue-900/50 text-blue-300 text-sm px-2 py-1 rounded-full">{tag}</span>)}
                        </div>
                    </div>
                )}
                {image && <img src={`data:image/jpeg;base64,${image}`} alt="Generated visual" className="rounded-lg w-full"/>}
            </div>
        </div>
    );
};


const MindMapPage: React.FC = () => {
    const [mainTopic, setMainTopic] = useState('');
    const [mapData, setMapData] = useState<MindMapNode | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [savedVoices] = useLocalStorage<BrandVoice[]>('savedBrandVoices', []);
    const [selectedVoiceId, setSelectedVoiceId] = useState<string>('');

    const [modalState, setModalState] = useState<{ node: MindMapNode; action: 'content' | 'image' } | null>(null);

    const updateNodeLoadingState = (nodeId: string, isLoading: boolean) => {
        setMapData(prevData => {
            if (!prevData) return null;
            const updateRecursively = (node: MindMapNode): MindMapNode => {
                if (node.id === nodeId) {
                    return { ...node, isLoading };
                }
                return { ...node, children: node.children.map(updateRecursively) };
            };
            return updateRecursively(prevData);
        });
    };

    const addChildrenToNode = (nodeId: string, children: MindMapNode[]) => {
         setMapData(prevData => {
            if (!prevData) return null;
            const updateRecursively = (node: MindMapNode): MindMapNode => {
                if (node.id === nodeId) {
                    return { ...node, children, isLoading: false };
                }
                return { ...node, children: node.children.map(updateRecursively) };
            };
            return updateRecursively(prevData);
        });
    };

    const handleGenerateMap = async () => {
        if (!mainTopic.trim()) return;
        setIsLoading(true);
        setError(null);
        setMapData(null);
        const selectedVoice = savedVoices.find(v => v.id === selectedVoiceId);

        try {
            const response = await generateMindMapSubTopics(mainTopic, selectedVoice);
            const mainNode: MindMapNode = {
                id: uuidv4(),
                text: mainTopic,
                parentId: null,
                type: 'main',
                isLoading: false,
                children: response.sub_topics.map(subTopic => ({
                    id: uuidv4(),
                    text: subTopic,
                    parentId: 'main',
                    type: 'sub-topic',
                    isLoading: false,
                    children: [],
                })),
            };
            setMapData(mainNode);
        } catch (err) {
            setError('فشل في توليد المحاور الرئيسية. حاول مرة أخرى.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleExpandNode = async (node: MindMapNode) => {
        updateNodeLoadingState(node.id, true);
        const selectedVoice = savedVoices.find(v => v.id === selectedVoiceId);
        try {
            const response = await generateContentIdeasForNode(mainTopic, node.text, selectedVoice);
            const childrenNodes: MindMapNode[] = response.ideas.map(idea => ({
                id: uuidv4(),
                text: idea,
                parentId: node.id,
                type: 'idea',
                isLoading: false,
                children: []
            }));
            addChildrenToNode(node.id, childrenNodes);
        } catch (err) {
            console.error(err);
            updateNodeLoadingState(node.id, false);
        }
    };

    const handleNodeAction = (node: MindMapNode, action: 'content' | 'image') => {
        setModalState({ node, action });
    };

    return (
        <div className="max-w-6xl mx-auto">
            {modalState && (
                <ActionModal 
                    node={modalState.node} 
                    action={modalState.action} 
                    brandVoice={savedVoices.find(v => v.id === selectedVoiceId)}
                    onClose={() => setModalState(null)} 
                />
            )}
            <div className="text-center mb-8">
                <GitBranchIcon className="w-12 h-12 mx-auto text-purple-300 mb-2" />
                <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-teal-400">خريطة الأفكار الذهنية</h2>
                <p className="text-slate-400 mt-2">حوّل فكرة واحدة إلى شبكة من المحتوى الإبداعي المنظم.</p>
            </div>

            <div className="glass-panel p-6 rounded-2xl shadow-lg space-y-4 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        type="text"
                        value={mainTopic}
                        onChange={(e) => setMainTopic(e.target.value)}
                        placeholder="اكتب الفكرة المحورية هنا..."
                        className="md:col-span-2 w-full p-3 glass-input rounded-lg"
                    />
                     <select value={selectedVoiceId} onChange={(e) => setSelectedVoiceId(e.target.value)} className="w-full p-3 glass-input rounded-lg">
                        <option value="">تطبيق هوية (اختياري)</option>
                        {savedVoices.map(voice => (
                            <option key={voice.id} value={voice.id}>{voice.name}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={handleGenerateMap}
                    disabled={isLoading || !mainTopic.trim()}
                    className="w-full flex items-center justify-center gap-3 text-lg font-bold py-3 px-6 bg-gradient-to-r from-purple-600 to-teal-500 rounded-lg hover:from-purple-700 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'المارد يتفرع...' : 'ولّد الخريطة'}
                </button>
            </div>
            
            <div className="mt-8 min-h-[300px]">
                {isLoading && <div className="flex justify-center p-8"><BrainCircuitIcon className="w-16 h-16 animate-pulse"/></div>}
                {error && <p className="text-red-400 text-center">{error}</p>}
                {mapData && <NodeComponent node={mapData} onExpand={handleExpandNode} onAction={handleNodeAction} level={0} />}
            </div>
        </div>
    );
};

export default MindMapPage;