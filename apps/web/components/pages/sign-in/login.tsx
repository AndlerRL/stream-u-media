import { signInAction } from "@/app/(auth-pages)/actions";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthSearchParams } from "@/types/auth";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

export function LoginComponent({
	searchParams,
}: { searchParams?: AuthSearchParams }): JSX.Element {
	console.log("searchParams", searchParams);
	return (
		<section className="relative flex-1 flex w-full flex-col items-center justify-center min-w-64">
			<Button
				asChild
				variant="link"
				className="absolute top-5 -left-5 font-medium text-accent"
			>
				<Link href="/" className="flex gap-1">
					<ArrowLeftIcon className="size-5" />
					Back
				</Link>
			</Button>
			<Card className="w-full max-w-[450px] flex flex-col items-center justify-center">
				<CardHeader>
					<CardTitle className="text-3xl font-bold text-center">Sign in</CardTitle>
					<p className="text-lg text-center font-medium">Sign in with an OTP</p>
				</CardHeader>
				<CardContent className="w-full flex items-center justify-center">
					<form className="flex flex-col w-full max-w-xs gap-2 [&>input]:mb-3 mt-8">
						<input
							type="hidden"
							name="searchParams"
							className="hidden"
							value={JSON.stringify(searchParams)}
						/>
						<Label htmlFor="email">Email</Label>
						<Input name="email" placeholder="you@example.com" required />
						{/* <div className="flex justify-between items-center">
						<Label htmlFor="password">Password</Label>
						<Link
							className="text-xs text-foreground underline"
							href="/forgot-password"
						>
							Forgot Password?
						</Link>
					</div>
					<Input
						type="password"
						name="password"
						placeholder="Your password"
						required
					/> */}
						<SubmitButton pendingText="Signing In..." formAction={signInAction}>
							Sign in
						</SubmitButton>
						<FormMessage message={searchParams} />
					</form>
				</CardContent>
			</Card>
		</section>
	);
}
