import * as assert from 'assert';
import { before, after, beforeEach, afterEach } from 'mocha';

import * as vscode from 'vscode';

// import * as myExtension from '../extension';

suite('describe1', () => {
	before(() => {
		vscode.window.showInformationMessage('Start all tests.');
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

suite('describe2', () => {
	test('test3', () => {
		assert.strictEqual(1, 100-98-1);
	});
});
