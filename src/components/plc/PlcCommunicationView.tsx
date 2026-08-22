import React, { useState } from 'react';
import { useScada } from '../../context/ScadaContext';
import {
  Server,
  Layers,
  Terminal,
  Database,
  Plus,
  Radio,
  Cpu,
  Activity,
  Zap,
  Sparkles,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { PlcDevice } from '../../types/scada';
import { PlcOverviewGrid } from './PlcOverviewGrid';
import { PlcConfigModal } from './PlcConfigModal';
import { PlcPingDiagnosticModal } from './PlcPingDiagnosticModal';
import { PlcCommunicationTerminal } from './PlcCommunicationTerminal';
import { PlcHierarchyExplorer } from './PlcHierarchyExplorer';
import { PlcMemoryInspector } from './PlcMemoryInspector';

type PlcSubTab = 'overview' | 'hierarchy' | 'terminal' | 'memory';

export const PlcCommunicationView: React.FC = () => {
  const { plcs, t } = useScada();
  const [activeTab, setActiveTab] = useState<PlcSubTab>('overview');

  // Modal states
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [editingPlc, setEditingPlc] = useState<PlcDevice | null>(null);
  const [isPingModalOpen, setIsPingModalOpen] = useState(false);
  const [pingTargetPlc, setPingTargetPlc] = useState<PlcDevice | null>(null);
  const [selectedPlcId, setSelectedPlcId] = useState<string>(plcs[0]?.id || '');

  const handleOpenAddModal = () => {
    setEditingPlc(null);
    setIsConfigModalOpen(true);
  };

  const handleEditPlc = (plc: PlcDevice) => {
    setEditingPlc(plc);
    setIsConfigModalOpen(true);
  };

  const handlePingPlc = (plc: PlcDevice) => {
    setPingTargetPlc(plc);
    setIsPingModalOpen(true);
  };

  const handleSelectPlcFromHierarchy = (plcId: string) => {
    setSelectedPlcId(plcId);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
            <Server className="w-4 h-4" />
            <span>INDUSTRIAL PLC COMMUNICATION & DRIVER RACK</span>
          </div>
          <h1 className="text-2xl font-black text-slate-100 mt-1">
            {t('plcTitle')} ({plcs.length} PLCs)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('plcDesc')}
          </p>
        </div>

        {/* Quick Action in Header */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ PLC</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'overview' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10' : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
        >
          <Server className="w-4 h-4" />
          <span>PLC Overview & Fleet Grid</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-950 text-[10px] font-mono text-cyan-400">
            {plcs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('hierarchy')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'hierarchy' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10' : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
        >
          <Layers className="w-4 h-4" />
          <span>Factory & PLC Hierarchy (5 Cấp)</span>
        </button>

        <button
          onClick={() => setActiveTab('terminal')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'terminal' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10' : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
        >
          <Terminal className="w-4 h-4" />
          <span>Live Communication Terminal</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>

        <button
          onClick={() => setActiveTab('memory')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'memory' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10' : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
        >
          <Database className="w-4 h-4" />
          <span>Register & Bit Inspector</span>
        </button>
      </div>

      {/* Main Tab Contents */}
      <div>
        {activeTab === 'overview' && (
          <PlcOverviewGrid
            onEditPlc={handleEditPlc}
            onPingPlc={handlePingPlc}
            onOpenAddModal={handleOpenAddModal}
            onSelectPlcDetail={id => setSelectedPlcId(id)}
          />
        )}

        {activeTab === 'hierarchy' && (
          <PlcHierarchyExplorer
            onSelectPlc={handleSelectPlcFromHierarchy}
          />
        )}

        {activeTab === 'terminal' && (
          <PlcCommunicationTerminal selectedPlcId={selectedPlcId} />
        )}

        {activeTab === 'memory' && (
          <PlcMemoryInspector
            selectedPlcId={selectedPlcId}
            onSelectPlc={id => setSelectedPlcId(id)}
          />
        )}
      </div>

      {/* Modals */}
      <PlcConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => {
          setIsConfigModalOpen(false);
          setEditingPlc(null);
        }}
        initialPlc={editingPlc}
      />

      <PlcPingDiagnosticModal
        isOpen={isPingModalOpen}
        onClose={() => {
          setIsPingModalOpen(false);
          setPingTargetPlc(null);
        }}
        plc={pingTargetPlc}
      />
    </div>
  );
};
