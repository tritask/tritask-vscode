import * as vscode from 'vscode';

var moment = require('moment');
const exec = require('child_process').exec;
moment.locale("ja");

const SELF_EXTENSION_ID = "stakiran.tritask-language-features";
const HELPER_FILENAME = "helper.py";

function abort(message: string){
	console.log(message);
	// Object is possibly 'undefined' を防げないので呼び出し元で.
	//throw new Error(`Error: ${message}`);
}

function getSelfDirectory(){
	let selfExtension = vscode.extensions.getExtension(SELF_EXTENSION_ID);
	if(selfExtension === undefined){
		abort("No extension found in getSelfDirectory()");
		throw new Error();
	}
	let selfDir = selfExtension.extensionPath;
	return selfDir;
}

function getHelperFullpath(){
	let selfDir = getSelfDirectory();
	return `${selfDir}/${HELPER_FILENAME}`;
}

function getFullpathOfActiveTextEditor(){
	let editor = getEditor();
	let fullpath = editor.document.uri.fsPath;
	return fullpath;
}

function input(message: string): Thenable<string|undefined>{
	let options = {
		placeHolder: message
	};
	return vscode.window.showInputBox(options);
}

function getEditor(){
	let editor = vscode.window.activeTextEditor;
	if(editor == null){
		abort("activeTextEditor is null currently.")
		throw new Error();
	}
	return editor;
}

function isSelected(){
	let curSel = CursorPositioner.currentSelection();
	if(curSel.start.line != curSel.end.line){
		return true;
	}
	if(curSel.start.character != curSel.end.character){
		return true;
	}
	return false;
}

function getHelperCommandline(){
	let helperFullpath = getHelperFullpath();
	let tritaFullpath = getFullpathOfActiveTextEditor();
	let commandLine = `python ${helperFullpath} -i ${tritaFullpath}`;
	return commandLine;
}

function getHelperYargs(){
	let curSel = CursorPositioner.currentSelection();
	let curSelStartLine = curSel.start.line;
	let curSelEndLine = curSel.end.line;

	let yargs = "";
	if(curSelStartLine == curSelEndLine){
		let curLineNumber = curSelStartLine;
		yargs = `-y ${curLineNumber}`;
	}else{
		yargs = `-y ${curSelStartLine} --y2 ${curSelEndLine}`;
	}

	return yargs;
}
class DateTime {
	private _momentinst: any
	private _format: string

	public constructor(){
		this._momentinst = moment();
		this._format = 'YYYY/MM/DD';
	}

	public toString(){
		return this._momentinst.format(this._format);
	}
}

class DateTimeUtil {
	static todayString(): string {
		var dtobj = new DateTime();
		return dtobj.toString();
	}

	static nowtimeString(): string {
		return moment().format("HH:mm");
	}

}

class CursorPositioner {
	static current(): vscode.Position {
		let editor = getEditor();
		let curPos = editor.selection.active;
		return curPos;
	}

	static currentSelection(): vscode.Selection {
		let editor = getEditor();
		return editor.selection;
	}

	static linetop(): vscode.Position {
		let editor = getEditor();
		let curPos = editor.selection.active;

		var newY = curPos.line;
		var newX = 0;

		return curPos.with(newY, newX);
	}

	static startOfTimeFields(): vscode.Position {
		let editor = getEditor();
		let curPos = editor.selection.active;

		var newY = curPos.line;
		var newX = POS_STARTTIME;

		return curPos.with(newY, newX);
	}

	static startOfStartTime(): vscode.Position {
		return CursorPositioner.startOfTimeFields();
	}

	static endOfTimeFields(): vscode.Position {
		let editor = getEditor();
		let curPos = editor.selection.active;

		var newY = curPos.line;
		var newX = POS_STARTTIME + LEN_TIME + LEN_DELIM + LEN_TIME;

		return curPos.with(newY, newX);
	}

	static endOfStartTime(): vscode.Position {
		let editor = getEditor();
		let curPos = editor.selection.active;

		var newY = curPos.line;
		var newX = POS_STARTTIME + LEN_TIME;

		return curPos.with(newY, newX);
	}

	static endOfEndTime(): vscode.Position {
		let editor = getEditor();
		let curPos = editor.selection.active;

		var newY = curPos.line;
		var newX = POS_ENDTIME + LEN_TIME;

		return curPos.with(newY, newX);
	}

	static rangeBetweenStartTime(): vscode.Range {
		let editor = getEditor();
		let curPos = editor.selection.active;

		let startpos = curPos.with(curPos.line, POS_STARTTIME)
		let endpos = curPos.with(curPos.line, POS_STARTTIME + LEN_TIME)
		let range = new vscode.Range(startpos, endpos);
		return range;
	}

