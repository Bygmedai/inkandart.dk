# Dependency findings — Emerge v0.1

`npm audit` reported three **high** issues, all transitive through `next@15`:

| Advisory | Via | Where it runs | Classification |
|---|---|---|---|
| PostCSS stringify XSS / sourceMappingURL file read | `next` → `postcss` | Next **build** (CSS pipeline). Not on the public request path. | Production tree, build-time. Forced to `postcss@8.5.26` via npm `overrides`. |
| PostCSS path traversal in source maps | same | same | same |
| sharp / libvips CVEs | `next` → `sharp` | Next **image optimizer** (server). We only pass first-party files from `public/`. | Production runtime. Forced to `sharp@0.35.3` via npm `overrides`. |

Upstream “fixAvailable” from audit wanted **Next 16**. That is outside the locked Next 15 stack. Overrides keep Next 15 and lift the vulnerable transitives.

If `npm audit` is still red after overrides, the remaining finding is documented here as **accepted under the Next 15 lock**, not ignored.
