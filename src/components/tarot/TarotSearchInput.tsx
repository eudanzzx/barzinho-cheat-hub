
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type Props = {
  value: string;
  onChange: (s: string) => void;
};
export default function TarotSearchInput({ value, onChange }: Props) {
  return (
    <div className="relative group w-full sm:w-auto">
      <Input
        type="text"
        placeholder="Buscar cliente..."
        className="pr-10 bg-white/80 border-[#ede9fe] focus:border-[#673193] focus:ring-[#673193]/20 transition-all duration-300 hover:bg-white hover:shadow-lg transform hover:scale-105"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#bda3f2] group-hover:text-[#673193] transition-colors duration-300" />
    </div>
  );
}
