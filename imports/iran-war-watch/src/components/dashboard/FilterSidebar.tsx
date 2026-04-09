"use client";

import { Search, SlidersHorizontal, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Category, SignalLevel, ArticleType } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface FilterSidebarProps {
  onSearchChange: (value: string) => void;
  onCategoryToggle: (category: Category) => void;
  onSignalToggle: (level: SignalLevel) => void;
  onTypeToggle: (type: ArticleType) => void;
  selectedCategories: Category[];
  selectedSignals: SignalLevel[];
  selectedTypes: ArticleType[];
  onClear: () => void;
}

export function FilterSidebar({
  onSearchChange,
  onCategoryToggle,
  onSignalToggle,
  onTypeToggle,
  selectedCategories,
  selectedSignals,
  selectedTypes,
  onClear
}: FilterSidebarProps) {
  return (
    <div className="h-full flex flex-col gap-4 py-4 px-3">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
            <h3 className="font-headline font-bold text-xs uppercase tracking-wider">Filters</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClear} className="h-6 text-[9px] text-muted-foreground hover:text-destructive p-0 px-1">
            <Trash2 className="w-2.5 h-2.5 mr-1" />
            Clear
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search keywords..."
            className="pl-7 h-8 text-[11px] bg-secondary/10 border-border focus:ring-primary"
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Categories</Label>
        <div className="space-y-2">
          {(['Conflict', 'Nuclear', 'Maritime/Energy'] as Category[]).map((cat) => (
            <div key={cat} className="flex items-center space-x-2">
              <Checkbox
                id={`cat-${cat}`}
                className="w-3.5 h-3.5"
                checked={selectedCategories.includes(cat)}
                onCheckedChange={() => onCategoryToggle(cat)}
              />
              <label htmlFor={`cat-${cat}`} className="text-[11px] font-medium leading-none cursor-pointer">
                {cat}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator className="bg-border/30" />

      <div className="space-y-3">
        <Label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Signal Levels</Label>
        <div className="space-y-2">
          {(['low', 'medium', 'high', 'critical'] as SignalLevel[]).map((lvl) => (
            <div key={lvl} className="flex items-center space-x-2">
              <Checkbox
                id={`lvl-${lvl}`}
                className="w-3.5 h-3.5"
                checked={selectedSignals.includes(lvl)}
                onCheckedChange={() => onSignalToggle(lvl)}
              />
              <label htmlFor={`lvl-${lvl}`} className="text-[11px] font-medium leading-none cursor-pointer capitalize">
                {lvl}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator className="bg-border/30" />

      <div className="space-y-3">
        <Label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Article Types</Label>
        <div className="space-y-2">
          {(['Event Report', 'Analysis', 'Opinion', 'Official Statement', 'Noise'] as ArticleType[]).map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`type-${type}`}
                className="w-3.5 h-3.5"
                checked={selectedTypes.includes(type)}
                onCheckedChange={() => onTypeToggle(type)}
              />
              <label htmlFor={`type-${type}`} className="text-[11px] font-medium leading-none cursor-pointer">
                {type}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-border/30">
        <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
          <p className="text-[8px] font-black text-primary uppercase mb-1 tracking-widest">Monitor Status</p>
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-semibold text-foreground/90">System Nominal</span>
          </div>
          <p className="text-[8px] text-muted-foreground leading-tight">
            Ingesting tactical streams across 12 verified global intelligence sectors.
          </p>
        </div>
      </div>
    </div>
  );
}
