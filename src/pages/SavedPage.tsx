import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  Search,
  Trash2,
  Copy,
  Check,
  Download,
  BookOpen,
  Filter,
  FolderPlus,
  Folder,
  X,
  FileText,
  Printer,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BottomNavigation } from '../components/layout/BottomNavigation';
import { storage } from '../lib/storage';
import { SavedItem } from '../types/database';
import { downloadFile } from '../lib/utils';

const TOPIC_FILTERS = ['All', 'General', 'Quran', 'Hadith', 'Fiqh', 'Duas', 'History'];

export const SavedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id || 'guest_user';

  const [savedItems, setSavedItems] = useState<SavedItem[]>(() => storage.getSavedItems(userId));
  const [folders, setFolders] = useState(() => storage.getSavedFolders(userId));
  const [activeFolderId, setActiveFolderId] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New folder modal
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('blue');

  // Change folder dropdown state
  const [openFolderMenuId, setOpenFolderMenuId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    const updated = savedItems.filter((item) => item.id !== id);
    setSavedItems(updated);
    storage.saveSavedItems(userId, updated);
  };

  const handleCopy = (item: SavedItem) => {
    navigator.clipboard.writeText(item.content);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const newF = {
      id: `f-${Date.now()}`,
      name: newFolderName.trim(),
      color: newFolderColor,
      icon: 'bookmark',
    };
    const updated = [...folders, newF];
    setFolders(updated);
    storage.saveSavedFolders(userId, updated);
    setNewFolderName('');
    setIsNewFolderModalOpen(false);
    setActiveFolderId(newF.id);
  };

  const handleAssignFolder = (itemId: string, folderId: string) => {
    const updated = savedItems.map((item) => {
      if (item.id === itemId) {
        return { ...item, folder: folderId };
      }
      return item;
    });
    setSavedItems(updated);
    storage.saveSavedItems(userId, updated);
    setOpenFolderMenuId(null);
  };

  const handleExportAll = () => {
    let md = `# Saved Islamic Knowledge Base\n*Exported from EMufti AI on ${new Date().toLocaleDateString()}*\n\n---\n\n`;
    for (const item of savedItems) {
      const folderName = folders.find((f) => f.id === item.folder)?.name || 'Uncategorized';
      md += `## ${item.title} (${item.topic}) · [Folder: ${folderName}]\n*Saved: ${new Date(item.created_at).toLocaleString()}*\n\n`;
      md += `${item.content}\n\n---\n\n`;
    }
    downloadFile(md, `EMufti_Saved_Knowledge_${new Date().toISOString().split('T')[0]}.md`, 'text/markdown');
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredItems = savedItems.filter((item) => {
    const matchesFolder =
      activeFolderId === 'all' ||
      item.folder === activeFolderId ||
      (!item.folder && activeFolderId === 'uncategorized');
    const matchesFilter = activeFilter === 'All' || item.topic === activeFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans w-full max-w-full overflow-x-hidden box-border">
      {/* Top Bar */}
      <div className="h-14 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-8 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm z-20 w-full max-w-full box-border">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
        <span className="text-sm font-bold text-slate-900">Kaydka & Folder-yada (Saved Knowledge)</span>
        <div className="flex items-center gap-1.5">
          {savedItems.length > 0 && (
            <>
              <button
                type="button"
                onClick={handlePrint}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium hover:bg-slate-50 transition-colors text-slate-700 cursor-pointer"
                title="Print or Save as PDF"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>PDF / Print</span>
              </button>
              <button
                type="button"
                onClick={handleExportAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium hover:bg-slate-50 transition-colors text-slate-700 cursor-pointer"
                title="Export all saved answers to Markdown"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Export (.md)</span>
              </button>
            </>
          )}
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto px-3.5 sm:px-8 py-6 sm:py-8 w-full space-y-6 pb-24 lg:pb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Aayadaha, Xadiisyada & Fatwooyinka La Keydiyey
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize, search, and categorize your saved Islamic proofs into custom folders.
          </p>
        </div>

        {/* Feature 1: Custom Folder Tabs Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-blue-600" />
              <span>Qeybaha / Folder-yada (Folders)</span>
            </span>
            <button
              type="button"
              onClick={() => setIsNewFolderModalOpen(true)}
              className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>+ Folder Cusub</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => setActiveFolderId('all')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeFolderId === 'all'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Dhamaan ({savedItems.length})
            </button>

            {folders.map((f) => {
              const count = savedItems.filter((i) => i.folder === f.id).length;
              const isSelected = activeFolderId === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFolderId(f.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Folder className="w-3 h-3" />
                  <span>{f.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Topic Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search saved proofs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar w-full sm:w-auto sm:flex-wrap">
            {TOPIC_FILTERS.map((topic) => (
              <button
                key={topic}
                onClick={() => setActiveFilter(topic)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeFilter === topic
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Items List */}
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100 animate-float-slow">
              <Bookmark className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Ma jiraan wax keydsan</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              When EMufti AI provides an insightful Quranic verse or ruling, click the bookmark icon to save it into your folders.
            </p>
            <Link
              to="/chat"
              className="inline-block mt-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-xs transition-colors"
            >
              Start a Chat
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => {
              const currentFolder = folders.find((f) => f.id === item.folder);
              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-200 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
                        {item.topic}
                      </span>
                      {currentFolder && (
                        <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200 flex items-center gap-1">
                          <Folder className="w-2.5 h-2.5" />
                          <span>{currentFolder.name}</span>
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-400 relative">
                      {/* Move to folder button */}
                      <button
                        type="button"
                        onClick={() => setOpenFolderMenuId(openFolderMenuId === item.id ? null : item.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-700 text-xs flex items-center gap-1 cursor-pointer"
                        title="Move to Folder"
                      >
                        <Folder className="w-3.5 h-3.5 text-blue-600" />
                        <ChevronDown className="w-2.5 h-2.5" />
                      </button>

                      {openFolderMenuId === item.id && (
                        <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-30 text-xs space-y-0.5 animate-in fade-in">
                          <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 block">
                            Assign Folder:
                          </span>
                          {folders.map((f) => (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => handleAssignFolder(item.id, f.id)}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer ${
                                item.folder === f.id ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <span>{f.name}</span>
                              {item.folder === f.id && <Check className="w-3 h-3 text-blue-600" />}
                            </button>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => handleCopy(item)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-700 text-xs flex items-center gap-1 cursor-pointer"
                        title="Copy content"
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-rose-600 text-xs cursor-pointer"
                        title="Remove from saved"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {item.content}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* New Folder Modal */}
      {isNewFolderModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-blue-600" />
                <span>Samee Folder Cusub</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsNewFolderModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Magaca Folder-ka (Folder Name)</label>
                <input
                  type="text"
                  placeholder="e.g., Fiqh Salaadda, Ducooyinka..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  autoFocus
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewFolderModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Ka Noqo
                </button>
                <button
                  type="submit"
                  disabled={!newFolderName.trim()}
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-50"
                >
                  Abuur Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
};
