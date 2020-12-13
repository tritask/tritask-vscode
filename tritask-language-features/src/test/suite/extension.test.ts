import * as assert from 'assert';
import { before, after, beforeEach, afterEach } from 'mocha';

import * as vscode from 'vscode';

// import * as myExtension from '../extension';

class IDE {
	static showInfo(msg: string){
		vscode.window.showInformationMessage(msg);
	}

	static openFile(){
	}
}

suite('describe1', () => {
	before(() => {
		IDE.showInfo('Run all tests.')
		console.log('before')
	});

	after(() => {
		console.log('after')
	});

	beforeEach(() => {
		console.log('before')
	});

	afterEach(() => {
		console.log('after')
	});

	test('test1', () => {
		assert.strictEqual(1, 100-98-1);
	});

	test('test2', () => {
		assert.strictEqual(2, 100-98);
	});

});

