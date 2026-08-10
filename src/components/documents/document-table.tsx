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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { categoryOf, fileExtension, formatBytes, formatDate, tagsOf } from "@/lib/format";
import type { DocumentItem } from "@/types/api";

export function DocumentTable({
  documents,
  onDownload,
  onDelete,
  downloadingId,
}: {
  documents: DocumentItem[];
  onDownload: (doc: DocumentItem) => void;
  onDelete: (doc: DocumentItem) => void;
  downloadingId?: string | null;
}) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[260px]">Document</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="hidden lg:table-cell">Tags</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="hidden md:table-cell">Size</TableHead>
            <TableHead className="hidden md:table-cell">Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => {
            const category = categoryOf(doc);
            const tags = tagsOf(doc);
            return (
              <TableRow key={doc._id}>
                <TableCell>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      <FileText className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <Link
                        to="/documents/$documentId"
                        params={{ documentId: doc._id }}
                        className="line-clamp-1 font-medium hover:underline"
                      >
                        {doc.title}
                      </Link>
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {doc.description || doc.originalName || "No description"}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {category ? (
                    <Badge variant="secondary">{category.name}</Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex max-w-[220px] flex-wrap gap-1">
                    {tags.slice(0, 2).map((tag) => (
                      <Badge key={tag._id} variant="outline">
                        {tag.name}
                      </Badge>
                    ))}
                    {tags.length > 2 ? <Badge variant="outline">+{tags.length - 2}</Badge> : null}
                    {tags.length === 0 ? <span className="text-muted-foreground">—</span> : null}
                  </div>
                </TableCell>
                <TableCell className="text-sm">{fileExtension(doc)}</TableCell>
                <TableCell className="hidden text-sm md:table-cell">
                  {formatBytes(doc.size)}
                </TableCell>
                <TableCell className="hidden whitespace-nowrap text-sm md:table-cell">
                  {formatDate(doc.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => onDownload(doc)}
                      disabled={downloadingId === doc._id}
                      aria-label={`Download ${doc.title}`}
                    >
                      <Download className="size-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          aria-label={`Actions for ${doc.title}`}
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to="/documents/$documentId" params={{ documentId: doc._id }}>
                            <Eye className="size-4" /> View details
                          </Link>
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
