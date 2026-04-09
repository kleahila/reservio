# Klea Hila

## Week 8 Tasks

- [ ] Create Week 8 branches from dev: feature/week8-presentations, code/backend, code/backend-orest, code/backend-licern, code/backend-joni
- [ ] Lead and coordinate the shared ERD — own the final file, collect entity definitions from Orest, Licern, and Joni
- [ ] Define ERD entities for Klea's scope: PricingRule (id, tenantId, occupancyThreshold, adjustmentPercent, createdAt) and analytics query logic
- [ ] Export ERD as PNG to docs/diagrams/week8/erd.png
- [ ] Create state diagram for US-17 — Dynamic Pricing Rules: states Idle → RuleConfigured → Evaluating (cron) → PriceAdjusted / ThresholdNotMet → Error
- [ ] Create state diagram for US-18 — Analytics Dashboard: states Loading → DateRangeSelected → DataLoaded → Exporting → ExportComplete → Error
- [ ] Create state diagram for US-19 — Parking Lot Management: states Idle → SpotAdded / SpotRemoved → PriceUpdated → OccupancyRefreshed → Error
- [ ] Create state diagram for US-20 — Housekeeping Queue: states Loading → QueueLoaded → UrgencyOverride → Reordered (WebSocket) → TaskCompleted
- [ ] Export all diagrams as PNG to docs/diagrams/week8/
- [ ] Commit ERD and state diagrams on branch feature/week8-presentations: feat: add shared ERD week8 / feat: add state diagrams US-17 to US-20
- [ ] PR all code/frontend-{name} branches into code/frontend
- [ ] Link all routes and nav guards across Guest, Staff, Housekeeper, Admin, and SuperAdmin portals
- [ ] Unify mock data across all screens in client/src/data/
- [ ] UI polish — layout alignment, shared components, responsive checks at 375px, Toast and Modal consistency
- [ ] Commit frontend polish on branch code/frontend: feat: add routing and nav guards / feat: fix mock data consistency / feat: ui polish and responsive fixes

## Work Summary

_Fill in after completing your tasks._
