import type { Message } from "@/components/form-message";
import { LoginComponent } from "@/components/pages/sign-in/login";

export default function Login({
	searchParams,
}: { searchParams: Message & { redirect_to: string } }) {
	return (
		<main className="layout_container">
			<LoginComponent searchParams={searchParams} />
		</main>
	);
}
