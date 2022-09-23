'use strict';

import { workspace, languages, Hover, ExtensionContext } from 'vscode';
import { LinkProvider } from './link';
import * as util from './util';

const REG = /(['"])[^'"]*\1/;

export function activate(context: ExtensionContext) {
    let hover = languages.registerHoverProvider({scheme: 'file', language: 'php'}, {
        provideHover(document, position, token) {
            let linkRange = document.getWordRangeAtPosition(position, REG);
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
                    let workspaceFolder = workspace.getWorkspaceFolder(document.uri);
                    return new Hover(workspaceFolder.name + filePath.replace(workspaceFolder.uri.fsPath, ''));
                }
            }
            return;
        }
    });
    let link = languages.registerDocumentLinkProvider({scheme: 'file', language: 'php'}, new LinkProvider());
    context.subscriptions.push(hover);
    context.subscriptions.push(link);
}

export function deactivate() {
    //
}
