# Klea Hila

## Work Summary

I created the shared ERD, collecting entity definitions from the backend team and consolidating them into a single unified diagram covering all 11 entities with full tenant isolation, relationships, and cardinality.

For US-17 (Dynamic Pricing Rules), I modelled the lifecycle of a pricing rule from configuration by the hotel admin through nightly cron evaluation, capturing the two possible outcomes — price adjusted when occupancy exceeds the threshold, or no change when it does not — alongside error and retry states.

For US-18 (Analytics Dashboard), I modelled the dashboard from initial data load through date range filtering and the export flow, including the intermediate exporting state and the error path that returns the admin to the loading state on retry.

For US-19 (Parking Lot Management), I modelled the three admin actions — adding a spot, removing a spot, and updating a spot's price — each flowing into an occupancy refresh that brings the dashboard back to idle, with error states for invalid input or occupied spots.

For US-20 (Housekeeping Queue), I modelled the real-time nature of the task list: the queue loads and sorts automatically, staff can trigger an urgency override which fires a WebSocket event that reorders the list on the housekeeper's device, and tasks are removed from the queue once marked as completed.

I also integrated all frontend portals, unified the shared mock data, and ensured consistent routing and UI behaviour across all five portals.
