import { CompletionItemProvider, TextDocument, Position, CancellationToken, CompletionItem, CompletionContext, ProviderResult, CompletionList, workspace, CompletionItemKind } from "vscode";

export class HashTagsCompletionItemProvider implements CompletionItemProvider {
  public provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, context: CompletionContext): ProviderResult<CompletionItem[] | CompletionList> {
    const configuration = workspace.getConfiguration('coffeebreak', document.uri).get<object>('mentions');

    if (!configuration) {
      return;
    }

    const items: CompletionItem[] = [];

    for (let tag of Object.keys(configuration)) {
      items.push(new CompletionItem(tag, CompletionItemKind.Keyword));
    }

    return items;
  }
}
