# Specification

## Summary
**Goal:** Refresh the site footer tagline and enhance service category browsing by showing a cartoon occupation image per category.

**Planned changes:**
- Update the footer to display exactly: "© 2026 - Crafted with care" and remove the existing “Built with love using caffeine.ai” wording, heart icon, and caffeine.ai link across all supported languages.
- Add one cartoon-style occupation image per existing service category (plumber, electrician, mason, house-cleaner, garden-cleaner, carpenter, painter, mechanic, other) as static assets under `frontend/public/assets/generated`.
- Update the service category cards/grid UI to display the correct per-category cartoon image loaded from `/assets/generated/*` while keeping the layout responsive.

**User-visible outcome:** The footer shows the new single-line tagline, and each service category card displays a matching cartoon occupation image to help users quickly identify categories.
