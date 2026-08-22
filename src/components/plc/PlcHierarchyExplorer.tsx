import React, { useState } from 'react';
import {
  Factory,
  Layers,
  Cpu,
  Server,
  Radio,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Search,
  ExternalLink,
  Activity,
  Zap
} from 'lucide-react';
import { useScada } from '../../context/ScadaContext';
import { FactoryHierarchyItem } from '../../types/scada';

export const PlcHierarchyExplorer: React.FC<{
  onSelectPlc?: (plcId: string) => void;
}> = ({ onSelectPlc }) => {
  const { factoryHierarchy, plcs, tags, machines } = useScada();
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'factory-01': true,
    'area-01': true,
    'line-m-01': true,
    'node-m-01': true,
    'node-plc-01': true
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<FactoryHierarchyItem | null>(null);

  const toggleExpand = (nodeId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const expandAll = () => {
    const allIds: Record<string, boolean> = {};
    const traverse = (item: FactoryHierarchyItem) => {
      allIds[item.id] = true;
      if (item.children) item.children.forEach(traverse);
    };
    factoryHierarchy.forEach(traverse);
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes({});
  };

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

  const renderTree = (node: FactoryHierarchyItem, level: number = 0) => {
    const isExpanded = !!expandedNodes[node.id];
    const hasChildren = node.children && node.children.length > 0;
    const isMatch = searchQuery === '' || node.name.toLowerCase().includes(searchQuery.toLowerCase()) || node.code.toLowerCase().includes(searchQuery.toLowerCase());

    if (!isMatch && !hasChildren) return null;

    return (
      <div key={node.id} className="select-none">
        <div
          onClick={() => {
            setSelectedNode(node);
            if (node.type === 'PLC') {
              const cleanId = node.id.replace('node-', '');
              if (onSelectPlc) onSelectPlc(cleanId);
            }
          }}
          className={`flex items-center justify-between px-3 py-1.5 rounded-xl cursor-pointer transition-colors ${selectedNode?.id === node.id ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-200' : 'hover:bg-slate-800/60 text-slate-300'}`}
          style={{ paddingLeft: `${Math.max(12, level * 20 + 8)}px` }}
        >
          <div className="flex items-center space-x-2 min-w-0">
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(node.id);
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
              <span className="text-xs font-semibold">{node.name}</span>
              <span className="text-[10px] font-mono text-slate-400">({node.code})</span>
            </div>
          </div>

          {/* Right badge metrics */}
          <div className="flex items-center space-x-2 text-[10px] shrink-0 ml-2">
            {node.status && (
              <span className={`px-1.5 py-0.2 rounded font-bold ${node.status === 'Running' || node.status === 'Connected' || node.status === 'GOOD' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : node.status === 'Alarm' || node.status === 'BAD' || node.status === 'Error' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'}`}>
                {node.status}
              </span>
            )}

            {node.metrics?.val && (
              <span className="font-mono text-cyan-300 font-bold px-1.5 py-0.5 rounded bg-slate-950/80 border border-slate-800">
                {node.metrics.val}
              </span>
            )}

            {node.metrics?.tagsCount !== undefined && node.type !== 'Tag' && (
              <span className="font-mono text-slate-400">
                {node.metrics.tagsCount} Tags
              </span>
            )}
          </div>
        </div>

        {/* Children Render */}
        {hasChildren && isExpanded && (
          <div className="space-y-0.5 mt-0.5">
            {node.children!.map(child => renderTree(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Tree Explorer */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-[540px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Factory className="w-4 h-4 text-cyan-400" />
              <span>Cây Phân Cấp Nhà Máy 5 Cấp (Factory Hierarchy Tree)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Factory → Area → Line → Machine → PLC → Tag
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={expandAll}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-medium transition-colors cursor-pointer"
            >
              Mở Rộng Tất Cả
            </button>
            <button
              onClick={collapseAll}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-medium transition-colors cursor-pointer"
            >
              Thu Gọn
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="my-3 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm Nhà máy, Dây chuyền, PLC, Tag..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Tree Container */}
        <div className="flex-1 overflow-y-auto space-y-0.5 pr-2">
          {factoryHierarchy.map(node => renderTree(node, 0))}
        </div>
      </div>

      {/* Right Selected Node Inspector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-[540px]">
        <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 pb-3 border-b border-slate-800 flex items-center space-x-2">
          <Activity className="w-4 h-4" />
          <span>Chi Tiết Nút Phân Cấp (Node Inspector)</span>
        </h3>

        {selectedNode ? (
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2">
                {getNodeIcon(selectedNode.type)}
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase">{selectedNode.type}</span>
              </div>
              <h4 className="text-base font-bold text-slate-100">{selectedNode.name}</h4>
              <p className="text-xs font-mono text-slate-400">Code / Address: {selectedNode.code}</p>
              {selectedNode.status && (
                <div className="pt-2">
                  <span className="text-xs text-slate-400 mr-2">Trạng thái:</span>
                  <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {selectedNode.status}
                  </span>
                </div>
              )}
            </div>

            {/* Metrics List */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300">Thông Số Kỹ Thuật:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {selectedNode.metrics?.oee !== undefined && (
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400">OEE Hiệu Suất</div>
                    <div className="text-sm font-mono font-bold text-cyan-400 mt-0.5">{selectedNode.metrics.oee}%</div>
                  </div>
                )}
                {selectedNode.metrics?.plcsCount !== undefined && (
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400">PLCs Kết Nối</div>
                    <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">
                      {selectedNode.metrics.plcsOnline ?? selectedNode.metrics.plcsCount} / {selectedNode.metrics.plcsCount}
                    </div>
                  </div>
                )}
                {selectedNode.metrics?.tagsCount !== undefined && (
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Tags Thu Thập</div>
                    <div className="text-sm font-mono font-bold text-purple-400 mt-0.5">{selectedNode.metrics.tagsCount}</div>
                  </div>
                )}
                {selectedNode.metrics?.alarmsCount !== undefined && (
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Alarms Active</div>
                    <div className={`text-sm font-mono font-bold mt-0.5 ${selectedNode.metrics.alarmsCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                      {selectedNode.metrics.alarmsCount}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedNode.type === 'PLC' && (
              <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-800/30 text-xs text-cyan-300">
                <p className="font-semibold mb-1">Kiến Trúc Driver Độc Lập:</p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Thiết bị PLC này chạy trong một background communication worker riêng biệt. Nếu PLC này mất kết nối, hệ thống sẽ tự động retry 3 lần và không làm ảnh hưởng đến các PLC khác.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-2 text-center p-6">
            <Layers className="w-8 h-8 opacity-40" />
            <p className="text-xs">Chọn một nút trong cây phân cấp bên trái để xem thông tin chi tiết</p>
          </div>
        )}
      </div>
    </div>
  );
};
