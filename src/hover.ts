'use strict';

import { Position, Hover, HoverProvider as vsHoverProvider, TextDocument, ProviderResult, MarkdownString, Uri } from 'vscode';
import * as util from './util';

export class HoverProvider implements vsHoverProvider {
    provideHover(document: TextDocument, position: Position): ProviderResult<Hover> {
        let linkRange = document.getWordRangeAtPosition(position, util.REG);
        if (linkRange) {
            let controllerPath = undefined;
            let text = document.getText(linkRange)
            if (text.includes('Controller')) {
                if (text.includes('@')) {
                    // laravel router eg: A\FooController@bar
                    [controllerPath] = text.replace(/\"|\'/g, '').split('@'); // 去除单双引号
                } else if (text.includes('::')) {
                    // comiru router eg: A\\FooController::bar
                    [controllerPath] = text.replace(/\"|\'/g, '').replace(/\\\\/g, '/').split('::'); // 去除单双引号, 替换\\
                } else  {
                    // laravel eg: resource('foo', 'fooController');
                    controllerPath = text;
                }
            }
            if (!controllerPath) {
                return;
            }
            let filePath = util.getFilePath(controllerPath, document);
            if (filePath != null) {
                const textLink = Uri.file(filePath).toString();
                return new Hover(new MarkdownString(`[comiru goto: ${text}](${textLink})`));
                // let workspaceFolder = workspace.getWorkspaceFolder(document.uri);
                // return new Hover(workspaceFolder.name + filePath.replace(workspaceFolder.uri.fsPath, ''));
            }
        }
        return;
    }
}