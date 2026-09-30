---
title: Sicherheit
description: Sicherheit ist in dieser API eine eigene Frage und liefert eine Zahl von 0 bis 1. Die Schwelle richtet sich nach den Kosten eines Fehlers.
section: concepts
order: 30
tags: ['confidence', 'clavue-jev']
---

## Zwei verschiedene Zahlen

Diese API versteckt keine Sicherheit in jeder Antwort. Du fragst nach der Zahl, die du willst.

- Eine `noul`-Frage liefert `{ "noul": 0.92 }`. Das ist die Stärke des „Ja", kein eigener Sicherheitswert.
- Eine `confidence`-Frage liefert `{ "noul": 0.78 }`. Das ist, wie fest dieses Urteil ist. Frag sie neben der Frage, die du automatisch ausführen lassen willst.
- Eine `choice`-Frage liefert `{ "choice": "billing" }`. Eine der Optionen, die du gesendet hast.

Wenn die Verzweigung wichtig ist, frag beide zusammen:

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

## Wann automatisch handeln

Diese Seite hat keine allgemeingültige Schwelle. Eine automatische Erstattung falsch auszuführen kostet mehr als ein falsches Tag in einer Log-Zeile. Deshalb wartet der Erstattungspfad auf eine höhere Zahl.

Ein praktischer Anfang:

1. Wähle die sichere Aktion, die bei hoher Zahl läuft.
2. Wähle die Übergabe bei niedriger Zahl (ein Mensch, oder ein zweiter Aufruf mit engerem Zustand).
3. Lies eine Charge deines eigenen Verkehrs über [Vergleich](/de/compare/) oder [Test](/de/try/), bevor du die Schwelle festlegst.

Lass das Modell kein Geld bewegen und keine Daten löschen, wenn es nicht „ich bin unsicher" sagen kann. Frag eine `confidence`-Frage und verzweige.

- [Zustand](/de/concepts/state/)
- [System One](/de/concepts/system-one/)
- [API](/de/api/)
