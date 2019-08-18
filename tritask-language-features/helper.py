# -*- coding: utf-8 -*-

import ctypes
import datetime
import os
import sys

NAME    = 'Tritask'
VERSION = '1.7.1'
INFO    = '{} {}'.format(NAME, VERSION)

MB_OK = 0
def message_box(message, title, mbtype):
    return ctypes.windll.user32.MessageBoxW(0, str(message), str(title), mbtype)

def ok(message, title):
    message_box(message, title, MB_OK)

def open_version_dialog():
    message = INFO
    title = 'Version'
    ok(message, title)

def file2list(filepath):
    ret = []
    with open(filepath, encoding='utf8', mode='r') as f:
        ret = [line.rstrip('\n') for line in f.readlines()]
    return ret

def list2file(filepath, ls):
    with open(filepath, encoding='utf8', mode='w') as f:
        f.writelines(['{:}\n'.format(line) for line in ls] )

def is_monday(weekday_val):
    return weekday_val==0

def is_tuesday(weekday_val):
    return weekday_val==1

def is_wednesday(weekday_val):
    return weekday_val==2

def is_thursday(weekday_val):
    return weekday_val==3

def is_friday(weekday_val):
    return weekday_val==4

def is_saturday(weekday_val):
    return weekday_val==5

def is_sunday(weekday_val):
    return weekday_val==6

def is_weekday(weekday_val):
    return 0<=weekday_val<=4

def is_weekend(weekday_val):
    return not(is_weekday(weekday_val))

def get_error_location(depth=0):
    import inspect
    frame = inspect.currentframe().f_back
    lineno = frame.f_lineno
    return lineon

def dp(msg):
    if args.debug:
        print(msg)

def abort(msg):
    print('Error: {0}'.format(msg))
    os.system('pause')
    exit(1)

def assert_y(y, lines):
    if y>=len(lines):
        abort('Out of range the line number "{0}", Max is "{1}".' \
              .format(y, len(lines)))


# datetime() 生成はコストがかかる処理なので
# 一度生成した分を保持しておいて使い回す.
dt_store = {}
def datestr2dt(datestr):
    """ @param datestr A string formatted with `YYYY/MM/DD`. """
    y = int(datestr[0:4])
    m = int(datestr[5:7])
    d = int(datestr[8:10])

    # 文字列連結はコストが高いので数値計算だけでキーをつくる.
    # 2011 10 12 -> 20111002
    key = y*10000 + m*100 + d

    if key in dt_store:
        dt = dt_store[key]
    else:
        dt = datetime.datetime(y, m, d)
        dt_store[key] = dt

    return dt

def dt2datestr(dt):
    """ @param dt A datetime.datetime object.
    @return A string `YYYY/MM/DD formatted. """
    return '{0}/{1:02d}/{2:02d}'.format(dt.year, dt.month, dt.day)

def dt2dowstr(dt):
    return ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][dt.weekday()]

def today_and_today_without_time():
    # without time について:
    #     today() をそのまま使うと時分秒レベルの差が生じて
    #     >0 や <0 で判定できないため,
    #     時分秒を省いた datetime オブジェクトを別途作って利用する.

    p1 = datetime.datetime.today()
    p2 = datetime.datetime(p1.year, p1.month, p1.day)
    return (p1, p2)

def reference_opener(refinfo):
    dirname = args.refconf_dir
    ext = args.refconf_ext

    do_not_use_new_creation = not(refinfo.use_new_creation)

    # reference もデータなので trita ファイルと同じディレクトリにする.
    # Q: 保存先を指定できるようにはしない?
    # A: しない. コマンドライン引数をあまり複雑にしたくない.
    tritafile_fullpath = os.path.abspath(args.input)
    basedir = os.path.dirname(tritafile_fullpath)
    dp('[Ref::BaseDir "{}"'.format(basedir))

    outputdir_fullpath = os.path.join(basedir, dirname)
    dp('[Ref::FullDir "{}"'.format(basedir))
    if not(os.path.isdir(outputdir_fullpath)):
        if do_not_use_new_creation:
            return
        os.mkdir(outputdir_fullpath)

    refname = refinfo.name
    reffile_name = '{}.{}'.format(refname, ext)
    reffile_fullpath = os.path.join(outputdir_fullpath, reffile_name)
    if not(os.path.exists(reffile_fullpath)):
        if do_not_use_new_creation:
            return
        # reference ファイル単体で開いても関連がわかりやすよう
        # 元タスク情報を書き込んでおく.
        contents = []
        contents.append(refinfo.taskline)
        contents.append('') # 空行. 個人的好み.
        list2file(reffile_fullpath, contents)

    os.system('start "" "{0}"'.format(reffile_fullpath))

