"use client";

import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import type { AuthSearchParams } from "@/types/auth";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function OTPForm({ query }: { query?: AuthSearchParams }) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [otp, setOtp] = useState(query?.token);
  const searchParams = useSearchParams();

  console.log("searchParams", searchParams.get('email'));
  console.log('query', query)

  const updateOTP = (value: string) => {
    setOtp(value);

    if (value.length === 6) {
      console.info("OTP is complete. Calling API...");
      buttonRef.current?.click();
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (otp && otp.length === 6 && buttonRef.current) {
      console.info("OTP is complete. Calling API...");

      // dispatch the action event to call the API
      buttonRef.current?.click();

      toast.success("OTP is complete. Calling API...");
    }
  }, [otp, buttonRef.current]);

  return (
    <form action="/auth/confirm" className="flex flex-col gap-4">
      <input type="hidden" name="type" value="email" />
      <input type="hidden" name="email" value={query?.email || ""} />
      <input type="hidden" name="redirect_to" value={query?.redirect_to || "events"} />
      <InputOTP
        type="text"
        maxLength={6}
        pattern={REGEXP_ONLY_DIGITS}
        onChange={updateOTP}
        value={otp}
        name="token"
        id="token"
        required
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
      <Button type="submit" ref={buttonRef}>
        Verify OTP
      </Button>
    </form>
  );
}
