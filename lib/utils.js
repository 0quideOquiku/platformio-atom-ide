'use babel';

/**
 * Copyright (C) 2016 Ivan Kravets. All rights reserved.
 *
 * This source file is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License version 2
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import tar from 'tar';
import zlib from 'zlib';
import {BASE_DIR, WIN32} from './config';

export function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

let _pythonExecutableCached = null;
// Get the system executable
export function getPythonExecutable() {
  if (!_pythonExecutableCached) {
    let executables;
    if (WIN32) {
      executables = ['python.exe', 'C:\\Python27\\python.exe'];
    } else {
      executables = ['python2.7', 'python'];
    }

    const args = ['-c', 'import sys; print \'.\'.join(str(v) for v in sys.version_info[:2])'];
    for (let i = 0; i < executables.length; i++) {
      const result = child_process.spawnSync(executables[i], args);
      if (0 === result.status && ('' + result.output).indexOf('2.7') > -1) {
        _pythonExecutableCached = executables[i];
      }
    }

    if (!_pythonExecutableCached) {
      // Fallback to `python`. User will see an error message if Python is not
      // installed.
      // Not caching, so restart will not be necessary in case user installs
      // Python right after an error message is seen.
      return 'python';
    }
  }
  return _pythonExecutableCached;
}

export function useBuiltinPlatformIO() {
  return atom.config.get('platformio-ide.useBuiltinPlatformIO');
}

export function getIDEVersion() {
  return require(path.join(BASE_DIR, 'package.json')).version;
}

// Recursively find directory with given name
export function findFileByName(desiredFileName, where) {
  var queue = [where];
  var content, item, fullPath, stat;
  while (queue) {
    item = queue.splice(0, 1)[0];  // take the first element from the queue
    content = fs.readdirSync(item);
    for (var i = 0; i < content.length; i++) {
      fullPath = path.join(item, content[i]);
      stat = fs.statSyncNoException(fullPath);
      if (!stat) {
        continue;
      }

      if (stat.isFile() && content[i] === desiredFileName) {
        return fullPath;
      } else if (stat.isDirectory()) {
        queue.push(fullPath);
      }
    }
  }
  return -1;
}

export function runAtomCommand(commandName) {
  return atom.commands.dispatch(
    atom.views.getView(atom.workspace), commandName);
}

export function removeChildrenOf(node) {
  if (!node) return;
  while(node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

export function getActiveProjectPath() {
  const paths = atom.project.getPaths();
  if (0 === paths.length) {
    return false;
  }

  const editor = atom.workspace.getActiveTextEditor();
  if (!editor || 1 === paths.length) {
    return paths[0];
  }

  const filePath = editor.getPath();
  if (!filePath) {
    return false;
  }

  for (let path of paths) {
    if (filePath.indexOf(path) === 0) {
      return path;
    }
  }

  return false;
}

export function getAvailableBoards() {
  return new Promise((resolve, reject) => {
    const args = ['-f', '-c', 'atom', 'boards', '--json-output'];
    let stdout = '';
    let stderr = '';
    const child = child_process.spawn('platformio', args);
    child.stdout.on('data', chunk => stdout += chunk);
    child.stderr.on('data', chunk => stderr += chunk);
    child.on('close', (code) => {
      if (0 !== code) {
        let title = 'PlaftormIO: Failed to get boards list!';
        atom.notifications.addError(title, {detail: stderr, dismissable: true});
        console.error(title);
        console.error(stderr);
        reject();
      } else {
        resolve(JSON.parse(stdout));
      }
    });
  });
}

export function deleteFolderRecursive(path) {
  if (!fs.statSyncNoException(path)) {
    return;
  }
  var items = fs.readdirSync(path);
  for (var i = 0; i < items.length; i++) {
    const curPath = path.join(path, items[i]);
    if (fs.lstatSync(curPath).isDirectory()) {
      deleteFolderRecursive(curPath);
    } else {
      fs.unlinkSync(curPath);
    }
  }
  fs.rmdirSync(path);
}

export function extractTargz(source, destination) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(source)
      .pipe(zlib.createGunzip())
      .on('error', onError)
      .pipe(tar.Extract({ path: destination}))
      .on('error', onError)
      .on("end", () => resolve());

    function onError(err) {
      reject(err);
    }
  });
}

/*
 * Locate a package in atom package directories.
 *
 * atom.packages.resolvePackagePath() works incorrectly when provided name is
 * an existing directory. When there is package named pkg atom.packages.resolvePackagePath('pkg')
 * and there is a directory named 'pkg' in current working directory, returned value
 * will be 'pkg', which is basically a releative path to the 'pkg' directory form CWD.
 */
export function resolveAtomPackagePath(name) {
  for (let dir of atom.packages.getPackageDirPaths()) {
    const fullPath = path.join(dir, name);
    if (fs.statSyncNoException(fullPath)) {
      return fullPath;
    }
  }
}
