---
name: Portfolio media portability
description: Deployment boundary for historical portfolio media and future user uploads.
---

Historical portfolio media was intentionally bundled as static website assets rather than moving to a new storage provider.

**Why:** The existing set was small enough to ship with the site, while the Replit storage API relies on a Replit-only sidecar and the external Render/Vercel deployment has no independent object-store credentials. Bundling verified copies makes the historical media readable without a new service.

**How to apply:** Keep historical static assets and their database references in sync during website deployments. Do not assume this handles new uploads: replace the upload signing and serving service with external persistent storage before retiring Replit or expecting admin uploads to work on Render. Check that the media assets were merged to the deploy branch, not just that the API proxy was deployed.