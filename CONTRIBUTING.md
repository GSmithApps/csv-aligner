Please contribute! We have some [open issues](https://github.com/GSmithApps/csv-aligner/issues).

# Setup

## npm packages

- **package.json**: run `npm install`

## Global Packages

- **node**: need this to run things.
- **vsce**: need this to package and push to vs code market.

You can just install
the two globally, or you can use nix and direnv.
This is done with **flake.nix** and **.envrc**.

# Viewing Docs

You can see the docs if you open docs/index.html.
If you updated something and want to regenerate the docs, you
can run `npm run doc`.

# Running/Debugging

Just go to the vscode run/debug menu and click the play button.
It will open a new window, and in that window, you can open a csv.
Note that you may need to add the following to your user settings json,
as mentioned in the README

```json
"[csv]": {
  "editor.inlayHints.maximumLength": 0
}
```

# Running tests

There's one test, and it came with the extension when the vs-code
tooling gave me the initial code. I don't really know how to run it,
but I think it's some sort of integration test.

# Making Changes

1. Update the changelog in README.md.
2. Update the version in package.json.
3. Push a tag, as described below.

# CICD

The code is packaged and pushed to the marketplace
using github actions. The workflow is in **.github/workflows/main.yml**.

To do this, just push a tag to the repo
with `vX.X.X` and the github action will
run the tests, package the extension, and push it to the marketplace.

# Links

- https://marketplace.visualstudio.com/manage/publishers/grantsmith
- https://dev.azure.com/14gsmith14/

# In Progress

- If I remember right, I think I was wanting to make the helpers folder
  into an npm package, so rainbow CSV could use it too. And I think
  that's why I didn't want to use the vs code extension in there... cuz
  if it's an npm package, I didn't really want to depend on vscode
- The thing I really need to do is get constant.csv to render
  properly. There's [an active github issue](https://github.com/GSmithApps/csv-aligner/issues/5)
  about it. See **Why wide files lose their hints** below -- we think we
  found the cause, but haven't picked a fix yet.

# Why wide files lose their hints

This is the constant.csv problem, and it's very likely what
[issue #5](https://github.com/GSmithApps/csv-aligner/issues/5) is about.
Writing down what we found so it isn't lost.

## The symptom

Open **src/test/test-csvs/constant.csv** (87 columns). The top ten-ish
lines get their hints and line up fine. Every line below that has no hints
at all. Scroll down and the new top ten-ish lines are fine again, and
everything under them is bare. Narrower files like train.csv (12 columns)
are unaffected.

## The cause

VS Code refuses to draw more than 1500 inlay hint decorations, and when it
hits that number it stops without saying anything. It's in
`InlayHintsController`, which you can read in the copy of vscode that the
test tooling downloads:

```
.vscode-test/vscode-linux-*/resources/app/out/vs/workbench/workbench.desktop.main.js
```

Search it for `_MAX_DECORATORS`:

```js
static { this._MAX_DECORATORS = 1500 }
// ...and in the render loop:
if (i.length > cD._MAX_DECORATORS) break
```

It's a hard-coded static on the class, so no setting turns it up.

We emit one hint per cell of the buffered visible range. For constant.csv
that's 87 columns times 51 rows (41 visible plus the buffer above and
below), which is **4437 hints against a cap of 1500** -- nearly 300% of the
budget. Since it's a `break` over the hints in document order, the top
1500 / 87 = about 17 rows get drawn and the rest are thrown away. That's
also why scrolling seems to fix the top: each render starts counting from
the top of the range again, so the top rows always win the budget and the
lower ones never do.

Roughly how many rows can be aligned before the cap bites:

| columns | rows that fit |
| ------- | ------------- |
| 3       | 500           |
| 12      | 125           |
| 20      | 75            |
| 40      | 37            |
| 87      | 17            |

train.csv is 12 columns and 612 hints, comfortably under, which is why it
looks fine.

## Things this is NOT

- **Not** the whole-document column width work (v0.3.3-ish). The number of
  hints is the same either way -- constant.csv produces 4437 hints whether
  the widths come from the visible window or from the whole document, so
  this predates that change.
- **Not** `editor.inlayHints.maximumLength`. That's a real second limit in
  the same render loop, and its vscode default of 43 characters would
  wreck constant.csv (which averages 2833 padding characters per line), but
  it was verified set to 0 while reproducing this. Still worth ruling out
  first on any new report, since it's easy to forget.

## Why the obvious fix isn't available

The natural answer is "only draw hints for the columns actually on screen"
-- with 87 columns you can only ever see a dozen or so at once. The
extension API won't tell us. `TextEditor.visibleRanges` says so directly in
vscode.d.ts:

> The current visible ranges in the editor (vertically). This accounts only
> for vertical scrolling, and not for horizontal scrolling.

There's no `scrollLeft` or equivalent anywhere in the API. So the hint
budget has to be spent without knowing which columns the user is looking
at.

## Possible fixes, and what they cost

1. **Budget by column instead of by row.** Emit hints for the first K
   columns of every visible row, where K is about 1500 / visible-rows (~29
   of 87 for constant.csv). Every visible row then gets the same treatment
   and the far-right columns are never aligned, instead of the current
   "top rows perfect, everything below raw". Same budget, much steadier
   result. This is the most promising option.
2. **Emit fewer hints, no behavior trade-off.** Stop generating hints for
   the `BUFFER_LINES_ABOVE`/`BELOW` rows (51 rows drops to 41) and skip
   hints whose label is empty, which happens when a cell is already at its
   column's full width (173 of the 4437 here, and they draw nothing
   anyway). Together that's roughly a quarter fewer hints -- enough to fix
   files up to about 35 columns, not enough for 87.
3. **Do 2, then 1.** The savings from 2 raise K, so more columns stay
   aligned.
4. **Leave it and document the ceiling**, which is where we are now.

Whatever gets picked, note that the failure is silent: nothing logs, and
the provider's return value looks perfectly correct. The only way to see it
is to count the hints you're returning and compare against 1500.
