# src folder

## Map/Directory

I believe the main extension is in extension.ts, and it
just calls out to the code in the other files.
In particular, the helpers folder and the csvParser.ts file.

csvParser.ts does not use any of the helpers -- those are only
used by extension.ts.