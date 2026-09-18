# Classification & Routing

Use this category for programs where Jev sorts incoming state into categories or picks the next destination — tickets, intents, alerts, documents, or traffic.

## Submission format

```md
- [Name](URL) - Industry: one-sentence description of the Jev use case.
```

## Entries

- [Notra](https://github.com/usenotra/notra) - Marketing analytics: production GEO platform whose `NOTRA_JEV_CLASSIFIERS` flag routes brand-visibility classifiers off an LLM and onto Jev `Boolean` decisions at a 0.5 threshold, targeting 300 ms p50.
- [jev-router](https://github.com/gargpratyush/jev-router) - Developer tooling: routes Claude Code tasks to the cheapest capable model by asking Jev to choose among candidates.
- [jev-router (prismhq)](https://github.com/prismhq/jev-router) - LLM infrastructure: open-source LiteLLM-based router where a Jev decision picks which model serves each request.
- [pi-jev-router](https://github.com/mejiasd3v/pi-jev-router) - Coding agents: adds automatic per-request model routing to the Pi coding agent through Jev decisions on Vercel AI Gateway.
- [jcm-router](https://github.com/adarshmishra07/jcm-router) - Coding agents: local proxy that picks the Claude model and reasoning effort per message with a Jev decision while leaving the cached main chat untouched.
- [jev-agent-skill-router](https://github.com/GodsBoy/jev-agent-skill-router) - Agent infrastructure: routes agent skill selection through typed, confidence-aware Jev decisions so weak matches are declined instead of guessed.
- [typesafe-jev CV screener](https://github.com/gtaras7/typesafe-jev) - Recruiting: screens a folder of CVs with Jev typed judgments against an editable policy, re-scoring candidates for free when the policy changes.
- [Jev email intent workflow](https://github.com/GiesN/typesafe-jev-workflow) - Back-office automation: async LangGraph workflow gets a typed Jev `Choice` (`invoice` or `general`) and routes each inbound email to the matching handler.
- [unclutter](https://github.com/kitze/unclutter) - Browser tooling: WXT extension where Jev decides per page element whether it is clutter, removing it under reusable template rules.