	static rangeBetweenEndTime(): vscode.Range {
		let editor = getEditor();
		let curPos = editor.selection.active;

		let startpos = curPos.with(curPos.line, POS_ENDTIME)
		let endpos = curPos.with(curPos.line, POS_ENDTIME + LEN_TIME)
		let range = new vscode.Range(startpos, endpos);
		return range;
	}

}

class CursorMover {
	static golinetop() {
		vscode.commands.executeCommand("cursorLineStart");
		return this;
	}

	static golineend() {
		vscode.commands.executeCommand("cursorLineEnd");
		return this;
	}

	static left() {
		vscode.commands.executeCommand("cursorLeft");
		return this;
	}

	static up() {
		vscode.commands.executeCommand("cursorUp");
		return this;
	}

	static endofstarttime() {
		let pos = CursorPositioner.endOfStartTime();
		let sel = new vscode.Selection(pos, pos);

		let editor = getEditor();
		editor.selection = sel;
		return this;
	}

	static endofendtime() {
		let pos = CursorPositioner.endOfEndTime();
		let sel = new vscode.Selection(pos, pos);

		let editor = getEditor();
		editor.selection = sel;
		return this;
	}

}

const LEN_DELIM = " ".length;
const LEN_SORTMARK = "1".length;
const LEN_DATE = "YYYY/MM/DD".length;
const LEN_DOW = "Sun".length;
const LEN_TIME = "HH:MM".length;
const LEN_FULLDATE = LEN_DATE + 1 + LEN_DOW;
const LEN_BEFORE_DESCRIPTION = LEN_SORTMARK + LEN_DELIM + LEN_FULLDATE + LEN_DELIM + (LEN_TIME+1)*2;
const EMPTYSORTMARK = " ".repeat(LEN_SORTMARK);
const EMPTYDOW = " ".repeat(LEN_DOW);
const EMPTYTIME = " ".repeat(LEN_TIME);
const EMPTYFULLDATE = " ".repeat(LEN_FULLDATE);

// 012345678901234567890123456789
//                              INBOX
// M 2017/07/11 Thu  9:52 10:33 YESTERDAY
// M 2017/07/12 Wed             TODAY 未着手
// M 2017/07/12 Wed  9:52       TODAY 作業中
// M 2017/07/12 Wed  9:52 10:33 TODAY 終了
// M 2017/07/13 Thu             TOMORROW
const POS_STARTTIME = 17;
const POS_ENDTIME = 23;

function showMenu(){
	vscode.commands.executeCommand("editor.action.showContextMenu");
}

function addTask(){
	let editor = getEditor();
	var todayString = DateTimeUtil.todayString();
	var inserteeString = `${EMPTYSORTMARK} ${todayString} ${EMPTYDOW} ${EMPTYTIME} ${EMPTYTIME} \n`;
	var inserteePos = CursorPositioner.linetop();
	let f = function(editBuilder: vscode.TextEditorEdit): void{
		editBuilder.insert(inserteePos, inserteeString);
	}
	editor.edit(f);

	CursorMover.golinetop().left();
}

function addInbox(){
	let editor = getEditor();
	var inserteeString = `${EMPTYSORTMARK} ${EMPTYFULLDATE} ${EMPTYTIME} ${EMPTYTIME} \n`;
	var inserteePos = CursorPositioner.linetop();
	let f = function(editBuilder: vscode.TextEditorEdit): void{
		editBuilder.insert(inserteePos, inserteeString);
	}
	editor.edit(f);

	CursorMover.golinetop().left();
}

function copyTask(cursorMoverAfterCopy: any){
	let editor = getEditor();
	let doc = editor.document;
	let currentLine = doc.lineAt(CursorPositioner.current()).text;
	var inserteeString = `${currentLine}\n`;
	var inserteePos = CursorPositioner.linetop();

	// 挿入後は現在行位置に「挿入した行」が来るため
	// 「挿入前における現在行位置」をそのまま使うだけで
	// 挿入した行に対する操作を行える.
	//
	//               line[x-1]
	// aaaaaaaIaa    line[x]
	//               line[x+1]
	// 
	//               line[x-1]
	// aaaaaaaIaa    line[x]    <== 挿入された行. x行目で変わらずアクセスできる.
	// aaaaaaaIaa    line[x+1]
	let startpos = CursorPositioner.startOfTimeFields();
	let endpos = CursorPositioner.endOfTimeFields();
	let replaceeRange = new vscode.Range(startpos, endpos);
	let afterString = `${EMPTYTIME} ${EMPTYTIME}`;

	// insert: 現在行を複製する.
	// replace: 複製した行の開始/終了時刻をクリアする(複製後は todo task として扱いたいはず).
	let f = function(editBuilder: vscode.TextEditorEdit): void{
		editBuilder.insert(inserteePos, inserteeString);
		editBuilder.replace(replaceeRange, afterString);
	}
	let promise = editor.edit(f);
	promise.then(
		(isSucceedEdit) => {
			if(!isSucceedEdit){
				return;
			}
			if(cursorMoverAfterCopy === undefined){
				return;
			}
			cursorMoverAfterCopy();
		}
	)
}

