'use client'

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function OTPForm({ token }: { token: string }) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [otp, setOtp] = useState(token);
  const searchParams = useSearchParams()

  console.log('searchParams', searchParams)

  const updateOTP = (value: string) => {
    setOtp(value);

    if (value.length === 6) {
      console.info("OTP is complete. Calling API...");
      buttonRef.current?.click();
    }
  }

  useEffect(() => {
    if (otp && otp.length === 6 && buttonRef.current) {
      console.info("OTP is complete. Calling API...");

      // dispatch the action event to call the API
      buttonRef.current?.click();

      // reset the OTP field
      setOtp('');
    }
  }, [otp, buttonRef.current]);

  return (
    <form action={`/auth/confirm`}>
      <input type="hidden" name="type" value="email" />
      <input type="hidden" name="redirect_to" value={`/events`} />
      <input type="hidden" name="email" value={searchParams.get('email') as string} />
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
      <button type="submit" ref={buttonRef}>Verify OTP</button>
    </form>
  );
}