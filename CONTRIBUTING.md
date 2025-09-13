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