import React, { useState } from 'react';
import { X, Copy, Check, AlertTriangle, Share2, FileText, Download, Printer } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { exportConversationToMarkdown, exportConversationToJson, downloadFile } from '../../lib/utils';
import { ReportCategory } from '../../types/database';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const { activeConversation, messages } = useChat();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !activeConversation) return null;

  const shareUrl = `${window.location.origin}/chat/${activeConversation.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportMarkdown = () => {
    const md = exportConversationToMarkdown(activeConversation.title, messages);
    downloadFile(md, `${activeConversation.title.replace(/[^a-z0-9]/gi, '_')}.md`, 'text/markdown');
  };

  const handleExportText = () => {
    let txt = `=======================================================================\n`;
    txt += `EMUFTI AI — ISLAMIC CONSULTATION DIALOGUE\n`;
    txt += `Title: ${activeConversation.title}\n`;
    txt += `Date: ${new Date().toLocaleString()}\n`;
    txt += `=======================================================================\n\n`;
    for (const msg of messages) {
      const sender = msg.role === 'user' ? 'SEEKER' : 'EMUFTI AI SCHOLAR';
      txt += `[${sender}] (${new Date(msg.created_at).toLocaleTimeString()}):\n`;
      txt += `${msg.content}\n\n-----------------------------------------------------------------------\n\n`;
    }
    downloadFile(txt, `${activeConversation.title.replace(/[^a-z0-9]/gi, '_')}.txt`, 'text/plain');
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl max-w-md w-full p-5 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-foreground">Share Conversation</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          Share this chat or download the entire dialogue with verified citations.
        </p>

        {/* Link sharing */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Public Conversation Link</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-muted/60 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Export Buttons (Feature 9) */}
        <div className="pt-2 border-t border-border space-y-2">
          <label className="text-xs font-semibold text-foreground">Export Dialogue (Dhoofi Wadahadalka)</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExportMarkdown}
              className="px-3 py-2 rounded-lg border border-border hover:bg-muted text-xs font-medium text-foreground flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Markdown (.md)</span>
            </button>
            <button
              onClick={handleExportText}
              className="px-3 py-2 rounded-lg border border-border hover:bg-muted text-xs font-medium text-foreground flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Plain Text (.txt)</span>
            </button>
            <button
              onClick={handlePrintPdf}
              className="px-3 py-2 rounded-lg border border-border hover:bg-muted text-xs font-medium text-foreground flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-blue-600" />
              <span>PDF / Print</span>
            </button>
            <button
              onClick={handleExportJson}
              className="px-3 py-2 rounded-lg border border-border hover:bg-muted text-xs font-medium text-foreground flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-600" />
              <span>JSON (.json)</span>
            </button>
          </div>
        </div>

        <div className="text-[11px] text-muted-foreground text-center pt-1">
          Only questions and AI responses are shared. Private personal credentials are never exposed.
        </div>
      </div>
    </div>
  );
};

interface ReportModalProps {
  isOpen: boolean;
  messageId: string | null;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, messageId, onClose }) => {
  const { reportMessage } = useChat();
  const [category, setCategory] = useState<ReportCategory>('inaccurate_quran');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !messageId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    await reportMessage(messageId, category, description.trim());
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setDescription('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl max-w-md w-full p-5 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-foreground">Report Religious Inaccuracy</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center mx-auto">
              <Check className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-foreground">Jazakallahu Khayran</h4>
            <p className="text-xs text-muted-foreground">
              Your report has been submitted to our Islamic research moderators for investigation.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <p className="text-xs text-muted-foreground">
              Help us maintain authentic Islamic standards by reporting false quotations, unverified hadiths, or problematic rulings.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Issue Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ReportCategory)}
                className="w-full bg-muted/60 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none cursor-pointer"
              >
                <option value="inaccurate_quran">Inaccurate Quran verse or tafsir</option>
                <option value="unverified_hadith">Unverified or fabricated hadith citation</option>
                <option value="inappropriate_fiqh">Problematic fiqh or biased ruling</option>
                <option value="misleading_translation">Misleading Arabic/Somali translation</option>
                <option value="other">Other religious or technical concern</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Describe the issue</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                placeholder="Explain what was incorrect and mention the authentic reference if known..."
                className="w-full bg-muted/60 border border-border rounded-lg p-2.5 text-xs text-foreground focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!description.trim()}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
