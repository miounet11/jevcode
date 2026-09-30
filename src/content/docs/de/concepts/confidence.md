---
title: Sicherheit
description: Sicherheit ist in dieser API eine eigene Frage und liefert eine Zahl von 0 bis 1. Die Schwelle richtet sich nach den Kosten eines Fehlers.
section: concepts
order: 30
tags: ['confidence', 'clavue-jev']
---

## Sicherheit

Diese API versteckt keine Sicherheit in jeder Antwort. Du fragst nach der Zahl, die du willst.

- `noul` liefert `{ "noul": 0.92 }`. Das ist, wie stark die Antwort Ja ist, keine zweite Sicherheitszahl.
- `confidence` liefert `{ "noul": 0.78 }`. Das ist, wie tragfähig das Urteil ist. Frag es neben der Frage, auf die du handeln willst.
- `choice` liefert `{ "choice": "billing" }`, eine der gesendeten Optionen.

```json
{
  "state": "The invoice was paid twice on Tuesday.",
  "questions": {
    "duplicate": {
      "type": "noul",
      "instructions": "Does this describe a duplicate charge?"
    },
    "sure": {
      "type": "confidence",
      "instructions": "How sure is that judgment?"
    },
    "lane": {
      "type": "choice",
      "instructions": "Which queue should take it?",
      "options": ["billing", "fraud", "ignore"]
    }
  }
}
```

Es gibt hier keine universelle Schwelle. Eine falsche automatische Erstattung kostet mehr als ein falsches Tag an einer Logzeile. Bei einer hohen Zahl die sichere Aktion, bei einer niedrigen Zahl ein Mensch oder ein zweiter Aufruf mit engerem Zustand. Sieh dir eigenen Verkehr auf [Vergleich](/de/compare/) oder [Ausprobieren](/de/try/) an, bevor du die Schwelle festlegst.

- [Zustand](/de/concepts/state/)
- [System One](/de/concepts/system-one/)
- [API](/de/api/)
