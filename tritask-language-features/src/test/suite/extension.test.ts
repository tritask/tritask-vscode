import * as assert from 'assert';
import { before, beforeEach } from 'mocha';

import * as vscode from 'vscode';

import * as path from 'path'

import { getSelfDirectory, getEditor } from '../../extension';
import { addTask, addInbox, startTask } from '../../extension';
import { LineTester } from '../../extension';

// ここで採用している mocha + 非同期テストの書き方.
// - suite と test を使う.
//   - suite は describe, test は it の糖衣構文(たぶん)
//   - わかりやすいネーミングだと思うので採用
// - before や test の中では promise object を返す.
//   - これにより, (当該非同期処理が終わるまで)次の test に行くのを待たせることができる
//   - (mocha 側が await 的なのを頑張ってくれてる)
// - テストコードの終わりでは done() する
//   - これしないと Error: Timeout of 2000ms exceeded. になる
//   - mocha 曰く
//     - 非同期処理がいつ終わるかわからん
//     - デフォではタイムアウト 2000ms にしてます( Error: Timeout of 2000ms exceeded. を出します
//     - いつ終わるかわからんけど、いつか終わる ← これできないと困るでしょ？
//       - だったら done() を使ってね
//       - done は test(), もっというと it() に渡しますんで

class IDE {
	static openTesteeFile(){
		const TESTEE_FILENAME = 'test.trita'
		const TESTEE_DIRECTORY = path.resolve(getSelfDirectory(), 'src', 'test', 'suite')
		const TESTEE_FULLLPATH = path.resolve(TESTEE_DIRECTORY, TESTEE_FILENAME)
		return vscode.workspace.openTextDocument(TESTEE_FULLLPATH)
	}

	static lineTextAt(lineNumber: number){
		const editor = getEditor();
		const doc = editor.document
		const line = doc.lineAt(lineNumber)
		return line.text
	}
}

function assertTrue(b: boolean){
	return assert.strictEqual(b, true)
}

function assertInbox(line: string){
	assertTrue(LineTester.isInbox(line))
}

function assertAdded(line: string){
	const isToday = !(LineTester.isNotToday(line))
	assertTrue(isToday)
}

suite('Test tritask operations on the VSCode Editor layer.', () => {
	before(() => {
		const promise = IDE.openTesteeFile()
		return promise.then(
			() => {
				// doc: vscode.TextDocument が渡ってきますが, 特にすることないです
			},
			(err) => {
				console.log(err)
				assert.fail('テスト用ファイルをopenできませんでした.')
			}
		)
	});

	beforeEach(() => {
		const editor = getEditor();
		const doc = editor.document
		const lineCount = doc.lineCount
		const overEof = lineCount + 1

		const fofPos = new vscode.Position(0, 0)
		const eofPos = new vscode.Position(overEof, 0)
		const allRange = new vscode.Range(fofPos, eofPos);

		const clear = function(editBuilder: vscode.TextEditorEdit): void{
			const empty = ""
			editBuilder.replace(allRange, empty);
		}
		return editor.edit(clear)
	});

	test('add task and inbox', async () => {
		let isSuccess = false
		isSuccess = await addTask()
		isSuccess = isSuccess && await addInbox()
		isSuccess = isSuccess && await addInbox()
		isSuccess = isSuccess && await addTask()
		isSuccess = isSuccess && await addTask()

		const editor = getEditor()
		const lineCount = editor.document.lineCount
		const LINECOUNT_OF_EMPTYFILE = 1

		assertTrue(isSuccess)
		assert.strictEqual(lineCount, 5 + LINECOUNT_OF_EMPTYFILE)

		// a一つ上の行に add されていくので逆順に検査
		const L = IDE.lineTextAt
		assertAdded(L(0))
		assertAdded(L(1))
		assertInbox(L(2))
		assertInbox(L(3))
		assertAdded(L(4))
	});

	test('start, end and copy task', async () => {
		let isSuccess = false

		isSuccess = await addTask()
		assertTrue(isSuccess)

		isSuccess = await startTask()
		assertTrue(isSuccess)

		const editor = getEditor()
		const doc = editor.document
		const lineCount = doc.lineCount
		const text = doc.lineAt(0).text
		const isTodayLine = !(LineTester.isNotToday(text))
		const alreadyStarted = !(LineTester.isNotStarted(text))

		assert.strictEqual(lineCount, 2)
		assertTrue(isTodayLine)
		assertTrue(alreadyStarted)
		assertTrue(LineTester.isNotEnded(text))
	});

	test('peek current document', async (done) => {
		const editor = getEditor()
		console.log(editor.document)
		done()
	});

});

