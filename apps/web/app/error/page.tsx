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
      <Card>
        <CardHeader>
          Error
        </CardHeader>
        <CardDescription>
          Sorry, something went wrong. Please try again later.
          <br />
          <strong>
            ERROR:
          </strong>
          {error && <pre className="text-destructive">{error.message || 'unknown'}</pre>}
        </CardDescription>
        <CardFooter>
          <p>ALL PROPS:</p>
          <pre>{JSON.stringify({
            params,
            props,
            searchParams,
          }, null, 2)}</pre>
          <Link href="/" className={cn(buttonVariants({ variant: 'destructive' }))}>
            Go back home
          </Link>
        </CardFooter>
      </Card>
    </RootLayoutComponent>
  )
}