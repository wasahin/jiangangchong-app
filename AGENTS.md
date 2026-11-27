<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

- Legacy Cloudflare Pages Functions live in `src/server/legacy/*` and are exposed via thin server routes under `src/routes/api/public/*`; they read config from `process.env` — keeps original Feishu/staff-token logic intact.
- tsconfig strict-index flags are relaxed because the imported app code was written without them.
- Self-host target is Cloudflare Pages: CI builds with `NITRO_PRESET=cloudflare_pages` (honored only outside the Lovable sandbox) and deploys `dist/` via `wrangler pages deploy`; vite.config stays untouched so Lovable preview/publish keep working.
- CI uses bun (`bun install --frozen-lockfile`) because the repo only has bun.lock.
- Secrets only via `wrangler pages secret put`; wrangler.jsonc `vars` hold public Feishu ids, pointed at the TEST table until the owner approves the switch.
- **Read `HANDOVER.md` before making changes.** It has the full status: what is already
  done (deployment is live at https://jiangangchong-app-v2.pages.dev, all 253 acceptance
  assertions green), the frozen constraints, the Feishu TEST table ids, the two-repo
  secret layout, and how to run the `verify/` suite.
- `verify/` is the acceptance suite (85 static contract + 132 mobile + 23 room E2E +
  13 live). Run `cd verify && npm install && npm run contract` after every change; it
  takes seconds and needs no network.
