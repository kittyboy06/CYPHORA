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

  // Emit event for future Task & Validation engine
  eventBus.emit('COMMAND_EXECUTED', {
    command: cmd,
    args,
    raw: trimmed,
    cwd
  });

  switch (cmd) {
    case 'help': {
      return [
        { type: 'info', text: 'CYPHORA OS Navigator v1.0.4 - Command Shell' },
        { type: 'info', text: '================================================' },
        { type: 'text', text: 'ls [-a] [-l] [path]  : List directory contents' },
        { type: 'text', text: 'cd [path]            : Change current working directory' },
        { type: 'text', text: 'pwd                  : Print working directory' },
        { type: 'text', text: 'cat <file>           : Display file content' },
        { type: 'text', text: 'echo [text]          : Print text to standard output' },
        { type: 'text', text: 'touch <file>         : Create an empty file' },
        { type: 'text', text: 'mkdir <dir>          : Create a new directory' },
        { type: 'text', text: 'rm <path>            : Remove file or directory' },
        { type: 'text', text: 'clear                : Clear the terminal screen' },
        { type: 'text', text: 'whoami               : Display current logged-in identity' },
        { type: 'text', text: 'date                 : Show system date and time' },
        { type: 'text', text: 'history              : View executed command history' },
        { type: 'text', text: 'exit                 : Close the terminal session' },
        { type: 'info', text: '================================================' }
      ];
    }

    case 'pwd': {
      return [{ type: 'text', text: cwd }];
    }

    case 'clear': {
      clearTerminal();
      return null;
    }

    case 'whoami': {
      return [{ type: 'text', text: `${teamName || 'navigator'}@cyphora-workstation` }];
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
      const target = args[0] || '~';
      const resolved = vfs.resolvePath(cwd, target);
      const node = vfs.getNode(resolved);

      if (!node) {
        return [{ type: 'error', text: `cd: no such file or directory: ${target}` }];
      }
      if (node.type !== 'dir') {
        return [{ type: 'error', text: `cd: not a directory: ${target}` }];
      }

      setCwd(resolved);
      eventBus.emit('DIR_CHANGED', { from: cwd, to: resolved, appId: 'terminal' });
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

    case 'cat': {
      if (args.length === 0) {
        return [{ type: 'error', text: 'cat: missing file operand' }];
      }

      const target = args[0];
      const resolved = vfs.resolvePath(cwd, target);

      try {
        const content = vfs.readFile(resolved, 'terminal');
        const lines = content.split('\n');
        return lines.map(line => ({ type: 'text', text: line }));
      } catch (err) {
        return [{ type: 'error', text: `cat: ${target}: ${err.message}` }];
      }
    }

    case 'echo': {
      // Check for simple redirection: echo "hello" > file.txt
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
