'use strict';

import { Position, Range, CancellationToken, DocumentLink, DocumentLinkProvider, TextDocument, Uri, ProviderResult, commands } from 'vscode';
import * as util from './util';

export class LinkProvider implements DocumentLinkProvider {
  public provideDocumentLinks (document: TextDocument, token: CancellationToken): ProviderResult<DocumentLink[]> {
    let documentLinks = [];
    let index = 0;
    while (index < document.lineCount) {
      let line = document.lineAt(index);
      let result = line.text.match(util.REG);

      if (result != null) {
        for (let item of result) {
          let controllerPath = undefined;
          let method = undefined;
          if (item.includes('Controller')) {
            if (item.includes('@')) {
              // laravel router eg: A\FooController@bar
              let splitted = item.replace(/\"|\'/g, '').split('@'); // 去除单双引号
              [controllerPath, method] = splitted
              if (splitted.length != 2 && splitted[0].includes('Controller')) {
                method = 'index';
              }
            } else if (item.includes('::')) {
              // comiru router eg: A\\FooController::bar
              let splitted = item.replace(/\"|\'/g, '').replace(/\\\\/g, '/').split('::'); // 去除单双引号, 替换\\
              [controllerPath, method] = splitted
            } else if (line.text.includes('resource(')) {
              // laravel eg: resource('foo', 'fooController');
              controllerPath = item.replace(/\"|\'/g, '');
              method = 'index';
            }
          }

          if (!controllerPath || !method) {
            continue;
          }

          let filePath = util.getFilePath(controllerPath, document);

          if (filePath != null) {
            let start = new Position(line.lineNumber, line.text.indexOf(item) + 1);
            let end = start.translate(0, item.length - 2);
            let documentLink = new util.ControllerLink(new Range(start, end), filePath, controllerPath, method);
            documentLinks.push(documentLink);
          }
        }
      }
      
      // laravel ClassName::class
      if (line.text.includes('::class')) {
        let controllerName = line.text.substring(0, line.text.lastIndexOf('::class'));
        controllerName = controllerName.substring(controllerName.lastIndexOf(',') + 1).trim();
        let filePath = util.getFilePath(controllerName, document);

        if (filePath != null) {
          let start = new Position(line.lineNumber, line.text.lastIndexOf('::class') - controllerName.length);
          let end = start.translate(0, controllerName.length + 7);
          let documentLink = new util.ControllerLink(new Range(start, end), filePath, controllerName, 'index');
          documentLinks.push(documentLink);
        }
      }
      index++;
    }
    return documentLinks;
  }

  public resolveDocumentLink (link: util.ControllerLink, token: CancellationToken): ProviderResult<DocumentLink> {
    let lineNum = util.getLineNumber(link.funcName, link.filePath);
    let path = link.filePath;
    if (lineNum != -1)
      path += "#" + lineNum;

    link.target = Uri.parse("file:" + path);
    return link;
  }
}
