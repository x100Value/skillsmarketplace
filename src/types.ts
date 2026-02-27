import type { Request } from "express";

export type SessionUser = {
  id: number;
  telegramUserId: string;
  username: string | null;
};

export type AuthedRequest = Request & {
  user?: SessionUser;
  sessionToken?: string;
};
