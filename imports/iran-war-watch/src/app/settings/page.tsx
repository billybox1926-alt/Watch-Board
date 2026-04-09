
"use client";

import { useState } from "react";
import { INITIAL_SETTINGS } from "@/lib/mock-data";
import { AppSettings, Category } from "@/lib/types";
import { Shield, Save, ArrowLeft, Plus, X, Globe, Weight, ListTodo } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [newSource, setNewSource] = useState("");
  const [newKeywords, setNewKeywords] = useState<Record<string, string>>({});

  const handleWeightChange = (key: keyof AppSettings['scoringWeights'], value: string) => {
    setSettings(prev => ({
      ...prev,
      scoringWeights: {
        ...prev.scoringWeights,
        [key]: parseInt(value) || 0
      }
    }));
  };

  const addSource = () => {
    if (newSource && !settings.trustedSources.includes(newSource)) {
      setSettings(prev => ({
        ...prev,
        trustedSources: [...prev.trustedSources, newSource]
      }));
      setNewSource("");
    }
  };

  const removeSource = (source: string) => {
    setSettings(prev => ({
      ...prev,
      trustedSources: prev.trustedSources.filter(s => s !== source)
    }));
  };

  const addKeyword = (catId: Category) => {
    const kw = newKeywords[catId];
    if (kw) {
      setSettings(prev => ({
        ...prev,
        watchlists: prev.watchlists.map(w => 
          w.id === catId ? { ...w, keywords: [...w.keywords, kw] } : w
        )
      }));
      setNewKeywords(prev => ({ ...prev, [catId]: "" }));
    }
  };

  const removeKeyword = (catId: Category, keyword: string) => {
    setSettings(prev => ({
      ...prev,
      watchlists: prev.watchlists.map(w => 
        w.id === catId ? { ...w, keywords: w.keywords.filter(k => k !== keyword) } : w
      )
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary fill-primary/20" />
            <h1 className="text-xl font-headline font-bold">Admin Configuration</h1>
          </div>
        </div>
        <Button className="h-9 gap-2 font-bold px-6">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </header>

      <main className="max-w-4xl mx-auto p-6 md:p-12">
        <Tabs defaultValue="watchlists" className="space-y-8">
          <TabsList className="bg-card border border-border h-12 p-1 w-full justify-start overflow-x-auto">
            <TabsTrigger value="watchlists" className="gap-2 px-6 h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <ListTodo className="w-4 h-4" />
              Watchlists
            </TabsTrigger>
            <TabsTrigger value="sources" className="gap-2 px-6 h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Globe className="w-4 h-4" />
              Trusted Sources
            </TabsTrigger>
            <TabsTrigger value="scoring" className="gap-2 px-6 h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Weight className="w-4 h-4" />
              Scoring Weights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="watchlists" className="space-y-6">
            <div className="grid gap-6">
              {settings.watchlists.map(group => (
                <Card key={group.id} className="bg-card border-border overflow-hidden">
                  <CardHeader className="bg-secondary/20">
                    <CardTitle className="text-sm font-headline uppercase tracking-widest flex items-center justify-between">
                      {group.id}
                      <span className="text-[10px] text-muted-foreground bg-background px-2 py-0.5 rounded-full border border-border">
                        {group.keywords.length} Keywords
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {group.keywords.map(kw => (
                        <div key={kw} className="flex items-center gap-1 bg-background border border-border pl-3 pr-1 py-1 rounded-md group hover:border-primary transition-colors">
                          <span className="text-xs font-medium">{kw}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5 text-muted-foreground hover:text-destructive"
                            onClick={() => removeKeyword(group.id, kw)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Input 
                        placeholder="Add keyword..." 
                        value={newKeywords[group.id] || ""}
                        onChange={(e) => setNewKeywords(prev => ({ ...prev, [group.id]: e.target.value }))}
                        className="h-9 bg-background/50"
                        onKeyDown={(e) => e.key === 'Enter' && addKeyword(group.id)}
                      />
                      <Button size="sm" onClick={() => addKeyword(group.id)} className="shrink-0 h-9">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sources">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg font-headline">Manage Trusted Sources</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {settings.trustedSources.map(source => (
                    <div key={source} className="flex items-center justify-between p-3 bg-secondary/20 rounded-xl border border-border group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {source[0]}
                        </div>
                        <span className="text-sm font-semibold">{source}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeSource(source)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Separator className="bg-border" />
                <div className="flex gap-3">
                  <Input 
                    placeholder="Source name (e.g. Associated Press)" 
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    className="h-10 bg-background/50"
                    onKeyDown={(e) => e.key === 'Enter' && addSource()}
                  />
                  <Button onClick={addSource} className="gap-2 px-6 h-10">
                    <Plus className="w-4 h-4" />
                    Add Source
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scoring">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg font-headline">Intelligence Scoring Algorithm</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                <div className="grid gap-8">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-bold">Keyword Match Weight</Label>
                      <span className="text-primary font-bold">{settings.scoringWeights.keywordMatch} pts</span>
                    </div>
                    <Input 
                      type="range" min="0" max="50" 
                      value={settings.scoringWeights.keywordMatch}
                      onChange={(e) => handleWeightChange('keywordMatch', e.target.value)}
                      className="accent-primary"
                    />
                    <p className="text-[11px] text-muted-foreground">Points added for each primary keyword found in title/description.</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-bold">Source Trust Bonus</Label>
                      <span className="text-primary font-bold">{settings.scoringWeights.sourceTrust} pts</span>
                    </div>
                    <Input 
                      type="range" min="0" max="100" 
                      value={settings.scoringWeights.sourceTrust}
                      onChange={(e) => handleWeightChange('sourceTrust', e.target.value)}
                      className="accent-primary"
                    />
                    <p className="text-[11px] text-muted-foreground">Extra points awarded if article originates from a trusted source list.</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-bold">Recency Sensitivity</Label>
                      <span className="text-primary font-bold">{settings.scoringWeights.recency}x</span>
                    </div>
                    <Input 
                      type="range" min="1" max="10" 
                      value={settings.scoringWeights.recency}
                      onChange={(e) => handleWeightChange('recency', e.target.value)}
                      className="accent-primary"
                    />
                    <p className="text-[11px] text-muted-foreground">Multiplier applied based on how many hours have passed since publication.</p>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-primary/10 rounded-xl border border-primary/20">
                  <h4 className="text-xs font-bold text-primary uppercase mb-2">Algorithm Note</h4>
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    Total Score = (Keyword Matches × Weight) + (Trusted ? Source Trust Bonus : 0) + (Recency Bonus).
                    Articles with scores over 80 are automatically classified as 'High' or 'Critical' signal.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
