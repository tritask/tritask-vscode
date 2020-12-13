import * as vscode from 'vscode';

import * as moment from 'moment'
import * as child_process from 'child_process'
const exec = child_process.exec;

moment.locale("ja");

const SELF_EXTENSION_ID = "stakiran.tritask-language-features";
const HELPER_FILENAME = "helper.py";

function abort(message: string){
	console.log(message);
	// Object is possibly 'undefined' を防げないので呼び出し元で.
	//throw new Error(`Error: ${message}`);
}

export function getSelfDirectory(){
	const selfExtension = vscode.extensions.getExtension(SELF_EXTENSION_ID);
	if(selfExtension === undefined){
		abort("No extension found in getSelfDirectory()");
		throw new Error();
	}
	const selfDir = selfExtension.extensionPath;
	return selfDir;
}

function getHelperFullpath(){
	const selfDir = getSelfDirectory();
	return `${selfDir}/${HELPER_FILENAME}`;
}

function getFullpathOfActiveTextEditor(){
	const editor = getEditor();
	const fullpath = editor.document.uri.fsPath;
	return fullpath;
}

function input(message: string): Thenable<string|undefined>{
	const options = {
		placeHolder: message
	};
	return vscode.window.showInputBox(options);
}

function getEditor(){
	const editor = vscode.window.activeTextEditor;
	if(editor == null){
		abort("activeTextEditor is null currently.")
		throw new Error();
	}
	return editor;
}

function isSelected(){
	const curSel = CursorPositioner.currentSelection();
	if(curSel.start.line != curSel.end.line){
		return true;
	}
	if(curSel.start.character != curSel.end.character){
		return true;
	}
	return false;
}

function getHelperCommandline(){
	const helperFullpath = getHelperFullpath();
	const tritaFullpath = getFullpathOfActiveTextEditor();
	// Use not `python` but `python3` because works on MacOS.
	const commandLine = `python3 ${helperFullpath} -i ${tritaFullpath}`;
	return commandLine;
}

function getHelperYargs(){
	const curSel = CursorPositioner.currentSelection();
	const curSelStartLine = curSel.start.line;
	const curSelEndLine = curSel.end.line;

	let yargs = "";
	if(curSelStartLine == curSelEndLine){
		const curLineNumber = curSelStartLine;
		yargs = `-y ${curLineNumber}`;
	}else{
		yargs = `-y ${curSelStartLine} --y2 ${curSelEndLine}`;
	}

	return yargs;
}
class DateTime {
	private _momentinst: moment.Moment
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
		const dtobj = new DateTime();
		return dtobj.toString();
	}

	static nowtimeString(): string {
		return moment().format("HH:mm");
	}

}

class CursorPositioner {
	static current(): vscode.Position {
		const editor = getEditor();
		const curPos = editor.selection.active;
		return curPos;
	}

	static currentSelection(): vscode.Selection {
		const editor = getEditor();
		return editor.selection;
	}

	static linetop(): vscode.Position {
		const editor = getEditor();
		const curPos = editor.selection.active;

		const newY = curPos.line;
		const newX = 0;

		return curPos.with(newY, newX);
	}

	static startOfTimeFields(): vscode.Position {
		const editor = getEditor();
		const curPos = editor.selection.active;

		const newY = curPos.line;
		const newX = POS_STARTTIME;

		return curPos.with(newY, newX);
	}

	static startOfStartTime(): vscode.Position {
		return CursorPositioner.startOfTimeFields();
	}

	static endOfTimeFields(): vscode.Position {
		const editor = getEditor();
		const curPos = editor.selection.active;

		const newY = curPos.line;
		const newX = POS_STARTTIME + LEN_TIME + LEN_DELIM + LEN_TIME;

		return curPos.with(newY, newX);
	}

