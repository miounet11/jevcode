---
title: Zustand
description: Der Zustand ist der Text, den clavue-jev beurteilt. In dieser API ist es eine Zeichenkette, 8 bis 4000 Zeichen, gesehen von jeder Frage desselben Aufrufs.
section: concepts
order: 20
tags: ['state', 'clavue-jev']
---

## Zustand

**Zustand** ist der Text, den clavue-jev beurteilt. Bei `POST /v1/judge` ist es eine Zeichenkette von 8 bis 4000 Zeichen. Jede Frage derselben Anfrage sieht diese Zeichenkette. Die Fragen lesen nicht die Antworten der anderen.

Pack die Fakten, die das Urteil braucht, in diese Zeichenkette. Was nicht drinsteht, hat das Modell nicht. Unabhängige Fragen stehen zusammen, höchstens sechs. Braucht eine Frage die vorige Antwort, schreib diese Antwort in einen neuen Zustand und ruf ein zweites Mal auf.

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

- [System One](/de/concepts/system-one/)
- [Sicherheit](/de/concepts/confidence/)
- [API](/de/api/)
