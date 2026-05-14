---
updated: 2026-05-13
---

# Backlog

## Add integration coverage for process-map flow

The current coverage checks the process-map JSON shape, profile filename PID parsing,
and the pure URL-to-tab correlation helper in the Firefox add-on. It does not verify
the full browser-to-CLI flow.

Next useful coverage:

- Add an IPC-level test for `ProcessMapGet` / `ProcessMapJson` with a fake browser
  service response, so malformed payloads and browser errors are covered without
  calling `os.Exit` from a goroutine.
- Run the Firefox add-on in a temporary Firefox Nightly / Developer Edition profile
  with the `procInfo` experiment enabled.
- Verify the `tabs process-map` CLI command returns OS PID to tab ID mappings for
  real tabs.
- Cover the missing-experiment path to make sure users get a clear error when the
  add-on is loaded without experiment privileges.
