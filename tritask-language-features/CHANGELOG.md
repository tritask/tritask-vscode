# Change Log

## v0.1.0
- Windows, MacOS 双方ともに動作確認
- Add Task 操作を Smart Add の挙動に変更
    - 何もない行で Add Task を行うと, 実行日は今日になる
    - タスク行で Add Task を行うと, そのタスクと同じ実行日が用いられる
        - ここが今回の追加ポイント
        - 従来は常に「実行日 = 今日」だった
- Jump to the top of today todo 操作を追加
    - ソート後などにカーソルが下に吹き飛んだ後も, この操作で一発で戻れる
- MacOS 時に Report today 操作を行うとエラーになる不具合を修正
    - 元々 MacOS に対応していないのに呼び出せていたので, 呼び出されないようにした
- MacOS 時の Completion Date 操作に Ctrl + P のショートカットキーを導入
- (開発) 内部の Tritask エンジンを v1.8.1 → v1.10.1 にアップデート
- (開発) 品質の向上
    - lint と prettier を導入
    - テストコードを導入
    - VSCode API が推奨する Promise の書き方を踏襲

## v0.0.2
- MacOS 10.14(Mojave) での動作をサポート
- 動作要件として `python3` コマンドを必須にする
- :warning: Windowsでは動作未確認

## v0.0.1
- 初版
