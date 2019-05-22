import { CompletionItemProvider, TextDocument, Position, CancellationToken, CompletionItem, CompletionContext, ProviderResult, CompletionList, workspace, CompletionItemKind } from "vscode";

export class HashTagsCompletionItemProvider implements CompletionItemProvider {
	public provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, context: CompletionContext): ProviderResult<CompletionItem[] | CompletionList> {
		const configuration = workspace.getConfiguration().get<string[]>('coffeebreak.mentions');

		if (!configuration) {
			return;
		}

		const items: CompletionItem[] = [];

		for (let tag of configuration) {
			items.push(new CompletionItem(tag, CompletionItemKind.Keyword));
		}

		return items;
	}
}
