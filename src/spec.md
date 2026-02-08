# Specification

## Summary
**Goal:** Ensure only admins can mark inquiries/jobs as completed, while workers can still view up-to-date completion status in their dashboard.

**Planned changes:**
- Remove/hide any worker-facing "Mark as Completed" UI and prevent the worker UI from triggering any completion action/API.
- Add an admin-only "Mark Completed" control in the admin inquiry management UI for non-completed inquiries.
- Update backend authorization to reject any non-admin attempts to mark an inquiry/job completed, while allowing admin-authorized updates to set status to completed.
- Ensure worker job lists display status badges (e.g., Pending/Completed) based on inquiry status and reflect admin-made completion changes after refresh/refetch.

**User-visible outcome:** Workers can no longer mark jobs completed and will only see completion status updates after an admin marks an inquiry/job as completed; admins have a dedicated control to complete inquiries in the admin interface.
