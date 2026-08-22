import React, { useState, useMemo } from 'react';
import { useScada } from '../../context/ScadaContext';
import {
  Factory,
  Layers,
  Activity,
  Cpu,
  Server,
  Radio,
  Search,
  ChevronRight,
  ChevronDown,
  LineChart as LineChartIcon,
  CheckCircle2,
  AlertTriangle,
  Star,
  Edit3,
  Plus,
  Shield,
  Filter,
  RefreshCw,
  Zap,
  Info,
  Calendar,
  Layers3,
  Sliders,
  Bell,
  ArrowRight
} from 'lucide-react';
import { Tag, FactoryHierarchyItem, Machine, PlcDevice, AlarmCondition, AlarmPriority } from '../../types/scada';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

interface LiveTagMonitorProps {
  onNavigateToHistorian: (tagId: string) => void;
}

type SearchScopeMode = 'Current Machine' | 'Current PLC' | 'Current Line' | 'Entire Factory';

export const LiveTagMonitor: React.FC<LiveTagMonitorProps> = ({ onNavigateToHistorian }) => {
  const {
    tags,
    machines,
    plcs,
    factoryHierarchy,
    currentUser,
    writeTagValue,
    toggleTagFavorite,
    tagHistoryBuffer,
    createAlarmRule,
    getTagsByMachine,
    getTagsByPlc,
    getTagsByLine,
    getScopedTags,
    t
  } = useScada();

  // Role Scoping Constraints (Req 57)
  const isOperator = currentUser.role === 'Operator';
  const isEngineer = currentUser.role === 'Engineer';
  const isAdmin = currentUser.role === 'Admin' || currentUser.role === 'Maintenance';

  // Default assigned machine for Operator (e.g. CNC Machine 01 / m-01)
  const defaultMachineId = isOperator ? (machines[0]?.id || 'm-01') : 'm-01';
  const defaultMachine = machines.find(m => m.id === defaultMachineId) || machines[0];

  // Tree & Navigation Selection State
  const [selectedNodeType, setSelectedNodeType] = useState<'Factory' | 'Area' | 'Line' | 'Machine' | 'PLC' | 'Tag'>('Machine');
  const [selectedNodeId, setSelectedNodeId] = useState<string>(defaultMachineId);
  const [inspectedTagId, setInspectedTagId] = useState<string | null>(null);

  // Expanded Tree Nodes State
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'factory-01': true,
    'area-01': true,
    'line-m-01': true,
    'node-m-01': true,
    'node-plc-01': true
  });
  const [treeSearchQuery, setTreeSearchQuery] = useState('');

  // Scoped Search & Filter State (Req 53)
  const [searchScopeMode, setSearchScopeMode] = useState<SearchScopeMode>(
    isOperator ? 'Current Machine' : isEngineer ? 'Current Line' : 'Current Machine'
  );
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // Pagination State (Req 50, 58)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Tag Override / Write State
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [overrideValue, setOverrideValue] = useState<string>('');

  // Alarm Rule Modal State (Req 56)
  const [alarmModalTag, setAlarmModalTag] = useState<Tag | null>(null);
  const [alarmCondition, setAlarmCondition] = useState<AlarmCondition>('GreaterThan');
  const [alarmLimit, setAlarmLimit] = useState<number>(75);
  const [alarmPriority, setAlarmPriority] = useState<AlarmPriority>('High');
  const [alarmMessage, setAlarmMessage] = useState<string>('');

  // Trend Range State (Req 55)
  const [trendRange, setTrendRange] = useState<'5m' | '15m' | '1h'>('5m');

  // Derive active context objects
  const activeMachine = useMemo(() => {
    if (selectedNodeType === 'Machine') return machines.find(m => m.id === selectedNodeId);
    if (selectedNodeType === 'PLC') {
      const targetPlc = plcs.find(p => p.id === selectedNodeId);
      return machines.find(m => m.id === targetPlc?.machineId || m.plcId === targetPlc?.id);
    }
    if (selectedNodeType === 'Tag') {
      const targetTag = tags.find(t => t.id === selectedNodeId);
      return machines.find(m => m.id === targetTag?.machineId);
    }
    return machines[0];
  }, [selectedNodeType, selectedNodeId, machines, plcs, tags]);

  const activePlc = useMemo(() => {
    if (selectedNodeType === 'PLC') return plcs.find(p => p.id === selectedNodeId);
    if (selectedNodeType === 'Machine' && activeMachine) {
      return plcs.find(p => p.id === activeMachine.plcId || p.machineId === activeMachine.id);
    }
    if (selectedNodeType === 'Tag') {
      const targetTag = tags.find(t => t.id === selectedNodeId);
      return plcs.find(p => p.id === targetTag?.plcId);
    }
    return plcs[0];
  }, [selectedNodeType, selectedNodeId, activeMachine, plcs, tags]);

  // Determine active context scope tags based on Tree Selection & Search Scope (Req 47, 48, 49, 51, 53)
  const scopedTagsList = useMemo(() => {
    let sourceTags: Tag[] = [];

    if (searchScopeMode === 'Current Machine' && activeMachine) {
      sourceTags = getTagsByMachine(activeMachine.id);
    } else if (searchScopeMode === 'Current PLC' && activePlc) {
      sourceTags = getTagsByPlc(activePlc.id);
    } else if (searchScopeMode === 'Current Line' && activeMachine) {
      sourceTags = getTagsByLine(activeMachine.line);
    } else if (searchScopeMode === 'Entire Factory') {
      if (isOperator) {
        // Enforce operator restriction to assigned machine
        sourceTags = getTagsByMachine(defaultMachineId);
      } else {
        sourceTags = tags;
      }
    } else {
      // Default to node selection
      if (selectedNodeType === 'Machine' && activeMachine) {
        sourceTags = getTagsByMachine(activeMachine.id);
      } else if (selectedNodeType === 'PLC' && activePlc) {
        sourceTags = getTagsByPlc(activePlc.id);
      } else if (selectedNodeType === 'Line' && activeMachine) {
        sourceTags = getTagsByLine(activeMachine.line);
      } else {
        sourceTags = tags;
      }
    }

    // Apply Filter & Search Query
    return sourceTags.filter(t => {
      if (favoritesOnly && !t.isFavorite) return false;
      if (tagSearchQuery.trim()) {
        const q = tagSearchQuery.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          t.address.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [
    searchScopeMode,
    selectedNodeType,
    activeMachine,
    activePlc,
    favoritesOnly,
    tagSearchQuery,
    tags,
    isOperator,
    defaultMachineId,
    getTagsByMachine,
    getTagsByPlc,
    getTagsByLine
  ]);

  // Pagination calculation
  const totalTags = scopedTagsList.length;
  const totalPages = Math.ceil(totalTags / pageSize) || 1;
  const paginatedTags = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return scopedTagsList.slice(start, start + pageSize);
  }, [scopedTagsList, currentPage, pageSize]);

  // Tree Toggle Handler
  const toggleNodeExpand = (nodeId: string) => {
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const expandAllTree = () => {
    const ids: Record<string, boolean> = {};
    const traverse = (item: FactoryHierarchyItem) => {
      ids[item.id] = true;
      if (item.children) item.children.forEach(traverse);
    };
    factoryHierarchy.forEach(traverse);
    setExpandedNodes(ids);
  };

  const collapseAllTree = () => {
    setExpandedNodes({});
  };

  // Tag Write Submit
  const handleTagWriteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTag) return;

    let parsedVal: number | string | boolean = overrideValue;
    if (editingTag.dataType === 'Bool') {
      parsedVal = overrideValue === 'true' || overrideValue === '1';
    } else if (editingTag.dataType === 'Int' || editingTag.dataType === 'DInt') {
      parsedVal = parseInt(overrideValue, 10);
    } else if (editingTag.dataType === 'Float' || editingTag.dataType === 'Double') {
      parsedVal = parseFloat(overrideValue);
    }

    const success = writeTagValue(editingTag.id, parsedVal);
    if (success) {
      setEditingTag(null);
      setOverrideValue('');
    }
  };

  // Quick Alarm Rule Submit (Req 56)
  const handleCreateAlarmRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alarmModalTag || !activeMachine) return;

    createAlarmRule({
      name: `Cảnh báo ${alarmModalTag.name} (${alarmCondition} ${alarmLimit}${alarmModalTag.unit})`,
      tagId: alarmModalTag.id,
      machineId: activeMachine.id,
      condition: alarmCondition,
      limitValue: alarmLimit,
      priority: alarmPriority,
      message: alarmMessage || `Giá trị Tag ${alarmModalTag.name} vi phạm ngưỡng ${alarmCondition} ${alarmLimit} ${alarmModalTag.unit}`,
      enabled: true,
      soundAlert: alarmPriority === 'Critical' || alarmPriority === 'High',
      autoAcknowledge: false
    });

    setAlarmModalTag(null);
    setAlarmMessage('');
  };

  // Selected Tag for Detail Trend Inspection (Req 50, 55)
  const activeInspectedTag = useMemo(() => {
    if (inspectedTagId) return tags.find(t => t.id === inspectedTagId) || null;
    return paginatedTags[0] || null;
  }, [inspectedTagId, tags, paginatedTags]);

  const activeTagHistory = useMemo(() => {
    if (!activeInspectedTag) return [];
    return tagHistoryBuffer[activeInspectedTag.id] || [];
  }, [activeInspectedTag, tagHistoryBuffer]);

  // Tree Node Icon helper
  const getNodeIcon = (type: FactoryHierarchyItem['type']) => {
    switch (type) {
      case 'Factory':
        return <Factory className="w-4 h-4 text-amber-400" />;
      case 'Area':
        return <Layers className="w-4 h-4 text-purple-400" />;
      case 'Line':
        return <Activity className="w-4 h-4 text-cyan-400" />;
      case 'Machine':
        return <Cpu className="w-4 h-4 text-blue-400" />;
      case 'PLC':
        return <Server className="w-4 h-4 text-emerald-400" />;
      case 'Tag':
        return <Radio className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  // Render Tree Recursive
  const renderTree = (node: FactoryHierarchyItem, level: number = 0) => {
    const isExpanded = !!expandedNodes[node.id];
    const hasChildren = node.children && node.children.length > 0;
    const isMatch =
      treeSearchQuery === '' ||
      node.name.toLowerCase().includes(treeSearchQuery.toLowerCase()) ||
      node.code.toLowerCase().includes(treeSearchQuery.toLowerCase());

    if (!isMatch && !hasChildren) return null;

    const cleanId = node.id.replace('node-', '');
    const isSelected = selectedNodeId === cleanId;

    return (
      <div key={node.id} className="select-none">
        <div
          onClick={() => {
            setSelectedNodeType(node.type);
            setSelectedNodeId(cleanId);
            if (node.type === 'Machine') setSearchScopeMode('Current Machine');
            if (node.type === 'PLC') setSearchScopeMode('Current PLC');
            if (node.type === 'Line') setSearchScopeMode('Current Line');
            setCurrentPage(1);
          }}
          className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer transition-colors text-xs ${
            isSelected
              ? 'bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 font-bold shadow-md'
              : 'hover:bg-slate-800/60 text-slate-300'
          }`}
          style={{ paddingLeft: `${Math.max(10, level * 16 + 8)}px` }}
        >
          <div className="flex items-center space-x-2 min-w-0">
            {hasChildren ? (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  toggleNodeExpand(node.id);
                }}
                className="p-0.5 rounded text-slate-400 hover:text-slate-200"
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <span className="w-4" />
            )}

            {getNodeIcon(node.type)}

            <div className="flex items-baseline space-x-1.5 truncate">
              <span className="font-semibold truncate">{node.name}</span>
              <span className="text-[10px] font-mono text-slate-500">({node.code})</span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 text-[10px] shrink-0 ml-2">
            {node.metrics?.tagsCount !== undefined && node.type !== 'Tag' && (
              <span className="px-1.5 py-0.5 rounded bg-slate-950/80 text-slate-400 font-mono">
                {node.metrics.tagsCount} Tags
              </span>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-0.5 mt-0.5">
            {node.children!.map(child => renderTree(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Top Header & Breadcrumb Context Banner (Req 46, 49) */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
              <Radio className="w-4 h-4 animate-pulse text-cyan-400" />
              <span>MACHINE FIRST HIERARCHICAL TAG EXPLORER</span>
            </div>

            {/* Hierarchical Context Breadcrumb (Req 46, 49) */}
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-mono">
              <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800/60 text-amber-300 font-bold flex items-center space-x-1">
                <Factory className="w-3 h-3" />
                <span>Nhà Máy HAT Industrial</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

              <span className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800/60 text-purple-300 font-bold flex items-center space-x-1">
                <Layers className="w-3 h-3" />
                <span>Khu Vực 01 - Gia Công SMT</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

              <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 font-bold flex items-center space-x-1">
                <Activity className="w-3 h-3" />
                <span>Line: {activeMachine ? activeMachine.line : 'Line 01'}</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

              <span className="px-2 py-0.5 rounded bg-blue-950/80 border border-blue-800/60 text-blue-300 font-bold flex items-center space-x-1">
                <Cpu className="w-3 h-3" />
                <span>Machine: {activeMachine ? `${activeMachine.code} - ${activeMachine.name}` : 'CNC Machine 01'}</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

              <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 font-bold flex items-center space-x-1">
                <Server className="w-3 h-3" />
                <span>PLC: {activePlc ? `${activePlc.name} (${activePlc.brand})` : 'Keyence KV-8000'}</span>
              </span>
            </div>
          </div>

          {/* User Role Permission Badge (Req 57) */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center space-x-2 ${
              isOperator
                ? 'bg-amber-950/70 border-amber-800/80 text-amber-300'
                : isEngineer
                ? 'bg-cyan-950/70 border-cyan-800/80 text-cyan-300'
                : 'bg-emerald-950/70 border-emerald-800/80 text-emerald-300'
            }`}>
              <Shield className="w-3.5 h-3.5" />
              <span>
                ROLE: {currentUser.role.toUpperCase()}
                {isOperator && ' (Scope: Current Machine Only)'}
                {isEngineer && ' (Scope: Current Line)'}
                {isAdmin && ' (Scope: Entire Factory Access)'}
              </span>
            </div>
          </div>
        </div>

        {/* Scoped Search System Controls (Req 53) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-slate-800">
          {/* Scope Mode Selector Buttons (Req 53) */}
          <div className="md:col-span-6 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono text-slate-400 mr-1 flex items-center space-x-1">
              <Filter className="w-3 h-3" />
              <span>{t('filter')}:</span>
            </span>

            <button
              onClick={() => { setSearchScopeMode('Current Machine'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                searchScopeMode === 'Current Machine'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Machine ({activeMachine?.code})
            </button>

            <button
              onClick={() => { setSearchScopeMode('Current PLC'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                searchScopeMode === 'Current PLC'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              PLC ({activePlc?.name})
            </button>

            <button
              onClick={() => { setSearchScopeMode('Current Line'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                searchScopeMode === 'Current Line'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Line
            </button>

            <button
              disabled={isOperator}
              onClick={() => {
                if (isAdmin || isEngineer) {
                  setSearchScopeMode('Entire Factory');
                  setCurrentPage(1);
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                searchScopeMode === 'Entire Factory'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              } ${isOperator ? 'opacity-40 cursor-not-allowed' : ''}`}
              title={isOperator ? 'Operator restricted' : 'Admin Search'}
            >
              <span>{t('Entire Factory')}</span>
              {isOperator && <Shield className="w-3 h-3 text-amber-400" />}
            </button>
          </div>

          {/* Search Box */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={tagSearchQuery}
              onChange={e => { setTagSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder={t('search')}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-cyan-500 outline-none font-mono"
            />
          </div>

          {/* Favorite Toggle */}
          <div className="md:col-span-2">
            <button
              onClick={() => { setFavoritesOnly(!favoritesOnly); setCurrentPage(1); }}
              className={`w-full py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 border transition-all cursor-pointer ${
                favoritesOnly
                  ? 'bg-amber-950/60 border-amber-600/70 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>{t('Yêu Thích')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Screen: Tree Explorer (Left) & Context Workspace (Right) (Req 47) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANEL: Tree Explorer (Req 47) */}
        <div className="lg:col-span-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
              <Factory className="w-4 h-4 text-amber-400" />
              <span>PLC / MACHINE HIERARCHY TREE</span>
            </div>

            <div className="flex items-center space-x-1 text-[10px] font-mono text-slate-400">
              <button
                onClick={expandAllTree}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Expand
              </button>
              <button
                onClick={collapseAllTree}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Collapse
              </button>
            </div>
          </div>

          {/* Tree Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={treeSearchQuery}
              onChange={e => setTreeSearchQuery(e.target.value)}
              placeholder="Lọc cây thiết bị..."
              className="w-full pl-8 pr-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Tree Structure List */}
          <div className="max-h-[620px] overflow-y-auto space-y-0.5 pr-1">
            {factoryHierarchy.map(factory => renderTree(factory, 0))}
          </div>
        </div>

        {/* RIGHT PANEL: Node Context Workspace (Req 47, 48, 54) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Machine / PLC Overview Summary Bar (Req 47, 48, 54) */}
          {activeMachine && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-xl grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Machine Badge */}
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-slate-400 uppercase">MÁY HIỆN TẠI</div>
                <div className="text-sm font-black text-blue-300 flex items-center space-x-1.5">
                  <Cpu className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="truncate">{activeMachine.name}</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  Code: <span className="text-slate-200">{activeMachine.code}</span> | Line: <span className="text-cyan-400">{activeMachine.line}</span>
                </div>
              </div>

              {/* PLC Controller Badge */}
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-slate-400 uppercase">PLC BỘ ĐIỀU KHIỂN</div>
                <div className="text-sm font-black text-emerald-300 flex items-center space-x-1.5">
                  <Server className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate">{activePlc ? activePlc.name : 'N/A'}</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  IP: <span className="text-slate-200">{activePlc?.ipAddress}</span> | <span className="text-emerald-400 font-bold">{activePlc?.status}</span>
                </div>
              </div>

              {/* Machine OEE & Status */}
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-slate-400 uppercase">TRẠNG THÁI & OEE</div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    activeMachine.status === 'Running' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                    activeMachine.status === 'Alarm' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse' :
                    'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {activeMachine.status}
                  </span>
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    OEE: {((activeMachine.okCount / (activeMachine.totalCount || 1)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  Tốc độ: <span className="text-slate-200">{activeMachine.currentSpeed} RPM</span>
                </div>
              </div>

              {/* Scope Tag Count */}
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-slate-400 uppercase">TỔNG SỐ TAGS PHẠM VI</div>
                <div className="text-lg font-black text-slate-100 font-mono">
                  {scopedTagsList.length} <span className="text-xs font-normal text-slate-400">Tags</span>
                </div>
                <div className="text-[11px] font-mono text-cyan-400">
                  Scope: {searchScopeMode}
                </div>
              </div>
            </div>
          )}

          {/* Machine Isolated Tag Table (Req 47, 48, 54) */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden space-y-3">
            <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>
                  BẢNG DỮ LIỆU TAGS ({paginatedTags.length} / {scopedTagsList.length} Tags)
                </span>
              </div>

              {/* Page Size Selector */}
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                <span>Hiển thị:</span>
                {[15, 30, 50].map(sz => (
                  <button
                    key={sz}
                    onClick={() => { setPageSize(sz); setCurrentPage(1); }}
                    className={`px-2 py-0.5 rounded font-bold transition-colors ${
                      pageSize === sz ? 'bg-cyan-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Table View */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3 w-8 text-center">★</th>
                    <th className="py-2.5 px-3">Tag Name</th>
                    <th className="py-2.5 px-3">PLC Address</th>
                    <th className="py-2.5 px-3">Machine & PLC</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3 text-right">Live Value</th>
                    <th className="py-2.5 px-3 text-center">Quality</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {paginatedTags.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500 font-mono">
                        Không tìm thấy Tag trong phạm vi lựa chọn hiện tại.
                      </td>
                    </tr>
                  ) : (
                    paginatedTags.map(tag => {
                      const tagMachine = machines.find(m => m.id === tag.machineId);
                      const tagPlc = plcs.find(p => p.id === tag.plcId);
                      const isInspected = activeInspectedTag?.id === tag.id;

                      return (
                        <tr
                          key={tag.id}
                          onClick={() => setInspectedTagId(tag.id)}
                          className={`hover:bg-slate-800/50 cursor-pointer transition-colors ${
                            isInspected ? 'bg-cyan-950/40 border-l-2 border-cyan-400' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 text-center" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => toggleTagFavorite(tag.id)}
                              className="text-slate-600 hover:text-amber-400 transition-colors"
                            >
                              <Star className={`w-3.5 h-3.5 ${tag.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                            </button>
                          </td>

                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-200">{tag.name}</div>
                            <div className="text-[10px] text-slate-400 font-sans truncate max-w-[180px]">
                              {tag.description}
                            </div>
                          </td>

                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/50 font-bold">
                              {tag.address}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 text-slate-300 text-[11px]">
                            <div>{tagMachine?.code || 'N/A'}</div>
                            <div className="text-[10px] text-slate-500">{tagPlc?.name}</div>
                          </td>

                          <td className="py-2.5 px-3">
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold text-[10px]">
                              {tag.dataType}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 text-right font-black text-sm text-cyan-300">
                            {String(tag.currentValue)} <span className="text-xs font-normal text-slate-400">{tag.unit}</span>
                          </td>

                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tag.quality === 'GOOD' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              tag.quality === 'BAD' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                              'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
                              {tag.quality}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 text-right" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-end space-x-1.5">
                              {/* Alarm Rule Creator Button (Req 56) */}
                              <button
                                onClick={() => {
                                  setAlarmModalTag(tag);
                                  setAlarmLimit(typeof tag.currentValue === 'number' ? tag.currentValue : 75);
                                }}
                                className="p-1 rounded hover:bg-slate-800 text-amber-400 hover:text-amber-300"
                                title="Tạo Cảnh Báo cho Tag này"
                              >
                                <Bell className="w-3.5 h-3.5" />
                              </button>

                              {/* Write Value Button */}
                              <button
                                onClick={() => {
                                  setEditingTag(tag);
                                  setOverrideValue(String(tag.currentValue));
                                }}
                                className="p-1 rounded hover:bg-slate-800 text-cyan-400 hover:text-cyan-300"
                                title="Ghi giá trị xuống PLC"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Historian Navigation */}
                              <button
                                onClick={() => onNavigateToHistorian(tag.id)}
                                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                                title="Xem Historian Trend"
                              >
                                <LineChartIcon className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls (Req 58) */}
            <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <div>
                Trang <span className="text-slate-200 font-bold">{currentPage}</span> / <span className="text-slate-200">{totalPages}</span> ({scopedTagsList.length} Tags)
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300"
                >
                  Trước
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                  const pg = idx + 1;
                  return (
                    <button
                      key={pg}
                      onClick={() => setCurrentPage(pg)}
                      className={`px-2.5 py-1 rounded font-bold ${
                        currentPage === pg ? 'bg-cyan-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {pg}
                    </button>
                  );
                })}

                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300"
                >
                  Sau
                </button>
              </div>
            </div>
          </div>

          {/* Active Tag Live Trend & Details Inspector (Req 50, 55, 56) */}
          {activeInspectedTag && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
                    <LineChartIcon className="w-4 h-4" />
                    <span>CONTEXTUAL REAL-TIME TREND CHART</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100 mt-0.5">
                    {activeInspectedTag.name} <span className="text-xs font-mono text-cyan-300 font-normal">({activeInspectedTag.address})</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-sans">
                    {activeInspectedTag.description}
                  </p>
                </div>

                {/* Live Value & Time Range Controls */}
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-slate-400">GIÁ TRỊ TRỰC TUYẾN</div>
                    <div className="text-xl font-black text-cyan-300 font-mono">
                      {String(activeInspectedTag.currentValue)} <span className="text-xs font-normal text-slate-400">{activeInspectedTag.unit}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 font-mono text-xs bg-slate-950 p-1 rounded-xl border border-slate-800">
                    {(['5m', '15m', '1h'] as const).map(rng => (
                      <button
                        key={rng}
                        onClick={() => setTrendRange(rng)}
                        className={`px-2 py-0.5 rounded font-bold transition-colors ${
                          trendRange === rng ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {rng}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recharts Area Chart */}
              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activeTagHistory.length > 0 ? activeTagHistory : [
                    { timestamp: '22:30', value: Number(activeInspectedTag.currentValue) || 50, quality: 'GOOD' as const },
                    { timestamp: '22:31', value: Number(activeInspectedTag.currentValue) || 52, quality: 'GOOD' as const },
                    { timestamp: '22:32', value: Number(activeInspectedTag.currentValue) || 51, quality: 'GOOD' as const },
                    { timestamp: '22:33', value: Number(activeInspectedTag.currentValue) || 54, quality: 'GOOD' as const },
                    { timestamp: '22:34', value: Number(activeInspectedTag.currentValue) || 53, quality: 'GOOD' as const }
                  ]}>
                    <defs>
                      <linearGradient id="tagTrendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="timestamp" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }}
                      formatter={(val: any) => [`${val} ${activeInspectedTag.unit}`, 'Giá Trị']}
                    />
                    <Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#tagTrendGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tag Write Value Modal */}
      {editingTag && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
                <Edit3 className="w-4 h-4" />
                <span>GHI GIÁ TRỊ TAG XUỐNG PLC</span>
              </div>
              <button
                onClick={() => setEditingTag(null)}
                className="text-slate-400 hover:text-slate-200 text-xs font-mono"
              >
                ✕ Đóng
              </button>
            </div>

            <form onSubmit={handleTagWriteSubmit} className="space-y-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-200 font-bold">{editingTag.name}</div>
                <div className="text-slate-400 font-sans">{editingTag.description}</div>
                <div className="text-cyan-300">Địa chỉ PLC: {editingTag.address} ({editingTag.dataType})</div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Giá trị ghi mới:</label>
                {editingTag.dataType === 'Bool' ? (
                  <select
                    value={overrideValue}
                    onChange={e => setOverrideValue(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none focus:border-cyan-500"
                  >
                    <option value="true">TRUE (1)</option>
                    <option value="false">FALSE (0)</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={overrideValue}
                    onChange={e => setOverrideValue(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none focus:border-cyan-500"
                  />
                )}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTag(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-lg shadow-cyan-600/30"
                >
                  Xác Nhận Ghi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tag Quick Alarm Rule Modal (Req 56) */}
      {alarmModalTag && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                <Bell className="w-4 h-4" />
                <span>TẠO QUY TẮC CẢNH BÁO CHO TAG PLC (Req 56)</span>
              </div>
              <button
                onClick={() => setAlarmModalTag(null)}
                className="text-slate-400 hover:text-slate-200 text-xs font-mono"
              >
                ✕ Đóng
              </button>
            </div>

            <form onSubmit={handleCreateAlarmRule} className="space-y-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-200 font-bold">{alarmModalTag.name} ({alarmModalTag.address})</div>
                <div className="text-slate-400 font-sans">Máy: {activeMachine?.name} | PLC: {activePlc?.name}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Điều kiện Trigger:</label>
                  <select
                    value={alarmCondition}
                    onChange={e => setAlarmCondition(e.target.value as AlarmCondition)}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none focus:border-cyan-500"
                  >
                    <option value="GreaterThan">&gt; (Lớn hơn)</option>
                    <option value="LessThan">&lt; (Nhỏ hơn)</option>
                    <option value="Equal">= (Bằng)</option>
                    <option value="NotEqual">!= (Khác)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Ngưỡng giới hạn ({alarmModalTag.unit}):</label>
                  <input
                    type="number"
                    value={alarmLimit}
                    onChange={e => setAlarmLimit(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Mức độ ưu tiên (Priority):</label>
                <select
                  value={alarmPriority}
                  onChange={e => setAlarmPriority(e.target.value as AlarmPriority)}
                  className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none focus:border-cyan-500"
                >
                  <option value="Low">Low (Thấp)</option>
                  <option value="Medium">Medium (Trung Bình)</option>
                  <option value="High">High (Cao)</option>
                  <option value="Critical">Critical (Khẩn Cấp)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Thông điệp cảnh báo tùy chỉnh:</label>
                <textarea
                  value={alarmMessage}
                  onChange={e => setAlarmMessage(e.target.value)}
                  placeholder={`Giá trị Tag ${alarmModalTag.name} vượt ngưỡng...`}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none focus:border-cyan-500 h-16 font-sans text-xs"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAlarmModalTag(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-lg shadow-amber-600/30"
                >
                  Lưu Quy Tắc Cảnh Báo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
