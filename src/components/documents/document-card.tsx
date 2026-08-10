import { Link } from "@tanstack/react-router";
import { Download, Eye, FileText, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingSpinner } from "@/components/common/loading";
import { categoryOf, fileExtension, formatBytes, formatDate, tagsOf } from "@/lib/format";
import type { DocumentItem } from "@/types/api";

export function DocumentCard({
  doc,
  onDownload,
  onDelete,
  downloading,
}: {
  doc: DocumentItem;
  onDownload: (doc: DocumentItem) => void;
  onDelete: (doc: DocumentItem) => void;
  downloading?: boolean;
}) {
  const category = categoryOf(doc);
  const tags = tagsOf(doc);

  return (
    <article className="panel flex flex-col gap-4 p-5 transition-shadow hover:shadow-elevated">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <FileText className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <Link
            to="/documents/$documentId"
            params={{ documentId: doc._id }}
            className="line-clamp-1 font-medium hover:underline"
          >
            {doc.title}
          </Link>
          <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
            {doc.description || "No description provided."}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8" aria-label="Document actions">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to="/documents/$documentId" params={{ documentId: doc._id }}>
                <Eye className="size-4" /> View details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownload(doc)}>
              <Download className="size-4" /> Download
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/documents/$documentId/edit" params={{ documentId: doc._id }}>
                <Pencil className="size-4" /> Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(doc)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="size-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {category ? <Badge variant="secondary">{category.name}</Badge> : null}
        {tags.slice(0, 3).map((tag) => (
          <Badge key={tag._id} variant="outline">
            {tag.name}
          </Badge>
        ))}
        {tags.length > 3 ? <Badge variant="outline">+{tags.length - 3}</Badge> : null}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
        <span>
          {fileExtension(doc)} · {formatBytes(doc.size)}
        </span>
        <span>{formatDate(doc.createdAt)}</span>
      </div>

      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link to="/documents/$documentId" params={{ documentId: doc._id }}>
            <Eye className="size-4" /> View
          </Link>
        </Button>
        <Button size="sm" className="flex-1" onClick={() => onDownload(doc)} disabled={downloading}>
          {downloading ? <LoadingSpinner /> : <Download className="size-4" />} Download
        </Button>
      </div>
    </article>
  );
}
