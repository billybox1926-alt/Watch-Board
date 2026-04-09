

'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Cpu, Zap, RotateCcw, Watch, Plus, Play, Pause, ArrowUp, ArrowDown, Minus, Bot, AlertTriangle } from 'lucide-react';
import { useBoardState, useBoardDispatch } from '@/hooks/use-board-store';
import { useAgentLoop } from '@/hooks/use-agent-loop';
import { initialState } from '@/lib/initial-state';
import type { Module, DecisionActor, Tripwire, ForecastRisk, MicroForecast, Incident, PulseMetric, MemoryRecord, Contradiction, EmergingSignal, Event, BoardState, MissReport } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { rssFeedRegistry } from '@/lib/rss-feeds';
import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend } from "recharts";


const ModuleCard = ({ module }: { module: Module }) => (
    <Dialog>
        <DialogTrigger asChild>
            <Card className="cursor-pointer hover:border-primary/50 transition-colors h-full flex flex-col">
                <CardHeader className="flex flex-row items-start justify-between pb-4">
                    <div className="space-y-1.5">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <span className="text-2xl">{module.icon}</span>
                            {module.title}
                        </CardTitle>
                        <CardDescription>{module.status}</CardDescription>
                    </div>
                    <div className="text-3xl font-bold text-accent">{module.reliability}</div>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground mb-4 h-20">{module.description}</p>
                </CardContent>
                <CardFooter>
                    <Button variant="secondary" size="sm" className="w-full">Open module</Button>
                </CardFooter>
            </Card>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-4">
                    <span className="text-3xl">{module.icon}</span>
                    {module.title}
                </DialogTitle>
                <DialogDescription>
                    {module.layer === 'narrative' ? 'Narrative Layer' : 'Reality Layer'}
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div>
                    <h4 className="font-semibold">Status</h4>
                    <p className="text-sm text-muted-foreground">{module.status}</p>
                </div>
                <div>
                    <h4 className="font-semibold">Description</h4>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                </div>
                <div>
                    <h4 className="font-semibold">Reliability Score</h4>
                    <div className="flex items-center gap-2">
                        <Progress value={module.reliability} className="w-full h-3" />
                        <span className="font-bold text-lg text-accent">{module.reliability}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        This score reflects the historical accuracy and trustworthiness of this data source. It is updated automatically based on system performance.
                    </p>
                </div>
            </div>
        </DialogContent>
    </Dialog>
);


const DecisionActor = ({ actor }: { actor: DecisionActor }) => (
    <div>
        <div className="flex justify-between items-baseline">
            <h4 className="font-semibold">{actor.name}</h4>
            <span className="text-sm text-muted-foreground">Power {actor.power}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{actor.description}</p>
        <div className="flex items-center gap-2 mt-3 text-sm">
            {(actor.actions || []).map((action, index) => (
                <React.Fragment key={index}>
                    <Button variant={action.type === 'primary' ? 'secondary' : 'ghost'} size="sm">{action.label}</Button>
                    {index < actor.actions.length - 1 && <span className="text-muted-foreground">→</span>}
                </React.Fragment>
            ))}
        </div>
    </div>
);

const TripwireCard = ({ tripwire }: { tripwire: Tripwire }) => {
    const statusConfig = {
        inactive: { variant: 'secondary' as const, label: 'Inactive' },
        approaching: { variant: 'default' as const, label: 'Approaching', className: 'bg-yellow-500 hover:bg-yellow-500/90 text-black' },
        triggered: { variant: 'destructive' as const, label: 'Triggered' },
    };
    const config = statusConfig[tripwire.status] || statusConfig.inactive;

    return (
        <div className="flex items-start gap-4 p-4 rounded-lg border">
            <Badge variant={config.variant} className={cn("h-6 mt-1 w-24 justify-center", config.className)}>
                {config.label}
            </Badge>
            <div className="flex-1">
                <h4 className="font-semibold">{tripwire.title}</h4>
                <p className="text-sm text-muted-foreground">{tripwire.description}</p>
            </div>
            <Button variant="outline" size="sm" className="ml-auto">
                <Watch className="mr-2 h-4 w-4"/>
                Watch
            </Button>
        </div>
    );
};

const ForecastRisk = ({ risk }: { risk: ForecastRisk }) => (
    <div>
        <div className="flex justify-between items-baseline mb-1">
            <h4 className="font-semibold">{risk.title}</h4>
            <span className="text-lg font-bold text-accent">{risk.value || 0}%</span>
        </div>
        <Progress value={risk.value || 0} className="h-2 bg-primary/20" />
        <p className="text-xs text-muted-foreground mt-1">{risk.description}</p>
    </div>
);

