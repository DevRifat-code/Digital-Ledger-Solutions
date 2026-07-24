import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { cn } from '../../lib/utils';
import { compressImage } from '../../lib/imageUtils';
import {
  Bold,
  Italic,
  Underline,
  Palette,
  Type,
  Heading,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Languages,
  Code,
  Eye,
  Maximize2,
  Minimize2,
  Moon,
  Sun,
  UploadCloud,
  X,
  Check,
  Plus,
  Sparkles,
  Columns
} from 'lucide-react';

/**
 * Automatically converts inline base64 images (![alt](data:image/...))
 * into clean reference-style images (![alt][img_1]) with data definitions appended at the bottom.
 */
export function cleanMarkdownBase64Images(text: string): string {
  if (!text || !text.includes('data:image/')) return text;

  const inlineImageRegex = /!\[([^\]]*)\]\((data:image\/[^)]+)\)/g;

  if (!inlineImageRegex.test(text)) return text;

  inlineImageRegex.lastIndex = 0;

  let counter = 1;
  const existingRefs = text.match(/\[img_(\d+)\]:/g);
  if (existingRefs) {
    existingRefs.forEach(m => {
      const num = parseInt(m.replace('[img_', '').replace(']:', ''), 10);
      if (!isNaN(num) && num >= counter) {
        counter = num + 1;
      }
    });
  }

  const references: { id: string; url: string }[] = [];

  let newText = text.replace(inlineImageRegex, (_fullMatch, alt, dataUrl) => {
    const refId = `img_${counter++}`;
    references.push({ id: refId, url: dataUrl });
    return `![${alt || 'Image'}][${refId}]`;
  });

  if (references.length > 0) {
    const refDefs = references.map(r => `[${r.id}]: ${r.url}`).join('\n');
    newText = `${newText.trim()}\n\n${refDefs}\n`;
  }

  return newText;
}

interface RichArticleEditorProps {
  content: string;
  onChange: (newContent: string) => void;
  darkMode?: boolean;
}

