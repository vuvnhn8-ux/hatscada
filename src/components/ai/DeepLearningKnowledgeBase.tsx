import React, { useState } from 'react';
import { useScada } from '../../context/ScadaContext';
import {
  Folder,
  FileText,
  UploadCloud,
  Search,
  Sparkles,
  CheckCircle2,
  Trash2,
  Eye,
  Plus,
  BookOpen,
  Cpu,
  Shield,
  Layers,
  Database,
  RefreshCw,
  Tag as TagIcon,
  Bot
} from 'lucide-react';
import { DeepLearningDoc } from '../../types/scada';

export const DeepLearningKnowledgeBase: React.FC = () => {
  const { deepLearningDocs, addDeepLearningDoc, deleteDeepLearningDoc, t, language } = useScada();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [previewDoc, setPreviewDoc] = useState<DeepLearningDoc | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // New Doc Form State
  const [newTitle, setNewTitle] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [newCategory, setNewCategory] = useState<DeepLearningDoc['category']>('Troubleshooting Guide');
  const [newFileType, setNewFileType] = useState<DeepLearningDoc['fileType']>('PDF');
  const [newMachineCode, setNewMachineCode] = useState('CNC-01');
  const [newContentSnippet, setNewContentSnippet] = useState('');
  const [newTagsStr, setNewTagsStr] = useState('Keyence, Spindle, Error_E402');

  const categories = [
    'ALL',
    'Equipment Manual',
    'Troubleshooting Guide',
    'Error Code Index',
    'PLC Memory Map',
    'Maintenance SOP'
  ];

  const filteredDocs = deepLearningDocs.filter(doc => {
    if (selectedCategory !== 'ALL' && doc.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        doc.title.toLowerCase().includes(q) ||
        doc.fileName.toLowerCase().includes(q) ||
        doc.contentSnippet.toLowerCase().includes(q) ||
        (doc.targetMachineCode && doc.targetMachineCode.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContentSnippet.trim()) return;

    addDeepLearningDoc({
      title: newTitle,
      fileName: newFileName.trim() || `${newTitle.toLowerCase().replace(/\s+/g, '_')}.${newFileType.toLowerCase()}`,
      fileSizeKb: Math.floor(Math.random() * 1500) + 200,
      fileType: newFileType,
      category: newCategory,
      targetMachineCode: newMachineCode,
      contentSnippet: newContentSnippet,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Kỹ Sư Trưởng SCADA',
      indexedInRAG: true,
      vectorChunkCount: Math.floor(newContentSnippet.length / 80) + 4,
      tags: newTagsStr.split(',').map(s => s.trim()).filter(Boolean)
    });

    // Reset Form
    setNewTitle('');
    setNewFileName('');
    setNewContentSnippet('');
    setShowUploadModal(false);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-700/50 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-purple-600/30 border border-purple-500/50 text-purple-300">
            <BookOpen className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-black text-slate-100">{t('knowledgeBaseTitle')}</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900/80 text-purple-300 border border-purple-700">
                RAG Vector Embeddings
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {t('knowledgeBaseDesc')}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer flex items-center space-x-2 shrink-0"
        >
          <UploadCloud className="w-4 h-4" />
          <span>{t('uploadEquipmentDoc')}</span>
        </button>
      </div>

      {/* RAG Metrics & Folder Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>{t('TỔNG SỐ TÀI LIỆU')}</span>
            <Folder className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono">{deepLearningDocs.length}</div>
          <div className="text-[10px] text-purple-400 font-mono">100% Active in RAG Memory</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>VECTOR CHUNKS INDEXED</span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-300 font-mono">
            {deepLearningDocs.reduce((acc, d) => acc + d.vectorChunkCount, 0)}
          </div>
          <div className="text-[10px] text-cyan-400 font-mono">Embedding Dim: 768 (Cosine)</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>AI COPILOT RETRIEVAL</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-300 font-mono">98.4%</div>
          <div className="text-[10px] text-indigo-400 font-mono">Precision Match Accuracy</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>{t('TỰ ĐỘNG CẬP NHẬT')}</span>
            <RefreshCw className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-300 font-mono">REAL-TIME</div>
          <div className="text-[10px] text-emerald-400 font-mono">Sync with Gemini Context</div>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-mono text-slate-400 mr-2 flex items-center space-x-1 shrink-0">
            <Layers className="w-3.5 h-3.5" />
            <span>Danh mục:</span>
          </span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat === 'ALL' ? 'Tất Cả Documents' : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm tài liệu, mã lỗi, tên máy..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-purple-500 outline-none font-mono"
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 font-mono bg-slate-900 border border-slate-800 rounded-2xl">
            Không tìm thấy tài liệu phù hợp.
          </div>
        ) : (
          filteredDocs.map(doc => (
            <div
              key={doc.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 shadow-xl transition-all space-y-3 flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-800/60 text-purple-300">
                    <FileText className="w-5 h-5" />
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
                    {doc.fileType} • {doc.fileSizeKb} KB
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-100 group-hover:text-purple-300 transition-colors">
                    {doc.title}
                  </h3>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5 flex items-center space-x-2">
                    <span>{doc.fileName}</span>
                    {doc.targetMachineCode && (
                      <span className="px-1.5 py-0.2 bg-blue-950 text-blue-300 rounded font-bold">
                        {doc.targetMachineCode}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-3 font-sans leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  {doc.contentSnippet}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="flex items-center space-x-1 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>RAG: {doc.vectorChunkCount} Chunks</span>
                  </span>
                  <span>{new Date(doc.uploadedAt).toLocaleDateString('vi-VN')}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-purple-400" />
                    <span>Xem Chi Tiết</span>
                  </button>

                  <button
                    onClick={() => deleteDeepLearningDoc(doc.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-950 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Xóa tài liệu"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Document Detail Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-purple-400 font-bold text-sm">
                <BookOpen className="w-5 h-5" />
                <span>NỘI DUNG TÀI LIỆU RAG DEEP LEARNING</span>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-200 text-xs font-mono"
              >
                ✕ Đóng
              </button>
            </div>

            <div className="space-y-2 overflow-y-auto pr-1">
              <h2 className="text-lg font-bold text-slate-100">{previewDoc.title}</h2>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
                <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                  {previewDoc.category}
                </span>
                <span>File: {previewDoc.fileName}</span>
                <span>•</span>
                <span>Thiết bị: {previewDoc.targetMachineCode || 'Chung'}</span>
                <span>•</span>
                <span>Người tạo: {previewDoc.uploadedBy}</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono leading-relaxed whitespace-pre-wrap mt-3">
                {previewDoc.contentSnippet}
              </div>

              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/60 text-xs text-purple-300 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
                <span>Tài liệu này đã được đánh chỉ mục {previewDoc.vectorChunkCount} Vector Embeddings. AI Copilot sẽ tự động trích xuất nội dung khi người dùng đặt câu hỏi chẩn đoán!</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-purple-400 font-bold text-sm">
                <UploadCloud className="w-5 h-5" />
                <span>TẢI LÊN TÀI LIỆU THIẾT BỊ MỚI (DEEP LEARNING RAG)</span>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-mono"
              >
                ✕ Đóng
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 mb-1 font-bold">Tên Tài Liệu / Sổ Tay Huấn Luyện AI:</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="VD: Sổ tay khắc phục lỗi quá nhiệt Spindle CNC-01"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Danh Mục:</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none focus:border-purple-500"
                  >
                    <option value="Equipment Manual">Equipment Manual</option>
                    <option value="Troubleshooting Guide">Troubleshooting Guide</option>
                    <option value="Error Code Index">Error Code Index</option>
                    <option value="PLC Memory Map">PLC Memory Map</option>
                    <option value="Maintenance SOP">Maintenance SOP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Thiết Bị Áp Dụng:</label>
                  <input
                    type="text"
                    value={newMachineCode}
                    onChange={e => setNewMachineCode(e.target.value)}
                    placeholder="CNC-01, Keyence PLC, SMT..."
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-bold">Nội Dung Chi Tiết / Bảng Tra Cứu Mã Lỗi:</label>
                <textarea
                  required
                  rows={5}
                  value={newContentSnippet}
                  onChange={e => setNewContentSnippet(e.target.value)}
                  placeholder="Nhập chi tiết mã lỗi, quy trình kiểm tra tủ điện, danh mục thanh ghi PLC hoặc các bước xử lý sự cố cho AI học..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none focus:border-purple-500 font-sans text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Thẻ Tags (phân cách bằng dấu phẩy):</label>
                <input
                  type="text"
                  value={newTagsStr}
                  onChange={e => setNewTagsStr(e.target.value)}
                  placeholder="Keyence, Spindle, Error_E402"
                  className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-600/30"
                >
                  Lưu & Đánh Chỉ Mục RAG
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
