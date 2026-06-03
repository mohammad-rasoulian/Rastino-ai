export type AdminTab =
  | "overview"
  | "users"
  | "chats"
  | "content"
  | "system"
  | "security"
  | "plans"
  | "prompts"
  | "models"
  | "settings";

export type Overview = {
  usersCount: number;
  chatsCount: number;
  messagesCount: number;
  imageChatsCount: number;
  plansCount: number;
  promptsCount: number;
  recentUsers: {
    id: string;
    mobile?: string | null;
    email?: string | null;
    role: string;
    plan: string;
    status: string;
    createdAt: string;
  }[];
  recentChats: {
    id: string;
    title: string;
    type: string;
    status: string;
    createdAt: string;
    user?: {
      mobile?: string | null;
      email?: string | null;
    } | null;
    _count: {
      messages: number;
    };
  }[];
};

export type AdminUser = {
  id: string;
  mobile?: string | null;
  email?: string | null;
  name?: string | null;
  role: string;
  plan: string;
  status: string;
  createdAt: string;
  wallet?: {
    balance: number;
    currency: string;
  } | null;
  _count: {
    chats: number;
    messages: number;
    usageLogs: number;
  };
};

export type AdminChat = {
  id: string;
  title: string;
  type: string;
  status: string;
  createdAt: string;
  user?: {
    mobile?: string | null;
    email?: string | null;
  } | null;
  messages: {
    id: string;
    role: string;
    content: string;
    model?: string | null;
    totalTokens: number;
    costUsd: number;
    createdAt: string;
  }[];
  _count: {
    messages: number;
  };
};

export type AdminPlan = {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  price: number;
  currency: string;
  monthlyMessages: number;
  dailyMessages: number;
  maxInputTokens: number;
  maxOutputTokens: number;
  allowFiles: boolean;
  allowImages: boolean;
  allowOcr: boolean;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminPromptTemplate = {
  id: string;
  key: string;
  title: string;
  category: string;
  description?: string | null;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminActionItem = {
  id: string;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  description?: string | null;
  metadata?: string | null;
  createdAt: string;
  admin?: {
    id: string;
    mobile?: string | null;
    email?: string | null;
  } | null;
};

export type AdminSecurity = {
  sessionsCount: number;
  expiredSessionsCount: number;
  inactiveUsersCount: number;
  otpLastHourCount: number;
  adminActions: AdminActionItem[];
};

export type AdminSystem = {
  ok: boolean;
  service: string;
  database: string;
  uptime?: number;
  responseTimeMs: number;
  timestamp: string;
  env?: {
    name: string;
    exists: boolean;
    configured: boolean;
  }[];
  counts?: {
    users: number;
    chats: number;
    messages: number;
    plans: number;
    prompts: number;
    usageLogs: number;
    transactions: number;
  };
};
