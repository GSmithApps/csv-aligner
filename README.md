This is an extension for vscode that uses the inlay hints to
render csvs as columns.  For example, a csv like

```csv
dog,1234,murphy
cat,123,samosa
elephant,4,jumbo
```

would be rendered as

```csv
dog     ,1234,murphy
cat     ,123 ,samosa
elephant,4   ,jumbo
```


![git](csv-aligner1.gif)

> Tip: We recommend that this is used with the rainbow csv extension, which will color the columns.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something.

## Known Issues

Doesn't work with csvs that have:

- commas in the data
- newlines in the data
- delimiters other than commas

## Release Notes

### 1.0.0

Initial release!!
