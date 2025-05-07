import { Input } from "@/components/ui/input";

export const SearchBar = ({
  searchInput,
  setSearchInput,
  setSearchTerm,
}: {
  searchInput: string;
  setSearchInput: (value: string) => void;
  setSearchTerm: (value: string) => void;
}) => (
  <Input
    type="text"
    value={searchInput}
    onChange={(e) => setSearchInput(e.target.value)}
    onKeyPress={(e) => e.key === "Enter" && setSearchTerm(searchInput)}
    placeholder="Search employees by name, role, project, or task..."
    className="max-w-sm"
  />
);
