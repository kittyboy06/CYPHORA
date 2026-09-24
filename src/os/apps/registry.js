import { TerminalApp } from './terminal/TerminalApp.jsx';
import { FileManagerApp } from './file-manager/FileManagerApp.jsx';
import { TextEditorApp } from './text-editor/TextEditorApp.jsx';

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
  }
};
