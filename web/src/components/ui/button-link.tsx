import Link from "next/link";
import type { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ButtonLinkProps = Omit<VariantProps<typeof buttonVariants>, "asChild"> & {
  href: string;
  children: React.ReactNode;
  className?: string;
  /** Renders a plain anchor for external/tel/mailto links. */
  external?: boolean;
  /** Open in a new tab and add the safe rel attributes. */
  newTab?: boolean;
  /** Screen-reader-only suffix, e.g. "(opens in a new tab)". */
  srSuffix?: string;
};

/**
 * A link styled as a button.
 *
 * This shadcn build is Base UI based, whose `Button` renders a real `<button>`
 * and does not swap the element for an anchor — which would break "open in a
 * new tab", middle-click and right-click-to-copy. So this applies
 * `buttonVariants()` to a genuine `<a>` instead.
 */
export function ButtonLink({
  href,
  children,
  className,
  variant = "default",
  size = "default",
  external = false,
  newTab = false,
  srSuffix,
}: ButtonLinkProps) {
  const classes = cn(buttonVariants({ variant, size, className }));
  const suffix = srSuffix ? <span className="sr-only">{srSuffix}</span> : null;

  if (external) {
    return (
      <a
        href={href}
        className={classes}
        {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
        {suffix}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
      {suffix}
    </Link>
  );
}
