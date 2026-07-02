# Graph Report - FretDNA  (2026-07-02)

## Corpus Check
- 2 files · ~3,696 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 16 nodes · 15 edges · 5 communities (1 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c9013158`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]

## God Nodes (most connected - your core abstractions)
1. `FretDNA v2 — Design Spec` - 11 edges
2. `Vision` - 2 edges
3. `Stack` - 2 edges
4. `Architecture — brain vs. skin` - 2 edges
5. `The core reframe — Voicings, not note-maps` - 2 edges
6. `The core problem being solved` - 1 edges
7. `Non-goals (YAGNI)` - 1 edges
8. `Rationale` - 1 edges
9. `Boundaries per unit` - 1 edges
10. `The voicing picker = chord charts (unified concept)` - 1 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (5 total, 4 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.25
Nodes (7): Audio (Phase 4), FretDNA v2 — Design Spec, Non-goals (YAGNI), Phasing (each phase leaves the app runnable), Testing, View & state, Visual direction

## Knowledge Gaps
- **10 isolated node(s):** `The core problem being solved`, `Non-goals (YAGNI)`, `Rationale`, `Boundaries per unit`, `The voicing picker = chord charts (unified concept)` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `FretDNA v2 — Design Spec` connect `Community 0` to `Community 1`, `Community 2`, `Community 3`, `Community 4`?**
  _High betweenness centrality (0.962) - this node is a cross-community bridge._
- **Why does `Vision` connect `Community 3` to `Community 0`?**
  _High betweenness centrality (0.133) - this node is a cross-community bridge._
- **Why does `Stack` connect `Community 2` to `Community 0`?**
  _High betweenness centrality (0.133) - this node is a cross-community bridge._
- **What connects `The core problem being solved`, `Non-goals (YAGNI)`, `Rationale` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._