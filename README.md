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

## Known Issues

Doesn't work with csvs that have:

- need to tell users to change their editor inlay hint length setting
  to zero
  - or make an overriding setting
- [x] We think that vs code is truncating the inlay hints
  to a max of like 44 characters per line.
  - this is actually fixed in the upcoming vs code release in October 2024.
    See issue [205708](https://github.com/microsoft/vscode/issues/205708).
- commas in the data
- newlines in the data
- delimiters other than commas

## Release Notes

### 0.0.5

learned that vscode October 2024 release fixes things


## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something.


