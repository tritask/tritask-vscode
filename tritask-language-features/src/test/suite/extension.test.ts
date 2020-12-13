import * as assert from 'assert';
import { before, after, beforeEach, afterEach } from 'mocha';

import * as vscode from 'vscode';

import * as path from 'path'

class Path {
	static get _entrypoint(){
		// __dirname には現在実行中のソースコードが格納されているディレクトリ.
		// node.js の動作.
		// src/test/suite/test.ts の場合, out/test/suite になる
		return path.resolve(__dirname)
	}

	static get root(){
		const defaultRoot = this._entrypoint
		return path.resolve(defaultRoot, '..', '..', '..', 'src', 'test', 'suite')
	}
}

class IDE {
	static openTesteeFile(){
		const TESTEE_FILENAME = 'test.trita'
		const TESTEE_FULLLPATH = path.resolve(Path.root, TESTEE_FILENAME)
		return vscode.workspace.openTextDocument(TESTEE_FULLLPATH)
	}

	static getEditor(){
		const editor = vscode.window.activeTextEditor;
		if(editor == null){
			throw new Error("activeTextEditor is null currently.");
		}
		return editor;
	}
}

suite('describe1', () => {
	before(() => {
		console.log(Path.root)
		const promise = IDE.openTesteeFile()
		promise.then(
			(doc: vscode.TextDocument) => {
				console.log(doc)
			}
		)
	});

	after(() => {
	});

	beforeEach(() => {
	});

	afterEach(() => {
	});

	test('test1', () => {
		assert.strictEqual(1, 100-98-1);
	});

});

