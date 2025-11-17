export interface BrandVoice {
  id?: string; // Optional UUID for saved voices
  name?: string; // Name for the saved voice profile
  tone: string;
  audience: string;
  keywords: string;
  goals: string;
}

export interface UserInput {
  user_idea: string;
  brand_voice: BrandVoice;
  context_vectors: string;
}

export interface ContentCreation {
  post_text: string;
  image_prompt: string;
  hashtags: string[];
}

export interface PlatformAdaptation {
  twitter_version: string;
  linkedin_version: string;
}

export interface StrategicInsights {
  hook_suggestion: string[];
  next_step_idea: string;
}

export interface ApiResponse {
  contentCreation: ContentCreation;
  platformAdaptation: PlatformAdaptation;
  strategicInsights: StrategicInsights;
}

export interface HistoryItem {
    id: string;
    date: string;
    userInput: UserInput;
    apiResponse: ApiResponse;
    generatedImage?: string; // base64 string
}


export interface IdeasBankResponse {
  ideas: string[];
}

export interface SubTopicsResponse {
  sub_topics: string[];
}

export interface ContentIdeasResponse {
    ideas: string[];
}

export interface MindMapNode {
    id: string;
    text: string;
    parentId: string | null;
    children: MindMapNode[];
    type: 'main' | 'sub-topic' | 'idea';
    isLoading: boolean;
}

export interface ScamperResponse {
  substitute: string;
  combine: string;
  adapt: string;
  modify: string;
  put_to_another_use: string;
  eliminate: string;
  reverse: string;
}

export interface ScamperSuggestion {
  letter: string;
  title: string;
  idea: string;
}

export interface InstagramAnalysisResult {
    followers: number;
    avgLikes: number;
    engagementRate: string;
    aiInsight: string;
}

// For TrendRadar
export interface TrendSuggestion {
  id: string;
  trendTitle: string;
  draftPost: string;
}