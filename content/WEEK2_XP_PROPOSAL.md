# Week 2 levels — proposal only

**Not approved and not implemented.** The current runtime preserves Level 10 · New Resident throughout Week 2, retains earned XP, and uses the existing lesson/answer rewards. It adds no Week 2 first-pass bonuses, catch-up floors, level caps or titles. Day 14 cannot award Week 1 graduation again.

One possible schedule for a later product decision would continue 200-XP nominal levels, add gated first-clear floors and retain the New Resident title:

| Cleared assessment | Proposed total-XP floor | Proposed level cap |
|---|---:|---:|
| Day 8 | 2,000 | 11 |
| Day 9 | 2,200 | 12 |
| Day 10 | 2,400 | 13 |
| Day 11 | 2,600 | 14 |
| Day 12 | 3,000 | 16 |
| Day 13 | 3,400 | 18 |
| Day 14 | 3,800 | 20 |

This would require separate approval, a versioned Week 2 assessment milestone, migration/idempotency rules and fresh skip-only tests. Existing banked XP would remain; it must not bypass future story gates. No second title or subsequent chapter is proposed here.
