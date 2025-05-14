import { Input } from "@/components/ui/input";

interface SearchBarProps {
  searchInput: string;
  setSearchInput: (value: string) => void;
  setSearchTerm: (value: string) => void;
}

export function SearchBar({
  searchInput,
  setSearchInput,
  setSearchTerm,
}: SearchBarProps) {
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    setSearchTerm(e.target.value);
  };

  return (
    <Input
      placeholder="Search evaluations..."
      value={searchInput}
      onChange={handleSearch}
      className="max-w-sm"
    />
  );
}