def parse_arguments():
    import argparse

    parser = argparse.ArgumentParser(
        formatter_class=argparse.ArgumentDefaultsHelpFormatter)

    # required
    # --------
    parser.add_argument('-i', '--input', default=None, required=True,
        help='A input filename.')

    # options
    # -------

    parser.add_argument('-y', default=None, type=int,
        help='The start line number of a input line. 0-ORIGIN.')
    parser.add_argument('--y2', default=None, type=int,
        help='The end line number of a input line. 0-ORIGIN.')
    parser.add_argument('-d', '--day', default=None, type=int,
        help='The day count to walk.')

    parser.add_argument('--to-today', default=False, action='store_true',
        help='Change the current task day to today. MUST: -y')
    parser.add_argument('--repeat', default=False, action='store_true',
        help='Walk day in the current task with rep:n param. MUST: -y.')
    parser.add_argument('--walk', default=False, action='store_true',
        help='Walk day in the current task. MUST: -y and -d.')
    parser.add_argument('--smartwalk', default=False, action='store_true',
        help='Walk +N or +1 day in the current task. MUST: -y')
    parser.add_argument('--sort', default=False, action='store_true',
        help='Do sort.')

    parser.add_argument('--use-simple-completion', default=False, action='store_true',
        help='Do simple completion of each line, but do not sort and to-today completion.')

    parser.add_argument('--ref', default=False, action='store_true',
        help='Open the reference writing space. MUST: -y')
    parser.add_argument('--refconf-dir', default='ref',
        help='--ref options: The location which the reference file saved.')
    parser.add_argument('--refconf-ext', default='md',
        help='--ref options: The extension which the reference file has.')

    # reporting
    # ---------

    parser.add_argument('--today-dialog-report', default=False, action='store_true',
        help='Display today report with dialog.')
    parser.add_argument('--selected-range-dialog-report', default=False, action='store_true',
        help='Display report of selected range with dialog.')

    parser.add_argument('--report', default=False, action='store_true',
        help='Debug mode for reporting.')

    # deugging
    # --------

    parser.add_argument('-v', '--version', default=False, action='store_true',
        help='Display "{}" to version dialog.'.format(INFO))

    parser.add_argument('--debug', default=False, action='store_true',
        help='Debug mode. (Show information to debug.)')
    parser.add_argument('--raw-error', default=False, action='store_true',
        help='Debug mode. (Show raw error message.)')

    args = parser.parse_args()
    return args

class ReferenceInfo:
    def __init__(self, name, task):
        self._name = name
        self._task = task

        self._use_new_creation = True

    def do_not_use_new_creation(self):
        self._use_new_creation = False

    @property
    def name(self):
        return self._name

    @property
    def use_new_creation(self):
        return self._use_new_creation

    @property
    def taskline(self):
        return str(self._task)

