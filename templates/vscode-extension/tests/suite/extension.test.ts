import assert from 'node:assert'

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import vscode from 'vscode'
// import myExtension from '../../src'

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.')

  it('sample test', () => {
    assert.strictEqual(-1, [1, 2, 3].indexOf(5))
    assert.strictEqual(-1, [1, 2, 3].indexOf(0))
  })
})
