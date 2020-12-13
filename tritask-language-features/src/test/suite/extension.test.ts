import * as assert from 'assert';
import { before, after } from 'mocha';

import * as vscode from 'vscode';

import * as path from 'path'

import { getSelfDirectory } from '../../extension';
import { addTask } from '../../extension';

class IDE {
	static openTesteeFile(){
		const TESTEE_FILENAME = 'test.trita'
		const TESTEE_DIRECTORY = path.resolve(getSelfDirectory(), 'src', 'test', 'suite')
		const TESTEE_FULLLPATH = path.resolve(TESTEE_DIRECTORY, TESTEE_FILENAME)
		return vscode.workspace.openTextDocument(TESTEE_FULLLPATH)
	}
}

// ここで採用している mocha + 非同期テストの書き方.
// - suite と test を使う.
//   - suite は describe, test は it の糖衣構文(たぶん)
//   - わかりやすいネーミングだと思うので採用
// - before や test の中では promise object を返す.
//   - これにより, (当該非同期処理が終わるまで)次の test に行くのを待たせることができる
//   - (mocha 側が await 的なのを頑張ってくれてる)
// - 必要なデータは TestData でやりとりする.
//   - 前の test で return した promise object を, 次の test は受け取れないため.
// - テストコードの終わりでは done() する
//   - これしないと Error: Timeout of 2000ms exceeded. になる
//   - mocha 曰く
//     - 非同期処理がいつ終わるかわからん
//     - デフォではタイムアウト 2000ms にしてます( Error: Timeout of 2000ms exceeded. を出します
//     - いつ終わるかわからんけど、いつか終わる ← これできないと困るでしょ？
//       - だったら done() を使ってね
//       - done は test(), もっというと it() に渡しますんで

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

	test('add task', () => {
		const promise = addTask()
		return promise.then(
			(isSuccess) => {
				const lineCount = TestData.document.lineCount
				assert.strictEqual(isSuccess, true)
				//assert.strictEqual(lineCount, 2)
			}
		)
	});

	test('test2', (done) => {
		assert.strictEqual(1, 100-98-1);
		console.log(TestData.document)
		done()
	});

});

