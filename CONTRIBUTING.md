Please contribute! We have some [open issues](https://github.com/GSmithApps/csv-aligner/issues).

# Setup

## npm packages

- **package.json**: run `npm install`

## Global Packages

- **node**: need this to run things.
- **vsce**: need this to package and push to vs code market.

You can just install
the two globally, or you can use nix and direnv.
This is done with **shell.nix** and **.envrc**.

# CICD

The code is packaged and pushed to the marketplace
using github actions. The workflow is in **.github/workflows/main.yml**.

To do this, just push a tag to the repo
with `vX.X.X` and the github action will
run the tests, package the extension, and push it to the marketplace.