import { TerminalApp } from './terminal/TerminalApp.jsx';
import { FileManagerApp } from './file-manager/FileManagerApp.jsx';
import { TextEditorApp } from './text-editor/TextEditorApp.jsx';
import { SettingsApp } from './settings/SettingsApp.jsx';
import { UniversalConverterApp } from './converter/UniversalConverterApp.jsx';
import { MetadataInspectorApp } from './metadata-inspector/MetadataInspectorApp.jsx';
import { QRScannerApp } from './qr-scanner/QRScannerApp.jsx';
import { ImageInspectorApp } from './image-inspector/ImageInspectorApp.jsx';
import { TextAnalyzerApp } from './text-analyzer/TextAnalyzerApp.jsx';
import { FileComparatorApp } from './file-comparator/FileComparatorApp.jsx';
import { AudioInspectorApp } from './audio-inspector/AudioInspectorApp.jsx';
import { Round2App } from './round2/Round2App.jsx';
import { VisionTargetApp } from './round2/VisionTargetApp.jsx';
import { PromptStudioApp } from './round2/PromptStudioApp.jsx';
import { ImageEvaluatorApp } from './round2/ImageEvaluatorApp.jsx';
import { LeaderboardApp } from './round2/LeaderboardApp.jsx';
import { PrologueApp } from './round2/PrologueApp.jsx';
import { TasksApp } from './tasks/TasksApp.jsx';

export const APP_REGISTRY = {
  'tasks': {
    id: 'tasks',
    title: 'Task Terminal',
    icon: 'CheckSquare',
    category: 'Expedition',
    defaultBounds: { width: 880, height: 600 },
    component: TasksApp
  },
  'task-terminal': {
    id: 'task-terminal',
    title: 'Task Terminal',
    icon: 'CheckSquare',
    category: 'Expedition',
    defaultBounds: { width: 880, height: 600 },
    component: TasksApp
  },
  'round2': {
    id: 'round2',
    title: 'Round 2: Image Navigation',
    icon: 'Compass',
    category: 'Expedition',
    defaultBounds: { width: 1060, height: 690 },
    component: Round2App
  },
  'image-navigation': {
    id: 'image-navigation',
    title: 'Round 2: Image Navigation',
    icon: 'Compass',
    category: 'Expedition',
    defaultBounds: { width: 1060, height: 690 },
    component: Round2App
  },
  'vision-target': {
    id: 'vision-target',
    title: 'Vision Target Viewer',
    icon: 'Eye',
    category: 'Expedition',
    defaultBounds: { width: 860, height: 600 },
    component: VisionTargetApp
  },
  'prompt-studio': {
    id: 'prompt-studio',
    title: 'Prompt Studio',
    icon: 'Sparkles',
    category: 'Expedition',
    defaultBounds: { width: 820, height: 570 },
    component: PromptStudioApp
  },
  'image-evaluator': {
    id: 'image-evaluator',
    title: 'Similarity Evaluator',
    icon: 'Zap',
    category: 'Expedition',
    defaultBounds: { width: 840, height: 590 },
    component: ImageEvaluatorApp
  },
  'leaderboard': {
    id: 'leaderboard',
    title: 'Expedition Standings',
    icon: 'Trophy',
    category: 'Expedition',
    defaultBounds: { width: 720, height: 540 },
    component: LeaderboardApp
  },
  'mission-prologue': {
    id: 'mission-prologue',
    title: 'Sector 4 Briefing',
    icon: 'BookOpen',
    category: 'Expedition',
    defaultBounds: { width: 880, height: 620 },
    component: PrologueApp
  },
  'terminal': {
    id: 'terminal',
    title: 'Terminal Interpreter',
    icon: 'Terminal',
    category: 'System',
    defaultBounds: { width: 740, height: 480 },
    component: TerminalApp
  },
  'file-manager': {
    id: 'file-manager',
    title: 'File Manager',
    icon: 'Folder',
    category: 'Utilities',
    defaultBounds: { width: 780, height: 520 },
    component: FileManagerApp
  },
  'text-editor': {
    id: 'text-editor',
    title: 'Text Editor',
    icon: 'FileText',
    category: 'Accessories',
    defaultBounds: { width: 680, height: 500 },
    component: TextEditorApp
  },
  'converter': {
    id: 'converter',
    title: 'Universal Converter',
    icon: 'RefreshCw',
    category: 'Tools',
    defaultBounds: { width: 780, height: 540 },
    component: UniversalConverterApp
  },
  'metadata-inspector': {
    id: 'metadata-inspector',
    title: 'Metadata Inspector',
    icon: 'Info',
    category: 'Tools',
    defaultBounds: { width: 740, height: 520 },
    component: MetadataInspectorApp
  },
  'qr-scanner': {
    id: 'qr-scanner',
    title: 'QR / Barcode Scanner',
    icon: 'QrCode',
    category: 'Tools',
    defaultBounds: { width: 680, height: 520 },
    component: QRScannerApp
  },
  'image-inspector': {
    id: 'image-inspector',
    title: 'Image Inspector',
    icon: 'Image',
    category: 'Media',
    defaultBounds: { width: 780, height: 560 },
    component: ImageInspectorApp
  },
  'text-analyzer': {
    id: 'text-analyzer',
    title: 'Text Analyzer',
    icon: 'BarChart2',
    category: 'Tools',
    defaultBounds: { width: 720, height: 520 },
    component: TextAnalyzerApp
  },
  'file-comparator': {
    id: 'file-comparator',
    title: 'File Comparison Tool',
    icon: 'GitCompare',
    category: 'Tools',
    defaultBounds: { width: 780, height: 540 },
    component: FileComparatorApp
  },
  'audio-inspector': {
    id: 'audio-inspector',
    title: 'Audio Inspector',
    icon: 'Volume2',
    category: 'Media',
    defaultBounds: { width: 700, height: 500 },
    component: AudioInspectorApp
  },
  'settings': {
    id: 'settings',
    title: 'Settings',
    icon: 'Settings',
    category: 'System',
    defaultBounds: { width: 820, height: 560 },
    component: SettingsApp
  }
};
