# tritask-language-features
VSCode 版 Tritask の拡張機能です。

事前に tritask-basics のインストールが必要です。

## 開発を始める

```
$ git clone https://github.com/tritask/tritask-vscode
$ cd tritask-vscode
$ cd tritask-language-features
$ npm install
$ code .
```

### Debug
事前準備:

- 1: .trita ファイルを適当に準備する
- 2: シンタックスハイライト(tritask-basics のインストールと settings.json への記入) を行っておく
    - これしないと .trita ファイルがシンタックスハイライトされず読みづらいです

デバッグ:

- 1: デバッグペインから Run Extension を選ぶ
- 2: F5 キーで実行する

実行すると VSCode のウィンドウが新たに立ち上がるので、そのウィンドウで .trita ファイルを開きます。

### Test
unittest コードがあります。

- 1: デバッグペインから Extension Tests を選ぶ
- 2: F5 キーで実行する

実行すると VSCode のウィンドウが立ち上がり、テストが実行され、終わったら自動で閉じてから OUTPUT にテスト結果を表示します。

### Build
ルートの README を見てください。

### Lint

```
$ npm run lint
```

### Pretty source

```
$ npm run pretty 
```

## Author
[stakiran](https://github.com/stakiran)
