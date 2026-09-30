---
title: Zustand
description: Der Zustand ist der Text, den clavue-jev beurteilt. In dieser API ist es eine Zeichenkette, 8 bis 4000 Zeichen, gesehen von jeder Frage desselben Aufrufs.
section: concepts
order: 20
tags: ['state', 'clavue-jev']
---

## Was du sendest

**Zustand** ist der Text, den clavue-jev beurteilt. Bei `POST /v1/judge` ist es eine Zeichenkette von 8 bis 4000 Zeichen. Jede Frage derselben Anfrage sieht diese Zeichenkette. Die Fragen lesen nicht die Antworten der anderen.

Pack die Fakten, die das Urteil braucht, in diese Zeichenkette: die Nachricht, die Richtlinienzeile, die zwei Namen, die du vergleichen willst. Ein Fakt, der nicht drinsteht, ist für das Modell nicht vorhanden.

```json
{
  "state": "Nutzer: Mir wurde zweimal berechnet. Richtlinie: eine doppelte Abbuchung innerhalb von 7 Tagen wird erstattet. Buchungszeilen: Dienstag 18:02, Dienstag 18:04, dieselbe Karte, derselbe Betrag.",
  "questions": {
    "duplicate": {
      "type": "noul",
      "instructions": "Zeigen diese Zeilen eine doppelte Abbuchung?"
    }
  }
}
```

## Ein Zustand, mehrere Fragen

Unabhängige Fragen kommen in dieselbe Anfrage, höchstens sechs. „Ist es doppelt?" und „Welche Warteschlange?" können zusammen reisen. Eine Frage, die die vorige Antwort braucht, kann das nicht: Führe sie als zweiten Aufruf aus, mit der ersten Antwort im neuen Zustand.

Benenne jeden Teil im Text, wenn du mehr als einen Fakt sendest. „Richtlinie: … Buchungszeilen: …" ist leichter zu beurteilen als drei unbeschriftete Blöcke.

## Länge

Kürzer als 8 Zeichen wird abgelehnt. Länger als 4000 wird ebenfalls abgelehnt. Wenn das Material nicht passt, kürze es auf die Zeilen, die die Frage wirklich braucht, oder teile die Arbeit auf zwei Aufrufe auf.

- [System One](/de/concepts/system-one/)
- [Konfidenz](/de/concepts/confidence/)
- [API](/de/api/)
