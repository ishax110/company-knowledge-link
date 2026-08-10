import { useRef, useState } from "react";
import { FileUp, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatBytes, validateFile } from "@/lib/format";

export function FileUpload({
  file,
  onFileChange,
  error,
  hint,
}: {
  file: File | null;
  onFileChange: (file: File | null, validationError: string | null) => void;
  error?: string | undefined;
  hint?: string | undefined;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function accept(selected: File | undefined) {
    if (!selected) return;
    onFileChange(selected, validateFile(selected));
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          accept(event.dataTransfer.files?.[0]);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-input bg-muted/40 px-6 py-8 text-center transition-colors",
          dragging && "border-primary bg-accent",
          error && "border-destructive",
        )}
      >
        <span className="flex size-10 items-center justify-center rounded-lg bg-surface text-primary shadow-sm">
          <FileUp className="size-5" />
        </span>
        <p className="text-sm font-medium">Drag & drop a file or browse</p>
        <p className="text-xs text-muted-foreground">
          {hint ?? "PDF, DOC, DOCX, PPT, PPTX — maximum 10 MB"}
        </p>
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          Choose file
        </Button>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.ppt,.pptx"
          onChange={(event) => accept(event.target.files?.[0])}
        />
      </div>

      {file ? (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5">
          <Paperclip className="size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => {
              onFileChange(null, null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            aria-label="Remove selected file"
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
