import vscode from 'vscode'
import Example from './Example'

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration('vscode-extension')
  if (config.enabledLanguages.length === 0) {
    return
  }

  const provider = new Example(config.minLength)
  if (config.includeAutomatically) {
    provider.enable()
  }

  const commandDisposable = vscode.commands.registerCommand(
    'vscode-extension.triggerSuggest',
    async () => {
      provider.enable()
      await vscode.commands.executeCommand('editor.action.triggerSuggest')
      if (!config.includeAutomatically) {
        provider.disable()
      }
    },
  )

  const providerDisposable = vscode.languages.registerCompletionItemProvider(
    config.enabledLanguages,
    provider,
  )

  context.subscriptions.push(commandDisposable, providerDisposable)
}

export function deactivate() {}
