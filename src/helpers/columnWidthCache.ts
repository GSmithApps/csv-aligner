/**
 * A tiny per-document cache for the whole-file column widths.
 *
 * Scanning the whole document is cheap, but it happens on every single
 * `provideInlayHints` call, which means every scroll event. Since the answer
 * can only change when the document changes, we hang on to it and key it by
 * the document's version, which vscode bumps on every edit.
 *
 * Note that this stores the widths, not the text -- a `number[]` per open
 * document, so it stays small no matter how big the csvs are.
 *
 * @packageDocumentation
 */

/**
 * The widths for one document, along with the version they were computed
 * from and the delimiter they were computed with.
 */
export interface CachedColumnWidths {
  /**
   * The `vscode.TextDocument.version` these widths came from. If the
   * document has moved on, the entry is stale.
   */
  version: number;
  delimiter: string;
  widths: number[];
}

/**
 * Caches whole-document column widths, keyed by document.
 *
 * This is deliberately free of any `vscode` imports -- it takes a plain
 * string key and a plain version number -- so it can be tested directly and
 * can travel with the other helpers if they ever become an npm package.
 */
export class ColumnWidthCache {
  private readonly entries = new Map<string, CachedColumnWidths>();

  /**
   * Look up the widths for a document.
   * @param key identifies the document, e.g. its uri as a string
   * @param version the document's current version
   * @returns the cached widths, or undefined if we have nothing for this
   * document or what we have is out of date
   */
  get(key: string, version: number): CachedColumnWidths | undefined {
    const entry = this.entries.get(key);

    if (entry === undefined || entry.version !== version) {
      return undefined;
    }

    return entry;
  }

  /**
   * Remember the widths for a document, replacing any older entry for it.
   */
  set(key: string, entry: CachedColumnWidths): void {
    this.entries.set(key, entry);
  }

  /**
   * Drop a document, for when it gets closed and we'd otherwise hold onto
   * its widths forever.
   */
  forget(key: string): void {
    this.entries.delete(key);
  }

  /**
   * How many documents we're currently holding widths for. Mostly here so
   * tests can check we aren't leaking.
   */
  get size(): number {
    return this.entries.size;
  }
}
