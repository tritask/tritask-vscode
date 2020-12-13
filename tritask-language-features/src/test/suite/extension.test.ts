import * as assert from 'assert';
import { before, after, beforeEach, afterEach } from 'mocha';

import * as vscode from 'vscode';

import * as path from 'path'

import { getSelfDirectory } from '../../extension';

class IDE {
	static openTesteeFile(){
		const TESTEE_FILENAME = 'test.trita'
		const TESTEE_DIRECTORY = path.resolve(getSelfDirectory(), 'src', 'test', 'suite')
		const TESTEE_FULLLPATH = path.resolve(TESTEE_DIRECTORY, TESTEE_FILENAME)
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
		const promise = IDE.openTesteeFile()
		return promise.then(
			(doc: vscode.TextDocument) => {
				console.log(doc)
			},
			(err) => {
				console.log(err)
				assert.fail('テスト用ファイルをopenできませんでした.')
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

