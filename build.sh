DIST_FOLDER_NAME=tritask-vscode
thisdir=`dirname 0`

echo [1/2] compiling with vsce...

pushd $thisdir/tritask-basics
vsce package -o ../tritask-syntax.vsix
popd

pushd $thisdir/tritask-language-features
vsce package -o ../tritask-command.vsix
popd

echo [2/2] distributing to the folder '$DIST_FOLDER_NAME'...

mkdir $thisdir/$DIST_FOLDER_NAME
cp "$thisdir/tritask-syntax.vsix" "$thisdir/$DIST_FOLDER_NAME"
cp "$thisdir/tritask-command.vsix" "$thisdir/$DIST_FOLDER_NAME"
cp "$thisdir/README.md" "$thisdir/$DIST_FOLDER_NAME"
cp "$thisdir/tritask-basics/settings.json" "$thisdir/$DIST_FOLDER_NAME/settings-for-tritask-syntax.json"
cp "$thisdir/tritask-basics/CHANGELOG.md" "$thisdir/$DIST_FOLDER_NAME/CHANGELOG-tritask-syntax.md"
cp "$thisdir/tritask-language-features/CHANGELOG.md" "$thisdir/$DIST_FOLDER_NAME/CHANGELOG-tritask-command.md"

echo Build Fin.