	static endOfStartTime(): vscode.Position {
		const editor = getEditor();
		const curPos = editor.selection.active;

		const newY = curPos.line;
		const newX = POS_STARTTIME + LEN_TIME;

		return curPos.with(newY, newX);
	}

	static endOfEndTime(): vscode.Position {
		const editor = getEditor();
		const curPos = editor.selection.active;

		const newY = curPos.line;
		const newX = POS_ENDTIME + LEN_TIME;

		return curPos.with(newY, newX);
	}

	static rangeBetweenStartTime(): vscode.Range {
		const editor = getEditor();
		const curPos = editor.selection.active;

		const startpos = curPos.with(curPos.line, POS_STARTTIME)
		const endpos = curPos.with(curPos.line, POS_STARTTIME + LEN_TIME)
		const range = new vscode.Range(startpos, endpos);
		return range;
	}

	static rangeBetweenEndTime(): vscode.Range {
		const editor = getEditor();
		const curPos = editor.selection.active;

		const startpos = curPos.with(curPos.line, POS_ENDTIME)
		const endpos = curPos.with(curPos.line, POS_ENDTIME + LEN_TIME)
		const range = new vscode.Range(startpos, endpos);
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
		const pos = CursorPositioner.endOfStartTime();
		const sel = new vscode.Selection(pos, pos);

		const editor = getEditor();
		editor.selection = sel;
		return this;
	}

