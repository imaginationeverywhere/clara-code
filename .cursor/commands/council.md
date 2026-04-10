# /council — Granville + Mary Together

**The Council:** When a decision needs both the Architect (Granville) and the Product Owner (Mary) at the table. Architecture meets product. HOW meets WHAT.

## What The Council Does

Sometimes you need both perspectives simultaneously:
- "Should we build this feature, and if so, how?"
- "The client wants X, but the architecture suggests Y"
- "Sprint prioritization — what's technically feasible vs. what's commercially urgent"

The Council is a **joint conversation** with both Granville (architecture) and Mary (product).

## Usage
```
/council                                       # Open joint session
/council "FMO wants real-time tracking — worth the complexity?"
/council "Prioritize Sprint 2 features"
/council "NOI platform scope — product vs. architecture"
/council --decision                            # Force a decision (no open-ended)
```

## Arguments
- `<topic>` (optional) — The decision or question
- `--decision` — Must reach a concrete decision, not just discussion
- `--sprint` — Sprint planning context (prioritization + feasibility)
- `--client <name>` — Client-specific decision (load their context)

## How The Council Works
1. Topic is framed
2. **Mary** speaks first — product perspective (what the customer/business needs)
3. **Granville** responds — architecture perspective (what's feasible, what the trade-offs are)
4. They debate trade-offs
5. A recommendation emerges
6. Amen Ra decides

## When to Use /council vs Individual
| Situation | Command |
|-----------|---------|
| Pure architecture question | `/gran` |
| Pure product question | `/mary` |
| "Should we build X and how?" | `/council` |
| Sprint planning | `/council --sprint` |
| Client scoping | `/council --client` |
| Technical debt vs features | `/council` |

## Related Commands
- `/gran` — Granville solo
- `/mary` — Mary solo
- `/ship` — After the council decides, ship it
