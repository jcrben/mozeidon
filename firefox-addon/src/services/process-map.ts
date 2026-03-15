import browser from "webextension-polyfill"
import { Port } from "../models/port"
import { Command } from "../models/command"
import { log } from "../logger"
import { Response } from "../models/response"
import { handleError, delay } from "../utils"

/**
 * Returns a process→tab mapping using Firefox's experimental browser.processes API.
 * Only available in Firefox Nightly (requires "processes" permission in manifest).
 *
 * Output format: [{osPid: number, tabIds: number[]}]
 */
export async function getProcessMap(port: Port, { command: _cmd }: Command) {
  try {
    const proc = (browser as any).processes
    if (!proc || typeof proc.getProcessInfo !== "function") {
      log("browser.processes API not available")
      port.postMessage(
        Response.data({
          error: "browser.processes API not available in this Firefox build",
        })
      )
      await delay(10)
      return port.postMessage(Response.end())
    }

    // -1 means "all processes"
    const processInfo: Record<number, any> = await proc.getProcessInfo(
      [-1],
      false
    )
    log("getProcessInfo returned", Object.keys(processInfo).length, "processes")

    const entries: { osPid: number; tabIds: number[] }[] = []
    for (const [, info] of Object.entries(processInfo)) {
      if (info.type !== "content" && info.type !== "tab") continue
      const tabIds: number[] = (info.tabs ?? [])
        .map((t: any) => t.tabId)
        .filter((id: number) => id >= 0)
      if (tabIds.length === 0) continue
      entries.push({ osPid: info.id, tabIds })
    }

    log("Sending back", entries.length, "process→tab entries")
    port.postMessage(Response.data(entries))
    await delay(10)
    return port.postMessage(Response.end())
  } catch (e) {
    return handleError(e, port)
  }
}
