import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";


export default function Login({ params: { token, token_hash, email } }: { params: { otp: string, token: string, token_hash: string, email: string } }) {
  if (token_hash) {
    console.info("Token hash: ", token_hash);
  }

  const submitOTP = (value: string) => {
    console.log(value);

    if (value.length === 6) {
      console.info("OTP is complete. Calling API...");
    }
  }

  return (
    <InputOTP
      maxLength={6}
      pattern={REGEXP_ONLY_DIGITS}
      onChange={submitOTP}
      defaultValue={token}
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
  );
}
