⚠️ **Warning! This extension needs the October 2024 VSCode release.** ⚠️ 

This is an extension for vscode that uses the inlay hints to
render csvs as columns.  For example: a csv like

![git](csv-aligner1.gif)

A CSV like this:

```csv
grant,murphy,whaddup,1234,dog
d-train,mochi,hi,1,kitten
```

Would be rendered like this:

```csv
grant  ,murphy,whaddup,1234,dog
d-train,mochi ,hi     ,1   ,kitten
```

> Tip: We recommend that this is used with the rainbow csv extension, which will color the columns.

## Known Issues

- need to tell users to change their editor inlay hint length setting
  to zero
  - or make an overriding setting
- [x] We think that vs code is truncating the inlay hints
  to a max of like 44 characters per line.
  - this is actually fixed in the upcoming vs code release in October 2024.
    See issue [205708](https://github.com/microsoft/vscode/issues/205708).
- use a CSV parser. This will fix the following:
  - It currently doesn't handle commas in the data.
  - It currently doesn't handle newlines in the data.
- delimiters other than commas

## Release Notes

### 0.0.5

Learned that VSCode October 2024 release fixes things. See issue [205708](https://github.com/microsoft/vscode/issues/205708).


## Support

If you like CSV Aligner, please consider paying
it forward by taking a pledge at [Giving What We Can](https://www.givingwhatwecan.org/pledge?c=header)
or donating to [GiveWell](https://secure.givewell.org).

Or you support me directly at PayPal 😄 [![PayPal](https://img.shields.io/badge/PayPal-GSmithApps-00457C?style=plastic&logo=paypal&logoColor=white)](https://paypal.me/GSmithApps?country.x=US&locale.x=en_US)