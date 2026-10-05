import React, { useState } from "react";
import {
  FolderArchive,
  Search,
  Plus,
  Copy,
  Check,
  FileText,
  FileCode,
  FileArchive,
  Trash2,
  ExternalLink,
  X,
  MoreVertical,
} from "lucide-react";

interface MediaFile {
  id: string;
  name: string;
  type: "PDF" | "SLIDES" | "CODE" | "OTHER";
  url: string;
  size: string;
  uploadedAt: string;
}

export default function FilesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "PDF" | "SLIDES" | "CODE">("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState<"PDF" | "SLIDES" | "CODE">("PDF");
  const [fileSize, setFileSize] = useState("2.4 MB");

  // Initial files catalog
  const [files, setFiles] = useState<MediaFile[]>([
    {
      id: "f-1",
      name: "Unisole_AI_Foundations_Slides.pdf",
      type: "SLIDES",
      url: "https://assets.unisole.org/curriculum/ai-foundations-v2.pdf",
      size: "8.4 MB",
      uploadedAt: "2026-09-20",
    },
    {
      id: "f-2",
      name: "Docker_Fastify_Starter_Project.zip",
      type: "CODE",
      url: "https://assets.unisole.org/templates/docker-fastify-starter.zip",
      size: "1.2 MB",
      uploadedAt: "2026-09-18",
    },
    {
      id: "f-3",
      name: "PyTorch_Tensor_Operations_Cheatsheet.pdf",
      type: "PDF",
      url: "https://assets.unisole.org/notes/pytorch-cheatsheet.pdf",
      size: "450 KB",
      uploadedAt: "2026-09-15",
    },
    {
      id: "f-4",
      name: "RAG_Vector_Search_Lab_Setup.zip",
      type: "CODE",
      url: "https://assets.unisole.org/templates/rag-chroma-setup.zip",
      size: "3.1 MB",
      uploadedAt: "2026-09-12",
    },
  ]);

  const handleCopyLink = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim() || !fileUrl.trim()) return;

    setFiles((prev) => [
      {
        id: `f-${Date.now()}`,
        name: fileName.trim(),
        type: fileType,
        url: fileUrl.trim(),
        size: fileSize || "1.0 MB",
        uploadedAt: new Date().toISOString().split("T")[0],
      },
      ...prev,
    ]);

    setFileName("");
    setFileUrl("");
    setShowAddModal(false);
  };

  const handleDeleteFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const filteredFiles = files.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "ALL" ? true : f.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-5 sm:p-7 lg:p-8 space-y-6 max-w-[1560px] mx-auto animate-fade-in font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <FolderArchive className="w-5 h-5 text-sky-500" />
            <span>Files & Learning Resources</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Media library for uploaded lecture slides, cheatsheet PDFs, and starter project ZIPs.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-xl transition-all shadow-xs cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Upload File</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search files by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-[#0B1120] p-1 rounded-xl border border-slate-200/80 dark:border-slate-800/80 self-start sm:self-auto overflow-x-auto">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filter === "ALL"
                ? "bg-white dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 font-bold shadow-2xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            All ({files.length})
          </button>
          <button
            onClick={() => setFilter("PDF")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filter === "PDF"
                ? "bg-white dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 font-bold shadow-2xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            PDFs
          </button>
          <button
            onClick={() => setFilter("SLIDES")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filter === "SLIDES"
                ? "bg-white dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 font-bold shadow-2xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            Slides
          </button>
          <button
            onClick={() => setFilter("CODE")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filter === "CODE"
                ? "bg-white dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 font-bold shadow-2xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            Code ZIPs
          </button>
        </div>
      </div>

      {/* Files Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0B1120] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-[#070A11]/60">
                <th className="p-4">File Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">Size</th>
                <th className="p-4">Uploaded</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    No files found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr
                    key={file.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="p-4 font-medium text-slate-900 dark:text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        {file.type === "PDF" ? (
                          <FileText className="w-4 h-4 text-rose-500" />
                        ) : file.type === "SLIDES" ? (
                          <FileText className="w-4 h-4 text-sky-500" />
                        ) : (
                          <FileArchive className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                      <span className="font-bold truncate max-w-sm">{file.name}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">
                        {file.type}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {file.size}
                    </td>
                    <td className="p-4 text-slate-400 font-mono text-[11px]">
                      {file.uploadedAt}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleCopyLink(file.id, file.url)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Copy direct file URL"
                      >
                        {copiedId === file.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-500 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>

                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Open file in new tab"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="inline-flex items-center p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload File Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1120] rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Upload New Resource
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddFile} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  File Display Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Week_3_Vector_DB_Cheatsheet.pdf"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Resource Public URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://assets.unisole.org/curriculum/..."
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/40 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Resource Category
                  </label>
                  <select
                    value={fileType}
                    onChange={(e: any) => setFileType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="SLIDES">Lecture Slides</option>
                    <option value="CODE">Code Repository ZIP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Approx Size
                  </label>
                  <input
                    type="text"
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Save Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
