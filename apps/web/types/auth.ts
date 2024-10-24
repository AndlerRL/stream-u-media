import type { Maybe, PageProps } from "@/types/helpers";

export interface AuthPageProps
  extends PageProps<
    {
      email?: string;
      token?: string;
      redirect_to?: string;
    } & Maybe<Message>,
    "searchParams"
  > {}

export type Message =
  | { success: string }
  | { error: string }
  | { message: string };
