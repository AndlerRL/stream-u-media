import { RootLayoutComponent } from "@/components/shared/root-layout"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default async function ErrorPage(props: { params: Promise<any>, error: Promise<any>, searchParams: Promise<{ error: Error }> }) {
  const params = await props.params
  const error = await props.error
  const searchParams = await props.searchParams
  return (
    <RootLayoutComponent className="px-4 py-16 top-0" style={{ background: "var(--gradient)" }}>
      <Card className="p-6">
        <CardHeader className="text-3xl">404 Page Not Found</CardHeader>
        <CardDescription className="text-xl p-6">
          We couldn't find what you are looking for. Try to go back home
        </CardDescription>
        <CardFooter>
          {error && <pre className="text-destructive">ERROR: {error.message}</pre>}
          <Link href="/" className={cn(buttonVariants({ variant: 'destructive' }))}>
            Go back home
          </Link>
        </CardFooter>
      </Card>
      {/* <p>ALL PROPS:</p>
      <pre>{JSON.stringify({
        ...props,
        params,
        searchParams,
      }, null, 2)}</pre> */}
    </RootLayoutComponent>
  )
}