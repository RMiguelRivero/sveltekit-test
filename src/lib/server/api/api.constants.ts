// Reserved so the E2E suite (step 17) can deterministically exercise the optimistic-UI
// rollback path: an update targeting this specific mock item always fails, every other
// item always succeeds. Keying the sentinel off the item id (rather than off the target
// status, e.g. always rejecting "archived") avoids permanently breaking a real status
// value for every other item, while staying just as deterministic and Playwright-testable.
export const SIMULATED_FAILURE_ITEM_ID = 'cmp_0001';
