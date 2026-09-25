# Portfolio media after moving off Replit

The 39 images, case-study media files, and video thumbnails migrated from
Replit App Storage are stored in `artifacts/portfolio/public/media/uploads/`.
Their original bytes were compared with Replit Object Storage using file size
and MD5 before the Neon `studio_images.image_path`,
`case_study_media.media_path`, and `videos.thumbnail_path` references were
changed to `/media/uploads/<uuid>.<extension>`. The portfolio's Vite build
copies `public/media` into `dist/public/media`, which Vercel serves directly.
The existing API returns these paths without modification, and the portfolio
already renders ordinary URLs as-is.

When deploying to Vercel, deploy the portfolio from `artifacts/portfolio`,
including the tracked `public/media` files. `vercel.json` proxies `/api/*` to
the Render API; update that rewrite if the Render service address changes.
Do not remove these files unless the Neon references have first been moved to
another durable host. After deploying both the Render API and Vercel site,
check `/api/images`,
`/api/videos`, and `/api/case-studies/<slug>/media` on the site and request a
sample (or all) of their `/media/uploads/` paths; they should respond with
image content, not HTML or an API error.

**Future uploads are not migrated.** The existing upload URL endpoint still
uses the Replit Object Storage sidecar. On Render, new uploads require a
separate external storage provider and an updated upload service. Existing
migrated media does not depend on that endpoint. Do not remove the Replit
storage data until any later uploads have also been moved.