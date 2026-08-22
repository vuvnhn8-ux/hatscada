import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { askHatAiCopilot } from './server/gemini.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'HATSCADA Server',
      timestamp: new Date().toISOString(),
      hasGeminiApiKey: Boolean(process.env.GEMINI_API_KEY)
    });
  });

  // AI Status & Test
  app.get('/api/ai/status', (req, res) => {
    const hasKey = Boolean(process.env.GEMINI_API_KEY);
    res.json({
      configured: hasKey,
      defaultModel: 'gemini-3.7-flash',
      availableModels: [
        { id: 'gemini-3.7-flash', name: 'Google Gemini 3.7 Flash (Default - Fast & Smart)', speed: 'Fast', capabilities: 'Industrial Diagnostic, OEE Analysis' },
        { id: 'gemini-3.1-pro-preview', name: 'Google Gemini 3.1 Pro (Deep Reasoning & Complex Physics)', speed: 'Advanced', capabilities: 'Root-Cause 5-Whys, Root-Cause Matrix' },
        { id: 'gemini-3.1-flash-lite', name: 'Google Gemini 3.1 Flash Lite (Ultra Low Latency)', speed: 'Instant', capabilities: 'Rapid Tag & Alarm Triage' }
      ]
    });
  });

  // AI Chat & Diagnostics
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { prompt, systemContext, context, modelName, model, temperature, apiKey } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const result = await askHatAiCopilot({
        prompt,
        systemContext: context || systemContext || '',
        modelName: model || modelName || 'gemini-3.7-flash',
        temperature: typeof temperature === 'number' ? temperature : 0.7,
        apiKey: apiKey || undefined
      });

      res.json({
        ...result,
        reply: result.text
      });
    } catch (error: any) {
      console.error('Error processing AI chat:', error);
      res.status(500).json({
        error: error.message || 'Internal Server Error during AI execution'
      });
    }
  });

  // AI Quick Alarm Diagnostic
  app.post('/api/ai/analyze-alarm', async (req, res) => {
    try {
      const { alarm, machine, recentTags } = req.body;
      const prompt = `Yêu cầu phân tích sự cố công nghiệp:
- Alarm: ${alarm?.alarmName || 'Unknown'} (Priority: ${alarm?.priority})
- Thiết bị: ${machine?.name || alarm?.machineName} (Code: ${machine?.code})
- Tag kích hoạt: ${alarm?.tagName} (Address: ${alarm?.tagAddress}) = Giá trị hiện tại ${alarm?.value} (Ngưỡng cảnh báo: ${alarm?.limitValue})
- Trạng thái máy: ${machine?.status}
- Tag lân cận: ${JSON.stringify(recentTags || {})}

Hãy phân tích nguyên nhân tiềm ẩn, mức độ nguy hiểm đối với dây chuyền sản xuất, và các bước kỹ sư bảo trì cần thực hiện ngay tại tủ điện/PLC/cơ khí để khôi phục máy an toàn.`;

      const result = await askHatAiCopilot({
        prompt,
        systemContext: `Smart Factory Real-Time Alarm Triage System. Target Machine: ${machine?.code || 'Industrial Cell'}`,
        modelName: 'gemini-3.7-flash',
        temperature: 0.4
      });

      res.json({
        ...result,
        reply: result.text,
        analysis: result.text
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Lỗi phân tích Alarm' });
    }
  });

  // AI Shift Summary Generator
  app.post('/api/ai/generate-shift-report', async (req, res) => {
    try {
      const { factorySnapshot, shiftName, machines, alarmEvents, overallOee, totalShiftProduction, plantPowerKw } = req.body;
      const snapshot = factorySnapshot || { machines, alarmEvents, overallOee, totalShiftProduction, plantPowerKw };

      const prompt = `Hãy soạn thảo bản Báo cáo Đánh giá Sản xuất & Hiệu suất Ca (Shift Production & OEE Audit Report) chuyên nghiệp cho Ban Giám đốc Nhà máy:
- Ca sản xuất: ${shiftName || 'Ca Hiện Tại'}
- Tổng quan dữ liệu xưởng:
${JSON.stringify(snapshot, null, 2)}

Báo cáo cần có định dạng markdown trực quan, gồm:
1. 📊 Tóm tắt Chỉ số Toàn Nhà Máy (Sản lượng OK/NG, OEE tổng, Tổng Downtime, Điện năng tiêu thụ)
2. 🏭 Đánh giá Chi tiết Từng Máy (Top máy hiệu suất cao nhất & Máy gặp sự cố nhiều nhất)
3. ⚠️ Phân tích 6 Tổn Thất Lớn (Six Big Losses) & Các Sự Cố Alarm Đáng Chú Ý
4. 🚀 Kế hoạch Hành động Cải Tiến (Kaizen / Action items cho ca tiếp theo)`;

      const result = await askHatAiCopilot({
        prompt,
        systemContext: 'Industrial MES & OEE Plant Audit Reporting System.',
        modelName: 'gemini-3.7-flash',
        temperature: 0.5
      });

      res.json({
        ...result,
        report: result.text,
        reply: result.text
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Lỗi tạo báo cáo ca' });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[HATSCADA] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
