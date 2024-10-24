import { LoginComponent } from "@/components/pages/sign-in/login";
import type { AuthPageProps } from "@/types/auth";

export default async function Login({ searchParams }: AuthPageProps) {
	const query = await searchParams;
	return (
		<main className="layout_container">
			<LoginComponent searchParams={query} />
		</main>
	);
}
