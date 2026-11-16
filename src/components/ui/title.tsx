import { cn } from "cn";

interface TitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Heading element to render. */
  as?: "h1" | "h2" | "h3";
}

/** Screen-level heading (24/32, semibold). */
export function Title({ as: Component = "h2", className, ...props }: TitleProps) {
  return (
    <Component className={cn("m-0 text-[24px] leading-8 font-semibold", className)} {...props} />
  );
}