class Task:
    EMPTY_TIME = ' '*5

    # [Marks]
    #   inbo(Mark is a space)
    # 1 td
    # 2 tt, ts
    # 3 tom
    # 4 ye
    INBO = ' '
    TD   = '1'
    TT   = '2'
    TS   = TT
    TOM  = '3'
    YE   = '4'

    def __init__(self, line, predefined_todays=None):
        """ @param predefined_todays A tuple (today, today_without_time). """

        # For Performance
        # ---------------

        # 事前につくった today datetime object を使うことで
        # Task インスタンス毎に新規生成するコストを抑える.
        self._today_dt = None
        self._today_dt_without_time = None
        if predefined_todays!=None:
            self._today_dt = predefined_todays[0]
            self._today_dt_without_time = predefined_todays[1]

        # Parse Basic elements
        # --------------------

        #      01234567890123456789012345678
        fmt = 'M YYYY/MM/DD DOW HH:MM HH:MM '
        if len(line)<len(fmt):
            abort('Invalid format, length shortage "{0}".'.format(line))

        if line[1]!=' '  or \
           line[12]!=' ' or \
           line[16]!=' ' or \
           line[22]!=' ' or \
           line[28]!=' ':
            abort('Invalid format, wrong space delim pos "{0}".'.format(line))

        self._line = line
        self._sortmark    = line[0:1]
        self._date        = line[2:12]
        self._dow         = line[13:16]
        self._starttime   = line[17:22]
        self._endtime     = line[23:28]
        self._description = line[29:]

        # Completion after parsing
        # ------------------------

        self.complete()

        # Parse task-attributes
        # ---------------------

        # extract all options from description
        self._options = {}
        for elm in self._description.split(' '):
            if elm.find(':')==-1:
                continue
            key, value = elm.split(':', 1)
            self._options[key] = value

    # is_xxxx() は既に sort されていることを前提とする.
    # もっというと, 先に sort した後で使うことを想定している.
    # (開発者都合だが sort mark 使った方が判定が楽だから....)

    def is_today(self):
        m = self._sortmark
        if m==self.TT or m==self.TS or m==self.TD:
            return True
        return False

    def is_today_done(self):
        m = self._sortmark
        if m==self.TD:
            return True
        return False

    def is_hold(self):
        try:
            int(self._options['hold'])
        except (KeyError, ValueError):
            return False
        return True

    def get_estimate_info(self):
        """ @return A taple: (result_as_boolean, 0 or estimate_minute) """
        result = False
        estimate_minute = 0

        is_found_option = True
        try:
            int(self._options['m'])
        except (KeyError, ValueError):
            is_found_option = False

        if is_found_option:
            result = True
            estimate_minute = int(self._options['m'])

        return (result, estimate_minute)

    def complete(self):
        self._determin_dow()
        self._determin_sortmark()

    def _determin_dow(self):
        """ 曜日を日付から算出する. """
        if len(self._date.strip()):
            dt = datestr2dt(self._date)
            self._dow = dt2dowstr(dt)

    def _determin_sortmark(self):
        """ ソートマークを日付と開始/終了時刻から算出する. """
        if len(self._date.strip())==0:
            self._sortmark = self.INBO
            return

        dt = datestr2dt(self._date)

        if self._today_dt!=None:
            today = self._today_dt
            today_without_time = self._today_dt_without_time
        else:
            today, today_without_time = today_and_today_without_time()

        delta = dt-today_without_time
        diff = int(delta.total_seconds())
        if diff<0:
            self._sortmark = self.YE
            return
        if diff>0:
            self._sortmark = self.TOM
            return

        s, e = len(self._starttime.strip()), len(self._endtime.strip())
        if s==0 and e==0:
            self._sortmark = self.TT
            return
        if s==0 and e:
            # 終了時間のみは容認しない.
            # 未記入に戻す.
            self._sortmark = self.TT
            self._endtime = self.EMPTY_TIME
            return
        if s and e==0:
            self._sortmark = self.TS
            return
        self._sortmark = self.TD

    def hold_me(self):
        try:
            holdday = int(self._options['hold'])
        except (KeyError, ValueError):
            return

        today = datetime.datetime.today()
        self._date = dt2datestr(today)
        self._dow  = dt2dowstr(today)

        self.walk(holdday)

    def skip_me(self):
        # 日付が無い = Inbox タスクの場合は
        # 日付時刻スキップのしようがないので処理スキップ.
        if not(self._date.strip()):
            return

        y = int(self._date[0:4])
        m = int(self._date[5:7])
        d = int(self._date[8:10])
        dt = datetime.datetime(y, m, d)
        dt_original = datetime.datetime(y, m, d)

        delta1 = datetime.timedelta(days=1)
        walk_count = 0
        ops = self._options

        # skip:月 -> 月曜日はスキップ
        # skip:月木 -> 月曜日と木曜日スキップ
        # skip:平土 -> 平日と土曜日はスキップ
        # skip:休水 -> 休日と水曜日はスキップ
        skipees_by_str = ops.get('skip')
        if skipees_by_str == None:
            return
        use_mon_skip = skipees_by_str.find('月')!=-1
        use_tue_skip = skipees_by_str.find('火')!=-1
        use_wed_skip = skipees_by_str.find('水')!=-1
        use_thu_skip = skipees_by_str.find('木')!=-1
        use_fri_skip = skipees_by_str.find('金')!=-1
        use_sat_skip = skipees_by_str.find('土')!=-1
        use_sun_skip = skipees_by_str.find('日')!=-1
        use_weekday_skip = skipees_by_str.find('平')!=-1
        use_weekend_skip = skipees_by_str.find('休')!=-1

        while True:
            wd = dt.weekday()
            do_skip = False

            if use_mon_skip and is_monday(wd) or \
               use_tue_skip and is_tuesday(wd) or \
               use_wed_skip and is_wednesday(wd) or \
               use_thu_skip and is_thursday(wd) or \
               use_fri_skip and is_friday(wd) or \
               use_sat_skip and is_saturday(wd) or \
               use_sun_skip and is_sunday(wd) or \
               use_weekday_skip and is_weekday(wd) or \
               use_weekend_skip and is_weekend(wd):
                do_skip = True

            if not(do_skip):
                break

            walk_count += 1
            dt = dt + delta1
            if walk_count>7:
                # 一周した = 永遠にスキップされ続ける,
                # なので無効にする. とりあえずスキップ無しにしとく.
                dt = dt_original
                break

        self._date = dt2datestr(dt)
        self._dow  = dt2dowstr(dt)

    def repeat_me(self):
        try:
            repday = int(self._options['rep'])
        except (KeyError, ValueError):
            return

        self.walk(repday)

    def to_today(self):
        today = datetime.datetime.today()
        self._date = dt2datestr(today)
        self._dow  = dt2dowstr(today)

    def walk(self, day):
        # 0123456789
        # YYYY/MM/DD
        y = int(self._date[0:4])
        m = int(self._date[5:7])
        d = int(self._date[8:10])

        dt = datetime.datetime(y, m, d)
        delta = datetime.timedelta(days=abs(day))

        if day>=0:
            newdt = dt + delta
        else:
            newdt = dt - delta

        self._date = dt2datestr(newdt)
        self._dow  = dt2dowstr(newdt)

    def smartwalk(self):
        """ smartwalk とは rep:N に対して N 日後を設定する Walk.
        rep:N なタスクは N 日後に繰り越すことが多いが,
        Walk だといちいち N を指定しなければならず手間.
        Smart Walk:
        - rep:N がある場合は N 日後に繰り越す.
        - rep:N がない場合は翌日に繰り越す. """

        # repeat_me() と実装が似ているが,
        # rep:N が無いケースも考慮必要なため DRY の対象ではない.

        DEFAULT_REPDAY_WHEN_NO_REP_ATTR = 1
        repday = DEFAULT_REPDAY_WHEN_NO_REP_ATTR
        try:
            repday = int(self._options['rep'])
        except (KeyError, ValueError):
            pass

        self.walk(repday)

    def if_invalid_then_to_today(self):
        """ ye や tom の無効タスクはどうせ today に変える.
        だったら自動的に変えてやろうって話.

            yesterday todo     -> tt
            yesterday starting -> ts
            yesterday done
            today     todo
            today     starting
            today     done
            tomorrow  todo
            tomorrow  starting -> ts
            tomorrow  done     -> ts(いきなりtdだと困惑するのでtsで目立たせる)

        ye, today, tom の判定には sortmark を用いる. """

        s, e = len(self._starttime.strip()), len(self._endtime.strip())
        if self._sortmark==self.YE:
            if s==0 and e==0: # todo
                self.to_today()
                return
            if s and e==0: # starting
                self.to_today()
                return
            return
        if self._sortmark == self.TOM:
            if s and e==0: # starting
                self.to_today()
                return
            if s and e: # done
                self.to_today()
                # 方針変更.
                # Before) tomorrow done は目立たせるため today start
                #         self._endtime = self.EMPTY_TIME
                # After ) 未来のタスクを潰したいケースもあるので today done
                return
            return
        return

    def get_my_reference_name(self):
        try:
            refname = self._options['ref']
        except KeyError:
            raise RuntimeError('Reference attribute does not exists on this task.')

        if len(refname) == 0:
            raise RuntimeError('Reference value must not be a empty. (`ref:` is invalid)')

        refinfo = ReferenceInfo(refname, self)

        # 終了済タスクの場合は reference ファイルを作らない.
        # 「古い reference ファイルは削除しておこう」等で消してるだけかもしれないから.
        if len(self._endtime.strip()) != 0:
            refinfo.do_not_use_new_creation()

        return refinfo

    def __str__(self):
        return '{0} {1} {2} {3} {4} {5}'.format(
            self._sortmark, self._date, self._dow,
            self._starttime, self._endtime,
            self._description
        )

    def print_options(self):
        for k, v in self._options.items():
            print('{0}: [{1}]'.format(k, v))

