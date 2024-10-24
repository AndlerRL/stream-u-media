import type { Maybe, PageProps } from "@/types/helpers";

export interface AuthPageProps
  extends PageProps<AuthSearchParams, "searchParams"> {}

export type AuthSearchParams = {
  email?: string;
  token?: string;
  redirect_to?: string;
} & Maybe<Message>;

export type Message =
  | { success: string }
  | { error: string }
  | { message: string };
