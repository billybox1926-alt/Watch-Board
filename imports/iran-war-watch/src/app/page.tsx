"use client";

import { useState, useMemo } from "react";
import { MOCK_ARTICLES } from "@/lib/mock-data";
import { Category, SignalLevel, Article, ReviewStatus, ArticleType, BriefingState } from "@/lib/types";
import { ArticleCard } from "@/components/dashboard/ArticleCard";
import { TopDevelopments } from "@/components/dashboard/TopDevelopments";
import { FilterSidebar } from "@/components/dashboard/FilterSidebar";
import { SidebarProvider, SidebarContent, SidebarTrigger, SidebarInset, Sidebar } from "@/components/ui/sidebar";
import { Shield, Settings, Bell, User, LayoutDashboard, History, BrainCircuit, RefreshCw, Sparkles, AlertCircle, Search, Activity, BarChart3 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { scoreArticle } from "@/ai/flows/article-scoring-engine";
import { classifyArticleSignificance } from "@/ai/flows/article-significance-classification";
import { generateSituationBriefing } from "@/ai/flows/generate-situation-briefing";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";

const SIMULATED_EVENTS = [
  {
    title: "IRGC Naval Drills: Anti-Ship Missile Test in Strait of Hormuz",
    description: "Iranian state media reports successful test-firing of long-range cruise missiles during 'Great Prophet' naval exercises.",
    content: "Imagery confirms multiple launches from mobile coastal batteries. Tone is highly nationalistic and escalatory toward regional transit.",
    source: "IRNA",
    matchedKeywords: ["IRGC", "Missile", "Strait of Hormuz"]
  },
  {
    title: "IAEA Inspectors Denied Entry to Karaj Centrifuge Facility",
    description: "Watchdog reports technical delays and access denials at key manufacturing site, complicating verification efforts.",
    content: "The IAEA Director General expressed grave concern over the lack of transparency regarding centrifuge component production.",
    source: "Reuters",
    matchedKeywords: ["IAEA", "Centrifuge", "Nuclear"]
  },
  {
    title: "Cyber Attack Targets Iranian Port Management System",
    description: "Operations at Shahid Rajaee port reportedly disrupted by 'Predatory Sparrow' hacking group.",
    content: "Large-scale logistics disruption following a sophisticated APT attack. Source attribution remains speculative but suggests state-level capability.",
    source: "AP News",
    matchedKeywords: ["Cyber Attack", "Strait of Hormuz"]
  }
];

export default function Dashboard() {
  const [articles, setArticles] = useState<Article[]>(MOCK_ARTICLES);
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedSignals, setSelectedSignals] = useState<SignalLevel[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<ArticleType[]>([]);
  const [view, setView] = useState<'all' | 'pending' | 'reviewed'>('pending');
  const [isProcessing, setIsProcessing] = useState(false);
  const [briefing, setBriefing] = useState<BriefingState>({
    text: "Review queue contains high-signal nuclear indicators. Focus on Karaj facility access and enrichment stockpiles at Natanz.",
    actionItems: ["Monitor Karaj access status", "Verify enrichment delta"],
    isGenerating: false
  });
  
  const { toast } = useToast();

  const filteredArticles = useMemo(() => {
    return articles
      .filter((article) => {
        const matchesSearch = 
          article.title.toLowerCase().includes(search.toLowerCase()) || 
          article.matchedKeywords.some(k => k.toLowerCase().includes(search.toLowerCase()));
        const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(article.category);
        const matchesSignal = selectedSignals.length === 0 || selectedSignals.includes(article.signalLevel);
        const matchesType = selectedTypes.length === 0 || selectedTypes.includes(article.articleType);
        const matchesView = view === 'all' || article.status === view;
        return matchesSearch && matchesCategory && matchesSignal && matchesView && matchesType;
      })
      .sort((a, b) => b.score - a.score);
  }, [articles, search, selectedCategories, selectedSignals, selectedTypes, view]);

  const chartData = useMemo(() => {
    const counts = { low: 0, medium: 0, high: 0, critical: 0 };
    articles.forEach(a => counts[a.signalLevel]++);
    return [
      { name: "Low", value: counts.low, color: "hsl(var(--muted-foreground))" },
      { name: "Med", value: counts.medium, color: "hsl(var(--primary))" },
      { name: "High", value: counts.high, color: "orange" },
      { name: "Crit", value: counts.critical, color: "hsl(var(--destructive))" },
    ];
  }, [articles]);

  const toggleCategory = (cat: Category) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleSignal = (lvl: SignalLevel) => {
    setSelectedSignals(prev => 
      prev.includes(lvl) ? prev.filter(l => l !== lvl) : [...prev, lvl]
    );
  };

  const toggleType = (type: ArticleType) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, t]
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setSelectedSignals([]);
    setSelectedTypes([]);
  };

  const markAsReviewed = (id: string) => {
    setArticles(prev => prev.map(a => a.id === id ? { ...a, status: 'reviewed' as ReviewStatus } : a));
    toast({
      title: "Indicator Archived",
      description: "Intel item moved to verified historical stream.",
    });
  };

  const runBriefingEngine = async () => {
    if (filteredArticles.length === 0) {
      toast({
        title: "No Data",
        description: "Insufficient intelligence in current view to generate briefing.",
      });
      return;
    }

    setBriefing(prev => ({ ...prev, isGenerating: true }));
    try {
      const topIntel = filteredArticles.slice(0, 5).map(a => ({
        title: a.title,
        description: a.description,
        source: a.source,
        score: a.score,
        signalLevel: a.signalLevel,
        category: a.category
      }));

      const result = await generateSituationBriefing({ articles: topIntel });
      setBriefing({
        text: result.briefing,
        actionItems: result.keyActionItems,
        isGenerating: false
      });
      
      toast({
        title: "SITREP Updated",
        description: "AI synthesized the latest high-signal patterns.",
      });
    } catch (error) {
      setBriefing(prev => ({ ...prev, isGenerating: false }));
      toast({
        variant: "destructive",
        title: "Briefing Error",
        description: "Could not generate situational SITREP.",
      });
    }
  };

  const processIntelligence = async () => {
    setIsProcessing(true);
    
    try {
      const eventIdx = Math.floor(Math.random() * SIMULATED_EVENTS.length);
      const rawInput = SIMULATED_EVENTS[eventIdx];

      const scoreResult = await scoreArticle(rawInput);
      const significanceResult = await classifyArticleSignificance({
        title: rawInput.title,
        description: rawInput.description,
        content: rawInput.content,
        matchedKeywords: rawInput.matchedKeywords,
        source: rawInput.source
      }, ["Reuters", "AP News", "BBC News", "IRNA"]);

      const newArticle: Article = {
        id: Math.random().toString(36).substr(2, 9),
        title: rawInput.title,
        source: rawInput.source,
        publishedAt: new Date().toISOString(),
        url: "#",
        description: rawInput.description,
        content: rawInput.content,
        matchedKeywords: rawInput.matchedKeywords,
        score: scoreResult.score,
        scoreBreakdown: {
          keywordRelevance: scoreResult.breakdown.keywordRelevance,
          sourceCredibility: scoreResult.breakdown.sourceCredibility,
          contentUrgency: scoreResult.breakdown.contentUrgency,
          recencyWeight: scoreResult.breakdown.recencyWeight,
        },
        signalLevel: significanceResult.signalLevel,
        articleType: scoreResult.articleType,
        status: 'pending',
        whyFlagged: scoreResult.explanation,
        category: (rawInput.matchedKeywords.includes("Nuclear") ? "Nuclear" : (rawInput.matchedKeywords.includes("Missile") ? "Conflict" : "Maritime/Energy")) as Category,
        imageUrl: `https://picsum.photos/seed/${Math.random()}/600/400`
      };

      setArticles(prev => [newArticle, ...prev]);
      
      toast({
        title: "Intel Ingested",
        description: `Source: ${rawInput.source} | Signal: ${scoreResult.score} (${significanceResult.signalLevel})`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ingestion Failure",
        description: "Intelligence engine encountered a processing error.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <Sidebar variant="sidebar" collapsible="icon" className="border-r border-border bg-card shadow-xl">
          <SidebarContent>
            <FilterSidebar 
              onSearchChange={setSearch}
              onCategoryToggle={toggleCategory}
              onSignalToggle={toggleSignal}
              onTypeToggle={toggleType}
              selectedCategories={selectedCategories}
              selectedSignals={selectedSignals}
              selectedTypes={selectedTypes}
              onClear={clearFilters}
            />
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1 flex flex-col overflow-hidden">
          <header className="h-12 flex items-center justify-between px-4 border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-50">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="md:hidden" />
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary fill-primary/10" />
                <div>
                  <h1 className="text-sm font-headline font-bold leading-none tracking-tight uppercase">Iran War Watch</h1>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5 opacity-70">Watch Floor Terminal</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="hidden lg:flex items-center gap-3 mr-3 px-3 py-1 bg-muted/20 rounded-full border border-border/30">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Feed Active</span>
                </div>
                <div className="w-px h-2.5 bg-border" />
                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Queue: {articles.filter(a => a.status === 'pending').length}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={processIntelligence} 
                disabled={isProcessing}
                className="hidden md:flex gap-1.5 border-primary/20 hover:bg-primary/5 text-primary font-bold h-8 text-[10px]"
              >
                {isProcessing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <BrainCircuit className="w-3 h-3" />}
                Ingest
              </Button>
              <Button variant="ghost" size="icon" className="relative h-8 w-8 text-muted-foreground">
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-1 h-1 bg-rose-500 rounded-full" />
              </Button>
              <Link href="/settings">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
              <div className="h-5 w-px bg-border mx-1" />
              <Button variant="ghost" className="hidden sm:flex items-center gap-2 px-1.5 h-8 hover:bg-muted/50 rounded-md">
                <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center border border-primary/20">
                  <User className="w-3 h-3 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-bold leading-none">ANALYST-01</p>
                </div>
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="max-w-[1600px] mx-auto p-3 md:p-4 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <Card className="lg:col-span-3 bg-card/20 border-border/30 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between py-2 px-4 border-b border-border/20">
                    <CardTitle className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <BarChart3 className="w-3 h-3" />
                      Signal Density Distribution
                    </CardTitle>
                    <div className="flex items-center gap-1">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                       <span className="text-[8px] font-bold text-muted-foreground">LIVE</span>
                    </div>
                  </CardHeader>
                  <CardContent className="h-[120px] p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <XAxis dataKey="name" fontSize={8} fontWeight="bold" stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '4px', fontSize: '8px', padding: '4px' }}
                          cursor={{ fill: 'hsl(var(--muted)/0.1)' }}
                        />
                        <Bar dataKey="value" radius={[2, 2, 0, 0]} barSize={40}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 p-2 opacity-5">
                    <BrainCircuit className="w-8 h-8 text-accent" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-accent" />
                        <h3 className="text-[9px] font-headline font-bold text-accent uppercase tracking-widest">SITREP Synthesis</h3>
                      </div>
                    </div>
                    
                    <div className={cn("transition-all duration-300", briefing.isGenerating && "opacity-40")}>
                      <p className="text-[11px] leading-tight text-foreground font-medium italic border-l-2 border-accent/30 pl-3 py-0.5 mb-3">
                        {briefing.text}
                      </p>
                      
                      {briefing.actionItems.length > 0 && (
                        <div className="space-y-1.5 bg-background/40 p-2 rounded border border-accent/10">
                          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                            <AlertCircle className="w-2.5 h-2.5" />
                            Recommended Focus
                          </p>
                          <ul className="space-y-1">
                            {briefing.actionItems.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-1.5 text-[9px] font-semibold text-foreground/90 leading-tight">
                                <span className="w-1 h-1 rounded-full bg-accent mt-1 shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={runBriefingEngine}
                    disabled={briefing.isGenerating}
                    className="w-full mt-3 border-accent/30 text-accent hover:bg-accent/10 text-[9px] font-black h-7 gap-1.5 uppercase tracking-widest"
                  >
                    <RefreshCw className={cn("w-3 h-3", briefing.isGenerating && "animate-spin")} />
                    Refresh SITREP
                  </Button>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <h2 className="text-xl font-headline font-bold tracking-tight">Active Indicators</h2>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                        Monitoring <span className="text-foreground">{filteredArticles.length}</span> high-signal reports
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Tabs value={view} onValueChange={(v) => setView(v as any)} className="w-auto">
                        <TabsList className="bg-card border border-border h-8 p-0.5">
                          <TabsTrigger value="pending" className="text-[9px] gap-1.5 px-3 h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold uppercase tracking-tight">
                            <History className="w-3 h-3" />
                            Queue
                          </TabsTrigger>
                          <TabsTrigger value="reviewed" className="text-[9px] gap-1.5 px-3 h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold uppercase tracking-tight">
                            <Activity className="w-3 h-3" />
                            Archive
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </div>

                  <div className="grid gap-2.5">
                    {filteredArticles.length > 0 ? (
                      filteredArticles.map((article) => (
                        <ArticleCard 
                          key={article.id} 
                          article={article} 
                          onMarkReviewed={markAsReviewed}
                        />
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 bg-card/10 rounded-xl border border-dashed border-border/30 text-center">
                        <Search className="w-6 h-6 text-muted-foreground/30 mb-2" />
                        <h3 className="text-sm font-headline font-bold">No indicators detected</h3>
                        <p className="text-[10px] text-muted-foreground mt-1">Adjust filters or ingest fresh data.</p>
                      </div>
                    )}
                  </div>
                </div>

                <aside className="w-full lg:w-72 shrink-0">
                  <TopDevelopments articles={articles} />
                </aside>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
