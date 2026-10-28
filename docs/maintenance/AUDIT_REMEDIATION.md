# Coordinated audit remediation

Starting remote main: `3d2896fa658be678fa0066635d4967821c0c6e43`. Branch: `review/audit-remediation`. Baseline full verification: exit 0, **76 checks**. No source edits preceded the completed baseline. [Original reproductions](audit/original-reproductions.txt).

Stage 1 protects the stored payload against stale-tab writes, observes storage/lifecycle changes without merging learning records, and rejects malformed nested plans, ledgers, SRS and question presentation. Schema 7 is unchanged. A conflict retains in-memory progress for export and requires reload to use the newer save. The ordinary-controls two-tab test preserves tutorial completion and 65 XP. New nested-validation tests preserve rejected raw data until explicit reset. Existing quota/recovery and all-family resume tests pass. Full Stage 1 verification: exit 0, 80 checks; [command log](audit/stage1-verification.txt).

Stages 2–4 and the final twelve-finding disposition are pending in this working review branch. No merge is authorised.
