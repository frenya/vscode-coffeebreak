import { CompletionItemProvider, TextDocument, Position, CancellationToken, CompletionItem, CompletionContext, ProviderResult, CompletionList, workspace, CompletionItemKind } from "vscode";
import Config from '../config';
import Document from "../document";

export class MentionsCompletionItemProvider implements CompletionItemProvider {
  public provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, context: CompletionContext): ProviderResult<CompletionItem[] | CompletionList> {
    const items: CompletionItem[] = [];

    // Check eligibility
    if (!Document.isSupported(document)) return items;

    const configuration = Config(document.uri).get<object>('mentions');

    if (!configuration) {
      return;
    }

    for (let tag of Object.keys(configuration)) {
      if (tag !== '<unassigned>') {
        items.push(new CompletionItem(tag, CompletionItemKind.Keyword));
      }
    }

    return items;
  }
}
