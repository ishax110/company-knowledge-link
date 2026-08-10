import { Check, Loader2, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTags } from "@/hooks/use-repository";
import { cn } from "@/lib/utils";

export function TagSelector({
  value,
  onChange,
}: {
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const { data: tags = [], isLoading, isError } = useTags();

  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((tag) => tag !== id) : [...value, id]);
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-3 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Loading tags…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-3 text-sm text-destructive">
        <TriangleAlert className="size-4" /> Tags could not be loaded.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border p-2">
      <ScrollArea className="max-h-40">
        <div className="flex flex-wrap gap-2 p-1">
          {tags.length === 0 ? (
            <p className="px-1 py-2 text-sm text-muted-foreground">
              No tags exist yet. Create tags first.
            </p>
          ) : null}
          {tags.map((tag) => {
            const selected = value.includes(tag._id);
            return (
              <button
                key={tag._id}
                type="button"
                onClick={() => toggle(tag._id)}
                aria-pressed={selected}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
              >
                <Badge
                  variant={selected ? "default" : "outline"}
                  className={cn("cursor-pointer gap-1 py-1", selected ? "" : "hover:bg-accent")}
                >
                  {selected ? <Check className="size-3" /> : null}
                  {tag.name}
                </Badge>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
