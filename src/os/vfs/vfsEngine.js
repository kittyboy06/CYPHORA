import { INITIAL_VFS } from './initialVFS.js';
import { eventBus } from '../events/eventBus.js';

const STORAGE_KEY = 'cyphora_vfs_data';

class VFSEngine {
  constructor() {
    this.tree = this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object' && parsed['/']) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('[VFS] Storage corrupted or unavailable, falling back to initial VFS', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_VFS));
  }

  saveToStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tree));
      }
    } catch (e) {
      console.error('[VFS] Failed to persist filesystem', e);
    }
  }

  resetVFS() {
    this.tree = JSON.parse(JSON.stringify(INITIAL_VFS));
    this.saveToStorage();
    eventBus.emit('VFS_RESET', { timestamp: new Date().toISOString() });
    return this.tree;
  }

  /**
   * Resolves relative path against current working directory (cwd)
   * into an absolute normalized path.
   */
  resolvePath(cwd, targetPath) {
    if (!targetPath || targetPath === '.') return cwd || '/';
    if (targetPath === '~') return '/Users/Navigator';

    let parts;
    if (targetPath.startsWith('/')) {
      parts = targetPath.split('/').filter(Boolean);
    } else {
      const baseParts = (cwd || '/').split('/').filter(Boolean);
      const relativeParts = targetPath.split('/').filter(Boolean);
      parts = [...baseParts, ...relativeParts];
    }

    const resolved = [];
    for (const part of parts) {
      if (part === '.') continue;
      if (part === '..') {
        if (resolved.length > 0) resolved.pop();
      } else {
        resolved.push(part);
      }
    }

    return '/' + resolved.join('/');
  }

  getNode(path) {
    const normalized = path === '/' ? '/' : path.replace(/\/+$/, '');
    return this.tree[normalized] || null;
  }

  exists(path) {
    return !!this.getNode(path);
  }

  listDir(path, includeHidden = false) {
    const normalized = path === '/' ? '/' : path.replace(/\/+$/, '');
    const parent = this.getNode(normalized);

    if (!parent) {
      throw new Error(`Directory not found: ${path}`);
    }
    if (parent.type !== 'dir') {
      throw new Error(`Not a directory: ${path}`);
    }

    const children = [];
    for (const [nodePath, node] of Object.entries(this.tree)) {
      if (nodePath === normalized) continue;

      // Direct child check
      let parentPath;
      const lastSlash = nodePath.lastIndexOf('/');
      if (lastSlash === 0) {
        parentPath = '/';
      } else {
        parentPath = nodePath.substring(0, lastSlash);
      }

      if (parentPath === normalized) {
        const isHidden = node.hidden || node.name.startsWith('.');
        if (!isHidden || includeHidden) {
          children.push(node);
        }
      }
    }

    // Sort folders first, then alphabetically
    return children.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'dir' ? -1 : 1;
    });
  }

  readFile(path, appId = 'system') {
    const node = this.getNode(path);
    if (!node) {
      throw new Error(`No such file: ${path}`);
    }
    if (node.type === 'dir') {
      throw new Error(`Is a directory: ${path}`);
    }

    eventBus.emit('FILE_OPENED', {
      path: node.path,
      name: node.name,
      mimeType: node.mimeType || 'text/plain',
      appId
    });

    return node.content || '';
  }

  writeFile(path, content, appId = 'system') {
    const normalized = path === '/' ? '/' : path.replace(/\/+$/, '');
    let node = this.getNode(normalized);

    if (node && node.type === 'dir') {
      throw new Error(`Cannot overwrite directory: ${path}`);
    }
    if (node && node.locked) {
      throw new Error(`File is write-protected: ${path}`);
    }

    if (!node) {
      // Create new file node
      const lastSlash = normalized.lastIndexOf('/');
      const parentPath = lastSlash === 0 ? '/' : normalized.substring(0, lastSlash);
      const fileName = normalized.substring(lastSlash + 1);

      const parentNode = this.getNode(parentPath);
      if (!parentNode || parentNode.type !== 'dir') {
        throw new Error(`Cannot create file, parent directory missing: ${parentPath}`);
      }

      node = {
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: fileName,
        type: 'file',
        parentId: parentNode.id,
        path: normalized,
        mimeType: 'text/plain',
        size: new Blob([content]).size,
        content,
        updatedAt: new Date().toISOString()
      };
      this.tree[normalized] = node;

      eventBus.emit('FILE_CREATED', { path: normalized, appId });
    } else {
      // Update existing node
      node.content = content;
      node.size = new Blob([content]).size;
      node.updatedAt = new Date().toISOString();

      eventBus.emit('FILE_MODIFIED', { path: normalized, appId });
    }

    this.saveToStorage();
    return node;
  }

  makeDir(path, appId = 'system') {
    const normalized = path === '/' ? '/' : path.replace(/\/+$/, '');
    if (this.exists(normalized)) {
      throw new Error(`Directory or file already exists: ${path}`);
    }

    const lastSlash = normalized.lastIndexOf('/');
    const parentPath = lastSlash === 0 ? '/' : normalized.substring(0, lastSlash);
    const dirName = normalized.substring(lastSlash + 1);

    const parentNode = this.getNode(parentPath);
    if (!parentNode || parentNode.type !== 'dir') {
      throw new Error(`Parent directory does not exist: ${parentPath}`);
    }

    const newDir = {
      id: `dir_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: dirName,
      type: 'dir',
      parentId: parentNode.id,
      path: normalized,
      updatedAt: new Date().toISOString()
    };

    this.tree[normalized] = newDir;
    this.saveToStorage();

    eventBus.emit('DIR_CREATED', { path: normalized, appId });
    return newDir;
  }

  deleteNode(path, appId = 'system') {
    const normalized = path === '/' ? '/' : path.replace(/\/+$/, '');
    if (normalized === '/' || normalized === '/System') {
      throw new Error(`Cannot delete protected system directory: ${path}`);
    }

    const node = this.getNode(normalized);
    if (!node) {
      throw new Error(`No such file or directory: ${path}`);
    }

    // Delete node and any children if it's a directory
    for (const key of Object.keys(this.tree)) {
      if (key === normalized || key.startsWith(normalized + '/')) {
        delete this.tree[key];
      }
    }

    this.saveToStorage();
    eventBus.emit('FILE_DELETED', { path: normalized, appId });
    return true;
  }
}

export const vfs = new VFSEngine();
