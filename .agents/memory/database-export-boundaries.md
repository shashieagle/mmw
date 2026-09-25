---
name: Database export boundaries
description: Caveat when transferring Replit production SQL results into an external PostgreSQL database.
---

Replit's production SQL query output is formatted text, not a raw scalar transport. A long base64 result may be CSV-quoted and contain embedded line breaks. Treat export results as serialized data: validate and decode them before importing, then compare imported rows with the source and commit atomically.

**Why:** Assuming a query's returned payload was a single unquoted line caused an export validation failure even though the underlying result was complete.

**How to apply:** For future cross-database transfers using the Replit production read-only query interface, verify the returned format and imported row equality rather than relying solely on counts. Keep temporary data exports outside the tracked repository and remove them afterward.