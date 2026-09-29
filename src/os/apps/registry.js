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

export const APP_REGISTRY = {
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
