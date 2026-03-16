import browser from "webextension-polyfill"
import { Port } from "../models/port"
import { Command } from "../models/command"
import { log } from "../logger"
import { Response } from "../models/response"
import { handleError, delay } from "../utils"

/**
 * Returns a process→tab mapping using the procInfo WebExtension Experiment.
 *
 * The experiment calls ChromeUtils.requestProcInfo() (same API as about:processes)
 * which returns OS PIDs + window URLs for each content process. We then correlate
 * those URLs with browser.tabs.query() to get WebExtension tab IDs.
 *
 * Only works in Firefox Nightly / Developer Edition.
 *
 * Output format: [{osPid: number, tabIds: number[]}]
 */
export async function getProcessMap(port: Port, { command: _cmd }: Command) {
  try {
    // Access procInfo via globalThis.browser (the native Firefox API), not the
    // webextension-polyfill wrapper, since the polyfill only proxies standard
    // WebExtension APIs and does not forward custom experiment_apis like procInfo.
    // Access procInfo via globalThis.browser (the native Firefox API), not the
    // webextension-polyfill wrapper, since the polyfill only proxies standard
    // WebExtension APIs and does not forward custom experiment_apis like procInfo.
    // NOTE: the extension must be loaded as a temporary add-on (via web-ext run)
    // for Firefox to grant experiment_apis privileges. Side-loaded XPIs are not
    // treated as privileged and will silently omit experiment APIs.
    const proc = ((globalThis as any).browser ?? (browser as any)).procInfo
    if (!proc || typeof proc.getProcessMap !== "function") {
      log("procInfo experiment API not available")
      port.postMessage(
        Response.data({
          error:
            "procInfo experiment not available — is the extension loaded in Firefox Nightly via web-ext?",
        })
      )
      await delay(10)
      return port.postMessage(Response.end())
    }

    // Get {osPid, urls[]} from the experiment
    const rawEntries = await proc.getProcessMap()

    if (!Array.isArray(rawEntries)) {
      log("procInfo.getProcessMap returned non-array:", rawEntries)
      port.postMessage(
        Response.data({
          error: rawEntries?.error ?? "unexpected response from experiment",
        })
      )
      await delay(10)
      return port.postMessage(Response.end())
    }

    // Build URL → tab ID map from browser.tabs.query()
    const allTabs = await browser.tabs.query({})
    const urlToTabId = new Map<string, number>()
    for (const tab of allTabs) {
      if (tab.url && tab.id != null) {
        urlToTabId.set(tab.url, tab.id)
      }
    }

    // Correlate process URLs with tab IDs
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

    log("Sending back", entries.length, "process→tab entries")
    port.postMessage(Response.data(entries))
    await delay(10)
    return port.postMessage(Response.end())
  } catch (e) {
    return handleError(e, port)
  }
}
