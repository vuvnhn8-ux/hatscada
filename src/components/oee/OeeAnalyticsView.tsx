import React, { useState } from 'react';
import { useScada } from '../../context/ScadaContext';
import {
  Gauge,
  Activity,
  TrendingUp,
  Award,
  AlertOctagon,
  Clock,
  CheckCircle2,
  XCircle,
  Bot,
  Layers
} from 'lucide-react';

interface OeeAnalyticsViewProps {
  onNavigateToAi: (prompt: string) => void;
  onSelectMachine: (machineId: string) => void;
}

export const OeeAnalyticsView: React.FC<OeeAnalyticsViewProps> = ({
  onNavigateToAi,
  onSelectMachine
}) => {
  const {
    machines,
    overallOee,
    plantOkRate,
    totalShiftProduction,
    calculateMachineOee
  } = useScada();

  const [selectedShift, setSelectedShift] = useState<'shift1' | 'shift2' | 'shift3'>('shift1');

  // Compute machine OEEs
  const machineOees = machines.map(m => ({
    machine: m,
    oeeData: calculateMachineOee(m)
  }));

  // Aggregate Six Big Losses
  const totalEquipmentFailure = machineOees.reduce((acc, curr) => acc + curr.oeeData.sixBigLosses.equipmentFailureMin, 0);
  const totalSetup = machineOees.reduce((acc, curr) => acc + curr.oeeData.sixBigLosses.setupAndAdjustmentMin, 0);
  const totalMinorStops = machineOees.reduce((acc, curr) => acc + curr.oeeData.sixBigLosses.idlingAndMinorStopsMin, 0);
  const totalReducedSpeed = machineOees.reduce((acc, curr) => acc + curr.oeeData.sixBigLosses.reducedSpeedMin, 0);
  const totalProcessDefects = machineOees.reduce((acc, curr) => acc + curr.oeeData.sixBigLosses.processDefectsCount, 0);

  return (
    <div className="space-y-6 pb-8">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
            <Gauge className="w-4 h-4" />
            <span>OVERALL EQUIPMENT EFFECTIVENESS & MES ANALYTICS</span>
          </div>
          <h1 className="text-xl font-black text-slate-100 mt-1">
            Phân Tích Hiệu Suất Thiết Bị Tổng Thể OEE / TEEP
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Tiêu chuẩn World-Class Manufacturing (WCM) 85% OEE • Tách bạch Khả dụng, Hiệu suất và Chất lượng
          </p>
        </div>

        <button
          onClick={() =>
            onNavigateToAi(
              `Hãy phân tích dữ liệu OEE toàn nhà máy hiện tại (OEE: ${overallOee}%, Chất lượng: ${plantOkRate}%). Đưa ra báo cáo phân tích Six Big Losses và 3 khuyến nghị Kaizen hành động ngay cho Giám đốc Nhà máy.`
            )
          }
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Bot className="w-4 h-4" />
          <span>AI Đề Xuất Chiến Lược Kaizen OEE</span>
        </button>
      </div>

      {/* Top 3 OEE Core Factors (Availability, Performance, Quality) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total OEE */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-cyan-500/50 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">PLANT OEE</span>
            <Award className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="my-3">
            <div className={`text-4xl font-black font-mono ${overallOee >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {overallOee}%
            </div>
            <div className="text-xs text-slate-400 mt-1">Mục tiêu ca: 82.0%</div>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-cyan-500 h-full" style={{ width: `${Math.min(100, overallOee)}%` }} />
          </div>
        </div>

        {/* Availability */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">AVAILABILITY (A)</span>
            <Clock className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-black font-mono text-emerald-400">92.4%</div>
            <div className="text-xs text-slate-400 mt-1">Uptime: 442m / 480m kế hoạch</div>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[92.4%]" />
          </div>
        </div>

        {/* Performance */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">PERFORMANCE (P)</span>
            <TrendingUp className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-black font-mono text-cyan-400">88.6%</div>
            <div className="text-xs text-slate-400 mt-1">Tốc độ thực tế vs Chuẩn</div>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-cyan-500 h-full w-[88.6%]" />
          </div>
        </div>

        {/* Quality */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">QUALITY RATE (Q)</span>
            <CheckCircle2 className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-black font-mono text-indigo-400">{plantOkRate}%</div>
            <div className="text-xs text-slate-400 mt-1">Tổng NG: {totalProcessDefects} pcs</div>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full" style={{ width: `${plantOkRate}%` }} />
          </div>
        </div>
      </div>

      {/* Machine OEE Ranking Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span>Bảng So Sánh Hiệu Suất Từng Máy (Cell-Level OEE Matrix)</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">Shift 1 (06:00 - 14:00)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                <th className="py-3 px-4">Machine Name</th>
                <th className="py-3 px-4 text-center">Availability (A)</th>
                <th className="py-3 px-4 text-center">Performance (P)</th>
                <th className="py-3 px-4 text-center">Quality (Q)</th>
                <th className="py-3 px-4 text-center">Overall OEE</th>
                <th className="py-3 px-4 text-right">Output (OK/Total)</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {machineOees.map(({ machine, oeeData }) => (
                <tr key={machine.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-100">
                    <div>{machine.name}</div>
                    <div className="text-[11px] text-slate-400 font-sans">{machine.code} • {machine.line}</div>
                  </td>

                  <td className="py-3.5 px-4 text-center text-emerald-400 font-bold">
                    {oeeData.availability}%
                  </td>

                  <td className="py-3.5 px-4 text-center text-cyan-400 font-bold">
                    {oeeData.performance}%
                  </td>

                  <td className="py-3.5 px-4 text-center text-indigo-400 font-bold">
                    {oeeData.quality}%
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        oeeData.oee >= 80
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                          : 'bg-amber-950 text-amber-300 border-amber-700'
                      }`}
                    >
                      {oeeData.oee}%
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right text-slate-200">
                    {oeeData.okCount} / {oeeData.actualCount} pcs
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onSelectMachine(machine.id)}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold cursor-pointer"
                    >
                      Chi Tiết →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Six Big Losses Breakdown */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
          <AlertOctagon className="w-5 h-5 text-rose-400" />
          <span>Phân Tích 6 Tổn Thất Lớn Trong Sản Xuất (Six Big Losses Analysis)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-xs text-rose-400 font-bold">1. Equipment Failure (Sự cố hư hỏng)</div>
            <div className="text-2xl font-black font-mono text-slate-100 mt-2">{totalEquipmentFailure} phút</div>
            <p className="text-[11px] text-slate-400 mt-1">Downtime do lỗi quá nhiệt và dừng máy khẩn cấp.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-xs text-amber-400 font-bold">2. Setup & Adjustments (Thay khuôn/Cài đặt)</div>
            <div className="text-2xl font-black font-mono text-slate-100 mt-2">{totalSetup} phút</div>
            <p className="text-[11px] text-slate-400 mt-1">Thời gian gá đặt phôi và hiệu chỉnh thông số đầu ca.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-xs text-cyan-400 font-bold">3. Idling & Minor Stops (Dừng vặt / Kẹt phôi)</div>
            <div className="text-2xl font-black font-mono text-slate-100 mt-2">{totalMinorStops} phút</div>
            <p className="text-[11px] text-slate-400 mt-1">Dừng dưới 5 phút do cấp phôi chậm hoặc sensor lệch.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-xs text-indigo-400 font-bold">4. Reduced Speed (Giảm tốc độ máy)</div>
            <div className="text-2xl font-black font-mono text-slate-100 mt-2">{totalReducedSpeed} phút</div>
            <p className="text-[11px] text-slate-400 mt-1">Chạy dưới định mức do mòn dao hoặc phôi chất lượng kém.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-xs text-red-400 font-bold">5. Process Defects (Phế phẩm trong ca)</div>
            <div className="text-2xl font-black font-mono text-slate-100 mt-2">{totalProcessDefects} pcs</div>
            <p className="text-[11px] text-slate-400 mt-1">Sản phẩm sai kích thước, lỗi hàn hoặc dập lỗi.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-xs text-emerald-400 font-bold">6. Reduced Yield (Hao hụt khởi động)</div>
            <div className="text-2xl font-black font-mono text-slate-100 mt-2">12 pcs</div>
            <p className="text-[11px] text-slate-400 mt-1">Sản phẩm thử nghiệm (warm-up) trước khi vào chu kỳ chuẩn.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
