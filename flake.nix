{
  description = "Dev environment for CSV aligner VSCode extension";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs";
  };

  outputs = { self, nixpkgs }: {
    devShell = nixpkgs.lib.mkShell {
      buildInputs = [
        nixpkgs.vsce
        nixpkgs.nodejs_20
      ];
    };
  };
}
