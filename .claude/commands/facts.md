# /facts — Verified Facts Only

**No opinions. No projections. No "I think." Only what is verified, documented, and provable.**

This is the command you use when you need to settle a dispute, prepare for a client meeting, or make a decision based on reality — not memory, not estimates, not what someone said last session.

## Usage
```
/facts                              # All verified facts about current topic
/facts "Maurice deal"               # Verified facts about a specific topic
/facts costs                        # Verified cost facts
/facts wcr                          # Verified facts about WCR
```

## What This Command Does

1. Read the vault for documented decisions
2. Read the codebase for what's actually built
3. Read git history for what's actually shipped
4. Read SSM/config for what's actually configured
5. Present ONLY verifiable facts

## Rules
- **Every fact must have a source.** "Per decision-creait-barter-deal-terms.md" or "Per git log" or "Per package.json"
- **No interpretation.** "WCR is at 72% MVP" is a fact if it's in the sprint plan. "WCR is close to done" is interpretation.
- **No estimates.** "$80/mo" is a fact if it was decided and documented. "~$80/mo" is not.
- **Distinguish between decided and current.** A decision from April 2 might have been changed on April 3. Show the most recent documented fact.
- **If it's not documented, it's not a fact.** Say "No documented fact found for [topic]."

## Output Format
```
FACTS — [topic]
━━━━━━━━━━━━━━━━━━━━━━━━━
1. [Fact] — Source: [file or command]
2. [Fact] — Source: [file or command]
3. [Fact] — Source: [file or command]

UNDOCUMENTED (needs a decision):
- [Thing that was discussed but never saved]
━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Why This Exists

Mo said the agents keep changing numbers and contradicting previous decisions. `/facts` stops that. If it's not documented, it's not a fact. If it IS documented, that's the answer — no recalculating.
