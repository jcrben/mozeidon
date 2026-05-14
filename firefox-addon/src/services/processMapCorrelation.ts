export type RawProcessEntry = { osPid: number; urls?: string[] }

/**
 * Correlate procInfo OS PIDs with WebExtension tab IDs using exact URL matches.
 * Pure helper (no browser globals) — covered by unit tests.
 */
export function correlateProcessEntriesToTabIds(
  rawEntries: RawProcessEntry[],
  urlToTabId: Map<string, number>
): { osPid: number; tabIds: number[] }[] {
  const entries: { osPid: number; tabIds: number[] }[] = []
  for (const entry of rawEntries) {
    const tabIds: number[] = []
    for (const url of entry.urls ?? []) {
      const tabId = urlToTabId.get(url)
      if (tabId != null) tabIds.push(tabId)
    }
    if (tabIds.length > 0) {
      entries.push({ osPid: entry.osPid, tabIds })
    }
  }
  return entries
}