const MemoryRecordCard = ({ record }: { record: MemoryRecord }) => {
    const pulseMetrics = Object.entries(record.pulse || {});
    const topForecast = (record.forecast?.microForecasts || (record.forecast as any)?.paths)?.sort((a:any,b:any) => b.probability - a.probability)[0];
    return (
        <div className="flex flex-col md:flex-row gap-4 justify-between py-4">
            <div className="flex-1 space-y-1">
                <h4 className="font-semibold">{record.summary}</h4>
                <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(record.timestamp), { addSuffix: true })}</p>
                {topForecast && (
                    <p className="text-xs text-muted-foreground pt-1">
                        Top Forecast: "{topForecast.title}" ({topForecast.probability}%)
                    </p>
                )}
            </div>
            <div className="flex items-center gap-4 text-sm font-mono">
                <div className="text-center">
                    <div className="text-xs text-muted-foreground">Stability</div>
                    <div className="font-bold">{(record.stabilityIndex ?? 0).toFixed(2)}</div>
                </div>
                {pulseMetrics.map(([key, metric]) => {
                     const trendIcon = () => {
                        if (!metric || metric.trend === 'stable') return <Minus className="h-3 w-3 inline text-muted-foreground" />;
                        if (metric.trend === 'up') return <ArrowUp className="h-3 w-3 inline text-green-400" />;
                        return <ArrowDown className="h-3 w-3 inline text-destructive" />;
                     };
                    return (
                        <div key={key} className="text-center">
                            <div className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                            <div><span className="font-bold">{(metric?.value ?? 0).toFixed(1)}</span> {trendIcon()}</div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
};


const IncidentCard = ({ incident, allEvents }: { incident: Incident, allEvents: Event[] }) => {
    const linkedEvents = (incident.linkedEvents || [])
        .map(id => (allEvents || []).find(e => e.id === id))
        .filter((e): e is Event => !!e)
        .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                 <div className="flex justify-between items-baseline">
                    <CardTitle className="text-lg">{incident.title}</CardTitle>
                    <span className="text-xl font-bold text-accent">{(incident.attentionScore || 0).toFixed(2)}</span>
                </div>
                <CardDescription>Updated {formatDistanceToNow(new Date(incident.lastUpdated), { addSuffix: true })}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow">
                <p className="text-sm text-muted-foreground h-12">{incident.summary}</p>
                <div>
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Actors</h4>
                    <div className="flex flex-wrap gap-2">
                        {(incident.actors || []).map(actor => <Badge key={actor} variant="secondary">{actor}</Badge>)}
                    </div>
                </div>
                <div>
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Domains</h4>
                     <div className="flex flex-wrap gap-2">
                        {(incident.domains || []).map(domain => <Badge key={domain} variant="outline">{domain}</Badge>)}
                    </div>
                </div>
            </CardContent>
             <CardFooter>
                {incident.linkedEvents.length > 0 && (
                    <Accordion type="single" collapsible className="w-full pt-2 border-t">
                        <AccordionItem value={incident.id} className="border-t-0">
                            <AccordionTrigger className="py-3 text-sm">
                                View {incident.linkedEvents.length} linked event{incident.linkedEvents.length === 1 ? '' : 's'}
                            </AccordionTrigger>
                            <AccordionContent>
                                <ScrollArea className="h-40">
                                    <div className="space-y-2 pr-4">
                                        {linkedEvents.map(event => (
                                            <div key={event.id} className="text-xs p-2 bg-muted/50 rounded-md">
                                                <p className="font-semibold">{event.title}</p>
                                                <p className="text-muted-foreground flex items-center flex-wrap gap-x-2">
                                                    <span>{formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })} | {event.source}</span>
                                                    {event.tags.includes('real') && <Badge variant="secondary" className="text-xs">Real</Badge>}
                                                    {event.tags.includes('synthetic') && <Badge variant="outline" className="text-xs">Synthetic</Badge>}
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="font-mono border-b border-dashed">
                                                                    C: {(event.confidence || 0).toFixed(2)}
                                                                </span>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <div className="space-y-1 p-1 text-xs w-48">
                                                                    <h4 className="font-bold mb-2">Confidence Breakdown</h4>
                                                                    {event.confidenceBreakdown ? (
                                                                        <>
                                                                            <div className="flex justify-between">
                                                                                <span>Source Reliability:</span>
                                                                                <span className="font-mono ml-2">{(event.confidenceBreakdown?.sourceReliability || 0).toFixed(2)}</span>
                                                                            </div>
                                                                            <div className="flex justify-between">
                                                                                <span>Assertion Strength:</span>
                                                                                <span className="font-mono ml-2">{(event.confidenceBreakdown?.assertionStrength || 0).toFixed(2)}</span>
                                                                            </div>
                                                                            <Separator className="my-2" />
                                                                            <div className="flex justify-between font-bold">
                                                                                <span>Total Weighted:</span>
                                                                                <span className="font-mono ml-2">{(event.confidence || 0).toFixed(2)}</span>
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <p>No breakdown available.</p>
                                                                    )}
                                                                </div>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </p>
                                                {event.skepticFeedback && (
                                                    <p className="text-destructive/80 italic text-[11px] mt-1 pl-1 border-l-2 border-destructive/50">
                                                        "{event.skepticFeedback}"
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                )}
            </CardFooter>
        </Card>
    );
};

const PulseMetricCard = ({ label, metric, higherIsBetter = false }: { label: string; metric?: PulseMetric; higherIsBetter?: boolean }) => {
    if (!metric) {
        return (
            <div className="flex flex-col rounded-lg bg-card p-3 text-center">
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="flex items-center justify-center gap-1">
                    <span className="text-2xl font-bold">--</span>
                    <Minus className="h-4 w-4 text-muted-foreground" />
                </dd>
            </div>
        );
    }

    const trendIcon = () => {
        if (metric.trend === 'stable') return <Minus className="h-4 w-4 text-muted-foreground" />;
        
        const isUp = metric.trend === 'up';
        const isGood = higherIsBetter ? isUp : !isUp;
        const colorClass = isGood ? "text-green-400" : "text-destructive";

        if (isUp) return <ArrowUp className={cn("h-4 w-4", colorClass)} />;
        return <ArrowDown className={cn("h-4 w-4", colorClass)} />;
    };
    
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex flex-col rounded-lg bg-card p-3 text-center">
                        <dt className="text-sm text-muted-foreground">{label}</dt>
                        <dd className="flex items-center justify-center gap-1">
                            <span className="text-2xl font-bold">{(metric.value || 0).toFixed(1)}</span>
                            {trendIcon()}
                        </dd>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{metric.description || 'No description available.'}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};


const StabilityCard = ({ compositeState }: { compositeState?: BoardState['compositeState'] }) => {
    const stabilityTrendIcon = () => {
        if (!compositeState?.stabilityTrend || compositeState.stabilityTrend === 'stable') return <Minus className="h-4 w-4 text-muted-foreground" />;
        if (compositeState.stabilityTrend === 'up') return <ArrowUp className="h-4 w-4 text-green-400" />;
        return <ArrowDown className="h-4 w-4 text-destructive" />;
    };
    
    const stabilityIndex = compositeState?.stabilityIndex ?? 0;

    const stabilityColor = () => {
        if (stabilityIndex > 0.7) return "text-green-400";
        if (stabilityIndex > 0.4) return "text-yellow-400";
        return "text-destructive";
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>System Stability</CardTitle>
                <CardDescription>{compositeState?.scoreDescription || 'Calculating...'}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Stability Index</span>
                    <span className={cn("text-2xl font-bold flex items-center gap-1", stabilityColor())}>
                        {stabilityIndex.toFixed(2)}
                        {stabilityTrendIcon()}
                    </span>
                </div>
                <Progress value={stabilityIndex * 100} className="h-2" />
            </CardContent>
        </Card>
    )
}

const TripwireSummaryCard = ({ tripwires }: { tripwires: Tripwire[] }) => {
    const triggered = (tripwires || []).filter(t => t.status === 'triggered');
    const approaching = (tripwires || []).filter(t => t.status === 'approaching');
    const mostUrgent = triggered[0] || approaching[0];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tripwire Status</CardTitle>
                <CardDescription>
                    {triggered.length} triggered, {approaching.length} approaching.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {mostUrgent ? (
                    <div className={cn(
                        "flex items-start gap-4 p-3 rounded-lg border",
                        mostUrgent.status === 'triggered' ? "border-destructive/50 bg-destructive/10" : "border-yellow-500/50 bg-yellow-500/10"
                    )}>
                        <Badge variant={mostUrgent.status === 'triggered' ? 'destructive' : 'default'} className={cn("h-6 mt-1 w-24 justify-center", mostUrgent.status === 'approaching' && 'bg-yellow-500 hover:bg-yellow-500/90 text-black')}>
                            {mostUrgent.status === 'triggered' ? 'Triggered' : 'Approaching'}
                        </Badge>
                        <div className="flex-1">
                            <h4 className="font-semibold">{mostUrgent.title}</h4>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-4">
                        <p>All tripwires are inactive.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default function Home() {
    const boardData = useBoardState();
    const dispatch = useBoardDispatch();
    const { isRunning, setIsRunning } = useAgentLoop(10000);

    const boardState = boardData || initialState;

    const {
        title,
        status = [],
        subtitle,
        description,
        supervisorBrief,
        redTeamNote,
        compositeState = initialState.compositeState,
        modules = [],
        agentStates = [],
        synthesis = initialState.synthesis,
        influenceNetwork = initialState.influenceNetwork,
        memory = initialState.memory,
        edgeCases = initialState.edgeCases,
        contradictions = initialState.contradictions,
        tripwires = initialState.tripwires,
        emergingSignals = initialState.emergingSignals,
        simulationLab = initialState.simulationLab,
        systemReflection = initialState.systemReflection,
        missReview = initialState.missReview,
        forecast = initialState.forecast,
        timeline = initialState.timeline,
        terminal = initialState.terminal,
        globalPulse = initialState.globalPulse,
        incidents = [],
        events = [],
        eventLog = [],
        lastAgentOutputs = {},
        causalLinks = [],
        calibration = initialState.calibration,
        operatorIntent = initialState.operatorIntent,
        quarantine = initialState.quarantine,
    } = boardState;
    
    const narrativeModules = modules.filter(m => m.layer === 'narrative');
    const realityModules = modules.filter(m => m.layer === 'reality');
    const ingestionMetrics = (lastAgentOutputs as any)?.collector?.metrics;


    const [simValues, setSimValues] = useState({
        kineticTempo: globalPulse.kineticTempo.value,
        narrativeDrift: globalPulse.narrativeDrift.value,
        cooperationLevel: globalPulse.cooperationLevel.value
    });

    useEffect(() => {
        setSimValues({
            kineticTempo: globalPulse?.kineticTempo?.value ?? 0,
            narrativeDrift: globalPulse?.narrativeDrift?.value ?? 0,
            cooperationLevel: globalPulse?.cooperationLevel?.value ?? 0,
        });
    }, [globalPulse]);

    const handleSimValueChange = (key: keyof typeof simValues, value: number[]) => {
        setSimValues(prev => ({ ...prev, [key]: value[0] }));
    };

    const handleRunSimulation = () => {
        dispatch({
            type: 'SIMULATE_SCENARIO',
            payload: simValues
        });
    };

    const handleInjectResidue = (type: 'cooperation' | 'betrayal' | 'shock', amount: number) => {
        dispatch({
            type: 'INJECT_RESIDUE',
            payload: { type, amount }
        });
    };

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset the system? This will clear all memory and restore the initial state.')) {
            dispatch({ type: 'SET_STATE', payload: initialState });
        }
    };
    
    const handleIntentChange = (key: keyof typeof operatorIntent, value: any) => {
        dispatch({
            type: 'UPDATE_OPERATOR_INTENT',
            payload: { [key]: value }
        });
    };

    const sortedIncidents = [...(incidents || [])].sort((a, b) => (b.attentionScore || 0) - (a.attentionScore || 0));

    const biggestRisk = [...(forecast.risks || [])].sort((a, b) => b.value - a.value)[0] || { title: 'Calculating...', value: 0 };
    
    const stabilityIndex = compositeState?.stabilityIndex ?? 0;
    const stabilityColor = () => {
        if (stabilityIndex > 0.7) return "text-green-400";
        if (stabilityIndex > 0.4) return "text-yellow-400";
        return "text-destructive";
    }

    const calibrationChartData = (calibration?.history || [])
        .map(record => ({
            name: record.hypothesisTitle.length > 25 ? record.hypothesisTitle.substring(0, 22) + '...' : record.hypothesisTitle,
            predicted: record.predictedProbability,
            actual: record.outcome === 'confirmed' ? 100 : (record.outcome === 'denied' ? 0 : null),
        }))
        .filter(item => item.actual !== null)
        .reverse();

    const calibrationChartConfig = {
        predicted: {
            label: "Predicted",
            color: "hsl(var(--muted-foreground))",
        },
        actual: {
            label: "Actual",
            color: "hsl(var(--primary))",
        },
    } satisfies ChartConfig;


    return (
        <div className="bg-background text-foreground min-h-screen p-4 sm:p-6 lg:p-8 font-body">
            <header className="mb-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold text-primary">{title}</h1>
                    <div className="flex items-center flex-wrap gap-4 text-sm text-muted-foreground">
                        {status.map((s, i) => (
                           <React.Fragment key={i}>
                             { i > 0 && <span>&middot;</span> }
                             <span>{s}</span>
                           </React.Fragment>
                        ))}
                    </div>
                </div>
                <h2 className="text-4xl font-headline mt-2">{subtitle}</h2>
                
                <Card className="mt-6 border-primary/30">
                    <CardContent className="p-4 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                        <div className="md:col-span-3">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">System Thesis</h3>
                            <p className="text-base font-medium">{compositeState.description}</p>
                        </div>
                        <div className="text-center">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Stability</h3>
                            <p className={cn("text-3xl font-bold", stabilityColor())}>
                                {compositeState.stabilityIndex.toFixed(2)}
                            </p>
                        </div>
                         <div className="text-center">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Biggest Risk</h3>
                            <p className="font-semibold text-destructive">{biggestRisk.title}</p>
                            <p className="text-sm text-muted-foreground">{biggestRisk.value}%</p>
                         </div>
                    </CardContent>
                </Card>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-lg">Primary Interpretation</CardTitle>
                            <CardDescription>The system's initial assessment of the event's meaning.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{supervisorBrief || 'Awaiting analysis...'}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-destructive/20">
                        <CardHeader>
                            <CardTitle className="text-lg">Structured Challenge</CardTitle>
                            <CardDescription>The Red Team agent's counter-argument to the primary interpretation.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {redTeamNote ? (
                                <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-body">
                                    {redTeamNote}
                                </pre>
                            ) : (
                                <p className="text-sm text-muted-foreground">No challenges raised.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </header>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3 md:grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="incidents">Incidents</TabsTrigger>
                    <TabsTrigger value="forecast">Forecast & Risks</TabsTrigger>
                    <TabsTrigger value="analysis">Deep Analysis</TabsTrigger>
                    <TabsTrigger value="system">System Internals</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                        
                        <aside className="xl:col-span-3 space-y-6">
                            <StabilityCard compositeState={compositeState} />
                            <TripwireSummaryCard tripwires={tripwires.items} />

                            <Card>
                                <CardHeader>
                                    <CardTitle>Global Pulse & Drift Tracker</CardTitle>
                                    <CardDescription>Key system metrics and their slow-moving trends.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    <PulseMetricCard label="Kinetic" metric={globalPulse.kineticTempo} />
                                    <PulseMetricCard label="Narrative" metric={globalPulse.narrativeDrift} />
                                    <PulseMetricCard label="Escalation" metric={globalPulse.escalationPressure} />
                                    <PulseMetricCard label="Cooperation" metric={globalPulse.cooperationLevel} higherIsBetter={true} />
                                    <div className="col-span-2">
                                    <PulseMetricCard label="Uncertainty" metric={globalPulse.uncertainty} />
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardHeader>
                                    <CardTitle>Operator Intent</CardTitle>
                                    <CardDescription>Align system analysis with your strategic goals.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Priority</Label>
                                        <Select value={operatorIntent?.priority || 'stability'} onValueChange={(value) => handleIntentChange('priority', value)}>
                                            <SelectTrigger className="h-9 mt-1">
                                                <SelectValue placeholder="Select priority" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="stability">Stability</SelectItem>
                                                <SelectItem value="escalation">Escalation</SelectItem>
                                                <SelectItem value="diplomacy">Diplomacy</SelectItem>
                                                <SelectItem value="all">All Factors</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                     <div>
                                        <Label className="text-xs text-muted-foreground">Risk Tolerance</Label>
                                        <Select value={operatorIntent?.riskTolerance || 'medium'} onValueChange={(value) => handleIntentChange('riskTolerance', value)}>
                                            <SelectTrigger className="h-9 mt-1">
                                                <SelectValue placeholder="Select risk tolerance" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Time Horizon</Label>
                                        <Select value={operatorIntent?.timeHorizon || 'medium'} onValueChange={(value) => handleIntentChange('timeHorizon', value)}>
                                            <SelectTrigger className="h-9 mt-1">
                                                <SelectValue placeholder="Select time horizon" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="short">Short (Days)</SelectItem>
                                                <SelectItem value="medium">Medium (Weeks)</SelectItem>
                                                <SelectItem value="long">Long (Months)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="secondary" onClick={() => setIsRunning(!isRunning)}>
                                    {isRunning ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                                    {isRunning ? 'Pause' : 'Resume'}
                                </Button>
                                <Button variant="secondary" onClick={handleReset}><RotateCcw className="mr-2 h-4 w-4" /> Reset</Button>
                            </div>
                        </aside>

                        <main className="xl:col-span-9 space-y-8">
                             <Card>
                                <CardHeader>
                                    <CardTitle>Top Attention Targets</CardTitle>
                                    <CardDescription>The highest-scoring active incident clusters that demand immediate focus.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {sortedIncidents.length > 0 ? (
                                        sortedIncidents.slice(0, 3).map(incident => <IncidentCard key={incident.id} incident={incident} allEvents={events} />)
                                    ) : (
                                        <div className="col-span-full text-center text-muted-foreground py-12">
                                            <p>No incidents clustered yet. The system is monitoring for correlated events.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Secondary Analysis</CardTitle>
                                    <CardDescription>Contextual signals and system self-reflection.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                     <Tabs defaultValue="signals" className="w-full">
                                        <TabsList>
                                            <TabsTrigger value="signals">Emerging Signals</TabsTrigger>
                                            <TabsTrigger value="contradictions">Contradictions</TabsTrigger>
                                            <TabsTrigger value="reflection">System Reflection</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="signals" className="mt-4">
                                            {emergingSignals.items.length > 0 ? (
                                                <div className="space-y-4">
                                                {emergingSignals.items.map(item => (
                                                    <div key={item.id} className="p-3 rounded-lg border bg-card-foreground/5">
                                                        <div className="flex justify-between items-start gap-2">
                                                            <h4 className="font-semibold text-accent flex-1">{item.title}</h4>
                                                            <Badge variant="outline">Novelty: {(item.score || 0).toFixed(2)}</Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mt-1">{item.summary}</p>
                                                        <p className="text-xs text-muted-foreground mt-2 text-right">{formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}</p>
                                                    </div>
                                                ))}
                                                </div>
                                            ) : (
                                                <div className="text-center text-muted-foreground py-8">
                                                    <p>No significant weak signals detected.</p>
                                                </div>
                                            )}
                                        </TabsContent>
                                        <TabsContent value="contradictions" className="mt-4">
                                             {contradictions.items.length > 0 ? (
                                                <div className="space-y-4">
                                                {contradictions.items.map(item => (
                                                    <div key={item.id} className="p-4 rounded-lg border bg-card-foreground/5">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <h4 className="font-semibold text-accent">{item.actor}</h4>
                                                            <Badge variant="destructive">{item.severity}</Badge>
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            <div>
                                                                <p className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">Statement (Narrative)</p>
                                                                <p className="text-sm italic">"{item.statement.replace('Said: ', '')}"</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">Action (Reality)</p>
                                                                <p className="text-sm">{item.action.replace('Did: ', '')}</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-3 text-right">Detected: {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}</p>
                                                    </div>
                                                ))}
                                                </div>
                                            ) : (
                                                <div className="text-center text-muted-foreground py-8">
                                                    <p>No narrative-reality divergence detected.</p>
                                                </div>
                                            )}
                                        </TabsContent>
                                        <TabsContent value="reflection" className="mt-4">
                                            <div className="space-y-4">
                                            {systemReflection.items.map(item => (
                                                <div key={item.id}>
                                                    <h4 className="font-semibold text-accent">{item.title}</h4>
                                                    <p className="text-sm text-muted-foreground">{item.content}</p>
                                                </div>
                                            ))}
                                            </div>
                                        </TabsContent>
                                     </Tabs>
                                </CardContent>
                            </Card>
                        </main>
                    </div>
                </TabsContent>

                <TabsContent value="incidents" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Incident Clusters</CardTitle>
                            <CardDescription>Automatically correlated events, ranked by potential impact.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                           {sortedIncidents.length > 0 ? (
                                sortedIncidents.map(incident => <IncidentCard key={incident.id} incident={incident} allEvents={events}/>)
                           ) : (
                                <div className="col-span-full text-center text-muted-foreground py-12">
                                    <p>No incidents clustered yet. The system is monitoring for correlated events.</p>
                                </div>
                           )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="forecast" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Micro-Forecasts & Hypotheses</CardTitle>
                                <CardDescription>Short-term, falsifiable predictions generated by the system each cycle.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Accordion type="multiple" className="w-full">
                                    {(forecast.microForecasts || []).map((forecastItem) => (
                                        <AccordionItem value={forecastItem.id} key={forecastItem.id} className="px-6">
                                            <AccordionTrigger className="py-3 hover:no-underline font-normal text-left">
                                                <div className="w-full">
                                                    <div className="flex justify-between items-baseline">
                                                        <h4 className="font-semibold text-base">{forecastItem.title}</h4>
                                                        <span className="text-xl font-bold text-accent">{forecastItem.probability}%</span>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="pt-2 pb-4">
                                                <p className="text-sm text-muted-foreground">{forecastItem.description}</p>
                                                
                                                {forecastItem.drivers && forecastItem.drivers.length > 0 && (
                                                    <div className="mt-4">
                                                        <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Why? Key Drivers</h5>
                                                        <div className="space-y-1 text-sm">
                                                            {forecastItem.drivers.map((driver, i) => {
                                                                const isPositive = driver.startsWith('+');
                                                                const isNegative = driver.startsWith('-');
                                                                const text = driver.replace(/^[+-]\s*/, '');
                                                                return (
                                                                    <div key={i} className="flex items-start gap-2">
                                                                        {isPositive && <ArrowUp className="h-4 w-4 mt-0.5 text-green-400 flex-shrink-0" />}
                                                                        {isNegative && <ArrowDown className="h-4 w-4 mt-0.5 text-destructive flex-shrink-0" />}
                                                                        {!isPositive && !isNegative && <Minus className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />}
                                                                        <span className="text-muted-foreground">{text}</span>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {forecastItem.timeHorizon && (
                                                    <p className="text-xs text-muted-foreground mt-4">Time Horizon: <span className="font-semibold">{forecastItem.timeHorizon}</span></p>
                                                )}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>
                        <div className="space-y-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Forecast Risks</CardTitle>
                                    <CardDescription>Probability of critical board states.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    {(forecast.risks || []).map(risk => <ForecastRisk key={risk.id} risk={risk} />)}
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>{tripwires.title}</CardTitle>
                                    <CardDescription>{tripwires.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {(tripwires.items || []).map(item => <TripwireCard key={item.id} tripwire={item} />)}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="analysis" className="mt-6">
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card>
                            <CardHeader>
                                <CardDescription>{synthesis.description}</CardDescription>
                                <CardTitle>{synthesis.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {(synthesis.items || []).map(item => (
                                    <div key={item.id}><h4 className="font-semibold">{item.title}</h4><p className="text-muted-foreground text-sm">{item.subtitle}</p><p className="text-xs text-muted-foreground">{item.description}</p></div>
                                ))}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardDescription>{influenceNetwork.description}</CardDescription>
                                <CardTitle>{influenceNetwork.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {(influenceNetwork.actors || []).map((actor, index) => (
                                    <React.Fragment key={actor.id}>
                                        <DecisionActor actor={actor} />
                                        {index < influenceNetwork.actors.length - 1 && <Separator />}
                                    </React.Fragment>
                                ))}
                            </CardContent>
                        </Card>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:col-span-2">
                             <Card>
                                <CardHeader>
                                    <CardDescription>{memory.description}</CardDescription>
                                    <CardTitle>{memory.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-xs text-muted-foreground">Pattern persistence</p>
                                    <div><div className="flex justify-between text-sm mb-1"><span>Cooperation residue</span><span>{memory.residue.cooperation}%</span></div><Progress value={memory.residue.cooperation} /></div>
                                    <div><div className="flex justify-between text-sm mb-1"><span>Betrayal residue</span><span>{memory.residue.betrayal}%</span></div><Progress value={memory.residue.betrayal} /></div>
                                    <div><div className="flex justify-between text-sm mb-1"><span>Shock residue</span><span>{memory.residue.shock}%</span></div><Progress value={memory.residue.shock} /></div>
                                    <Separator />
                                     <h4 className="font-semibold text-sm pt-2">Retrospective Analysis</h4>
                                      <ScrollArea className="h-72">
                                        <div className="divide-y pr-4">
                                            {(memory.history && memory.history.length > 0) ? (
                                                memory.history.map(record => <MemoryRecordCard key={record.timestamp} record={record} />)
                                            ) : (
                                                <div className="text-center text-muted-foreground py-12">
                                                    <p>No memory records yet. Run the engine to generate history.</p>
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardDescription>{edgeCases.description}</CardDescription>
                                    <CardTitle>{edgeCases.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {(edgeCases.items || []).map(item => (
                                        <div key={item.id} className="p-3 rounded-lg bg-card-foreground/5">
                                            <h4 className="font-semibold text-accent">{item.title}</h4>
                                            <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="system" className="mt-6">
                    <Tabs defaultValue="modules" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
                            <TabsTrigger value="modules">Modules</TabsTrigger>
                            <TabsTrigger value="causal-map">Causal Map</TabsTrigger>
                            <TabsTrigger value="calibration">Calibration</TabsTrigger>
                            <TabsTrigger value="simulation">Simulation</TabsTrigger>
                            <TabsTrigger value="terminal">Terminal</TabsTrigger>
                        </TabsList>

                        <TabsContent value="modules" className="mt-6">
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-xl font-semibold mb-2 text-accent">Ingestion Layer</h3>
                                    <p className="text-sm text-muted-foreground mb-4 max-w-2xl">External signals enter the system here. They are filtered for quality before processing.</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>{rssFeedRegistry.length > 0 ? "Live RSS Feeds" : "RSS Feeds"}</CardTitle>
                                                <CardDescription>Public feeds being monitored for new signals.</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                {rssFeedRegistry.length > 0 ? (
                                                    <ul className="space-y-2 text-sm">
                                                        {rssFeedRegistry.map(feed => (
                                                            <li key={feed.id} className="flex justify-between items-center">
                                                                <span>{feed.name}</span>
                                                                <Badge variant="outline">{feed.category}</Badge>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">No RSS feeds are configured.</p>
                                                )}
                                            </CardContent>
                                            {ingestionMetrics && (
                                                <>
                                                    <Separator className="my-2" />
                                                    <CardFooter className="flex justify-between text-xs text-muted-foreground pt-4">
                                                        <span>Incoming: {ingestionMetrics.incoming}</span>
                                                        <span>Processed: {ingestionMetrics.processed}</span>
                                                        <span>Backlog: {ingestionMetrics.backlog}</span>
                                                    </CardFooter>
                                                </>
                                            )}
                                        </Card>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>{quarantine.title}</CardTitle>
                                                <CardDescription>{quarantine.description}</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                {quarantine.items.length > 0 ? (
                                                    <ScrollArea className="h-40">
                                                        <div className="space-y-3 pr-4">
                                                        {quarantine.items.map((item, index) => (
                                                            <div key={index} className="text-xs p-2 bg-muted/50 rounded-md">
                                                                <p className="font-semibold truncate">{item.title}</p>
                                                                <p className="text-muted-foreground">Source: {item.source}</p>
                                                                <p className="text-muted-foreground truncate">{item.content}</p>
                                                            </div>
                                                        ))}
                                                        </div>
                                                    </ScrollArea>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">The quarantine is empty.</p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-2 text-accent">Narrative Layer</h3>
                                    <p className="text-sm text-muted-foreground mb-4 max-w-2xl">What actors are saying, how coalitions are shifting, and the stories being told. This is the realm of intent and diplomacy.</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {narrativeModules.map(module => <ModuleCard key={module.id} module={module} />)}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-2 text-accent">Reality Layer</h3>
                                    <p className="text-sm text-muted-foreground mb-4 max-w-2xl">What is physically happening on the ground. This is the realm of kinetic action, infrastructure, and observable facts.</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {realityModules.map(module => <ModuleCard key={module.id} module={module} />)}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="causal-map" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Causal Map</CardTitle>
                                    <CardDescription>Inferred causal relationships between events, sorted by strength. (Top 10 shown)</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {causalLinks && causalLinks.length > 0 ? (
                                        <div className="space-y-4">
                                            {[...(causalLinks || [])].sort((a, b) => b.strength - a.strength).slice(0,10).map((link, index) => {
                                                const fromEvent = events.find(e => e.id === link.from);
                                                const toEvent = events.find(e => e.id === link.to);
                                                if (!fromEvent || !toEvent) return null;

                                                return (
                                                    <div key={index} className="flex items-center gap-4 p-3 rounded-lg border">
                                                        <div className="flex-1">
                                                            <p className="text-sm font-semibold">{fromEvent.title}</p>
                                                            <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(fromEvent.timestamp), { addSuffix: true })}</p>
                                                        </div>
                                                        <div className="flex flex-col items-center text-center w-32">
                                                            <p className="text-sm font-bold capitalize text-primary">{link.type}</p>
                                                            <p className="text-xs text-muted-foreground">Strength: {link.strength.toFixed(2)}</p>
                                                            <div className="w-full h-1 bg-muted rounded-full mt-1">
                                                                <div className="h-1 bg-primary rounded-full" style={{ width: `${link.strength * 100}%` }}></div>
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 text-right">
                                                            <p className="text-sm font-semibold">{toEvent.title}</p>
                                                            <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(toEvent.timestamp), { addSuffix: true })}</p>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center text-muted-foreground py-12">
                                            <p>No causal links inferred yet. The system is analyzing event sequences.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                        
                        <TabsContent value="calibration" className="mt-6">
                            <div className="space-y-8">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{calibration.title}</CardTitle>
                                        <CardDescription>{calibration.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <h4 className="font-semibold">Model Bias</h4>
                                            <div>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span>Overconfidence</span>
                                                    <span>{(calibration.overconfidenceScore || 0).toFixed(1)}%</span>
                                                </div>
                                                <Progress value={calibration.overconfidenceScore} />
                                                <p className="text-xs text-muted-foreground mt-1">System tends to assign higher probabilities than outcomes justify.</p>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span>Underconfidence</span>
                                                    <span>{(calibration.underconfidenceScore || 0).toFixed(1)}%</span>
                                                </div>
                                                <Progress value={calibration.underconfidenceScore} />
                                                 <p className="text-xs text-muted-foreground mt-1">System tends to assign lower probabilities than outcomes justify.</p>
                                            </div>
                                            <div className="pt-4">
                                                <h4 className="font-semibold mb-4">Confidence vs. Reality</h4>
                                                <p className="text-sm text-muted-foreground mb-4">A comparison of predicted probabilities against actual outcomes for recent resolved forecasts.</p>
                                                <div className="h-60">
                                                    <ChartContainer config={calibrationChartConfig} className="w-full h-full">
                                                        <BarChart accessibilityLayer data={calibrationChartData} margin={{ top: 20 }}>
                                                            <CartesianGrid vertical={false} />
                                                            <XAxis 
                                                                dataKey="name" 
                                                                tickLine={false} 
                                                                tickMargin={10} 
                                                                axisLine={false}
                                                                tickFormatter={(value) => value.substring(0, 15) + (value.length > 15 ? '...' : '')}
                                                            />
                                                            <YAxis domain={[0, 100]} />
                                                            <RechartsTooltip 
                                                                cursor={{ fill: 'hsl(var(--muted))' }}
                                                                content={<ChartTooltipContent indicator="dot" />} 
                                                            />
                                                            <Legend content={() => null} />
                                                            <Bar dataKey="predicted" fill="var(--color-predicted)" radius={4} />
                                                            <Bar dataKey="actual" fill="var(--color-actual)" radius={4} />
                                                        </BarChart>
                                                    </ChartContainer>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                             <h4 className="font-semibold mb-4">Recent Calibration Events</h4>
                                             <ScrollArea className="h-[34rem]">
                                                <div className="space-y-4">
                                                    {calibration.history.length > 0 ? calibration.history.map(record => (
                                                        <div key={record.id} className="p-3 rounded-lg border text-sm">
                                                            <p>Hypothesis <span className="font-semibold text-accent">"{record.hypothesisTitle}"</span> was predicted with <span className="font-bold">{record.predictedProbability}%</span> probability.</p>
                                                            <p className="text-muted-foreground">Outcome: <span className={cn("font-semibold", record.outcome === 'confirmed' ? 'text-green-400' : 'text-destructive')}>{record.outcome}</span>. {record.notes}</p>
                                                             <p className="text-xs text-muted-foreground mt-2 text-right">{formatDistanceToNow(new Date(record.timestamp), { addSuffix: true })}</p>
                                                        </div>
                                                    )) : (
                                                        <div className="text-center text-muted-foreground py-12">
                                                            <p>No calibration events yet.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </ScrollArea>
                                        </div>
                                    </CardContent>
                                </Card>
                                 <Card>
                                    <CardHeader>
                                        <CardTitle>{missReview.title}</CardTitle>
                                        <CardDescription>{missReview.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ScrollArea className="h-96">
                                            <div className="space-y-4 pr-4">
                                                {missReview.reports.length > 0 ? missReview.reports.map(report => (
                                                    <div key={report.id} className="p-3 rounded-lg border text-sm bg-card-foreground/5">
                                                        <p className="font-semibold text-accent">Miss by {report.agentName} Agent</p>
                                                        <div className="mt-2 space-y-1">
                                                            <p><span className="font-semibold text-foreground/80">What was wrong:</span> {report.whatWasWrong}</p>
                                                            <p className="text-muted-foreground"><span className="font-semibold text-foreground/80">Why it happened:</span> {report.whyItHappened}</p>
                                                            <p className="text-muted-foreground"><span className="font-semibold text-foreground/80">Adjustment made:</span> {report.adjustmentMade}</p>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-2 text-right">{formatDistanceToNow(new Date(report.timestamp), { addSuffix: true })}</p>
                                                    </div>
                                                )) : (
                                                    <div className="text-center text-muted-foreground py-12">
                                                        <p>No agent misses detected recently.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                         <TabsContent value="simulation" className="mt-6">
                             <Card>
                                <CardHeader>
                                    <CardTitle>{simulationLab.title}</CardTitle>
                                    <CardDescription>{simulationLab.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span>Kinetic Tempo</span>
                                                <span className="font-bold">{(simValues.kineticTempo || 0).toFixed(1)}</span>
                                            </div>
                                            <Slider value={[simValues.kineticTempo || 0]} onValueChange={(val) => handleSimValueChange('kineticTempo', val)} max={10} step={0.1} />
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span>Narrative Drift</span>
                                                <span className="font-bold">{(simValues.narrativeDrift || 0).toFixed(1)}</span>
                                            </div>
                                            <Slider value={[simValues.narrativeDrift || 0]} onValueChange={(val) => handleSimValueChange('narrativeDrift', val)} max={10} step={0.1} />
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span>Cooperation Level</span>
                                                <span className="font-bold">{(simValues.cooperationLevel || 0).toFixed(1)}</span>
                                            </div>
                                            <Slider value={[simValues.cooperationLevel || 0]} onValueChange={(val) => handleSimValueChange('cooperationLevel', val)} max={10} step={0.1} />
                                        </div>
                                    </div>

                                    <Button onClick={handleRunSimulation} className="w-full">
                                        <Zap className="mr-2 h-4 w-4" />
                                        Run Simulation
                                    </Button>
                                    
                                    <Separator />
                                    
                                    <div className="space-y-4">
                                        <h4 className="font-semibold">Inject Memory Residue</h4>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Cooperation</span>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" onClick={() => handleInjectResidue('cooperation', 10)}><Plus className="h-4 w-4 mr-1"/>Add</Button>
                                                <Button size="sm" variant="outline" onClick={() => handleInjectResidue('cooperation', -10)}><Minus className="h-4 w-4 mr-1"/>Remove</Button>
                                            </div>
                                        </div>
                                         <div className="flex items-center justify-between">
                                            <span className="text-sm">Betrayal</span>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" onClick={() => handleInjectResidue('betrayal', 10)}><Plus className="h-4 w-4 mr-1"/>Add</Button>
                                                <Button size="sm" variant="outline" onClick={() => handleInjectResidue('betrayal', -10)}><Minus className="h-4 w-4 mr-1"/>Remove</Button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Shock</span>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" onClick={() => handleInjectResidue('shock', 10)}><Plus className="h-4 w-4 mr-1"/>Add</Button>
                                                <Button size="sm" variant="outline" onClick={() => handleInjectResidue('shock', -10)}><Minus className="h-4 w-4 mr-1"/>Remove</Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="terminal" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{terminal.title}</CardTitle>
                                    <CardDescription>{terminal.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="grid lg:grid-cols-3 gap-x-8 gap-y-12">
                                    <div className="lg:col-span-2 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-semibold">Agent Activity Log</h4>
                                            <Badge variant="outline" className={isRunning ? "text-green-400 border-green-500/50" : ""}>{isRunning ? 'Live' : 'Paused'}</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">The agent pipeline's actions and reasoning.</p>
                                        <ScrollArea className="h-96 w-full rounded-md border mt-2">
                                          <div className="p-4 font-mono text-xs">
                                            {(eventLog || []).slice().reverse().map((entry, i) => (
                                                <div key={i} className="border-b py-2">
                                                    <p className="flex items-center gap-2">
                                                        <span className="font-bold text-primary/80 w-20">{entry.agent}</span>
                                                        <span>{entry.message}</span>
                                                    </p>
                                                    <p className="text-muted-foreground text-[10px] pl-24">{formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}</p>
                                                </div>
                                            ))}
                                          </div>
                                        </ScrollArea>
                                        <Accordion type="single" collapsible className="w-full pt-4">
                                            <AccordionItem value="item-1">
                                                <AccordionTrigger>Show Raw Event Store</AccordionTrigger>
                                                <AccordionContent>
                                                    <ScrollArea className="h-72 w-full rounded-md border mt-2 bg-muted/20">
                                                        <pre className="p-4 text-xs font-mono">{JSON.stringify(events, null, 2)}</pre>
                                                    </ScrollArea>
                                                </AccordionContent>
                                            </AccordionItem>
                                            <AccordionItem value="item-2">
                                                <AccordionTrigger>Show Agent Outputs</AccordionTrigger>
                                                <AccordionContent>
                                                     <ScrollArea className="h-72 w-full rounded-md border mt-2 bg-muted/20">
                                                        <pre className="p-4 text-xs font-mono">{JSON.stringify(lastAgentOutputs, null, 2)}</pre>
                                                    </ScrollArea>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="space-y-2 pt-8">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-semibold">Agent Performance</h4>
                                            </div>
                                            <p className="text-sm text-muted-foreground">Agent reliability scores, updated each cycle.</p>
                                            <div className="pt-2 space-y-6">
                                            {(agentStates || []).map(agent => (
                                                <div key={agent.id}>
                                                    <div className="flex justify-between text-sm mb-2">
                                                        <span className="font-semibold">{agent.name}</span>
                                                        <span className="font-bold text-primary">{(agent.reliability || 0).toFixed(0)}%</span>
                                                    </div>
                                                    <div className="space-y-2 text-xs">
                                                        <div>
                                                            <div className="flex justify-between text-muted-foreground">
                                                                <span>Precision</span>
                                                                <span>{(agent.scores?.precision || 0).toFixed(0)}%</span>
                                                            </div>
                                                            <Progress value={agent.scores?.precision || 0} className="h-1 mt-1" />
                                                        </div>
                                                         <div>
                                                            <div className="flex justify-between text-muted-foreground">
                                                                <span>Usefulness</span>
                                                                <span>{(agent.scores?.usefulness || 0).toFixed(0)}%</span>
                                                            </div>
                                                            <Progress value={agent.scores?.usefulness || 0} className="h-1 mt-1" />
                                                        </div>
                                                         <div>
                                                            <div className="flex justify-between text-muted-foreground">
                                                                <span>Calibration</span>
                                                                <span>{(agent.scores?.calibration || 0).toFixed(0)}%</span>
                                                            </div>
                                                            <Progress value={agent.scores?.calibration || 0} className="h-1 mt-1" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                 <CardFooter className="text-xs text-muted-foreground flex justify-between items-center">
                                    <p>v4 adds actor reactions, memory decay/persistence, nonlinear pressure, and autonomous snap behavior.</p>
                                    {(lastAgentOutputs as any)?.system?.cycleTime && (
                                        <p>Last cycle: {(lastAgentOutputs as any).system.cycleTime}ms</p>
                                    )}
                                </CardFooter>
                            </Card>
                        </TabsContent>

                    </Tabs>
                </TabsContent>
            </Tabs>
        </div>
    );
}
