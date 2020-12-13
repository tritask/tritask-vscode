import * as assert from 'assert';
import { before, after } from 'mocha';

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

// ここで採用している mocha + 非同期テストの書き方.
// - suite と test を使う.
//   - suite は describe, test は it の糖衣構文(たぶん)
//   - わかりやすいネーミングだと思うので採用
// - before や test の中では promise object を返す.
//   - これにより, (当該の処理が終わるまで)次の test に行くのを待たせることができる
//   - (mocha 側が await 的なのを頑張ってくれてる)
// - 必要なデータは TestData でやりとりする.
//   - 前の test で return した promise object を, 次の test は受け取れないため.
// - テストコードの(非同期処理の)終わりでは done() する
//   - これしないと Error: Timeout of 2000ms exceeded. になる
//   - done とは test(), もっというと it() に渡されてくる「非同期処理終わったならこれ呼んでね」関数

class TestData {
	static document: vscode.TextDocument;
}

suite('describe1', () => {
	before(() => {
		const promise = IDE.openTesteeFile()
		return promise.then(
			(doc: vscode.TextDocument) => {
				TestData.document = doc
			},
			(err) => {
				console.log(err)
				assert.fail('テスト用ファイルをopenできませんでした.')
			}
		)
	});

	after(() => {
	});

	test('test1', () => {
		assert.strictEqual(1, 100-98-1);
		console.log(TestData.document)
	});

	test('test2', (done) => {
		assert.strictEqual(1, 100-98-1);
		console.log(TestData.document.fileName)
		done()
	});

});

