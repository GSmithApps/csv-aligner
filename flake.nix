{
  description = "Development environment with vsce and Node.js 20";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let pkgs = nixpkgs.legacyPackages.${system};
      in {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            vsce
            nodejs_20
          ];
          shellHook = ''
            echo "Welcome to the CSV-aligner development environment!"
            echo "Node.js version: $(node --version)"
            echo "vsce version: $(vsce --version)"
          '';
        };
      }
    );
}
