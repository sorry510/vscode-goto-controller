'use strict';

import { workspace, TextDocument, DocumentLink, Range, Uri } from 'vscode';
import * as fs from 'fs';
import * as readLine from 'n-readlines';

const configurationNamespace = 'comiru_goto_controller';
export class ControllerLink extends DocumentLink {
  filePath: string;
  funcName: string;
  controllerName: string;
  constructor(range: Range, path: string, controllerName: string, funcName: string) {
    super(range, null);
    this.filePath = path.replace(/\\/g, '/');
    this.controllerName = controllerName;
    this.funcName = funcName;
  }
}

/**
 * Finds the controller's filepath
 * @param text example A/FooController
 * @param document
 */
export function getFilePath(text: string, document: TextDocument) {
  let strPathCtrl = workspace.getConfiguration(configurationNamespace).pathControllers || '/app/Http/Controllers,/app/Admin/Controllers,/src/App/Controller'; // default settings or user settings
  for (let pathCtrl of strPathCtrl.split(',')) {
    let filePath = workspace.getWorkspaceFolder(document.uri).uri.fsPath + pathCtrl.trim();
    if (!fs.existsSync(filePath)) {
      continue;
    }
    let controllerFileName = text.replace(/\./g, '/').replace(/\"|\'/g, '') + '.php';

    if (controllerFileName.includes('\\')) {
      controllerFileName = controllerFileName.replace(/\\/g, '\/');
    }

    let targetPath = filePath + '/' + controllerFileName;

    if (fs.existsSync(targetPath)) {
      return targetPath;
    }
    let dirItems = fs.readdirSync(filePath);
    for (let item of dirItems) {
      targetPath = filePath + '/' + item + '/' + controllerFileName;
      if (fs.existsSync(targetPath)) {
        return targetPath;
      }
    }
  }
  return null;
}

/**
 * @param text example bar
 * @param path
 */
export function getLineNumber(text: string, path: string) {
    let file = new readLine(path);
    let lineNum = 0;
    let line: string;
    while (line = file.next()) {
        lineNum++;
        line = line.toString();
        if (line.toLowerCase().includes('function ' + text.toLowerCase() + '(') ||
          line.toLowerCase().includes('function ' + text.toLowerCase() + ' (')
        ) {
            return lineNum;
        }
    }
    return -1;
}

export const REG = /(['"])[^'"]*\1/g;