def apply_holding(lines):
    for i, line in enumerate(lines):
        if line.find('hold:')==-1:
            continue
        task = Task(line)
        task.hold_me()
        lines[i] = str(task)

def apply_skipping(lines):
    for i, line in enumerate(lines):
        if line.find('skip:')==-1:
            continue
        task = Task(line)
        task.skip_me()
        lines[i] = str(task)

def apply_completion(lines):
    """ 記述が不足している or 不正なタスクを可能な限り補完する. """
    predefined_todays = (TODAY_WHEN_EXECUTED, TODAY_WITHOUT_TIME_WHEN_EXECUTED)

    for i, line in enumerate(lines):
        # today datetime object は生成に時間がかかるので
        # 事前に生成していたものを参照させて生成時間をカット.
        task = Task(line, predefined_todays)

        task.if_invalid_then_to_today()

        # 補完後の内容でソートマークを反映したいので
        # 最後に complete する.
        task.complete()
        lines[i] = str(task)

# Simple Completion: Task.complete() を行うだけ.
def apply_simple_completion(lines):
    for i, line in enumerate(lines):
        # Task の ctor で complete() が走るので
        # いったん to inst して to str するだけで completion できる.
        task = Task(line)
        lines[i] = str(task)

def apply_today_report(lines):
    today_task_count = 0
    today_estimate_total_minute = 0

    for i, line in enumerate(lines):
        task = Task(line)
        if not(task.is_today()):
            continue

        # ホールドされたタスクは区切りタスクだと思うので
        # 集計対象には含めない.
        if task.is_hold():
            continue

        today_task_count += 1

        if not(task.is_today_done()):
            # 未完了(Doneしてない)分のみ見積もりも計算
            # -> あとどれくらいで終わるかが知りたい.
            is_estimate_given, estimate_minute = task.get_estimate_info()
            if is_estimate_given:
                today_estimate_total_minute += estimate_minute

    # あると便利な情報をついでにつくっておく
    # --------------------------------------

    today_estimate_total_hour = round(today_estimate_total_minute/60.0, 2)

    _today_dt = datetime.datetime.today()
    _today_estimate_total_delta_min = datetime.timedelta(minutes=today_estimate_total_minute)
    _today_endtime_dt = _today_dt + _today_estimate_total_delta_min
    today_endtime = _today_endtime_dt.strftime('%H:%M')


    # ダイアログでレポート表示
    # ------------------------

    result_by_str = """Today: {} tasks, {:02}[H] estimated({}).""".format(
        today_task_count,
        today_estimate_total_hour,
        today_endtime
    )

    title = '{} Today report'.format(NAME)
    ok(result_by_str, title)

