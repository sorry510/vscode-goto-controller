'use strict';

import { languages, ExtensionContext } from 'vscode';
import { LinkProvider } from './link';
import { HoverProvider } from './hover';

export function activate(context: ExtensionContext) {
    const hover = languages.registerHoverProvider({scheme: 'file', language: 'php'}, new HoverProvider());
    const link = languages.registerDocumentLinkProvider({scheme: 'file', language: 'php'}, new LinkProvider());

    context.subscriptions.push(hover, link);
}

export function deactivate() {
    //
}
