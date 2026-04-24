import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className,
}: SearchInputProps) {
  return (
    <div className={`relative flex items-center ${className ?? ""}`}>
      <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
      <Input
        data-ocid="search_input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 h-7 w-7"
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          <X className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}
