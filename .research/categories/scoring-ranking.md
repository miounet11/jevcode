# Scoring & Ranking

Use this category for programs where Jev produces rubric scores, quality grades, or relevance and priority orderings that drive a downstream decision.

## Submission format

```md
- [Name](URL) - Industry: one-sentence description of the Jev use case.
```

## Entries

- [Clean Code Judge](https://github.com/frostney/clean-code-review) - Code quality: scores every file of a pull request on 31 boolean Clean Code smells plus function size and nesting, then hands the verdicts to a writing model for the review prose.
- [citation-verifier](https://github.com/MarissaFamularo/citation-verifier) - Academic publishing: checks whether each cited paper actually supports the sentence citing it, with Claude locating the quote, Jev scoring the support, and a human making the final call.
- [jev-bfs](https://github.com/komikat/jev-bfs) - Search tooling: finds link paths between English Wikipedia articles by having Jev rank each page's outgoing links while Python controls the search.
- [Jev Search](https://github.com/superagents-lab/jev-search) - Web search: uses Jev Noul judgments on result titles and snippets to rank Search1API results by relevance, with application code merging duplicate URLs and grouping lower-scoring matches separately.
