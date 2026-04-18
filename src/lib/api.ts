"use client";

import { getBrowserSupabase } from "@/lib/supabase";
import type {
  AuthResponse,
  BreathingExercise,
  Chat,
  ConversationResponse,
  GroundingTechnique,
  MeditationScript,
  Memory,
  MessageListResponse,
  User,
} from "@/lib/types";

type RequestOptions = RequestInit & {
  auth?: boolean;
};

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
}

async function getAuthHeader() {
  const supabase = getBrowserSupabase();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, headers, ...init } = options;
  const authHeaders = auth ? await getAuthHeader() : {};
  const requestHeaders = new Headers(headers);
  requestHeaders.set("Content-Type", "application/json");
  Object.entries(authHeaders).forEach(([key, value]) => {
    requestHeaders.set(key, value);
  });

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: requestHeaders,
    cache: "no-store",
  });

  if (!response.ok) {
    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    const message =
      typeof data === "object" && data && "detail" in data
        ? String((data as { detail: string }).detail)
        : `Request failed with status ${response.status}`;
    console.error("[Tea] API request failed", {
      path,
      status: response.status,
      message,
      data,
    });
    throw new ApiError(message, response.status, data);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function syncSupabaseSession(auth: AuthResponse) {
  if (!auth.access_token || !auth.refresh_token) {
    return;
  }

  const supabase = getBrowserSupabase();
  await supabase.auth.setSession({
    access_token: auth.access_token,
    refresh_token: auth.refresh_token,
  });
}

export const api = {
  signup(email: string, password: string) {
    return request<AuthResponse>("/api/auth/signup", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ email, password }),
    });
  },
  login(email: string, password: string) {
    return request<AuthResponse>("/api/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ email, password }),
    });
  },
  async logout() {
    const supabase = getBrowserSupabase();
    const { data } = await supabase.auth.getSession();
    const refreshToken = data.session?.refresh_token;
    await request<{ message: string }>("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken ?? null }),
    });
    await supabase.auth.signOut();
  },
  me() {
    return request<User>("/api/auth/me");
  },
  deleteAccount() {
    return request<{ message: string }>("/api/auth/me", { method: "DELETE" });
  },
  listChats() {
    return request<Chat[]>("/api/chats");
  },
  getChat(chatId: string) {
    return request<Chat>(`/api/chats/${chatId}`);
  },
  createChat(name: string, emoji: string) {
    return request<Chat>("/api/chats", {
      method: "POST",
      body: JSON.stringify({ name, emoji }),
    });
  },
  updateChat(chatId: string, payload: { name?: string; emoji?: string }) {
    return request<Chat>(`/api/chats/${chatId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  deleteChat(chatId: string) {
    return request<{ message: string }>(`/api/chats/${chatId}`, {
      method: "DELETE",
    });
  },
  getMemories(chatId: string) {
    return request<Memory[]>(`/api/chats/${chatId}/memories`);
  },
  clearMemories(chatId: string) {
    return request<{ deleted: number }>(`/api/chats/${chatId}/memories`, {
      method: "DELETE",
    });
  },
  getMessages(chatId: string, before?: string) {
    const suffix = before ? `?before=${encodeURIComponent(before)}` : "";
    return request<MessageListResponse>(`/api/messages/${chatId}${suffix}`);
  },
  sendMessage(chatId: string, content: string, mood_tag?: string | null) {
    return request<ConversationResponse>(`/api/messages/${chatId}`, {
      method: "POST",
      body: JSON.stringify({ content, mood_tag: mood_tag ?? null }),
    });
  },
  getBreathingExercises() {
    return request<BreathingExercise[]>("/api/wellness/breathing", { auth: false });
  },
  getGroundingTechnique() {
    return request<GroundingTechnique>("/api/wellness/grounding", { auth: false });
  },
  getMeditations() {
    return request<MeditationScript[]>("/api/wellness/meditations", { auth: false });
  },
};
