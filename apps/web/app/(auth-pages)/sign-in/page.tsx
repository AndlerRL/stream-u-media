import { LoginComponent } from "@/components/pages/sign-in/login";
import type { AuthPageProps } from "@/types/auth";

export default async function Login({ searchParams }: AuthPageProps) {
	const query = await searchParams;
	return (
		<main className="layout_container px-4 py-16 top-0" style={{ background: "var(--gradient)" }}>
			<LoginComponent searchParams={query} />
		</main>
	);
}
