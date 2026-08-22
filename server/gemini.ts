import { GoogleGenAI } from '@google/genai';

let aiInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiInstance;
}

export async function askHatAiCopilot({
  prompt,
  systemContext,
  modelName = 'gemini-3.7-flash',
  temperature = 0.7
}: {
  prompt: string;
  systemContext: string;
  modelName?: string;
  temperature?: number;
}) {
  try {
    const ai = getGeminiClient();
    
    // Choose model safely
    const targetModel = modelName || 'gemini-3.7-flash';

    const systemInstruction = `You are "HAT AI Copilot" - the Senior Industrial Automation & SCADA AI Assistant for HATSCADA (Hoang Automation Technology SCADA).
You have 15+ years of domain expertise in PLC programming (Keyence KV, Mitsubishi MELSEC MC Protocol, Siemens S7, Modbus TCP, OPC UA), Smart Factory MES, OEE performance analysis, Industrial Alarm triage, root cause analysis (5 Whys, Ishikawa), and predictive maintenance.

Context about current factory state:
${systemContext}

Instructions:
1. Provide accurate, professional, and actionable answers in the language the user asks (default Vietnamese if asked in Vietnamese, or English).
2. Directly reference relevant machine codes (CNC-01, ROBOT-02, SMT-03, INJECT-04, PACK-05), PLC addresses (DM100, D500, DB1.DBD10), active alarms, OEE loss metrics, or tag values when diagnosing.
3. Formulate clear structured responses:
   - 🔍 Tình trạng & Phân tích hiện tại (Current Status & Analysis)
   - ⚙️ Nguyên nhân cốt lõi (Root Cause & Diagnostic)
   - 🛠️ Hành động khắc phục & Bước kiểm tra thực tế cho kỹ sư (Actionable Troubleshooting Steps)
   - 💡 Khuyến nghị tối ưu hóa OEE / Bảo trì dự đoán (Optimization & Predictive Maintenance)`;

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: temperature ?? 0.7
      }
    });

    return {
      text: response.text || 'Không nhận được phản hồi từ mô hình AI.',
      model: targetModel
    };
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    throw new Error(error.message || 'Lỗi khi kết nối với Google Gemini API.');
  }
}
