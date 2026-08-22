import React, { useState } from 'react';
import { ScadaProvider } from './context/ScadaContext';
import { Header } from './components/layout/Header';
import { Sidebar, ViewType } from './components/layout/Sidebar';
import { MainDashboard } from './components/dashboard/MainDashboard';
import { MachineDetailView } from './components/machines/MachineDetailView';
import { LiveTagMonitor } from './components/tags/LiveTagMonitor';
import { TagStudio } from './components/tags/TagStudio';
import { PlcCommunicationView } from './components/plc/PlcCommunicationView';
import { AlarmManagementView } from './components/alarms/AlarmManagementView';
import { HistorianTrendsView } from './components/historian/HistorianTrendsView';
import { OeeAnalyticsView } from './components/oee/OeeAnalyticsView';
import { ReportManagementView } from './components/reports/ReportManagementView';
import { NotificationCenterView } from './components/notifications/NotificationCenterView';
import { AiCopilotView } from './components/ai/AiCopilotView';
import { DeepLearningKnowledgeBase } from './components/ai/DeepLearningKnowledgeBase';
import { SettingsView } from './components/settings/SettingsView';

function ScadaApp() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedMachineId, setSelectedMachineId] = useState<string | undefined>(undefined);
  const [selectedTagId, setSelectedTagId] = useState<string | undefined>(undefined);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | undefined>(undefined);

  const handleSelectMachine = (machineId: string) => {
    setSelectedMachineId(machineId);
    setCurrentView('machines');
  };

  const handleNavigateToHistorian = (tagId?: string) => {
    setSelectedTagId(tagId);
    setCurrentView('historian');
  };

  const handleNavigateToAi = (prompt?: string) => {
    setAiInitialPrompt(prompt);
    setCurrentView('ai-copilot');
  };

  const handleNavigateToAlarms = () => {
    setCurrentView('alarms');
  };

  const handleNavigateToOee = () => {
    setCurrentView('oee');
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 flex-col overflow-hidden font-sans select-none">
      {/* Top Industrial Header */}
      <Header
        onNavigateToAi={() => handleNavigateToAi()}
        onNavigateToAlarms={handleNavigateToAlarms}
      />

      {/* Main Content Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar Navigation */}
        <Sidebar
          currentView={currentView}
          onSelectView={view => {
            setCurrentView(view);
            if (view !== 'ai-copilot') setAiInitialPrompt(undefined);
          }}
        />

        {/* Dynamic Main Workspace Screen */}
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950">
          <div className="max-w-[1600px] mx-auto">
            {currentView === 'dashboard' && (
              <MainDashboard
                onSelectMachine={handleSelectMachine}
                onNavigateToAlarms={handleNavigateToAlarms}
                onNavigateToAi={handleNavigateToAi}
                onNavigateToOee={handleNavigateToOee}
              />
            )}

            {currentView === 'machines' && (
              <MachineDetailView
                selectedMachineId={selectedMachineId}
                onNavigateToAi={handleNavigateToAi}
                onNavigateToHistorian={handleNavigateToHistorian}
              />
            )}

            {currentView === 'tags-live' && (
              <LiveTagMonitor onNavigateToHistorian={handleNavigateToHistorian} />
            )}

            {currentView === 'tags-studio' && <TagStudio />}

            {currentView === 'plc-drivers' && <PlcCommunicationView />}

            {currentView === 'alarms' && (
              <AlarmManagementView onNavigateToAi={handleNavigateToAi} />
            )}

            {currentView === 'notifications' && <NotificationCenterView />}

            {currentView === 'historian' && (
              <HistorianTrendsView initialSelectedTagId={selectedTagId} />
            )}

            {currentView === 'oee' && (
              <OeeAnalyticsView
                onNavigateToAi={handleNavigateToAi}
                onSelectMachine={handleSelectMachine}
              />
            )}

            {currentView === 'reports' && <ReportManagementView />}

            {currentView === 'ai-copilot' && (
              <AiCopilotView initialPrompt={aiInitialPrompt} />
            )}

            {currentView === 'deep-learning' && <DeepLearningKnowledgeBase />}

            {currentView === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ScadaProvider>
      <ScadaApp />
    </ScadaProvider>
  );
}
