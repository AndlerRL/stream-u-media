import type { Maybe } from "@/types/helpers";

export interface AuthPageProps {
  searchParams: Maybe<Message> & {
    email?: string;
    token?: string;
    redirect_to?: string;
  };
}

export type Message =
  | { success: string }
  | { error: string }
  | { message: string };
