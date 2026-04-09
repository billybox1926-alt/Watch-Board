"use client";

import { Article } from "@/lib/types";
import { ShieldAlert, TrendingUp } from "lucide-react";
import { SignalBadge } from "./SignalBadge";

interface TopDevelopmentsProps {
  articles: Article[];
}

export function TopDevelopments({ articles }: TopDevelopmentsProps) {
  const topArticles = [...articles]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return (
    <div className="space-y-3 bg-card/10 p-3 rounded-xl border border-border/20">
      <div className="flex items-center gap-2 px-1 mb-1">
        <TrendingUp className="w-4 h-4 text-accent" />
        <h2 className="font-headline font-bold text-xs uppercase tracking-tight">Top Developments</h2>
      </div>
      <div className="space-y-2">
        {topArticles.map((article) => (
          <div
            key={article.id}
            className="group relative p-2.5 bg-card border border-border/50 rounded-lg hover:border-accent/40 transition-all cursor-pointer overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
               <ShieldAlert className="w-3 h-3 text-accent" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{article.source}</span>
              <SignalBadge level={article.signalLevel} className="text-[7px] h-3.5 px-1" />
            </div>
            <h4 className="text-[11px] font-semibold font-headline leading-tight group-hover:text-accent transition-colors">
              {article.title}
            </h4>
          </div>
        ))}
      </div>
    </div>
  );
}
