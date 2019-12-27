# tritask-vscode
VSCode 版 Tritask です。

![190818_tritask-vscode-demo](https://user-images.githubusercontent.com/23325839/63220639-2e3e5380-c1c7-11e9-8404-ee610bd7672f.gif)

## システム要件
- Visual Studio Code
- Windows 7+ あるいは MacOS 10.14(Mojave)+
- Python 3.6+
  - 内蔵コマンド(helper.py)が Python 製なので Python も必要です
  - :warning: `python3` コマンドで Python 3.x を呼び出せる必要があります

## インストール
tritask-vscode は以下から構成されます。

- シンタックスハイライトをつかさどる tritask-basics
- 各種操作をつかさどる tritask-language-features

tritask-vscode のインストールには上記二点のインストールが必要です。

手順:

- 1: tritask-basics の vsix ファイルを VSCode にインストールする
- 2: tritask-basics の settings.json を、あなたの settings.json に追記する
  - **これをしないと .trita ファイルの中身がハイライトされません**
- 3: tritask-language-features の vsix ファイルを VSCode にインストールする

なお、vsix ファイルのインストールは Command Palette > Install from VSIX あるいは `code --install-extension xxxxx.vsix` にて行なえます。

インストールが完了すると、以下のように Tritask syntax と Tritask command の二つが enabled になります。

![190818_tritask_extension_found](https://user-images.githubusercontent.com/23325839/63220650-56c64d80-c1c7-11e9-953d-290dc3dbe70b.JPG)

## 使い方
.trita ファイルを開くと、シンタックスハイライトが効いているはずです。また .trita ファイル内に限り、各操作が有効になっています。以下方法より呼び出せます。

- editor/context(エディタ上での右クリックメニュー)
- Command palette(Ctrl + Shift + P) > `tritask` で検索
- Key bindings(キーボードショートカット)

以下は editor/context のスクショです。

![190818_tritask_extension_editorcontext](https://user-images.githubusercontent.com/23325839/63220641-34cccb00-c1c7-11e9-9cc6-8b3e7ed0db75.JPG)

## 開発者向け情報
VSCode による拡張機能開発については公式サイト、あるいは本ツール開発時に書いた以下記事を参照ください。

- [ざっくりとイメージをつかむための Visual Studio Code 拡張機能開発入門 - Qiita](https://qiita.com/sta/items/979f6d6eafcc74f01723#%E3%83%91%E3%83%83%E3%82%B1%E3%83%BC%E3%82%B8%E3%83%B3%E3%82%B0)

### 必要な環境
- Node.js
- npm
- `npm install -g yo` と `npm install -g generator-code`
- (パッケージングがしたいなら) `npm install -g vsce`

### ディレクトリ構成について
シンタックスハイライトをつかさどる tritask-basics と、メニュー表示やタスク操作など各種操作をつかさどる tritask-language-features があります。

各々が VSCode 拡張機能開発用のプロジェクト(`yo code` で生成したもの)になっています。

### バージョン管理について
- :warning: **master ブランチが安定しているとは限りません**
- 区切りの良いバージョンはタグを切ってリリースしています

### 開発を始める
tritask-language-features の開発を行う例です。

```
$ git clone https://github.com/tritask/tritask-vscode
$ cd tritask-vscode
$ cd tritask-language-features
$ npm install
```

### ビルド(パッケージング)する
tritask-language-features のビルドを行う例です。

ビルドといっても vsce を用いてパッケージングを行うだけです。

```
$ cd tritask-language-features
$ vsce package
$ ls *.vsix
tritask-language-features-0.0.1.vsix
```

### テストする
まだテストコードはありません。

### デバッグする
各種操作をつかさどる tritask-language-features のデバッグ方法についてです。

- 1: .trita ファイルを適当に準備する
- 2: シンタックスハイライト(tritask-basics のインストールと settings.json への記入) を行なっておく
  - これしないと .trita ファイルがシンタックスハイライトされず読みづらいです
- 3: tritask-language-features を VSCode で開き、F5 キーでデバッグ実行する

デバッグ実行を開始すると、VSCode のウィンドウが新たに立ち上がるので、そのウィンドウで .trita ファイルを開きます。あとは試したい操作などを試します。

## License
[MIT license](LICENSE)

## Author
[stakiran](https://github.com/stakiran)

