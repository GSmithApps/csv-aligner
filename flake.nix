{
  description = "Development environment with vsce and Node.js 20";
  inputs.nixpkgs.url = "github:NixOS/nixpkgs";
  outputs = { self, nixpkgs }: 
    let
      system = "x86_64-linux";  # or "x86_64-darwin" for macOS, etc.
      pkgs = nixpkgs.legacyPackages.${system};
    in {
      devShells.${system}.default = pkgs.mkShell {
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
    };
}