function doSave(){
	let editor = getEditor();
	let doc = editor.document;

	// 変更が無い状態(not dirty)で save() すると failed になるので防止.
	if(!doc.isDirty){
		return;
	}

	let promise = editor.document.save();
	promise.then((result) =>{
		if(!result){
			abort("Failed to save()");
			throw new Error();
		}
	});
}

function doSort(){
	let commandLine = `${getHelperCommandline()} --sort`;
	console.log(`Sort: "${commandLine}"`);

	doSave();

	exec(commandLine, (err:any, stdout:any, stderr:any) => {
		if(err){
			console.log(err);
		}
	});
}

function doRepeatIfPossible(){
	let editor = getEditor();
	let curPos = CursorPositioner.current();
	let doc = editor.document;
	let currentLine = doc.lineAt(curPos).text;
	if(currentLine.indexOf("rep:") == -1){
		return;
	}

	let curLineNumber = curPos.line;
	let commandLine = `${getHelperCommandline()} -y ${curLineNumber} --repeat`;
	console.log(`Repeat: "${commandLine}"`);

	doSave();

	exec(commandLine, (err:any, stdout:any, stderr:any) => {
		if(err){
			console.log(err);
		}
	});
}

function startTask(){
	// s  e  >DStart>  s  e
	// ---------------------
	// x  x            o  x    OK. 普通に start する.
	// o  x            x  x    OK. トグルで start をやめる.
	// o  o            -  -    Don't care.
	// x  o            -  -    Don't care.
	//
	// x  o のケースが Invalid(endTask参照) なので,
	// このケース時の start がどうなるかは気にしない.
	// 今のコードだと単にトグルするが, 別に問題は無いのでこのままで.

	let editor = getEditor();
	let doc = editor.document;
	let currentLine = doc.lineAt(CursorPositioner.current()).text;
	let currentStartTimeValue = currentLine.substr(POS_STARTTIME, LEN_TIME);
	let afterString = EMPTYTIME;
	if(currentStartTimeValue == EMPTYTIME){
		afterString = DateTimeUtil.nowtimeString();
	}

	let startTimeRange = CursorPositioner.rangeBetweenStartTime()

	let f = function(editBuilder: vscode.TextEditorEdit): void{
		editBuilder.replace(startTimeRange, afterString);
	}
	editor.edit(f);

	CursorMover.endofstarttime();
}

function endTask(){
	// s  e  >DoEnd>  s  e
	// -------------------
	// x  x           x  x    Invalid. start してないので end しない.
	// o  x           o  o    OK. 普通に end する.
	// o  o           o  x    OK. トグルで end をやめる.
	// x  o           -  -    Don't care.
	//
	// x  x から x  o に至れないので x  o の時は想定していない.
	// 今のコードだと end しない挙動になるが, 特に問題はないのでこのままで.

	let editor = getEditor();
	let doc = editor.document;
	let currentLine = doc.lineAt(CursorPositioner.current()).text;

	let currentStartTimeValue = currentLine.substr(POS_STARTTIME, LEN_TIME);
	let isNotStarted = currentStartTimeValue == EMPTYTIME;
	if(isNotStarted){
		return;
	}

	let currentEndTimeValue = currentLine.substr(POS_ENDTIME, LEN_TIME);
	let isDoneNewly = currentEndTimeValue == EMPTYTIME;
	let shouldCopyBecauseRepeat = currentLine.indexOf("rep:") != -1;

	let afterStringForEndTime = EMPTYTIME;
	if(isDoneNewly){
		afterStringForEndTime = DateTimeUtil.nowtimeString();
	}
	let endTimeRange = CursorPositioner.rangeBetweenEndTime()
	let endTimeBuilder = function(editBuilder: vscode.TextEditorEdit): void{
		editBuilder.replace(endTimeRange, afterStringForEndTime);
	}	
	let endTimePromise = editor.edit(endTimeBuilder);

	let functionAfterCopy = () => {
		CursorMover.golineend();
		doRepeatIfPossible();
	}

	endTimePromise.then(
		(isSucceedEdit) => {
			if(isSucceedEdit && isDoneNewly && shouldCopyBecauseRepeat){
				copyTask(functionAfterCopy);
			}
		}
	)
}

