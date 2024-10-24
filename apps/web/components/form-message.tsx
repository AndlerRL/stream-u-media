import type { Message } from "@/types/auth";
import { CheckCircle2Icon, InfoIcon, XCircleIcon } from "lucide-react";

export function FormMessage({ message }: { message: Message }) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-md text-sm">
      {"success" in message && (
        <div className="w-full flex gap-2 items-center leading-loose font-semibold text-foreground border-l-2 border-foreground px-4">
          <CheckCircle2Icon className="size-4" />
          {message.success}
        </div>
      )}
      {"error" in message && (
        <div className="w-full flex gap-2 items-center leading-loose font-semibold bg-destructive text-destructive-foreground border-l-2 border-destructive-foreground px-4">
          <XCircleIcon className="size-4" />
          {message.error}
        </div>
      )}
      {"message" in message && (
        <div className="w-full flex gap-2 items-center leading-loose font-semibold text-foreground border-l-2 px-4">
          <InfoIcon className="size-4" />
          {message.message}
        </div>
      )}
    </div>
  );
}
