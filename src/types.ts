import type { Request } from "express";

export type SessionUser = {
  id: number;
  telegramUserId: string;
  username: string | null;
  moderationStatus?: "active" | "under_review" | "banned";
};

export type AuthedRequest = Request & {
  user?: SessionUser;
  sessionToken?: string;
};