def apply_selected_range_report(lines):
    ''' 指定範囲をとにかく集計する.
    Today やら Done やらは一切考えない.
    絞りたいなら lines をつくる呼び出し元で対処する. '''

    task_count = 0
    estimate_total_minute = 0

    for i, line in enumerate(lines):
        task = Task(line)

        # ホールドされたタスクは区切りタスクだと思うので
        # 集計対象には含めない.
        if task.is_hold():
            continue

        task_count += 1

        is_estimate_given, estimate_minute = task.get_estimate_info()
        if is_estimate_given:
            estimate_total_minute += estimate_minute

    estimate_total_hour = round(estimate_total_minute/60.0, 2)

    result_by_str = """All {} tasks, {:02}[H].""".format(
        task_count,
        estimate_total_hour,
    )

    title = '{} Selected-Range report'.format(NAME)
    ok(result_by_str, title)

class reporting:

    def main():
        reporting.report()

    def _report_per_a_classifier(a_classifier, caption, report_outname):
        """ @param a_classifier classifier.daily とか classifier.monthly とか
        @param caption 'Daily' など観点名
        @param report_outname レポート内容保存先ファイル名 """

        # trita ファイルと同じディレクトリに保存する
        report_outpdir = os.path.abspath(os.path.dirname(args.input))
        report_outpath = os.path.join(report_outpdir, report_outname)

        formatter = reporting.MarkdownFormatter(filename=report_outpath)

        element_count = len(a_classifier.keys())
        formatter.header(caption, element_count)

        counter = reporting.Counter(a_classifier)
        data_dict = counter.data_dict

        # 降順でパースする
        sorted_keys = sorted(data_dict.keys())
        sorted_keys.reverse()

        for k in sorted_keys:
            classified_key = k
            counted_data = data_dict[k]
            formatter.body(counted_data, classified_key)

        formatter.footer()

        formatter.save()

    def report():
        countee_tasks = []
        for idx,line in enumerate(lines):
            countee_task = reporting.CounteeTask(line)
            if countee_task.is_invalid():
                continue
            countee_tasks.append(countee_task)
        dp('All {} tasks.'.format(len(countee_tasks)))

        classifier = reporting.Classifier(countee_tasks)

        # report 機能はコマンドライン引数をシンプルにしたい＆
        # どうせオレオレ用なので保存ファイル名は決め打ちでいいっす.
        reporting._report_per_a_classifier(classifier.daily, 'Daily', 'report_daily.md')
        reporting._report_per_a_classifier(classifier.monthly, 'Monthly', 'report_monthly.md')
        reporting._report_per_a_classifier(classifier.hourband, 'Hourly', 'report_hourly.md')

    class Formatter:
        def __init__(self, *args, **kwargs):
            pass

        def body(self, counted_data, classifiled_key):
            self._aw_total_min  = counted_data.actual_worktime_total
            self._aw_total_hour = round(self._aw_total_min/60, 1)
            self._aw_avg_min    = round(counted_data.actual_worktime_average, 1)
            self._task_count    = counted_data.task_count

            self._body(classifiled_key)

        def header(self, caption, element_count):
            raise NotImplementedError

        def footer(self):
            raise NotImplementedError

        def _body(self, classifiled_key):
            raise NotImplementedError

        def save(self):
            raise NotImplementedError

    class DebugPrintFormatter(Formatter):
        def __init__(self, *args):
            super().__init__(*args)

            self._lines = []

        def header(self, caption, element_count):
            self._lines.append('[{}]'.format(caption))
            self._lines.append('All {} keys.'.format(element_count))

        def footer(self):
            pass

        def _body(self, classifiled_key):
            line = '{} : {} tasks with Total:{}[M]({}[H]) Avg:{}[M]'.format(
                classifiled_key,
                self._task_count,
                self._aw_total_min,
                self._aw_total_hour,
                self._aw_avg_min
            )
            self._lines.append(line)

        def save(self):
            for line in self._lines:
                dp(line)

    class MarkdownFormatter(Formatter):
        def __init__(self, **kwargs):
            super().__init__(**kwargs)

            try:
                filepath = kwargs['filename']
            except KeyError:
                raise RuntimeError('MarkdownFormatter requires the filepath to save!')

            self._filepath = filepath
            self._lines = []

        def header(self, caption, element_count):
            self._lines.append('# {}'.format(caption))
            self._lines.append('All {} keys.'.format(element_count))
            self._lines.append('')

        def footer(self):
            pass

        def _body(self, classifiled_key):
            line = '- {} : {} Tasks, Total:{}[H], Avg:{}[M]'.format(
                classifiled_key,
                self._task_count,
                self._aw_total_hour,
                self._aw_avg_min
            )
            self._lines.append(line)

        def save(self):
            list2file(self._filepath, self._lines)

    class CountedData():
        def __init__(self):
            self._task_count = 0

            self._actual_worktimes = []

        def plus_task_count(self, count):
            self._task_count += count

        def add_actual_worktime(self, countee_task):
            starttimestr = countee_task._starttime
            endtimestr = countee_task._endtime

            # 作業実績時間は end - start.
            # これを datetime を使って計算する.
            # datetime では year/month/day が必要なのでダミーを使う.

            # 13:25 13:55
            # ^^ ^^ ^^ ^^
            # sh sm eh em

            fixeddate = (2011, 11, 11)
            try:
                starth, startm = int(starttimestr[0:2]), int(starttimestr[3:5])
                endh, endm = int(endtimestr[0:2]), int(endtimestr[3:5])
                dt_start = datetime.datetime(*fixeddate, starth, startm)
                dt_end = datetime.datetime(*fixeddate, endh, endm)
            except ValueError:
                # エラーは出ないと思ってるけど, とりあえず出してみるか.
                dp('actual worktime calcerror at ' + countee_task)
                raise

            delta = dt_end - dt_start
            actual_second = delta.total_seconds()

            # tritask は分単位なので最低でも分で扱う.
            # が, 時単位はでかすぎる(基本的にタスクは粒度が小さいはず)ので
            # 時単位には丸めない.
            actual_minute = int(actual_second/60)

            # 1分未満のタスクはとりあえず 1 分として計算してみる.
            # 細かい定期タスクが多い場合, 0ばかりになっちゃうから.
            if actual_minute==0:
                actual_minute = 1

            self._actual_worktimes.append(actual_minute)

        @property
        def task_count(self):
            return self._task_count

        @property
        def actual_worktime_total(self):
            total = 0
            for t in self._actual_worktimes:
                total += t
            return total

        @property
        def actual_worktime_average(self):
            total = self.actual_worktime_total
            average = total / len(self._actual_worktimes)
            return average

    class Counter():
        #classified_dict = {
        #   "2018/04/07" : [CounteeTask, CounteeTask, ...]
        #   ...
        #}
        #
        #counted_data_with_classified = {
        #   "2018/04/07" : CountedData
        #   ...
        #}
        def __init__(self, classified_dict):
            self._counted_data_with_classified = {}

            for k in classified_dict:
                countee_tasks = classified_dict[k]

                counted_data = reporting.CountedData()
                task_count = len(countee_tasks)

                # タスク数
                counted_data.plus_task_count(task_count)

                # 作業実績時間系
                for countee_task in countee_tasks:
                    counted_data.add_actual_worktime(countee_task)

                self._counted_data_with_classified[k] = counted_data

        @property
        def data_dict(self):
            return self._counted_data_with_classified

    # 日毎, 月毎などの集約を行うクラス.
    # 内部的には各タスクが返した「私はこのキーで分類してください」情報を
    # そのままキーとして辞書に突っ込んでるだけ.
    # (つまり全タスクを分類キー単位で仕分けたい)
    class Classifier():
        def __init__(self, countee_tasks):
            self._d_daily = {}
            self._d_monthly = {}
            self._d_hourband = {}

            for countee_task in countee_tasks:
                key_daily = countee_task.key_daily
                key_monthly = countee_task.key_monthly
                key_hourband = countee_task.key_hourband

                self._smart_append(self._d_daily, key_daily, countee_task)
                self._smart_append(self._d_monthly, key_monthly, countee_task)
                self._smart_append(self._d_hourband, key_hourband, countee_task)

        def _smart_append(self, container, key, value):
            if not key in container:
                container[key] = []
            container[key].append(value)

        @property
        def daily(self):
            return self._d_daily

        @property
        def monthly(self):
            return self._d_monthly

        @property
        def hourband(self):
            return self._d_hourband

    class CounteeTask(Task):
        def __init__(self, *args):
            super().__init__(*args)

            self._is_invalid = False

            # 以下のタスクは集計対象外.
            # - 終了していないタスク
            # - 区切り
            # - インボックス(日付が未定)
            is_not_ended = len(self._endtime.strip())==0
            has_separator = self._description.find(' --') != -1
            is_inbox = len(self._date.strip())==0
            if is_not_ended or has_separator or is_inbox:
                self._is_invalid = True
                return

        def is_invalid(self):
            return self._is_invalid

        # 1 2018/04/27 Fri 13:00 14:01 Task1
        #  ||
        #  VV
        # Daily    : YYYY/MM/DD 2018/04/27
        # Monthly  : YYYY/MM    2018/04
        # Hour     : HH         13

        @property
        def key_daily(self):
            return self._date

        @property
        def key_monthly(self):
            return '/'.join(self._date.split('/')[:2])

        @property
        def key_hourband(self):
            h_str = self._starttime.split(':')[0]
            h_int = int(h_str)
            return '{:02}'.format(h_int)

