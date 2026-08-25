import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: TabsPrimitive.TabsListProps) {
  return (
    <TabsPrimitive.List
      className={cn(
        "flex w-full flex-wrap gap-1 rounded-lg border border-border bg-surface p-1.5 sm:flex-nowrap",
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
        "min-h-11 min-w-0 flex-1 basis-[calc(50%-0.125rem)] rounded-md px-2 py-2 text-center text-sm font-medium break-words text-muted transition-[color,background-color,box-shadow] duration-150 sm:basis-0 sm:whitespace-nowrap sm:px-3",
        "data-[state=active]:bg-lore data-[state=active]:text-fg data-[state=active]:shadow-[inset_0_-2px_0_0_var(--color-gold)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50",
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
