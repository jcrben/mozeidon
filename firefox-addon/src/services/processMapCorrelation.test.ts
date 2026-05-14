import { describe, expect, it } from "vitest"
import { correlateProcessEntriesToTabIds } from "./processMapCorrelation"

describe("correlateProcessEntriesToTabIds", () => {
  it("maps URLs to tab ids and drops processes with no tab matches", () => {
    const urlToTabId = new Map<string, number>([
      ["https://a.example/", 1],
      ["https://b.example/", 2],
    ])
    const raw = [
      { osPid: 10, urls: ["https://a.example/", "https://unknown/"] },
      { osPid: 20, urls: [] },
      { osPid: 30, urls: ["https://b.example/"] },
    ]
    expect(correlateProcessEntriesToTabIds(raw, urlToTabId)).toEqual([
      { osPid: 10, tabIds: [1] },
      { osPid: 30, tabIds: [2] },
    ])
  })

  it("returns empty list for empty input", () => {
    expect(correlateProcessEntriesToTabIds([], new Map())).toEqual([])
  })
})
