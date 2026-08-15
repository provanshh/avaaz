export type AgentCategory = "business" | "personal" | "other" | "student";

export type VoicePersonality = "friendly" | "professional" | "warm" | "energetic";

export type VoiceSessionState = "idle" | "listening" | "processing" | "speaking";

export type TranscriptTurn = {
  role: "user" | "assistant";
  text: string;
};

export type AgentKnowledge = {
  name: string;
  category: string;
  description: string;
  location: string;
  phone: string;
  email: string;
  website: string;
  opening_hours: string;
  products: string[];
  services: string[];
  pricing: string[];
  faqs: { question: string; answer: string }[] | string[];
  important_information: string[];
  personality: string;
  additional_knowledge: string;
  logo: string;
};

export type AgentRecord = AgentKnowledge & {
  id: string;
  slug: string;
  knowledge: string;
  voice: VoicePersonality;
  followers_count?: number;
  created_at: string;
  updated_at: string;
};

export type AgentFileRecord = {
  id: string;
  agent_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  extracted_text: string;
  created_at: string;
};

export type CreateFlowState = {
  category: AgentCategory | null;
  websiteUrl: string;
  websiteText: string;
  missingFields: string[];
  transcript: TranscriptTurn[];
  knowledge: AgentKnowledge | null;
  files: {
    name: string;
    type: string;
    extractedText: string;
  }[];
  voice: VoicePersonality;
};

export type AppStatus = {
  openrouter: boolean;
  supabase: boolean;
};
