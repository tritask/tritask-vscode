# tritask-vscode
VSCode 版 Tritask です。

![190818_tritask-vscode-demo](https://user-images.githubusercontent.com/23325839/63220639-2e3e5380-c1c7-11e9-8404-ee610bd7672f.gif)

## システム要件
- Visual Studio Code
- Windows 7+
- Python 3.6+

MacOS 10.14(Mojave) でも一部開発は行っていましたが、たぶん動きません。

また内蔵コマンド(helper.py)が Python 製なので Python も必須です。

## ディレクトリ構成について
シンタックスハイライトをつかさどる tritask-basics と、各種操作をつかさどる tritask-language-features があります。

## バージョン管理について
- master ブランチが安定しているとは限りません
- 区切りの良いバージョンはタグを切ってリリースしています

## インストール
- 1: tritask-basics の vsix ファイルを VSCode にインストールする
- 2: tritask-basics の settings.json を、あなたの settings.json に追記する
  - **これをしないと .trita ファイルの中身がハイライトされません**
- 3: tritask-language-features の vsix ファイルを VSCode にインストールする

vsix ファイルのインストールは Command Palette > Install from VSIX あるいは `code --install-extension xxxxx.vsix` にて行なえます。

インストールが完了すると、以下のように Tritask syntax と Tritask command の二つが enabled になります。

![190818_tritask_extension_found](https://user-images.githubusercontent.com/23325839/63220650-56c64d80-c1c7-11e9-953d-290dc3dbe70b.JPG)

## 使い方
.trita ファイルを開くと、シンタックスハイライトが効いているはずです。また .trita ファイル内に限り、各操作が有効になっています。以下方法より呼び出せます。

- editor/context(エディタ上での右クリックメニュー)
- Command palette(Ctrl + Shift + P) > `tritask` で検索
- Key bindings(キーボードショートカット)

以下は editor/context のスクショです。

![190818_tritask_extension_editorcontext](https://user-images.githubusercontent.com/23325839/63220641-34cccb00-c1c7-11e9-9cc6-8b3e7ed0db75.JPG)

## License
[MIT license](LICENSE)

## Author
[stakiran](https://github.com/stakiran)

