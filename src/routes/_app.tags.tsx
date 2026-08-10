import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Tags as TagsIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { CardsSkeleton } from "@/components/common/loading";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { tagApi } from "@/api/tagApi";
import { handleApiError } from "@/lib/handle-api-error";
import { useTags } from "@/hooks/use-repository";
import { formatDate } from "@/lib/format";
import type { Tag } from "@/types/api";

export const Route = createFileRoute("/_app/tags")({
  head: () => ({
    meta: [
      { title: "Tags — Knowledge Repository" },
      {
        name: "description",
        content: "Manage cross-cutting tags used to label and discover documents.",
      },
      { property: "og:title", content: "Tags — Knowledge Repository" },
      { property: "og:description", content: "Create, rename and remove document tags." },
    ],
  }),
  component: TagsPage,
});

function TagsPage() {
  const queryClient = useQueryClient();
  const { data: tags = [], isLoading, isError, refetch } = useTags();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Tag | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Tag | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function save() {
    if (!form.name.trim()) {
      toast.error("Name required", { description: "Enter a tag name." });
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await tagApi.update(editing._id, {
          name: form.name.trim(),
          description: form.description.trim(),
        });
        toast.success("Tag updated");
      } else {
        await tagApi.create({ name: form.name.trim(), description: form.description.trim() });
        toast.success("Tag created");
      }
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      setCreating(false);
      setEditing(null);
    } catch (error) {
      handleApiError(error, "Could not save tag");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await tagApi.remove(pendingDelete._id);
      toast.success("Tag deleted");
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      setPendingDelete(null);
    } catch (error) {
      handleApiError(error, "Could not delete tag");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tags"
        description="Tags cut across categories and make documents easier to find in search."
        actions={
          <Button
            onClick={() => {
              setForm({ name: "", description: "" });
              setCreating(true);
            }}
          >
            <Plus className="size-4" /> New tag
          </Button>
        }
      />

      {isLoading ? (
        <CardsSkeleton count={6} />
      ) : isError ? (
        <div className="panel">
          <EmptyState
            icon={TagsIcon}
            title="Tags could not be loaded"
            action={
              <Button variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        </div>
      ) : tags.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={TagsIcon}
            title="No tags yet"
            description="Create tags so documents can be labelled and discovered quickly."
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tags.map((tag) => (
            <div key={tag._id} className="panel flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <Badge variant="secondary" className="text-sm">
                  {tag.name}
                </Badge>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => {
                      setForm({ name: tag.name, description: tag.description ?? "" });
                      setEditing(tag);
                    }}
                    aria-label={`Edit ${tag.name}`}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive"
                    onClick={() => setPendingDelete(tag)}
                    aria-label={`Delete ${tag.name}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{tag.description || "No description"}</p>
              <p className="mt-auto text-xs text-muted-foreground">
                Created {formatDate(tag.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={creating || Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) {
            setCreating(false);
            setEditing(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit tag" : "New tag"}</DialogTitle>
            <DialogDescription>Tags are shared across the repository.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tag-name">Name</Label>
              <Input
                id="tag-name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="e.g. Onboarding"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tag-description">Description</Label>
              <Textarea
                id="tag-description"
                rows={3}
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreating(false);
                setEditing(null);
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              {editing ? "Save changes" : "Create tag"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Delete this tag?"
        description={pendingDelete ? `“${pendingDelete.name}” will be removed from the library.` : ""}
        confirmLabel="Delete tag"
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
