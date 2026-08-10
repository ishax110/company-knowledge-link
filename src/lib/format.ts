import type { Category, DocumentItem, Tag } from "@/types/api";

export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx", "ppt", "pptx"] as const;

export function formatBytes(bytes?: number) {
  if (!bytes || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

export function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function fileExtension(doc: DocumentItem) {
  const name = doc.originalName || doc.filename || "";
  const ext = name.split(".").pop();
  if (ext && ext !== name) return ext.toUpperCase();
  if (doc.mimeType?.includes("pdf")) return "PDF";
  if (doc.mimeType?.includes("presentation")) return "PPTX";
  if (doc.mimeType?.includes("word")) return "DOCX";
  return "FILE";
}

export function categoryOf(doc: DocumentItem): Category | null {
  const category = doc.category;
  if (!category) return null;
  if (typeof category === "string") return { _id: category, name: "Unknown category" };
  return category;
}

export function tagsOf(doc: DocumentItem): Tag[] {
  return (doc.tags ?? []).map((tag) =>
    typeof tag === "string" ? { _id: tag, name: "Unknown tag" } : tag,
  );
}

export function validateFile(file: File): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number])) {
    return `Unsupported file type ".${ext}". Allowed: PDF, DOC, DOCX, PPT, PPTX.`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File is ${formatBytes(file.size)} — the maximum allowed size is 10 MB.`;
  }
  return null;
}

export function initialsOf(name?: string) {
  if (!name) return "KR";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