export function RichArticleEditor({ content, onChange }: RichArticleEditorProps) {
  // Undo/Redo stack management
  const [history, setHistory] = useState<string[]>([content]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Editor states
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [editorDarkMode, setEditorDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'html'>('editor');
  const [isSplitMode, setIsSplitMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Formatting popovers / dropdowns
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);
  const [showFontFamilyPicker, setShowFontFamilyPicker] = useState(false);
  const [showHeadingPicker, setShowHeadingPicker] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Inputs for modals
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize history when content changes from external prop reset
  useEffect(() => {
    if (history[historyIndex] !== content) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(content);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [content]);

  const updateContent = (newVal: string) => {
    onChange(newVal);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newVal);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      onChange(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      onChange(next);
    }
  };

  // Helper to wrap selected text or insert snippet at cursor
  const insertText = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      updateContent(content + `${prefix}${suffix}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = content.substring(start, end) || 'text';
    const before = content.substring(0, start);
    const after = content.substring(end);

    const replacement = `${prefix}${selection}${suffix}`;
    const newContent = `${before}${replacement}${after}`;
    updateContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selection.length);
    }, 0);
  };

  // Alignment
  const handleAlign = (align: 'left' | 'center' | 'right') => {
    insertText(`<div align="${align}">\n\n`, `\n\n</div>`);
  };

  // Text Direction RTL / LTR
  const handleDirection = (dir: 'rtl' | 'ltr') => {
    insertText(`<div dir="${dir}">\n\n`, `\n\n</div>`);
  };

  // Formatting actions
  const applyBold = () => insertText('**', '**');
  const applyItalic = () => insertText('*', '*');
  const applyUnderline = () => insertText('<u>', '</u>');

  const applyHeading = (level: number) => {
    const hashes = '#'.repeat(level) + ' ';
    insertText(`\n${hashes}`, '');
    setShowHeadingPicker(false);
  };

  const applyColor = (colorHex: string) => {
    insertText(`<span style="color: ${colorHex}">`, `</span>`);
    setShowColorPicker(false);
  };

  const applyFontSize = (sizePx: string) => {
    insertText(`<span style="font-size: ${sizePx}">`, `</span>`);
    setShowFontSizePicker(false);
  };

  const applyFontFamily = (family: string) => {
    insertText(`<span style="font-family: ${family}">`, `</span>`);
    setShowFontFamilyPicker(false);
  };

  const applyListOrdered = () => insertText('\n1. Item 1\n2. Item 2\n');
  const applyListUnordered = () => insertText('\n- Item 1\n- Item 2\n');
  const applyQuote = () => insertText('\n> ', '\n');

  // Link Insertion
  const handleInsertLink = () => {
    if (!linkUrl) return;
    const txt = linkText || 'Link';
    insertText(`[${txt}](${linkUrl})`);
    setLinkUrl('');
    setLinkText('');
    setShowLinkModal(false);
  };

  // Auto-clean inline base64 images on initial load or content change if needed
  useEffect(() => {
    if (content && content.includes('data:image/') && /!\[[^\]]*\]\(data:image\//.test(content)) {
      const cleaned = cleanMarkdownBase64Images(content);
      if (cleaned !== content) {
        updateContent(cleaned);
      }
    }
  }, []);

  const handleCleanImages = () => {
    const cleaned = cleanMarkdownBase64Images(content);
    if (cleaned !== content) {
      updateContent(cleaned);
    }
  };

  // Insert reference-style image (![alt][img_1]) and append definition at bottom
  const insertReferenceImage = (alt: string, dataUrl: string) => {
    const textarea = textareaRef.current;

    let nextNum = 1;
    const existingRefs = content.match(/\[img_(\d+)\]:/g);
    if (existingRefs) {
      existingRefs.forEach(m => {
        const num = parseInt(m.replace('[img_', '').replace(']:', ''), 10);
        if (!isNaN(num) && num >= nextNum) {
          nextNum = num + 1;
        }
      });
    }

    const refId = `img_${nextNum}`;
    const imageTag = `\n![${alt || 'Image'}][${refId}]\n`;
    const refDefinition = `[${refId}]: ${dataUrl}`;

    if (!textarea) {
      updateContent(`${content.trim()}\n${imageTag}\n\n${refDefinition}\n`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = content.substring(0, start);
    const after = content.substring(end);

    const newTextBody = `${before}${imageTag}${after}`.trim();
    const newContent = `${newTextBody}\n\n${refDefinition}\n`;
    updateContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + imageTag.length, start + imageTag.length);
    }, 0);
  };

  // Image Insertion & Preview Handlers
  const handleConfirmInsertImage = () => {
    const src = imagePreview || imageUrl;
    if (!src) return;
    const alt = imageAlt || 'Image';
    if (imagePreview) {
      insertReferenceImage(alt, imagePreview);
    } else {
      insertText(`\n![${alt}](${imageUrl})\n`);
    }
    setImageUrl('');
    setImageAlt('');
    setImagePreview(null);
    setShowImageModal(false);
  };

  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await compressImage(file, 1000, 800, 0.7);
        const cleanName = file.name.replace(/\.[^/.]+$/, "") || 'Uploaded Image';
        setImagePreview(base64);
        setImageAlt(cleanName);
      } catch (err) {
        console.error('Image upload failed', err);
        alert('Failed to process image');
      }
    }
  };

  // Video Insertion
  const handleInsertVideo = () => {
    if (!videoUrl) return;
    let embedSnippet = '';
    // YouTube link conversion
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      let videoId = '';
      if (videoUrl.includes('youtu.be/')) {
        videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
      } else if (videoUrl.includes('v=')) {
        videoId = videoUrl.split('v=')[1]?.split('&')[0];
      }
      if (videoId) {
        embedSnippet = `\n<div className="aspect-video w-full my-6 rounded-2xl overflow-hidden shadow-lg"><iframe src="https://www.youtube.com/embed/${videoId}" className="w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe></div>\n`;
      } else {
        embedSnippet = `\n<iframe src="${videoUrl}" className="w-full aspect-video rounded-2xl border-0" allowFullScreen></iframe>\n`;
      }
    } else {
      // Direct mp4 video
      embedSnippet = `\n<video controls src="${videoUrl}" className="w-full rounded-2xl shadow-lg my-6"></video>\n`;
    }
    insertText(embedSnippet);
    setVideoUrl('');
    setShowVideoModal(false);
  };

  // Drag and Drop files onto editor area
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(f => f.type.startsWith('image/'));
    if (imageFile) {
      try {
        const compressed = await compressImage(imageFile, 800, 600, 0.6);
        const cleanName = imageFile.name.replace(/\.[^/.]+$/, "") || 'Image';
        insertReferenceImage(cleanName, compressed);
      } catch (err) {
        console.error('Drop image failed:', err);
      }
    }
  };

  const presetColors = [
    '#000000', '#4f46e5', '#2563eb', '#0284c7', '#059669', 
    '#dc2626', '#d97706', '#7c3aed', '#db2777', '#475569'
  ];

  const presetFontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px'];

  const presetFontFamilies = [
    { label: 'Sans-serif (Modern)', value: 'sans-serif' },
    { label: 'Serif (Classic)', value: 'serif' },
    { label: 'Monospace (Code)', value: 'monospace' },
    { label: 'Space Grotesk (Display)', value: "'Space Grotesk', sans-serif" },
    { label: 'Playfair Display (Editorial)', value: "'Playfair Display', serif" }
  ];

  return (
    <div
      className={cn(
        "rounded-[2rem] border transition-all overflow-hidden flex flex-col",
        editorDarkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900",
        isFullScreen ? "fixed inset-0 z-50 rounded-none border-0 h-screen w-screen" : "relative min-h-[550px]"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-40 bg-indigo-600/90 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-3 animate-in fade-in">
          <UploadCloud size={48} className="animate-bounce" />
          <p className="text-lg font-black tracking-wide uppercase">Drop Image Here to Upload</p>
          <p className="text-xs font-bold text-indigo-200">Images will be compressed and inserted into article</p>
        </div>
      )}

      {/* Main Toolbar */}
      <div className={cn(
        "p-3 border-b flex flex-wrap items-center justify-between gap-2 select-none sticky top-0 z-20 transition-colors",
        editorDarkMode ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50/90 border-slate-200 text-slate-700"
      )}>
        {/* Formatting Actions Left */}
        <div className="flex flex-wrap items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          {/* Undo / Redo */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-2 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-all disabled:opacity-30"
            title="Undo (Ctrl+Z)"
          >
            <Undo size={16} />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-all disabled:opacity-30"
            title="Redo (Ctrl+Y)"
          >
            <Redo size={16} />
          </button>

          <div className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* Heading Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowHeadingPicker(!showHeadingPicker)}
              className="flex items-center gap-1 p-2 px-2.5 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-all"
              title="Heading (H1-H6)"
            >
              <Heading size={16} />
              <span>Headings</span>
            </button>
            {showHeadingPicker && (
              <div className="absolute top-full left-0 mt-1 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-30 space-y-1">
                {[1, 2, 3, 4, 5, 6].map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => applyHeading(level)}
                    className="w-full text-left px-3 py-1.5 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl text-xs font-black text-slate-800 dark:text-slate-200"
                  >
                    H{level} Heading
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* Text Formatting */}
          <button
            type="button"
            onClick={applyBold}
            className="p-2 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-all font-black text-xs"
            title="Bold"
          >
            <Bold size={16} />
          </button>
          <button
            type="button"
            onClick={applyItalic}
            className="p-2 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-all italic text-xs"
            title="Italic"
          >
            <Italic size={16} />
          </button>
          <button
            type="button"
            onClick={applyUnderline}
            className="p-2 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-all underline text-xs"
            title="Underline"
          >
            <Underline size={16} />
          </button>

          {/* Text Color Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-2 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-all text-indigo-600 dark:text-indigo-400"
              title="Text Color"
            >
              <Palette size={16} />
            </button>
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-3 z-30 space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-400">Select Text Color</span>
                <div className="grid grid-cols-5 gap-1.5">
                  {presetColors.map(c => (
                    <button
                      key={c}
                      type="button"
                      style={{ backgroundColor: c }}
                      onClick={() => applyColor(c)}
                      className="w-6 h-6 rounded-lg border border-white/20 shadow-sm hover:scale-110 transition-transform"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Font Size Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFontSizePicker(!showFontSizePicker)}
              className="p-2 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-all"
              title="Font Size"
            >
              Size
            </button>
            {showFontSizePicker && (
              <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-30 space-y-1">
                {presetFontSizes.map(sz => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => applyFontSize(sz)}
                    className="w-full text-left px-3 py-1.5 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl text-xs font-medium"
                  >
                    {sz}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Font Family Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFontFamilyPicker(!showFontFamilyPicker)}
              className="p-2 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-all"
              title="Font Family"
            >
              <Type size={16} />
            </button>
            {showFontFamilyPicker && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-30 space-y-1">
                {presetFontFamilies.map(ff => (
                  <button
                    key={ff.value}
                    type="button"
                    onClick={() => applyFontFamily(ff.value)}
                    className="w-full text-left px-3 py-1.5 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl text-xs font-medium"
                  >
                    {ff.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* Alignment */}
          <button
            type="button"
            onClick={() => handleAlign('left')}
            className="p-2 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-all"
            title="Align Left"
          >
            <AlignLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleAlign('center')}
            className="p-2 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-all"
            title="Align Center"
          >
            <AlignCenter size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleAlign('right')}
            className="p-2 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-all"
            title="Align Right"
          >
            <AlignRight size={16} />
          </button>

          {/* RTL / LTR Toggle */}
          <button
            type="button"
            onClick={() => handleDirection('rtl')}
            className="p-2 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-all text-xs font-black"
            title="RTL Text Direction"
          >
            <Languages size={16} />
          </button>

          <div className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* Lists & Quote */}
          <button
            type="button"
            onClick={applyListUnordered}
            className="p-2 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-all"
            title="Unordered List"
          >
            <List size={16} />
          </button>
          <button
            type="button"
            onClick={applyListOrdered}
            className="p-2 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-all"
            title="Ordered List"
          >
            <ListOrdered size={16} />
          </button>
          <button
            type="button"
            onClick={applyQuote}
            className="p-2 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-all"
            title="Quote Block"
          >
            <Quote size={16} />
          </button>

          <div className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* Embeds: Link, Image, Video */}
          <button
            type="button"
            onClick={() => setShowLinkModal(true)}
            className="p-2 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-all"
            title="Insert Link"
          >
            <LinkIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() => setShowImageModal(true)}
            className="p-2 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-all text-indigo-600 dark:text-indigo-400"
            title="Insert Image"
          >
            <ImageIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() => setShowVideoModal(true)}
            className="p-2 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-all text-red-600 dark:text-red-400"
            title="Insert Video"
          >
            <Video size={16} />
          </button>
          
          <button
            type="button"
            onClick={handleCleanImages}
            className="flex items-center gap-1.5 p-2 px-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-xl text-xs font-bold transition-all ml-1"
            title="Clean & format long base64 image strings into neat reference links"
          >
            <Sparkles size={14} className="text-amber-600 dark:text-amber-400" />
            <span>Clean Images</span>
          </button>
        </div>

        {/* View Controls Right: Mode Switchers, Split View, Fullscreen, Dark Mode */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Tab switchers */}
          <div className="flex items-center gap-1 bg-slate-200/50 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setActiveTab('editor');
                setIsSplitMode(false);
              }}
              className={cn(
                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                activeTab === 'editor' && !isSplitMode ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              Write
            </button>

            {/* Split Mode button */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('editor');
                setIsSplitMode(!isSplitMode);
              }}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1",
                activeTab === 'editor' && isSplitMode ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
              title="Toggle Live Split View"
            >
              <Columns size={12} />
              <span>Split</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('preview');
                setIsSplitMode(false);
              }}
              className={cn(
                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1",
                activeTab === 'preview' ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Eye size={12} />
              Preview
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('html');
                setIsSplitMode(false);
              }}
              className={cn(
                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1",
                activeTab === 'html' ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Code size={12} />
              HTML / Code
            </button>
          </div>

          {/* Dark mode toggle */}
          <button
            type="button"
            onClick={() => setEditorDarkMode(!editorDarkMode)}
            className="p-2 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-500 hover:text-slate-900 dark:hover:text-amber-400"
            title="Toggle Editor Dark Mode"
          >
            {editorDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Full screen toggle */}
          <button
            type="button"
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-2 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-500 hover:text-indigo-600"
            title="Toggle Full Screen Mode"
          >
            {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {activeTab === 'editor' && (
          <div className="flex-1 flex flex-col min-h-0">
            {isSplitMode ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800 flex-1 min-h-[400px]">
                {/* Left: Textarea Write Box */}
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => updateContent(e.target.value)}
                  className={cn(
                    "w-full h-full p-6 outline-none resize-none font-serif text-base leading-relaxed transition-colors min-h-[300px]",
                    editorDarkMode ? "bg-slate-900 text-slate-100 placeholder:text-slate-600" : "bg-white text-slate-800 placeholder:text-slate-400"
                  )}
                  placeholder="Write your article content here..."
                />
                {/* Right: Live Preview */}
                <div className={cn(
                  "p-6 overflow-y-auto max-h-[500px]",
                  editorDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
                )}>
                  <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest mb-3">Live Article & Image Preview</p>
                  <div className="prose prose-indigo max-w-none dark:prose-invert">
                    <Markdown 
                      rehypePlugins={[rehypeRaw]}
                      urlTransform={(url) => url}
                      components={{
                        img: ({ node, ...props }) => {
                          if (!props.src || props.src.trim() === '') return null;
                          return (
                            <img
                              {...props}
                              alt={props.alt || 'Uploaded Image'}
                              className="rounded-2xl shadow-lg max-w-full my-4 mx-auto object-cover border border-slate-200"
                              referrerPolicy="no-referrer"
                            />
                          );
                        }
                      }}
                    >
                      {content || '*Start typing to see live preview...*'}
                    </Markdown>
                  </div>
                </div>
              </div>
            ) : (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => updateContent(e.target.value)}
                className={cn(
                  "w-full flex-1 p-6 md:p-8 outline-none resize-none font-serif text-base leading-relaxed transition-colors min-h-[280px]",
                  editorDarkMode ? "bg-slate-900 text-slate-100 placeholder:text-slate-600" : "bg-white text-slate-800 placeholder:text-slate-400"
                )}
                placeholder="Write your article content here... Drag & drop images or use the rich toolbar above."
              />
            )}
          </div>
        )}

        {activeTab === 'html' && (
          <textarea
            value={content}
            onChange={(e) => updateContent(e.target.value)}
            className="w-full flex-1 p-6 md:p-8 bg-slate-950 text-emerald-400 font-mono text-xs leading-relaxed outline-none resize-none"
            placeholder="<p>Write raw HTML or Markdown source code...</p>"
          />
        )}

        {activeTab === 'preview' && (
          <div className={cn(
            "w-full flex-1 p-6 md:p-10 overflow-y-auto max-h-[600px] transition-colors",
            editorDarkMode ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-900"
          )}>
            <div className="prose prose-indigo max-w-none dark:prose-invert">
              <div className="blog-content text-base md:text-lg leading-relaxed space-y-4 [&_img]:rounded-2xl [&_img]:shadow-lg [&_img]:max-w-full [&_iframe]:max-w-full">
                <Markdown 
                  rehypePlugins={[rehypeRaw]}
                  urlTransform={(url) => url}
                  components={{
                    img: ({ node, ...props }) => {
                      if (!props.src || props.src.trim() === '') return null;
                      return (
                        <img
                          {...props}
                          alt={props.alt || 'Uploaded Image'}
                          className="rounded-2xl shadow-lg max-w-full my-4 mx-auto object-cover border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                      );
                    }
                  }}
                >
                  {content || '*No content written yet. Write something in the Editor tab.*'}
                </Markdown>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <LinkIcon size={18} className="text-indigo-600" />
                Insert Web Link
              </h4>
              <button type="button" onClick={() => setShowLinkModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400">Link Text</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="e.g. Visit Our Website"
                  className="w-full mt-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400">URL Address</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full mt-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertLink}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-indigo-700"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal with Live Preview */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon size={18} className="text-indigo-600" />
                Insert Article Image
              </h4>
              <button 
                type="button" 
                onClick={() => {
                  setShowImageModal(false);
                  setImagePreview(null);
                  setImageUrl('');
                  setImageAlt('');
                }} 
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Live Preview Container when image exists */}
            {(imagePreview || (imageUrl && imageUrl.trim() !== '')) ? (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950/80 group">
                  <div className="aspect-video w-full flex items-center justify-center overflow-hidden">
                    <img 
                      src={imagePreview || imageUrl} 
                      alt={imageAlt || 'Preview'} 
                      className="max-h-64 w-full object-contain"
                      onError={() => {
                        // handled gracefully
                      }}
                    />
                  </div>
                  <div className="absolute top-3 left-3 bg-indigo-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-lg tracking-wider">
                    Live Preview
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setImageUrl('');
                    }}
                    className="absolute top-3 right-3 p-1.5 bg-red-600 text-white rounded-xl text-xs font-bold shadow-lg hover:bg-red-700 transition-all flex items-center gap-1"
                    title="Remove / Change Image"
                  >
                    <X size={14} />
                    <span>Change</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Alt Caption / Description</label>
                  <input
                    type="text"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="Describe the image for SEO & Accessibility..."
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Option 1: File Upload */}
                <div className="p-6 bg-indigo-50/50 dark:bg-slate-800/50 border-2 border-dashed border-indigo-200 dark:border-slate-700 rounded-2xl text-center space-y-3 hover:border-indigo-500 transition-all">
                  <UploadCloud size={32} className="mx-auto text-indigo-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Upload Image File</p>
                    <p className="text-[10px] text-slate-400 font-medium">PNG, JPG, WEBP, GIF up to 5MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all"
                  >
                    Choose Local File
                  </button>
                </div>

                <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase">
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                  <span>OR Image Web URL</span>
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                </div>

                {/* Option 2: Image URL */}
                <div className="space-y-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  <input
                    type="text"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="Alt caption text"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowImageModal(false);
                  setImagePreview(null);
                  setImageUrl('');
                  setImageAlt('');
                }}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmInsertImage}
                disabled={!imagePreview && (!imageUrl || imageUrl.trim() === '')}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 disabled:opacity-50 shadow-md shadow-indigo-500/20 transition-all"
              >
                Insert Into Article
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Video size={18} className="text-red-600" />
                Embed Video (YouTube / MP4)
              </h4>
              <button type="button" onClick={() => setShowVideoModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400">YouTube or Direct MP4 Video URL</label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full mt-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              <p className="text-[10px] text-slate-400 mt-1">Supports YouTube links or direct MP4 video URLs.</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertVideo}
                disabled={!videoUrl}
                className="px-5 py-2 bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-700 disabled:opacity-50"
              >
                Embed Video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
