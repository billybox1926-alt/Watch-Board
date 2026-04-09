import { useState } from "react";
import { CommandBar } from "@/components/CommandBar";
import { HeroSection } from "@/components/HeroSection";
import { DetailPanel } from "@/components/DetailPanel";
import { GlobalPulseModal } from "@/components/GlobalPulseModal";
import { OverviewTab } from "@/components/tabs/OverviewTab";
import { WarLayerTab } from "@/components/tabs/WarLayerTab";
import { ChokepointsTab } from "@/components/tabs/ChokepointsTab";
import { FracturePillarsTab } from "@/components/tabs/FracturePillarsTab";
import { TripwiresTab } from "@/components/tabs/TripwiresTab";
import { PropagationTab } from "@/components/tabs/PropagationTab";
import { ScenariosTab } from "@/components/tabs/ScenariosTab";
import { SnapshotLogTab } from "@/components/tabs/SnapshotLogTab";
import type { IntelCard, StatusLevel } from "@/data/types";
import { Crosshair, Layers, Navigation, Columns3, AlertTriangle, GitBranch, SplitSquareHorizontal, Clock } from "lucide-react";

const tabs = [
  { id: "overview", label: "Overview", icon: Crosshair },
  { id: "war-layer", label: "War Layer", icon: Layers },
  { id: "chokepoints", label: "Chokepoints", icon: Navigation },
  { id: "fracture-pillars", label: "Fracture Pillars", icon: Columns3 },
  { id: "tripwires", label: "Tripwires", icon: AlertTriangle },
  { id: "propagation", label: "Propagation", icon: GitBranch },
  { id: "scenarios", label: "Scenarios", icon: SplitSquareHorizontal },
  { id: "snapshot-log", label: "Log", icon: Clock },
];

const tabSectionMap: Record<string, string> = {
  "Chokepoints": "chokepoints",
  "War Layer": "war-layer",
  "Fracture Pillars": "fracture-pillars",
};

export default function Index() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCard, setSelectedCard] = useState<IntelCard | null>(null);
  const [pulseOpen, setPulseOpen] = useState(false);
  const [liveSync, setLiveSync] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusLevel | null>(null);

  const handleJumpToSection = (section: string) => {
    const tab = tabSectionMap[section] || section.toLowerCase().replace(/\s+/g, "-");
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-background text-foreground scrollbar-thin">
      <CommandBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAnalyze={() => setPulseOpen(true)}
        liveSync={liveSync}
        onToggleSync={() => setLiveSync(!liveSync)}
        statusFilter={statusFilter}
        onStatusFilter={setStatusFilter}
      />

      <HeroSection onJumpToSection={handleJumpToSection} />

      {/* Tab bar */}
      <div className="px-4 md:px-6 border-b border-border">
        <div className="flex gap-0.5 overflow-x-auto scrollbar-thin pb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 px-2.5 py-2 text-xs whitespace-nowrap transition-colors border-b -mb-px ${
                  activeTab === tab.id
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3 w-3" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <main className="px-4 md:px-6 py-5">
        {activeTab === "overview" && <OverviewTab searchQuery={searchQuery} onSelectCard={setSelectedCard} />}
        {activeTab === "war-layer" && <WarLayerTab searchQuery={searchQuery} onSelectCard={setSelectedCard} />}
        {activeTab === "chokepoints" && <ChokepointsTab searchQuery={searchQuery} onSelectCard={setSelectedCard} />}
        {activeTab === "fracture-pillars" && <FracturePillarsTab searchQuery={searchQuery} onSelectCard={setSelectedCard} />}
        {activeTab === "tripwires" && <TripwiresTab searchQuery={searchQuery} />}
        {activeTab === "propagation" && <PropagationTab searchQuery={searchQuery} />}
        {activeTab === "scenarios" && <ScenariosTab searchQuery={searchQuery} />}
        {activeTab === "snapshot-log" && <SnapshotLogTab searchQuery={searchQuery} />}
      </main>

      <DetailPanel card={selectedCard} onClose={() => setSelectedCard(null)} />
      <GlobalPulseModal open={pulseOpen} onClose={() => setPulseOpen(false)} />
    </div>
  );
}