function jumpToStartingTask(){
	let editor = getEditor();
	let doc = editor.document;
	let lineCount = doc.lineCount;

	// starting task 行を自力で探す.
	// - starting task = start time がある && end time がない
	// - VSCode に find(keyword, options) のような関数があれば正規表現 `[0-9]{2}\:[0-9]{2}( ){7}` で一発だが, 無い.

	let foundLineNumber = -1;
	for(let curLineNumber=0; curLineNumber<lineCount; curLineNumber++){
		let line = doc.lineAt(curLineNumber).text;
		if(line.length < LEN_BEFORE_DESCRIPTION){
			continue;
		}
		let startTimePart = line.substr(POS_STARTTIME, LEN_TIME);
		let endTimePart = line.substr(POS_ENDTIME, LEN_TIME);
		if(startTimePart == EMPTYTIME){
			continue;
		}
		if(endTimePart != EMPTYTIME){
			continue;
		}
		foundLineNumber = curLineNumber;
		break;
	}
	if(foundLineNumber == -1){
		return;
	}

	let startPos = new vscode.Position(foundLineNumber, POS_STARTTIME);
	let endPos = startPos.with(startPos.line, startPos.character + (LEN_TIME+1)*2)
	let sel = new vscode.Selection(startPos, endPos);
	editor.selection = sel;

	// revealRange しないとスクロールが発生しないのでする.
	let range = new vscode.Range(startPos, endPos);
	editor.revealRange(range, vscode.TextEditorRevealType.Default);
}

function jumpToNextSeparator(){
	jumpToSeparator("down");
}

function jumpToPrevSeparator(){
	jumpToSeparator("up");
}

function jumpToSeparator(command: string){
	let editor = getEditor();
	let doc = editor.document;
	let lineCount = doc.lineCount;
	let curPos = CursorPositioner.current();

	// 区切り行を自力で探す.
	// - 区切り行 = `--` が存在する行.
	// - Why 自力? -> Symbol を作り込むのは大変だし Jump to Next Symbol 的なコマンドもサポートされてないから.

	let lineNumberOfSeparators = [];
	for(let curLineNumber=0; curLineNumber<lineCount; curLineNumber++){
		let line = doc.lineAt(curLineNumber).text;
		if(line.length < LEN_BEFORE_DESCRIPTION){
			continue;
		}
		if(line.indexOf("--") == -1){
			continue;
		}
		lineNumberOfSeparators.push(curLineNumber);
	}
	if(lineNumberOfSeparators.length == 0){
		return;
	}

	//          up       down
	// Case1    x        o(1)
	// -1-
	// Case2    o(1)     o(2)
	// -2-
	// Case3    o(2)     o(3)
	// -3-
	// Case4    o(3)     x
	//
	// up(上の区切り)時は下から見ていって最初にヒットした区切りにジャンプ.
	// down(下の区切り)時は上から見ていって最初にヒットした区切りにジャンプ.

	let destLineNumber = -1;
	if(command == "up"){
		for(let i=(lineNumberOfSeparators.length)-1; i>=0; i--){
			let lineNumberofSeparator = lineNumberOfSeparators[i];
			let cursorLineNumber = curPos.line;
			if(lineNumberofSeparator < cursorLineNumber){
				destLineNumber = lineNumberofSeparator;
				break;
			}
		}
	}else if(command == "down"){
		for(let i=0; i<lineNumberOfSeparators.length; i++){
			let lineNumberofSeparator = lineNumberOfSeparators[i];
			let cursorLineNumber = curPos.line;
			if(cursorLineNumber < lineNumberofSeparator){
				destLineNumber = lineNumberofSeparator;
				break;
			}
		}
	}
	if(destLineNumber == -1){
		return;
	}

	let newPos = curPos.with(destLineNumber, curPos.character);
	let sel = new vscode.Selection(newPos, newPos);
	editor.selection = sel;

	let range = new vscode.Range(newPos, newPos);
	editor.revealRange(range, vscode.TextEditorRevealType.Default);
}

