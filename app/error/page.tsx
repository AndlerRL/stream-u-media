export default function ErrorPage(props: any) {
  return (
    <>
      <p>Sorry, something went wrong</p>
      <p>ERROR:</p>
      {props.error && <pre>{props.error.message}</pre>}
      <p>ALL PROPS:</p>
      <pre>{JSON.stringify(props, null, 2)}</pre>
    </>
  )
}