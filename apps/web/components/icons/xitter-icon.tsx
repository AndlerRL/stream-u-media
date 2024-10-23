import { cn } from "@/lib/utils";

export function XitterIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
      imageRendering="optimizeQuality"
      fillRule="evenodd"
      clipRule="evenodd"
      viewBox="0 0 512 462.799"
      className={cn("size-5 fill-foreground", className)}
      {...props}
    >
      <title className="sr-only">Xitter Icon</title>
      <path
        fillRule="nonzero"
        d="M403.229 0h78.506L310.219 196.04 512 462.799H354.002L230.261 301.007 88.669 462.799h-78.56l183.455-209.683L0 0h161.999l111.856 147.88L403.229 0zm-27.556 415.805h43.505L138.363 44.527h-46.68l283.99 371.278z"
      />
    </svg>
  );
}