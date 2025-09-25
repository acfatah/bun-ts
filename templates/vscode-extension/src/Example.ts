import type {
  Position,
  TextDocument,
} from 'vscode'

export default class Example {
  private minLength: number
  private enabled: boolean

  constructor(minLength: number) {
    this.minLength = minLength
    this.enabled = false
  }

  enable() {
    this.enabled = true
  }

  disable() {
    this.enabled = false
  }

  provideCompletionItems(
    _document: TextDocument,
    _position: Position,
  ) {
    // ...example

    return undefined
  }
}
