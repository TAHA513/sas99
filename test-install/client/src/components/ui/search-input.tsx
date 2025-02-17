import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
}

export function SearchInput({ placeholder = "بحث...", ...props }: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
      <Input
        {...props}
        className="pr-10 text-right"
        placeholder={placeholder}
      />
    </div>
  );
}