def __main_from_here__():
    pass

args = parse_arguments()

if args.version:
    open_version_dialog()
    exit(0)

MYDIR = os.path.abspath(os.path.dirname(__file__))
infile = args.input
lines = file2list(infile)

logfile = os.path.join(MYDIR, 'tritask.log')
if not(os.path.exists(logfile)):
    # new file if does not exists.
    list2file(logfile, [])
loglines = file2list(logfile)

# 今日の datetime オブジェクトは生成にそこそこ時間がかかり,
# Task クラス内で毎回つくるとタスク数が多い(例: 1 万件以上)時に待ち時間が増える.
# なので, 起動時に一度だけつくっておいて, これを使い回すようにする.
#
# 使いどころ:
#     頻繁に呼び出される処理(ソート時に呼び出されるポイントなど)
#
# 使わなくてもいいところ:
#     たまに呼び出される処理(レポート機能など)
TODAY_WHEN_EXECUTED, TODAY_WITHOUT_TIME_WHEN_EXECUTED = today_and_today_without_time()

try:
    if args.debug and args.y!=None:
        task = Task(lines[args.y])
        print(task)
        task.print_options()

    if args.report:
        reporting.main()
        exit(0)

    if args.today_dialog_report:
        apply_today_report(lines)
        exit(0)

    if args.selected_range_dialog_report:
        y = args.y
        y2 = args.y2
        if y==None or y2==None:
            ok('Do select lines what you get the report.', NAME)
            exit(0)
        assert_y(y, lines)
        assert_y(y2, lines)
        apply_selected_range_report(lines[y:y2+1])
        exit(0)

    if args.ref:
        y = args.y
        assert_y(y, lines)

        line = lines[y]
        task = Task(line)
        refinfo = task.get_my_reference_name()
        reference_opener(refinfo)
        exit(0)

    if args.walk:
        y = args.y
        y2 = args.y2
        if y2==None:
            y2 = y
        assert_y(y, lines)
        assert_y(y2, lines)
        day = args.day

        for cnt in range(y2-y+1):
            targetidx = cnt + y
            line = lines[targetidx]
            task = Task(line)
            task.walk(day)
            lines[targetidx] = str(task)

        outfile = infile
        list2file(outfile, lines)
        exit(0)

    if args.smartwalk:
        y = args.y
        y2 = args.y2
        if y2==None:
            y2 = y
        assert_y(y, lines)
        assert_y(y2, lines)

        for cnt in range(y2-y+1):
            targetidx = cnt + y
            line = lines[targetidx]
            task = Task(line)
            task.smartwalk()
            lines[targetidx] = str(task)

        outfile = infile
        list2file(outfile, lines)
        exit(0)

    if args.repeat:
        y = args.y
        assert_y(y, lines)

        line = lines[y]
        task = Task(line)
        task.repeat_me()

        lines[y] = str(task)

        outfile = infile
        list2file(outfile, lines)
        exit(0)

    if args.to_today:
        y = args.y
        y2 = args.y2
        if y2==None:
            y2 = y
        assert_y(y, lines)
        assert_y(y2, lines)
        day = args.day

        for cnt in range(y2-y+1):
            targetidx = cnt + y
            line = lines[targetidx]
            task = Task(line)
            task.to_today()
            lines[targetidx] = str(task)

        outfile = infile
        list2file(outfile, lines)
        exit(0)

    if args.use_simple_completion:
        outfile = infile
        apply_simple_completion(lines)
        list2file(outfile, lines)
        exit(0)

    if args.sort:
        outfile = infile

        # before sorting
        # --------------
        apply_holding(lines)
        apply_skipping(lines)
        apply_completion(lines)

        # sorting
        # -------
        lines.sort()

        # after sorthing
        # --------------
        pass

        list2file(outfile, lines)
        exit(0)
except Exception as e:
    if args.raw_error:
        raise
    errmsg = 'Type:{0} Detail:{1}'.format(str(type(e)), str(e))
    creationdate = datetime.datetime.today().strftime('%Y/%m/%d %H:%M:%S')
    logmsg = '{0} {1}'.format(creationdate, errmsg)
    loglines.insert(0, logmsg)
    list2file(logfile, loglines)

    # open logfile with system association.
    os.system('start "" "{0}"'.format(logfile))
    exit(1)
