# Specification

## Summary
**Goal:** Make the admin login entry point visible by adding an “Admin Login” button in the header next to the existing Internet Identity “Login” button, including in the mobile menu.

**Planned changes:**
- Add an “Admin Login” button to the desktop header actions (md and up) when the admin session is not authenticated, placed next to the existing “Login” button and using the same Button styling system.
- Add an “Admin Login” button to the mobile menu action area when the admin session is not authenticated, aligned with the existing “Login” action.
- Wire “Admin Login” to navigate to the admin login route (`/admin-login`) while keeping existing admin-session behavior unchanged (authenticated state shows “Admin Logout”; unauthenticated access to `/admin` continues to redirect to `/admin-login`).

**User-visible outcome:** Users can click “Admin Login” from the header (desktop and mobile) to go to `/admin-login`, and authenticated admins continue to see “Admin Logout” instead of “Admin Login”.
