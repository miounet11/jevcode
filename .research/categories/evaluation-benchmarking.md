# Evaluation & Benchmarking

Use this category for programs where Jev judges model or system outputs — eval harnesses, LLM-as-judge replacements, benchmark scorers, regression gates.

## Submission format

```md
- [Name](URL) - Industry: one-sentence description of the Jev use case.
```

## Entries

- [Jev Playground](https://github.com/hegargarcia/jev-playground) - Model evaluation: benchmarks Jev against Luna, Haiku, and Gemini at choosing validated legal moves in explicit-state games, scoring decision quality and consistency across a sequence of moves.
- [Jev vs Mistral and Gemini for event validation](https://nearhere.events/blog/typesafe-jev-mistral-gemini-event-validation) - Event discovery: head-to-head test of Jev against Mistral Small and Gemini Flash-Lite at validating local event listings.
- [jev-research-eval](https://github.com/jgridifier/jev-research-eval) - Research automation: reproducible eval harness plus field note for Jev Ultrafast research-browser tasks, with QC'd cases, a suite runner, and a report generator.
- [Jev judge call vs dimension scores](https://agentjournal.dev/blog/llm-judge-vs-feature-extraction/) - Model evaluation: tests one direct Jev question per row against 12–14 Jev-scored dimensions with locally fitted weights on three classification tasks, reaching 0.9076 against 0.8373 on Japanese NLI but flagging about 25× more hard benign rows as attacks.
