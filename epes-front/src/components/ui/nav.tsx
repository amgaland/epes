import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { usePathname } from "next/navigation";

interface NavProps {
  isCollapsed: boolean;
  links: {
    title: string;
    label?: string;
    icon: LucideIcon;
    href: string;
  }[];
}

export function Nav({ links, isCollapsed }: NavProps) {
  const pathName = usePathname();

  return (
    <TooltipProvider>
      <div
        data-collapsed={isCollapsed}
        className="group flex flex-col items-start gap-4 py-2"
      >
        <nav className="grid gap-1 group-[[data-collapsed=true]]:justify-start">
          {links.map((link, index) => {
            const isActive = link.href === pathName;
            const buttonClass = cn(
              buttonVariants({
                variant: isActive ? "secondary" : "ghost",
                size: isCollapsed ? "icon" : "sm",
              }),
              isCollapsed
                ? "h-9 w-9"
                : "flex items-center justify-start text-muted-foreground hover:text-black dark:hover:text-white",
              isActive && "text-primary dark:text-white"
            );

            return isCollapsed ? (
              <Tooltip key={index} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link href={link.href} className={buttonClass}>
                    <link.icon className="h-4 w-4" />
                    <span className="sr-only">{link.title}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="flex items-center justify-between gap-4"
                >
                  {link.title}
                  {link.label && (
                    <span className="ml-auto text-muted-foreground">
                      {link.label}
                    </span>
                  )}
                </TooltipContent>
              </Tooltip>
            ) : (
              <Link key={index} href={link.href} className={buttonClass}>
                <link.icon className="mr-2 h-4 w-4" />
                {link.title}
                {link.label && (
                  <span
                    className={cn(
                      "ml-auto",
                      isActive && "text-primary dark:text-white"
                    )}
                  >
                    {link.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </TooltipProvider>
  );
}
