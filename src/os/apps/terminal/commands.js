/**
 * Terminal command interpreter engine
 */

export function executeCommand({ commandLine, cwd, vfs, eventBus, teamName, setCwd, clearTerminal, history }) {
  const trimmed = commandLine.trim();
  if (!trimmed) return null;

  // Split into command and arguments, handling quotes
  const match = trimmed.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g);
  if (!match) return null;

  const rawArgs = match.map(arg => arg.replace(/^['"]|['"]$/g, ''));
  const cmd = rawArgs[0].toLowerCase();
  const args = rawArgs.slice(1);

  // Emit event for Task & Validation engine
  eventBus.emit('TERMINAL_COMMAND_EXECUTED', {
    command: cmd,
    args,
    raw: trimmed,
    cwd,
    output: trimmed
  });

  switch (cmd) {
    case 'help': {
      return [
        { type: 'text', text: 'pwd               show current location' },
        { type: 'text', text: 'ls                list folder contents' },
        { type: 'text', text: 'ls -a             show hidden entries' },
        { type: 'text', text: 'cd <folder>       enter a folder' },
        { type: 'text', text: 'cd ..             move to parent folder' },
        { type: 'text', text: 'cat <file>        read a text file' },
        { type: 'text', text: 'find <path> <x>   search for a file' },
        { type: 'text', text: 'grep <x> <path>   search text' },
        { type: 'text', text: 'history           show command history' },
        { type: 'text', text: 'clear             clear terminal' },
        { type: 'text', text: 'date              show system time' },
        { type: 'text', text: 'whoami            show current user' }
      ];
    }

    case 'pwd': {
      return [{ type: 'text', text: cwd || '/' }];
    }

    case 'clear': {
      clearTerminal();
      return null;
    }

    case 'whoami': {
      return [{ type: 'text', text: `${teamName || 'hkgj'}@cyphora-workstation` }];
    }

    case 'date': {
      return [{ type: 'text', text: new Date().toUTCString() }];
    }

    case 'history': {
      return history.map((item, idx) => ({
        type: 'text',
        text: `  ${idx + 1}  ${item}`
      }));
    }

    case 'cd': {
      const target = args[0] || '/';
      const resolved = vfs.resolvePath(cwd, target);
      const node = vfs.getNode(resolved);

      if (!node) {
        // Navigation Safety Check: If target exists at root (e.g. /Documents), give a helpful hint
        const rootAttempt = target.startsWith('/') ? null : vfs.getNode('/' + target);
        if (rootAttempt && rootAttempt.type === 'dir') {
          return [
            { type: 'error', text: `cd: ${target}: no such directory here` },
            { type: 'info', text: `Tip: use an absolute path such as /${target}` }
          ];
        }
        return [{ type: 'error', text: `cd: no such file or directory: ${target}` }];
      }
      if (node.type !== 'dir') {
        return [{ type: 'error', text: `cd: not a directory: ${target}` }];
      }

      setCwd(node.path);
      eventBus.emit('DIR_CHANGED', { from: cwd, to: node.path, appId: 'terminal' });
      return null;
    }

    case 'ls': {
      let showHidden = false;
      let longFormat = false;
      const targetPaths = [];

      for (const arg of args) {
        if (arg.startsWith('-')) {
          if (arg.includes('a')) showHidden = true;
          if (arg.includes('l')) longFormat = true;
        } else {
          targetPaths.push(arg);
        }
      }

      const target = targetPaths[0] || '.';
      const resolved = vfs.resolvePath(cwd, target);

      try {
        const entries = vfs.listDir(resolved, showHidden);
        if (entries.length === 0) {
          return [{ type: 'text', text: '(empty directory)' }];
        }

        if (longFormat) {
          return entries.map(item => {
            const isDir = item.type === 'dir';
            const perm = isDir ? 'drwxr-xr-x' : (item.locked ? '-r--r--r--' : '-rw-r--r--');
            const size = (item.size || 0).toString().padStart(8, ' ');
            const date = new Date(item.updatedAt || Date.now()).toLocaleDateString();
            return {
              type: isDir ? 'dir' : 'file',
              text: `${perm}  1 navigator staff ${size} ${date} ${item.name}${isDir ? '/' : ''}`
            };
          });
        }

        // Standard compact view
        return [
          {
            type: 'entry-grid',
            entries: entries.map(e => ({
              name: e.name + (e.type === 'dir' ? '/' : ''),
              isDir: e.type === 'dir',
              isHidden: e.hidden || e.name.startsWith('.')
            }))
          }
        ];
      } catch (err) {
        return [{ type: 'error', text: `ls: cannot access '${target}': ${err.message}` }];
      }
    }

    case 'find': {
      if (args.length === 0) return [{ type: 'error', text: 'Usage: find <path> <pattern> or find <pattern>' }];
      let searchPathArg, patternArg;
      if (args.length === 1) {
        searchPathArg = cwd || '/';
        patternArg = args[0];
      } else {
        searchPathArg = args[0];
        patternArg = args[1];
      }

      const searchRoot = vfs.resolvePath(cwd, searchPathArg);
      const pattern = patternArg.toLowerCase();
      const matches = [];

      const visit = (path) => {
        const node = vfs.getNode(path);
        if (!node) return;
        if (node.type === 'file') {
          if (node.name.toLowerCase().includes(pattern) || node.path.toLowerCase().includes(pattern)) {
            matches.push(node);
          }
          return;
        }
        try {
          vfs.listDir(path, true).forEach(child => visit(child.path));
        } catch (e) {}
      };

      visit(searchRoot);
      matches.forEach(node => {
        eventBus.emit('FILE_FOUND', { filePath: node.path, fileName: node.name, hidden: Boolean(node.hidden) });
        if (node.path.toLowerCase().includes('distress') || node.path.toLowerCase().includes('radio')) {
          eventBus.emit('DISTRESS_MESSAGE_FOUND', { filePath: node.path, evidence: 'relay tampered' });
        }
      });

      return matches.length > 0
        ? matches.map(node => ({ type: 'text', text: node.path }))
        : [{ type: 'text', text: `find: no matches for '${patternArg}'` }];
    }

    case 'cat': {
      if (args.length === 0) {
        return [{ type: 'error', text: 'cat: missing file operand' }];
      }

      const target = args[0];
      const resolved = vfs.resolvePath(cwd, target);

      try {
        const content = vfs.readFile(resolved, 'terminal');
        const lowerPath = resolved.toLowerCase();

        // T05 event correlation
        if (lowerPath.includes('field_report.txt') || lowerPath.includes('marker_data.txt') || lowerPath.includes('trail_reference.txt')) {
          eventBus.emit('TRAIL_RECORD_FOUND', { filePath: resolved, trailRecordFound: true });
          eventBus.emit('FILE_FOUND', { filePath: resolved, hidden: false });
        }

        // T07 event correlation
        if (lowerPath.includes('distress')) {
          eventBus.emit('DISTRESS_MESSAGE_FOUND', { filePath: resolved, evidence: 'relay tampered' });
        }

        // T09 event correlation
        if (lowerPath.includes('marker_sequence.txt') || lowerPath.includes('marker_data.txt')) {
          eventBus.emit('TRAIL_MARKER_SEQUENCE_FOUND', { filePath: resolved, sequence: 'STONE,LEAF,RIVER,LEAF' });
        }

        // T11 event correlation
        if (lowerPath.includes('last_coordinate.txt') || lowerPath.includes('navigation.cfg') || lowerPath.includes('route_notes.txt')) {
          eventBus.emit('POSITION_FOUND', { filePath: resolved, grid: '118/742', bearing: '041', sector: '07' });
        }

        const lines = content.split('\n');
        return lines.map(line => ({ type: 'text', text: line }));
      } catch (err) {
        return [{ type: 'error', text: `cat: ${target}: ${err.message}` }];
      }
    }

    case 'grep': {
      if (args.length === 0) {
        return [{ type: 'error', text: 'grep: missing search pattern' }];
      }

      const query = args[0].toLowerCase();
      const target = args[1] || cwd;
      const resolvedTarget = vfs.resolvePath(cwd, target);
      const matches = [];
      const visit = (path) => {
        const node = vfs.getNode(path);
        if (!node) return;
        if (node.type === 'file') {
          const content = node.content || '';
          content.split('\n').forEach((line, index) => {
            if (line.toLowerCase().includes(query)) {
              matches.push(`${node.path}:${index + 1}:${line}`);
            }
          });
          return;
        }
        try {
          vfs.listDir(path, true).forEach(child => visit(child.path));
        } catch (e) {}
      };

      visit(resolvedTarget);

      // Check T07 distress search
      const distressMatch = matches.find(text => text.toLowerCase().includes('distress') || text.toLowerCase().includes('relay tampered'));
      if (distressMatch || query.includes('distress') || query.includes('radio') || query.includes('tampered')) {
        eventBus.emit('DISTRESS_MESSAGE_FOUND', { filePath: '/Field/Logs/distress.log', evidence: 'relay tampered' });
      }

      return matches.length > 0
        ? matches.map(text => ({ type: 'text', text }))
        : [{ type: 'text', text: `grep: no matches for '${args[0]}'` }];
    }

    case 'head':
    case 'tail': {
      if (args.length === 0) return [{ type: 'error', text: `${cmd}: missing file operand` }];
      const resolved = vfs.resolvePath(cwd, args[0]);
      try {
        const lines = vfs.readFile(resolved, 'terminal').split('\n');
        const selected = cmd === 'head' ? lines.slice(0, 10) : lines.slice(-10);
        return selected.map(line => ({ type: 'text', text: line }));
      } catch (err) {
        return [{ type: 'error', text: `${cmd}: ${args[0]}: ${err.message}` }];
      }
    }

    case 'echo': {
      const redirIndex = args.indexOf('>');
      if (redirIndex !== -1 && redirIndex < args.length - 1) {
        const textToSave = args.slice(0, redirIndex).join(' ');
        const destFile = args[redirIndex + 1];
        const resolved = vfs.resolvePath(cwd, destFile);
        try {
          vfs.writeFile(resolved, textToSave, 'terminal');
          return null;
        } catch (err) {
          return [{ type: 'error', text: `echo: ${err.message}` }];
        }
      }

      return [{ type: 'text', text: args.join(' ') }];
    }

    case 'touch': {
      if (args.length === 0) {
        return [{ type: 'error', text: 'touch: missing file operand' }];
      }
      const target = args[0];
      const resolved = vfs.resolvePath(cwd, target);

      try {
        if (!vfs.exists(resolved)) {
          vfs.writeFile(resolved, '', 'terminal');
        }
        return null;
      } catch (err) {
        return [{ type: 'error', text: `touch: cannot touch '${target}': ${err.message}` }];
      }
    }

    case 'mkdir': {
      if (args.length === 0) {
        return [{ type: 'error', text: 'mkdir: missing operand' }];
      }
      const target = args[0];
      const resolved = vfs.resolvePath(cwd, target);

      try {
        vfs.makeDir(resolved, 'terminal');
        return null;
      } catch (err) {
        return [{ type: 'error', text: `mkdir: cannot create directory '${target}': ${err.message}` }];
      }
    }

    case 'rm': {
      if (args.length === 0) {
        return [{ type: 'error', text: 'rm: missing operand' }];
      }
      const target = args.filter(a => !a.startsWith('-'))[0];
      if (!target) {
        return [{ type: 'error', text: 'rm: missing file operand' }];
      }
      const resolved = vfs.resolvePath(cwd, target);

      try {
        vfs.deleteNode(resolved, 'terminal');
        return null;
      } catch (err) {
        return [{ type: 'error', text: `rm: cannot remove '${target}': ${err.message}` }];
      }
    }

    default: {
      return [{ type: 'error', text: `command not found: ${cmd}. Type 'help' for available commands.` }];
    }
  }
}
