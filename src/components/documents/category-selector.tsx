import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/use-repository";

export function CategorySelector({
  value,
  onChange,
  includeAllOption = false,
  placeholder = "Select a category",
  triggerClassName,
}: {
  value: string;
  onChange: (value: string) => void;
  includeAllOption?: boolean;
  placeholder?: string | undefined;
  triggerClassName?: string | undefined;
}) {
  const { data: categories = [], isLoading, isError } = useCategories();

  return (
    <Select {...(value ? { value } : {})} onValueChange={onChange} disabled={isLoading || isError}>
      <SelectTrigger className={triggerClassName} aria-label="Category">
        <SelectValue
          placeholder={
            isLoading ? "Loading categories…" : isError ? "Categories unavailable" : placeholder
          }
        />
      </SelectTrigger>
      <SelectContent>
        {includeAllOption ? <SelectItem value="all">All categories</SelectItem> : null}
        {categories.map((category) => (
          <SelectItem key={category._id} value={category._id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
