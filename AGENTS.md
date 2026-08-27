# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

**Start every task at the recipe index** — `../start-technologies/projects/start-sdk/docs/src/recipes.md`
(or <https://docs.start9.com/packaging/recipes.html>). It maps an intent ("prompt the user to create
admin credentials", "expose a web UI") to the constructs, the reference pages, and a named production
package to copy. Find the recipe before you read this package's neighbours: a package you reach by
grepping may be non-conformant, and the recipe outranks it.

Freshly scaffolded? Work the
[New Package Checklist](../start-technologies/projects/start-sdk/docs/src/new-package-checklist.md)
(or <https://docs.start9.com/packaging/new-package-checklist.html>) from top to bottom. It is a
guide page, not a file in this repo — read it, don't copy it in.

Keep `README.md` (technical reference for an AI support or administering agent) and
`instructions.md` (end-user docs) in sync with your changes.

**Fix a defect you spot rather than reporting it** — you have the package open and the
context to be sure. File **a GitHub issue on this repo** only when the call isn't yours to
make: you can't pin the cause down, two defensible fixes exist, or it's too large to ride on
the work in hand. An open issue is a report, not a queue — implement one when you're asked
to or when it's labelled `Approved`, then close it with `Closes #<n>`.

Don't record work in the repo instead: no `TODO.md`, no `NOTES.md`, no `PLAN.md`. What you
verified, tried, and decided belongs in the commit message and the PR body.

## This repo

- **`runAsInit` on the `openserp` daemon is load-bearing.** OpenSERP does not reap the Chromium processes it spawns; making it PID 1 of its own namespace lets the kernel tear them down when it exits. This is the cleanup upstream gets from Compose's `init: true`.
- **The auth gate is StartOS's, not OpenSERP's.** Upstream ships no login, so `setupInterfaces` attaches `addSsl.auth` to both bindings. It rides the TLS variant only — the plaintext bridge address stays open so a sibling service needs no credential. Don't "fix" that asymmetry; it is what makes service-to-service work.
- **The `mcp` image is built from `mcp/`, not pulled.** Its dependency graph is pinned by `mcp/package-lock.json`, so a version bump there means regenerating the lock, not editing `package.json` alone.
