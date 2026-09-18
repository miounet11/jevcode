---
title: Agent skill
description: Install the TypeSafe skill into Claude Code, Codex, and other coding agents so they get full API context instead of guessing.
section: sdk
order: 40
tags: ['agent', 'claude-code', 'codex']
source: docs.typesafe.ai/agent-skill
---

## What the skill solves

The TypeSafe agent skill gives your AI coding agent full context on the TypeSafe API: the three question [types](/en/primitives/), the architectural [patterns](/en/patterns/), and best practices for structuring evaluations.

**Why you need it**: without the skill, an agent invents request and response fields from plausibility rather than knowledge. That is the most common failure mode when an agent integrates a new API.

## Installation

### Claude Code

```bash
claude plugin marketplace add typesafe-ai/skills
claude plugin install typesafe@typesafe-ai
```

### Other agents

```bash
npx skills add typesafe-ai/skills --skill typesafe-ai
```

Choose your agent when prompted. Installation is **project-local by default**; add `-g` to install globally.

### Let the agent install it

Paste this prompt into your coding agent:

```text
Install the TypeSafe skill. If you're in Claude Code, run `claude plugin marketplace add typesafe-ai/skills`,
then `claude plugin install typesafe@typesafe-ai`. If you're in another agent, run
`npx skills add typesafe-ai/skills --skill typesafe-ai` and select your agent.
Use one installation method. You can read the skill directly at
https://github.com/typesafe-ai/skills/blob/main/skills/typesafe-ai/SKILL.md
(raw: https://raw.githubusercontent.com/typesafe-ai/skills/main/skills/typesafe-ai/SKILL.md).
Then use the TypeSafe skill when working on this project.
```

For manual installation, copy the entire `skills/typesafe-ai` directory from GitHub — **including its reference files** — into your agent's skills directory.

> **Choose one installation method** to avoid duplicate copies.

## Updates

For the Claude Code plugin:

```bash
claude plugin marketplace update typesafe-ai
claude plugin update typesafe@typesafe-ai
```

Restart Claude Code or run `/reload-plugins`. To enable automatic updates, open `/plugin` and select **Marketplaces → typesafe-ai → Enable auto-update**.

For skills.sh installs, run `npx skills update`. For manual copies, replace the whole skill directory with the latest GitHub version.

## Useful prompts

Naming the skill in your prompt ("use the TypeSafe skill") works in any agent. With the Claude Code plugin you can also invoke `/typesafe:typesafe-ai` directly.

**Find refactoring opportunities**:

```text
Using the TypeSafe skill, explore the project and find opportunities for using
intelligent judgement to stand in for complex parsing or other fragile code.
```

**Experiment with a real API key**:

```text
Using the TypeSafe skill, run some experiments using the TypeSafe API key that I've
exported to `TYPESAFE_API_KEY`. Propose changes based on the most promising results.
```

**Find a matching cookbook**:

```text
Using the TypeSafe skill, analyze my code and see if there are any applicable cookbooks
that show how I could refactor my code to be less fragile or complex.
```

## Working with agents

The four official principles are worth following:

1. **Talk it out first.** Use the prompts above to align on direction before implementing.
2. **Review the plan before implementation.** Make sure it makes sense before code is written.
3. **Keep constants in one place.** Questions and thresholds should live in a single file for easy review. **Agents are not great at writing questions** — expect to edit collaboratively rather than accepting the first draft.
4. **Do not take assertions at face value.** Encourage the agent to validate its assumptions.

## Common issues

### The agent isn't using the skill

With the Claude Code plugin, invoke `/typesafe:typesafe-ai`; in other agents, say "use the TypeSafe skill". If it still does not load, confirm the installer targeted the agent you are using, then restart it.

### Routing isn't working as expected

Check the questions and thresholds. Thresholds may be too high (false negatives) or too low (false positives). The questions may also need to be more specific.

### You're using confidence thresholds everywhere

If all you care about is choosing the best option, just pick the highest-confidence option rather than setting a threshold. If you have a specific statistical algorithm in mind, you probably want `probabilities` rather than `confidence`.

### TypeSafe code is hard to review

The things humans must review are the **questions** and the **threshold constants**. Define them in a single code file so review does not require spelunking.

### The agent invents request or response fields

A stale skill causes this. Update it with your installation method and retry.

## Related

- [SDKs](/en/sdk/) — Python and JavaScript clients
- [Primitives](/en/primitives/) — the three question types an agent must understand
- [Confidence](/en/concepts/confidence/) — how to set thresholds
