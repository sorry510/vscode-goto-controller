'use strict';

import { languages, ExtensionContext } from 'vscode';
import { LinkProvider } from './link';

export function activate(context: ExtensionContext) {
    const link = languages.registerDocumentLinkProvider({scheme: 'file', language: 'php'}, new LinkProvider());

    context.subscriptions.push(link);
}

export function deactivate() {
    //
}
