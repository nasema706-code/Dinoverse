import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: TabsPrimitive.TabsListProps) {
  return (
    <TabsPrimitive.List
      className={cn(
        "flex w-full gap-1 overflow-x-auto rounded-lg bg-surface p-1.5 border border-border",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: TabsPrimitive.TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "min-h-11 shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-muted transition-[color,background-color] duration-150 sm:flex-1",
        "data-[state=active]:bg-surface-2 data-[state=active]:text-fg",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: TabsPrimitive.TabsContentProps) {
  return (
    <TabsPrimitive.Content
      className={cn("mt-5 focus-visible:outline-none", className)}
      {...props}
    />
  );
}
