export interface User {
  id: string;
  email?: string | null;
  is_premium?: boolean;
}

export interface AuthResponse {
  access_token?: string | null;
  refresh_token?: string | null;
  token_type: string;
  user: User;
  needs_email_confirmation: boolean;
}

export interface Chat {
  id: string;
  user_id?: string | null;
  name: string;
  emoji: string;
  image_url?: string | null;
  personality?: string | null;
  created_at?: string | null;
  last_message?: string | null;
  last_message_at?: string | null;
  last_message_role?: string | null;
}

export interface Message {
  id: string;
  chat_id: string;
  role: "user" | "assistant";
  content: string;
  mood_tag?: string | null;
  used_memory: boolean;
  created_at?: string | null;
}

export interface MessageListResponse {
  items: Message[];
  next_before?: string | null;
}

export interface ConversationResponse {
  user_message: Message;
  ai_message: Message;
  rate_limited: boolean;
  model_used?: string | null;
}

export interface Memory {
  id: string;
  content: string;
  created_at?: string | null;
  similarity?: number | null;
}

export interface BreathingExercise {
  id: string;
  title: string;
  inhale: number;
  hold: number;
  exhale: number;
  hold_after_exhale: number;
  description: string;
}

export interface GroundingTechnique {
  title: string;
  intro: string;
  steps: Array<{
    count: number;
    sense: string;
    prompt: string;
  }>;
}

export interface MeditationScript {
  id: string;
  title: string;
  duration_minutes: number;
  script: string;
}
