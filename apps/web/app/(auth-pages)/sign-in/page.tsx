import { LoginComponent } from "@/components/pages/sign-in/login";
import type { AuthPageProps } from "@/types/auth";

export default function Login({ searchParams }: AuthPageProps) {
	return (
		<main className="layout_container">
			<LoginComponent searchParams={searchParams} />
		</main>
	);
}