function walkTask(){
	let thenable = input("Input a day diff(Ex: 1, +7, -4)");
	thenable.then(
		(inputTextMaybe) => {
			if(inputTextMaybe === undefined){
				return;
			}
			let inputText = inputTextMaybe;
			let walkDay = parseInt(inputText);
			if(isNaN(walkDay)){
				return;
			}
			walkTaskMain(walkDay);
		}
	)
}

function walkTaskMain(walkDay: Number){
	let yargs = getHelperYargs();
	let commandLine = `${getHelperCommandline()} ${yargs} -d ${walkDay} --walk`;
	console.log(`WalkDay: "${commandLine}"`);

	doSave();

	exec(commandLine, (err:any, stdout:any, stderr:any) => {
		if(err){
			console.log(err);
		}
	});
}

function walkTask1Day(){
	let yargs = getHelperYargs();
	let commandLine = `${getHelperCommandline()} ${yargs} --smartwalk`;
	console.log(`WalkDay+1(SmartWark): "${commandLine}"`);

	doSave();

	exec(commandLine, (err:any, stdout:any, stderr:any) => {
		if(err){
			console.log(err);
		}
	});
}

function walkTaskToToday(){
	let yargs = getHelperYargs();
	let commandLine = `${getHelperCommandline()} ${yargs} --to-today`;
	console.log(`Walk To Today: "${commandLine}"`);

	doSave();

	exec(commandLine, (err:any, stdout:any, stderr:any) => {
		if(err){
			console.log(err);
		}
	});
}

function completeSimply(){
	let commandLine = `${getHelperCommandline()} --use-simple-completion`;
	console.log(`Simple Completion: "${commandLine}"`);

	doSave();

	exec(commandLine, (err:any, stdout:any, stderr:any) => {
		if(err){
			console.log(err);
		}
	});
}

function reportDialog(){
	let reportArgs = "--today-dialog-report";
	if(isSelected()){
		let yargs = getHelperYargs();
		reportArgs = `${yargs} --selected-range-dialog-report`;
	}
	let commandLine = `${getHelperCommandline()} ${reportArgs}`;
	console.log(`Reporting: "${commandLine}"`);

	exec(commandLine, (err:any, stdout:any, stderr:any) => {
		if(err){
			console.log(err);
		}
	});
}

export function activate(context: vscode.ExtensionContext) {

	let dummy_for_menu_separator = vscode.commands.registerCommand('tritask.dummy', () => {});

	let menu_show = vscode.commands.registerCommand('tritask.menu.show', () => {
		showMenu();
	});

	let task_add = vscode.commands.registerCommand('tritask.task.add', () => {
		addTask();
	});

	let inbox_add = vscode.commands.registerCommand('tritask.inbox.add', () => {
		addInbox();
	});

	let task_copy = vscode.commands.registerCommand('tritask.task.copy', () => {
		let callbackAfterCopy = CursorMover.golineend;
		copyTask(callbackAfterCopy);
	});

	let sort = vscode.commands.registerCommand('tritask.sort', () => {
		doSort();
	});

	let jump_to_starting = vscode.commands.registerCommand('tritask.jump.starting', () => {
		jumpToStartingTask();
	});

	let jump_to_next_separator = vscode.commands.registerCommand('tritask.jump.separator.next', () => {
		jumpToNextSeparator();
	});

	let jump_to_prev_separator = vscode.commands.registerCommand('tritask.jump.separator.prev', () => {
		jumpToPrevSeparator();
	});

	let task_start = vscode.commands.registerCommand('tritask.task.start', () => {
		startTask();
	});

	let task_end = vscode.commands.registerCommand('tritask.task.end', () => {
		endTask();
	});

	let task_walk = vscode.commands.registerCommand('tritask.task.walk', () => {
		walkTask();
	});

	let task_walk_plus1 = vscode.commands.registerCommand('tritask.task.walk.1', () => {
		walkTask1Day();
	});

	let task_walk_to_today = vscode.commands.registerCommand('tritask.task.walk.today', () => {
		walkTaskToToday();
	});

	let completion_simple = vscode.commands.registerCommand('tritask.completion.simple', () => {
		completeSimply();
	});

	let report_dialog = vscode.commands.registerCommand('tritask.report.dialog', () => {
		reportDialog();
	});

	context.subscriptions.push(
		dummy_for_menu_separator,
		menu_show,
		task_add, inbox_add,
		task_copy,
		sort,
		task_start,
		task_end,
		jump_to_starting,
		task_walk,
		task_walk_plus1,
		task_walk_to_today,
		completion_simple,
		report_dialog
	);
}

export function deactivate() {}
