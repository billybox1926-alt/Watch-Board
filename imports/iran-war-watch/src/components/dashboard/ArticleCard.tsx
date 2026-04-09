"use client";

import { Article } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { SignalBadge } from "./SignalBadge";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Clock, Tag, Info, CheckCircle2, ChevronRight, BarChart3, Fingerprint } from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ArticleCardProps {
  article: Article;
  onMarkReviewed?: (id: string) => void;
}

export function ArticleCard({ article, onMarkReviewed }: ArticleCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isReviewed = article.status === 'reviewed';
  const isCritical = article.signalLevel === 'critical';

  return (
    <Card className={cn(
      "overflow-hidden bg-card/40 border-border/40 hover:border-primary/40 transition-all duration-200 group shadow-sm hover:shadow-md relative",
      isReviewed && "opacity-60 grayscale-[0.2] border-emerald-500/10",
      isCritical && !isReviewed && "border-rose-500/40 ring-1 ring-rose-500/10 shadow-[0_0_20px_-10px_rgba(244,63,94,0.1)]"
    )}>
      <div className="flex flex-col md:flex-row h-full">
        {article.imageUrl && (
          <div className="relative w-full md:w-48 lg:w-52 shrink-0 overflow-hidden border-b md:border-b-0 md:border-r border-border/30">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              data-ai-hint="surveillance imagery"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent/10" />
            <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
              <SignalBadge level={article.signalLevel} className="shadow-md backdrop-blur-sm border-none text-[8px] h-4" />
              {article.duplicateOfId && (
                <Badge variant="destructive" className="h-4 px-1.5 text-[7px] gap-1 font-black bg-rose-600/90 backdrop-blur-sm border-none uppercase tracking-tighter shadow-md">
                  <Fingerprint className="w-2 h-2" />
                  CORROB
                </Badge>
              )}
            </div>
            <div className="absolute bottom-2 left-2 z-10">
              <Badge variant="secondary" className="bg-black/80 text-white backdrop-blur-sm border border-white/10 text-[8px] uppercase tracking-widest font-black px-1.5 py-0.5 shadow-md">
                {article.articleType}
              </Badge>
            </div>
          </div>
        )}

        <div className="flex flex-col flex-1 p-3 lg:p-4">
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="flex items-center gap-2 text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
              <span className="text-primary hover:underline cursor-pointer">{article.source}</span>
              <span className="w-0.5 h-0.5 rounded-full bg-muted-foreground/30" />
              <div className="flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
              </div>
            </div>
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-primary/10 rounded border border-primary/20">
              <span className="text-[8px] opacity-60 font-medium uppercase tracking-tighter">Score:</span>
              <span className={cn(
                "text-xs font-black tabular-nums tracking-tighter",
                isCritical && !isReviewed ? "text-rose-500" : "text-primary"
              )}>{article.score}</span>
            </div>
          </div>

          <h3 className={cn(
            "text-base font-headline font-bold mb-1.5 leading-tight transition-colors cursor-pointer group-hover:text-primary",
            isCritical && !isReviewed && "group-hover:text-rose-400"
          )}>
            {article.title}
          </h3>

          <p className="text-[11px] text-muted-foreground mb-3 leading-snug font-medium opacity-90">
            {article.description}
          </p>

          <div className="flex flex-wrap gap-1 mb-3">
            {article.matchedKeywords.map((keyword) => (
              <Badge key={keyword} variant="outline" className="text-[8px] py-0 px-1.5 flex items-center gap-1 border-border/50 bg-muted/5 hover:bg-muted/15 transition-all font-bold tracking-tight">
                <Tag className="w-2 h-2 opacity-60" />
                {keyword}
              </Badge>
            ))}
          </div>

          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full mt-auto">
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/20">
              <div className="flex items-center gap-2">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[9px] font-black uppercase tracking-widest text-accent hover:bg-accent/10">
                    <BarChart3 className="w-3 h-3 mr-1" />
                    Analysis
                    <ChevronRight className={cn("w-2.5 h-2.5 ml-1 transition-transform duration-200", isOpen && "rotate-90")} />
                  </Button>
                </CollapsibleTrigger>
                {!isReviewed && onMarkReviewed && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onMarkReviewed(article.id)}
                    className="h-6 px-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Archive
                  </Button>
                )}
              </div>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors group/link"
              >
                INTEL
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            
            <CollapsibleContent className="mt-3 p-3 bg-muted/5 rounded-lg border border-border/20 space-y-3 animate-in fade-in duration-200">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: "Keywords", value: article.scoreBreakdown.keywordRelevance, max: 40 },
                  { label: "Source", value: article.scoreBreakdown.sourceCredibility, max: 30 },
                  { label: "Urgency", value: article.scoreBreakdown.contentUrgency, max: 20 },
                  { label: "Recency", value: article.scoreBreakdown.recencyWeight, max: 10 }
                ].map((stat) => (
                  <div key={stat.label} className="space-y-1">
                    <div className="flex justify-between text-[7px] font-black uppercase tracking-widest text-muted-foreground/80">
                      <span>{stat.label}</span>
                      <span className="text-foreground/90">{stat.value}/{stat.max}</span>
                    </div>
                    <Progress value={(stat.value / stat.max) * 100} className="h-1" />
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2 border-t border-border/20">
                <div className="w-7 h-7 rounded bg-accent/10 flex items-center justify-center shrink-0 border border-accent/20">
                  <Info className="w-3.5 h-3.5 text-accent" />
                </div>
                <div className="space-y-0.5">
                  <p className="font-black text-[8px] text-accent uppercase tracking-widest">Analyst Briefing</p>
                  <p className="text-[10px] leading-tight text-foreground/80 font-semibold">{article.whyFlagged}</p>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </Card>
  );
}