	static endofendtime() {
		const pos = CursorPositioner.endOfEndTime();
		const sel = new vscode.Selection(pos, pos);

		const editor = getEditor();
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
const POS_DATE = 2;
const POS_DESCRIPTION = 29;

function showMenu(){
	vscode.commands.executeCommand("editor.action.showContextMenu");
}

function addTask(){
	const editor = getEditor();
	const todayString = DateTimeUtil.todayString();
	const inserteeString = `${EMPTYSORTMARK} ${todayString} ${EMPTYDOW} ${EMPTYTIME} ${EMPTYTIME} \n`;
	const inserteePos = CursorPositioner.linetop();
	const f = function(editBuilder: vscode.TextEditorEdit): void{
		editBuilder.insert(inserteePos, inserteeString);
	}
	editor.edit(f);

	CursorMover.golinetop().left();
}

function addInbox(){
	const editor = getEditor();
	const inserteeString = `${EMPTYSORTMARK} ${EMPTYFULLDATE} ${EMPTYTIME} ${EMPTYTIME} \n`;
	const inserteePos = CursorPositioner.linetop();
	const f = function(editBuilder: vscode.TextEditorEdit): void{
		editBuilder.insert(inserteePos, inserteeString);
	}
	editor.edit(f);

	CursorMover.golinetop().left();
}

// コールバック関数使う以外の上手い設計思いつかないので disable にする.
// (ちなみに any から Function にしても Don't use Function as a type. The Function type accepts any function-like value.)
function copyTask(cursorMoverAfterCopy: any){ // eslint-disable-line  @typescript-eslint/no-explicit-any
	const editor = getEditor();
	const doc = editor.document;
	const currentLine = doc.lineAt(CursorPositioner.current()).text;
	const inserteeString = `${currentLine}\n`;
	const inserteePos = CursorPositioner.linetop();

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
	const startpos = CursorPositioner.startOfTimeFields();
	const endpos = CursorPositioner.endOfTimeFields();
	const replaceeRange = new vscode.Range(startpos, endpos);
	const afterString = `${EMPTYTIME} ${EMPTYTIME}`;

	// insert: 現在行を複製する.
	// replace: 複製した行の開始/終了時刻をクリアする(複製後は todo task として扱いたいはず).
	const f = function(editBuilder: vscode.TextEditorEdit): void{
		editBuilder.insert(inserteePos, inserteeString);
		editBuilder.replace(replaceeRange, afterString);
	}
	const promise = editor.edit(f);
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
	const editor = getEditor();
	const doc = editor.document;

	// 変更が無い状態(not dirty)で save() すると failed になるので防止.
	if(!doc.isDirty){
		return;
	}

	const promise = editor.document.save();
	promise.then((result) =>{
		if(!result){
			abort("Failed to save()");
			throw new Error();
		}
	});
}

function doSort(){
	const commandLine = `${getHelperCommandline()} --sort`;
	console.log(`Sort: "${commandLine}"`);

	doSave();

	exec(commandLine, (err) => {
		if(err){
			console.log(err);
		}
	});
}

function doRepeatIfPossible(){
	const editor = getEditor();
	const curPos = CursorPositioner.current();
	const doc = editor.document;
	const currentLine = doc.lineAt(curPos).text;
	if(currentLine.indexOf("rep:") == -1){
		return;
	}

	const curLineNumber = curPos.line;
	const commandLine = `${getHelperCommandline()} -y ${curLineNumber} --repeat`;
	console.log(`Repeat: "${commandLine}"`);

	doSave();

	exec(commandLine, (err) => {
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

	const editor = getEditor();
	const doc = editor.document;
	const currentLine = doc.lineAt(CursorPositioner.current()).text;
	const currentStartTimeValue = currentLine.substr(POS_STARTTIME, LEN_TIME);
	let afterString = EMPTYTIME;
	if(currentStartTimeValue == EMPTYTIME){
		afterString = DateTimeUtil.nowtimeString();
	}

	const startTimeRange = CursorPositioner.rangeBetweenStartTime()

	const f = function(editBuilder: vscode.TextEditorEdit): void{
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

	const editor = getEditor();
	const doc = editor.document;
	const currentLine = doc.lineAt(CursorPositioner.current()).text;

	const currentStartTimeValue = currentLine.substr(POS_STARTTIME, LEN_TIME);
	const isNotStarted = currentStartTimeValue == EMPTYTIME;
	if(isNotStarted){
		return;
	}

	const currentEndTimeValue = currentLine.substr(POS_ENDTIME, LEN_TIME);
	const isDoneNewly = currentEndTimeValue == EMPTYTIME;
	const shouldCopyBecauseRepeat = currentLine.indexOf("rep:") != -1;

	let afterStringForEndTime = EMPTYTIME;
	if(isDoneNewly){
		afterStringForEndTime = DateTimeUtil.nowtimeString();
	}
	const endTimeRange = CursorPositioner.rangeBetweenEndTime()
	const endTimeBuilder = function(editBuilder: vscode.TextEditorEdit): void{
		editBuilder.replace(endTimeRange, afterStringForEndTime);
	}	
	const endTimePromise = editor.edit(endTimeBuilder);

	const functionAfterCopy = () => {
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
	const editor = getEditor();
	const doc = editor.document;
	const lineCount = doc.lineCount;

	// starting task 行を自力で探す.
	// - starting task = start time がある && end time がない
	// - VSCode に find(keyword, options) のような関数があれば正規表現 `[0-9]{2}\:[0-9]{2}( ){7}` で一発だが, 無い.

	let foundLineNumber = -1;
	for(let curLineNumber=0; curLineNumber<lineCount; curLineNumber++){
		const line = doc.lineAt(curLineNumber).text;
		if(line.length < LEN_BEFORE_DESCRIPTION){
			continue;
		}
		const startTimePart = line.substr(POS_STARTTIME, LEN_TIME);
		const endTimePart = line.substr(POS_ENDTIME, LEN_TIME);
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

	const startPos = new vscode.Position(foundLineNumber, POS_STARTTIME);
	const endPos = startPos.with(startPos.line, startPos.character + (LEN_TIME+1)*2)
	const sel = new vscode.Selection(startPos, endPos);
	editor.selection = sel;

	// revealRange しないとスクロールが発生しないのでする.
	const range = new vscode.Range(startPos, endPos);
	editor.revealRange(range, vscode.TextEditorRevealType.Default);
}

function jumpToTodayTodo(){
	const editor = getEditor();
	const doc = editor.document;
	const lineCount = doc.lineCount;

	// today todo は, datetime が今日 && starttime がない && endtime がないもの

	let foundLineNumber = -1;
	for(let curLineNumber=0; curLineNumber<lineCount; curLineNumber++){
		const line = doc.lineAt(curLineNumber).text;

		if(line.length < LEN_BEFORE_DESCRIPTION){
			continue;
		}

		const startTimePart = line.substr(POS_STARTTIME, LEN_TIME);
		const endTimePart = line.substr(POS_ENDTIME, LEN_TIME);
		if(startTimePart != EMPTYTIME){
			continue;
		}
		if(endTimePart != EMPTYTIME){
			continue;
		}

		const datePart = line.substr(POS_DATE, LEN_DATE);
		const todayString = DateTimeUtil.todayString();
		const isNotTodayLine = datePart != todayString
		if(isNotTodayLine){
			continue;
		}

		// 最初に見つかった行 = 先頭行なのでこれで確定して良い.
		foundLineNumber = curLineNumber;
		break;
	}
	if(foundLineNumber == -1){
		return;
	}

	const startPos = new vscode.Position(foundLineNumber, POS_DESCRIPTION);
	const endPos = startPos.with(startPos.line, startPos.character)
	const sel = new vscode.Selection(startPos, endPos);
	editor.selection = sel;

	const range = new vscode.Range(startPos, endPos);
	editor.revealRange(range, vscode.TextEditorRevealType.Default);
}

function jumpToNextSeparator(){
	jumpToSeparator("down");
}

function jumpToPrevSeparator(){
	jumpToSeparator("up");
}

function jumpToSeparator(command: string){
	const editor = getEditor();
	const doc = editor.document;
	const lineCount = doc.lineCount;
	const curPos = CursorPositioner.current();

	// 区切り行を自力で探す.
	// - 区切り行 = `--` が存在する行.
	// - Why 自力? -> Symbol を作り込むのは大変だし Jump to Next Symbol 的なコマンドもサポートされてないから.

	const lineNumberOfSeparators = [];
	for(let curLineNumber=0; curLineNumber<lineCount; curLineNumber++){
		const line = doc.lineAt(curLineNumber).text;
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
			const lineNumberofSeparator = lineNumberOfSeparators[i];
			const cursorLineNumber = curPos.line;
			if(lineNumberofSeparator < cursorLineNumber){
				destLineNumber = lineNumberofSeparator;
				break;
			}
		}
	}else if(command == "down"){
		for(let i=0; i<lineNumberOfSeparators.length; i++){
			const lineNumberofSeparator = lineNumberOfSeparators[i];
			const cursorLineNumber = curPos.line;
			if(cursorLineNumber < lineNumberofSeparator){
				destLineNumber = lineNumberofSeparator;
				break;
			}
		}
	}
	if(destLineNumber == -1){
		return;
	}

	const newPos = curPos.with(destLineNumber, curPos.character);
	const sel = new vscode.Selection(newPos, newPos);
	editor.selection = sel;

	const range = new vscode.Range(newPos, newPos);
	editor.revealRange(range, vscode.TextEditorRevealType.Default);
}

function walkTask(){
	const thenable = input("Input a day diff(Ex: 1, +7, -4)");
	thenable.then(
		(inputTextMaybe) => {
			if(inputTextMaybe === undefined){
				return;
			}
			const inputText = inputTextMaybe;
			const walkDay = parseInt(inputText);
			if(isNaN(walkDay)){
				return;
			}
			walkTaskMain(walkDay);
		}
	)
}

function walkTaskMain(walkDay: number){
	const yargs = getHelperYargs();
	const commandLine = `${getHelperCommandline()} ${yargs} -d ${walkDay} --walk`;
	console.log(`WalkDay: "${commandLine}"`);

	doSave();

	exec(commandLine, (err) => {
		if(err){
			console.log(err);
		}
	});
}

function walkTask1Day(){
	const yargs = getHelperYargs();
	const commandLine = `${getHelperCommandline()} ${yargs} --smartwalk`;
	console.log(`WalkDay+1(SmartWark): "${commandLine}"`);

	doSave();

	exec(commandLine, (err) => {
		if(err){
			console.log(err);
		}
	});
}

function walkTaskToToday(){
	const yargs = getHelperYargs();
	const commandLine = `${getHelperCommandline()} ${yargs} --to-today`;
	console.log(`Walk To Today: "${commandLine}"`);

	doSave();

	exec(commandLine, (err) => {
		if(err){
			console.log(err);
		}
	});
}

function completeSimply(){
	const commandLine = `${getHelperCommandline()} --use-simple-completion`;
	console.log(`Simple Completion: "${commandLine}"`);

	doSave();

	exec(commandLine, (err) => {
		if(err){
			console.log(err);
		}
	});
}

function reportDialog(){
	let reportArgs = "--today-dialog-report";
	if(isSelected()){
		const yargs = getHelperYargs();
		reportArgs = `${yargs} --selected-range-dialog-report`;
	}
	const commandLine = `${getHelperCommandline()} ${reportArgs}`;
	console.log(`Reporting: "${commandLine}"`);

	exec(commandLine, (err) => {
		if(err){
			console.log(err);
		}
	});
}

export function activate(context: vscode.ExtensionContext):void {
	/* eslint-disable-next-line @typescript-eslint/no-empty-function */
	const dummy_for_menu_separator = vscode.commands.registerCommand('tritask.dummy', () => {});

	const menu_show = vscode.commands.registerCommand('tritask.menu.show', () => {
		showMenu();
	});

	const task_add = vscode.commands.registerCommand('tritask.task.add', () => {
		addTask();
	});

	const inbox_add = vscode.commands.registerCommand('tritask.inbox.add', () => {
		addInbox();
	});

	const task_copy = vscode.commands.registerCommand('tritask.task.copy', () => {
		const callbackAfterCopy = CursorMover.golineend;
		copyTask(callbackAfterCopy);
	});

	const sort = vscode.commands.registerCommand('tritask.sort', () => {
		doSort();
	});

	const jump_to_starting = vscode.commands.registerCommand('tritask.jump.starting', () => {
		jumpToStartingTask();
	});

	const jump_to_today_todo = vscode.commands.registerCommand('tritask.jump.today.todo', () => {
		jumpToTodayTodo();
	});

	const jump_to_next_separator = vscode.commands.registerCommand('tritask.jump.separator.next', () => {
		jumpToNextSeparator();
	});

	const jump_to_prev_separator = vscode.commands.registerCommand('tritask.jump.separator.prev', () => {
		jumpToPrevSeparator();
	});

	const task_start = vscode.commands.registerCommand('tritask.task.start', () => {
		startTask();
	});

	const task_end = vscode.commands.registerCommand('tritask.task.end', () => {
		endTask();
	});

	const task_walk = vscode.commands.registerCommand('tritask.task.walk', () => {
		walkTask();
	});

	const task_walk_plus1 = vscode.commands.registerCommand('tritask.task.walk.1', () => {
		walkTask1Day();
	});

	const task_walk_to_today = vscode.commands.registerCommand('tritask.task.walk.today', () => {
		walkTaskToToday();
	});

	const completion_simple = vscode.commands.registerCommand('tritask.completion.simple', () => {
		completeSimply();
	});

	const report_dialog = vscode.commands.registerCommand('tritask.report.dialog', () => {
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
		jump_to_today_todo,
		jump_to_starting,
		jump_to_prev_separator,
		jump_to_next_separator,
		task_walk,
		task_walk_plus1,
		task_walk_to_today,
		completion_simple,
		report_dialog
	);
}
 