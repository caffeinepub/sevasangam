# Specification

## Summary
**Goal:** Simplify the Worker Dashboard to only show the worker’s job list, and restore a working admin-only per-job “Mark Completed” action within each worker’s assigned jobs list.

**Planned changes:**
- Remove all statistic/summary cards from the Worker Dashboard while keeping the “My Jobs” list (including loading/empty/error states) unchanged.
- In the Admin Dashboard worker management view, display each worker’s assigned inquiries as individual job cards within that worker’s section.
- Add a visible “Mark Completed” button on each non-completed job card in the admin worker job list, and hide it for already completed jobs.
- Wire the admin “Mark Completed” button to update the inquiry status to completed via existing admin-authorized backend calls, then refetch/invalidate relevant queries so both admin and worker UIs reflect the updated status without a full page reload.

**User-visible outcome:** Workers see only their job list on the Worker Dashboard (no summary metrics). Admins can view each worker’s assigned jobs and mark individual jobs completed, with the updated status appearing immediately in both admin and worker job lists.
