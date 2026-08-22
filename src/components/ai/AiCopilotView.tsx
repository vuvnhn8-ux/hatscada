import React, { useState, useRef, useEffect } from 'react';
import { useScada } from '../../context/ScadaContext';
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  Cpu,
  AlertTriangle,
  Zap,
  TrendingUp,
  FileCode2,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { AiMessage } from '../../types/scada';

interface AiCopilotViewProps {
  initialPrompt?: string;
}

export const AiCopilotView: React.FC<AiCopilotViewProps> = ({ initialPrompt }) => {
  const {
    machines,
    tags,
    alarmEvents,
    overallOee,
    plantPowerKw,
    plantOkRate,
    deepLearningDocs,
    settings,
    t
  } = useScada();

  const [messages, setMessages] = useState<AiMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Xin chào! Tôi là **HAT AI Industrial Copilot**, chuyên gia tự động hóa nhà máy, kiến trúc SCADA & PLC (Keyence, Siemens, Mitsubishi) được hỗ trợ bởi Google Gemini.\n\nTôi có thể giúp bạn:\n1. 🔍 **Chẩn đoán sự cố Alarm & Root-Cause Analysis** thời gian thực.\n2. 📚 **Tra cứu tài liệu thiết bị & SOP sửa lỗi (Deep Learning RAG)**.\n3. 📊 **Phân tích tổn thất OEE** và đề xuất giải pháp Kaizen.\n4. ⚡ **Tối ưu hóa chu kỳ quét PLC (Scan Cycle)** và cấu hình bộ nhớ thanh ghi.\n5. 📝 **Dự đoán bảo trì (Predictive Maintenance)** dựa trên cảm biến nhiệt độ và rung động.',
      timestamp: new Date().toISOString()
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState(initialPrompt || '');
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim().length > 0) {
      handleSendMessage(initialPrompt);
    }
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (promptToSend?: string) => {
    const text = promptToSend || inputPrompt;
    if (!text.trim() || isLoading) return;

    const userMsg: AiMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      // Build industrial context snapshot with Deep Learning Knowledge Base
      const systemContext = {
        plantOee: overallOee,
        plantOkRate,
        plantPowerKw,
        activeAlarmsCount: alarmEvents.filter(a => a.status === 'Active').length,
        activeAlarms: alarmEvents.filter(a => a.status === 'Active').slice(0, 5),
        machines: machines.map(m => ({
          code: m.code,
          name: m.name,
          status: m.status,
          temp: m.temperature,
          vibration: m.vibration,
          speed: m.currentSpeed,
          okCount: m.okCount,
          totalCount: m.totalCount
        })),
        ragKnowledgeBase: deepLearningDocs.map(doc => ({
          title: doc.title,
          category: doc.category,
          machine: doc.targetMachineCode,
          content: doc.contentSnippet,
          tags: doc.tags
        }))
      };

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          context: systemContext,
          apiKey: settings.geminiApiKey || undefined,
          model: settings.geminiModel || 'gemini-3.7-flash',
          temperature: settings.geminiTemperature ?? 0.7
        })
      });

      const data = await response.json();

      const aiMsg: AiMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Không nhận được phản hồi từ AI Server.',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errMsg: AiMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: '⚠️ Không thể kết nối với AI Backend. Vui lòng kiểm tra `GEMINI_API_KEY` trong Settings.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    '🔍 Chẩn đoán các cảnh báo và nguyên nhân gốc rễ (Root Cause) hiện tại',
    '📊 Đánh giá chỉ số OEE toàn xưởng và đề xuất giải pháp giảm 6 Big Losses',
    '⚡ Đánh giá điện năng tiêu thụ và chi phí vận hành máy trong ca',
    '🛠️ Kiểm tra tình trạng rung động và nhiệt độ trục chính Spindle CNC-01',
    '💻 Viết hàm C# / Structured Text (ST) đọc dữ liệu từ Keyence MC Protocol'
  ];

  return (
    <div className="space-y-6 pb-8 h-[calc(100vh-140px)] flex flex-col">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-700/50 shadow-xl flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-600/30 border border-indigo-500/50 text-indigo-300">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-black text-slate-100">HAT AI Industrial Copilot</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-900/80 text-indigo-300 border border-indigo-700">
                Gemini Industrial Agent
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Trợ lý AI chuyên biệt cho Kỹ sư SCADA, Bảo trì & Quản lý Nhà máy Thông minh
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages(messages.slice(0, 1))}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Xóa lịch sử chat"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 min-h-0 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map(msg => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                    isUser
                      ? 'bg-cyan-950 border-cyan-700 text-cyan-300'
                      : 'bg-indigo-950 border-indigo-700 text-indigo-300'
                  }`}
                >
                  {isUser ? <span className="font-bold text-xs font-mono">OP</span> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-cyan-950/80 text-cyan-100 border border-cyan-800/80'
                      : 'bg-slate-950 border border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 text-[10px] opacity-70">
                    <span className="font-bold">{isUser ? 'Kỹ Sư Vận Hành' : 'HAT AI Copilot'}</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString('vi-VN')}</span>
                  </div>

                  <div className="whitespace-pre-wrap font-sans space-y-2">
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-950 border border-indigo-700 text-indigo-300 flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-indigo-300 flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>AI đang phân tích dữ liệu máy, sự cố PLC và sinh báo cáo...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 overflow-x-auto flex items-center space-x-2">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 text-[11px] text-slate-300 whitespace-nowrap transition-all cursor-pointer disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-3"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={e => setInputPrompt(e.target.value)}
              placeholder="Nhập câu hỏi chẩn đoán sự cố, lập trình PLC, phân tích OEE..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500 outline-none font-sans"
            />

            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-40 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Gửi</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
