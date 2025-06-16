
import React from 'react';
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';

interface TarotListingSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const TarotListingSearch: React.FC<TarotListingSearchProps> = ({
  searchTerm,
  onSearchChange
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div />
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar por nome..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 w-full sm:w-64 bg-white/90 backdrop-blur-sm border border-white/30 shadow-lg"
        />
      </div>
    </div>
  );
};

export default TarotListingSearch;
