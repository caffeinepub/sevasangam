# Specification

## Summary
**Goal:** Fix the production regression where workers and related data disappear after canister upgrades, and ensure both admin and public pages show clear error states instead of empty lists when queries fail.

**Planned changes:**
- Persist workers, categories, inquiries, and userProfiles across canister upgrades/deploys so production redeploys do not reset state and hide previously approved/pending workers.
- Update Admin Dashboard workers list to distinguish loading/empty/error states, show pending workers when returned, and display an explicit retryable network error message (instead of silently showing an empty list).
- Update public Category and Search Results pages to surface network/connection errors with a retry option (instead of showing “0 workers”), and ensure data refetch/invalidation so newly approved workers appear without a hard refresh.

**User-visible outcome:** After deployments, previously registered workers and categories remain visible; admins reliably see pending workers (or a clear error with retry), and public users see approved workers on category/search pages with clear, retryable error states if connectivity fails.
