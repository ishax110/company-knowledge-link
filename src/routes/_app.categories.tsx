import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { FolderTree, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { TableSkeleton } from "@/components/common/loading";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { categoryApi } from "@/api/categoryApi";
import { handleApiError } from "@/lib/handle-api-error";
import { useCategories } from "@/hooks/use-repository";
import { formatDate } from "@/lib/format";
import type { Category } from "@/types/api";

export const Route = createFileRoute("/_app/categories")({
  head: () => ({
    meta: [
      { title: "Categories — Knowledge Repository" },
      {
        name: "description",
        content: "Manage the categories used to classify company documents.",
      },
      { property: "og:title", content: "Categories — Knowledge Repository" },
      { property: "og:description", content: "Create, rename and remove document categories." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading, isError, refetch } = useCategories();
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  function openCreate() {
    setForm({ name: "", description: "" });
    setCreating(true);
  }

  function openEdit(category: Category) {
    setForm({ name: category.name, description: category.description ?? "" });
    setEditing(category);
  }

  async function save() {
    if (!form.name.trim()) {
      toast.error("Name required", { description: "Enter a category name." });
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await categoryApi.update(editing._id, {
          name: form.name.trim(),
          description: form.description.trim(),
        });
        toast.success("Category updated");
      } else {
        await categoryApi.create({
          name: form.name.trim(),
          description: form.description.trim(),
        });
        toast.success("Category created");
      }
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditing(null);
      setCreating(false);
    } catch (error) {
      handleApiError(error, "Could not save category");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await categoryApi.remove(pendingDelete._id);
      toast.success("Category deleted");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setPendingDelete(null);
    } catch (error) {
      handleApiError(error, "Could not delete category");
    } finally {
      setDeleting(false);
    }
  }

  const dialogOpen = creating || Boolean(editing);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Categories group documents by business function. They are referenced by ID when uploading."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> New category
          </Button>
        }
      />

      <div className="panel overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : isError ? (
          <EmptyState
            icon={FolderTree}
            title="Categories could not be loaded"
            action={
              <Button variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        ) : categories.length === 0 ? (
          <EmptyState
            icon={FolderTree}
            title="No categories yet"
            description="Create your first category so documents can be classified."
            action={
              <Button onClick={openCreate}>
                <Plus className="size-4" /> New category
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead className="hidden lg:table-cell">Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category._id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="hidden max-w-md text-sm text-muted-foreground md:table-cell">
                    {category.description || "—"}
                  </TableCell>
                  <TableCell className="hidden text-sm lg:table-cell">
                    {formatDate(category.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => openEdit(category)}
                        aria-label={`Edit ${category.name}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive"
                        onClick={() => setPendingDelete(category)}
                        aria-label={`Delete ${category.name}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCreating(false);
            setEditing(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit category" : "New category"}</DialogTitle>
            <DialogDescription>
              Categories are shared across the whole repository.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Name</Label>
              <Input
                id="category-name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="e.g. Finance"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-description">Description</Label>
              <Textarea
                id="category-description"
                rows={3}
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="What belongs in this category?"
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
              {editing ? "Save changes" : "Create category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Delete this category?"
        description={
          pendingDelete
            ? `“${pendingDelete.name}” will be removed. Documents referencing it may become uncategorised.`
            : ""
        }
        confirmLabel="Delete category"
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
