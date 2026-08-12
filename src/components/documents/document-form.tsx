import { useState } from "react";
import { Loader2, Save, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CategorySelector } from "./category-selector";
import { TagSelector } from "./tag-selector";
import { FileUpload } from "./file-upload";
import type { DocumentPayload } from "@/api/documentApi";
import type { ApiError } from "@/api/apiClient";

export interface DocumentFormValues {
  title: string;
  description: string;
  category: string;
  tags: string[];
  file: File | null;
}

export function DocumentForm({
  mode,
  initialValues,
  existingFileName,
  submitting,
  progress,
  apiError,
  onSubmit,
  onCancel,
}: {
  mode: "create" | "edit";
  initialValues?: Partial<DocumentFormValues> | undefined;
  existingFileName?: string | undefined;
  submitting: boolean;
  progress: number;
  apiError?: ApiError | null | undefined;
  onSubmit: (payload: DocumentPayload) => void;
  onCancel?: (() => void) | undefined;
}) {
  const [values, setValues] = useState<DocumentFormValues>({
    title: initialValues?.title ?? "",
    description: initialValues?.description ?? "",
    category: initialValues?.category ?? "",
    tags: initialValues?.tags ?? [],
    file: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [replaceFile, setReplaceFile] = useState(mode === "create");

  function setField<K extends keyof DocumentFormValues>(key: K, value: DocumentFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!values.title.trim()) next["title"] = "Title is required.";
    else if (values.title.trim().length > 160)
      next["title"] = "Keep the title under 160 characters.";
    if (!values.description.trim()) next["description"] = "Description is required.";
    else if (values.description.length > 2000)
      next["description"] = "Keep the description under 2000 characters.";
    if (!values.category) next["category"] = "Select a category.";
    if (values.tags.length === 0) next["tags"] = "Select at least one tag.";

    if (mode === "create" && !values.file) next["file"] = "Attach a document file.";
    if (mode === "edit" && replaceFile && !values.file)
      next["file"] = "Choose a replacement file or turn off file replacement.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    onSubmit({
      title: values.title.trim(),
      description: values.description.trim(),
      category: values.category,
      tags: values.tags,
      file: replaceFile ? values.file : null,
    });
  }

  const fieldError = (name: string) => errors[name] ?? apiError?.fieldErrors[name];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {apiError && Object.keys(apiError.fieldErrors).length === 0 ? (
        <Alert variant="destructive">
          <AlertTitle>{mode === "create" ? "Upload failed" : "Update failed"}</AlertTitle>
          <AlertDescription>{apiError.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={values.title}
              maxLength={200}
              onChange={(event) => setField("title", event.target.value)}
              placeholder="e.g. Q3 Financial Summary"
              aria-invalid={Boolean(fieldError("title"))}
            />
            {fieldError("title") ? (
              <p className="text-sm text-destructive">{fieldError("title")}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={5}
              value={values.description}
              onChange={(event) => setField("description", event.target.value)}
              placeholder="What does this document contain? Who should read it?"
              aria-invalid={Boolean(fieldError("description"))}
            />
            {fieldError("description") ? (
              <p className="text-sm text-destructive">{fieldError("description")}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <CategorySelector
              value={values.category}
              onChange={(value) => setField("category", value)}
              triggerClassName="w-full"
            />
            {fieldError("category") ? (
              <p className="text-sm text-destructive">{fieldError("category")}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <TagSelector value={values.tags} onChange={(value) => setField("tags", value)} />
            <p className="text-xs text-muted-foreground">
              {values.tags.length} tag{values.tags.length === 1 ? "" : "s"} selected
            </p>
            {fieldError("tags") ? (
              <p className="text-sm text-destructive">{fieldError("tags")}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-4">
          {mode === "edit" ? (
            <div className="panel space-y-3 p-4">
              <p className="text-sm font-medium">File</p>
              <p className="text-xs text-muted-foreground">
                Current file: {existingFileName || "unknown"}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={replaceFile ? "outline" : "default"}
                  size="sm"
                  onClick={() => {
                    setReplaceFile(false);
                    setField("file", null);
                  }}
                >
                  Metadata only
                </Button>
                <Button
                  type="button"
                  variant={replaceFile ? "default" : "outline"}
                  size="sm"
                  onClick={() => setReplaceFile(true)}
                >
                  Replace file
                </Button>
              </div>
            </div>
          ) : null}

          {replaceFile ? (
            <FileUpload
              file={values.file}
              {...(fieldError("file") ? { error: fieldError("file") as string } : {})}
              onFileChange={(file, validationError) => {
                setField("file", file);
                setErrors((prev) => ({ ...prev, ...(validationError ? { file: validationError } : {}) }));
                if (!validationError) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next["file"];
                    return next;
                  });
                }
              }}
            />
          ) : null}

          {submitting ? (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground">
                {progress < 100 ? `Uploading… ${progress}%` : "Processing on the server…"}
              </p>
            </div>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : mode === "create" ? (
                <UploadCloud className="size-4" />
              ) : (
                <Save className="size-4" />
              )}
              {mode === "create" ? "Upload document" : "Save changes"}
            </Button>
            {onCancel ? (
              <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
                Cancel
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </form>
  );
}
