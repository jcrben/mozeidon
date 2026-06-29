# Testing the Firefox addon

The addon talks to the native messaging host, so testing it needs a running Firefox with
the addon loaded and the host registered. To avoid polluting your real browser profile —
or leaving stray test profiles behind — test in an **ephemeral profile**.

## Quick approach — `web-ext`

[Mozilla's `web-ext`](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/)
creates and destroys its own temporary profile and loads the addon as a temporary extension:

```bash
cd firefox-addon
npm install && npm run build       # produces the built artifact
web-ext run --source-dir=dist      # temp profile, auto-removed on exit
```

## Manual approach — disposable profile

```bash
TMP=$(mktemp -d)
firefox --no-remote --profile "$TMP"
#   then either: about:debugging → "This Firefox" → Load Temporary Add-on (pick the xpi),
#   or seed the xpi into "$TMP/extensions/" before launch and set
#   extensions.autoDisableScopes=0 so it auto-enables.
rm -rf "$TMP"                       # teardown
```

The native messaging host is registered globally per user
(`~/.mozilla/native-messaging-hosts/<host>.json` on Linux), so a throwaway profile reaches
it with no extra setup.

## Rules of thumb — keep test profiles junk-free

- **Ephemeral** — use a temp profile and delete it; don't create persistent named profiles.
- **Never sign a test profile into Firefox Sync** — it pulls down your real bookmarks/logins
  and entangles your account.
- **Never "Set as default browser"** for a test profile — on Linux this can generate stray
  `.desktop` handler files that linger.
