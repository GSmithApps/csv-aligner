{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.vsce
    pkgs.nodejs_20
  ];
}

