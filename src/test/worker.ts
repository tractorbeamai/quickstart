// The Worker that tests run inside. wrangler.jsonc's `main` is TanStack
// Start's virtual server entry, which only resolves inside the app's Vite
// build (cloudflare/workers-sdk#14937), so tests import app modules directly.
export default {} satisfies ExportedHandler;
