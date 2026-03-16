"use strict";

/**
 * WebExtension Experiment: procInfo
 *
 * Calls ChromeUtils.requestProcInfo() (the same API used by about:processes)
 * and returns {osPid, urls} for each Firefox content process.
 *
 * The TypeScript service layer matches these URLs against browser.tabs.query()
 * to produce the final osPid → tabId mapping.
 *
 * Only works in Firefox Nightly / Developer Edition (unsigned extensions).
 */
this.procInfo = class extends ExtensionAPI {
  getAPI(context) {
    return {
      procInfo: {
        async getProcessMap() {
          try {
            const procData = await ChromeUtils.requestProcInfo();

            const entries = [];
            for (const child of procData.children || []) {
              // Only care about web content processes (webIsolated for site-isolated tabs)
              const webTypes = new Set(["web", "tab", "webIsolated"]);
              if (!webTypes.has(child.type)) continue;

              const urls = [];
              for (const win of child.windows || []) {
                const spec = win.documentURI?.spec;
                if (spec && spec !== "about:blank" && spec !== "about:newtab") {
                  urls.push(spec);
                }
              }

              if (urls.length > 0) {
                entries.push({ osPid: child.pid, urls });
              }
            }

            return entries;
          } catch (e) {
            return { error: String(e) };
          }
        },
      },
    };
  }
};
