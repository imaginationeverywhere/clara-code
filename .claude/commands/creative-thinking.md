# /creative-thinking — Think Outside the Box

**Philosophy:** When the obvious answer isn't working, stop thinking obviously. Improvise. Riff. Come at the problem sideways. The best solutions come from connecting things that nobody thought were related.

**Origin:** April 3, 2026 — Mo asked Granville how to protect platform IP in Heru repos. Granville went down a rabbit hole of global skills, npm packages, MCP servers — everything except the obvious answer that was already in our toolbox: git worktrees. This command exists to prevent that kind of tunnel vision.

## Usage
```
/creative-thinking                             # Rethink the current problem
/creative-thinking "How do we solve X?"        # Fresh perspective on a specific problem
/creative-thinking --flip                      # Invert your assumptions
/creative-thinking --analog                    # Find analogies from other domains
```

## The Process

### Step 1: State What You're Stuck On
Write it in one sentence. If you can't, you don't understand the problem yet.

### Step 2: List Your Assumptions
What are you taking for granted? Write them down. These are the walls you've built around your thinking.

### Step 3: Flip Each Assumption
For each assumption, ask: "What if the OPPOSITE were true?"

| Assumption | Flip |
|-----------|------|
| "The files need to live in the repo" | What if they DON'T? |
| "We need to sync to every project" | What if the project comes to US? |
| "We need a new tool for this" | What if we ALREADY have the tool? |
| "This is a code problem" | What if it's a PROCESS problem? |
| "This needs to be automated" | What if doing it manually is better? |

### Step 4: Look at What You Already Have
Before inventing something new, audit what's in your toolbox:
- What existing tools solve adjacent problems?
- What patterns have you already established?
- What worked for a DIFFERENT problem that could work here?
- What did you build last week that you forgot about?

### Step 5: Find Analogies
How do OTHER fields solve this?
- How does a restaurant protect recipes? (The chef keeps them, servers don't need them)
- How does Shopify protect its platform? (Merchants get the store, not the code)
- How does a construction foreman work? (Brings tools to the site, doesn't leave them)
- How does a musician improvise? (Knows the rules so well they can break them)

### Step 6: Combine
Take the best flip + the best existing tool + the best analogy. That's usually the answer.

## Red Flags (You're Thinking in a Box)

| What You're Doing | What To Do Instead |
|-------------------|-------------------|
| Proposing a whole new system | Use something you already built |
| Writing 500 lines of analysis | Draw it on a napkin |
| Researching for 20 minutes | Ask "what's the dumbest simple thing that works?" |
| Building infrastructure | Use infrastructure you already have |
| Adding complexity | Remove complexity |
| Saying "we need to build X" | Ask "do we already have X?" |
| Going deep on one approach | Step back and list 5 approaches in 30 seconds |

## The Granville Rule

**If you have 60 patents and someone asks you to solve a problem, check your existing patents first before filing a new one.**

Granville T. Woods had the multiplex telegraph, the steam boiler furnace, the electric railway, the automatic air brake. When a new problem came up, the FIRST question should always be: "Which of my existing inventions can I adapt?" Not: "Let me invent something new."

## When to Use This

- You've been thinking about a problem for more than 5 minutes with no answer
- Your proposed solution is more complex than the problem
- Mo says you're off track
- You're about to build something new when something old might work
- You're in analysis paralysis
- The obvious approach failed and you need a fresh angle

## Examples

### BAD (Tunnel Vision)
```
Problem: "How to protect IP in client repos?"
→ Spends 10 minutes researching global skills
→ Proposes npm packages for markdown files
→ Designs an MCP server to serve prompts
→ Writes a 3-tier migration plan
→ Mo: "git worktrees bruh"
```

### GOOD (Creative Thinking)
```
Problem: "How to protect IP in client repos?"
→ Step 1: "IP is in repos, shouldn't be"
→ Step 2: Assumptions: "Files must be in the repo to be available"
→ Step 3: Flip: "What if the repo comes to the files, not files to the repo?"
→ Step 4: What do we have? Git worktrees! Agents already work in worktrees.
→ Step 5: Analogy: Construction foreman brings tools TO the site.
→ Answer: "Work from the boilerplate, worktree into the Heru. IP stays home."
```

## Related Commands
- `/critically-think` — Anticipate next actions (different from creative thinking)
- `/think` — Quick vault check
- `/talk` — Reason through decisions
- `/brainstorm` — Ideation sessions
- `/analyze` — Deep content analysis
