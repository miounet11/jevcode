---
title: "Einführung in Jev"
description: "Jev ist das Flaggschiff-Modell von TypeSafe und das erste System-One-Modell. Es wandelt unstrukturierte Zustände und typisierte Fragen in typisierte Entscheidungen um, die Software direkt verwenden kann."
section: start
order: 10
tags: ['overview', 'system-one']
source: docs.typesafe.ai/introduction
translatedFrom: zh
---

## Auf einen Nenner

Jev ist kein Chat-Modell. Sie übergeben ihm **Status** (state) und **typisierte Fragen** (typed questions), und es gibt **typisierte Entscheidungen** (typed decisions) zurück – eine Option, eine Punktzahl oder eine boolesche Wahrscheinlichkeit, jeweils mit **Konfidenz** (confidence).

Diese Positionierung bestimmt den grundlegenden Unterschied zu konversationellen Modellen:

| Dimension | Konversationelle Modelle | Jev |
| :--- | :--- | :--- |
| Ausgabe | Freitext | Strukturiertes Ergebnis mit festem Schema |
| Verwendung | Generierung, Konversation, Reasoning Chains | Klassifizierung, Routing, Scoring, Validierung, Guardrails |
| Integration | Parsing der Modellausgabe | Direkte Nutzung der Rückgabewerte, keine Regex-Parsing erforderlich |
| Konfidenz | Oft nicht vorhanden | Jeder Antwort beiliegend |
| Latenz | Sekundenbereich, wächst mit der Ausgabelänge | Niedrig und stabil |

## Warum eine „Decision Layer“ notwendig ist

Bei der Integration von LLMs in Geschäftssysteme ist der häufigste Schmerzpunkt: Das Modell gibt einen Fließtext aus, und Sie müssen einen Parser schreiben, Randfälle behandeln und raten, ob die Antwort korrekt ist. Jev abstrahiert diese Ebene weg – die Frage selbst deklariert den Ausgabetyp, und das Modell muss gemäß dem Schema antworten.

```json
{
  "department": {
    "type": "choice",
    "instructions": "Which team should handle this",
    "criteria": {
      "billing": "Payment or subscription issues",
      "technical": "Bugs or integration problems",
      "sales": "Pricing or account questions"
    }
  }
}
```

Der Rückgabewert ist einer von `billing` / `technical` / `sales` sowie eine Konfidenz. Kein Parsing, keine Fallback-Formate.

## Drei primitive Fragetypen

Alle Entscheidungen lassen sich auf drei Fragetypen reduzieren. Dies ist die Kernabstraktion von Jev; ihr Verständnis bedeutet, das gesamte System zu verstehen:

- **[Choice](/de/primitives/choice/)** — Wählt eine Option aus einer Menge sich gegenseitig ausschließender Kandidaten. Wird für Intent-Erkennung, Ticket-Routing und Aktionsauswahl verwendet.
- **[Score](/de/primitives/score/)** — Vergibt eine Punktzahl basierend auf einer Skala oder Bewertungsmaßstab. Wird für Relevanz-Ranking, Qualitätsbewertung und Risikoklassifizierung verwendet.
- **[Noul](/de/primitives/noul/)** — Beantwortet eine Ja/Nein-Frage und gibt die Wahrscheinlichkeit für die Antwort „Ja“ zurück. Wird für Inhaltsvalidierung, Assert-Prüfungen und Guardrails verwendet.

In einer einzelnen Anfrage können diese drei Fragetypen gemischt werden. Das Modell liest den Status nur einmal und bewertet dann alle Fragen parallel.

## Die Positionierung von System One

System One ist eine Klasse von Modellen, die speziell für „schnelle, strukturierte Entscheidungen, die von Software direkt verwendet werden können“, entwickelt wurden. Jev ist das erste Modell dieser Klasse. Es steht nicht in Konkurrenz zu System-Two-Modellen mit Reasoning-Fähigkeiten, sondern ergänzt diese durch Arbeitsteilung:

- **System One**: Häufige, latenzarme, strukturierte Urteile. Sie sind die Upgrade-Version von if/else in der Geschäftsprozesskette.
- **System Two**: Komplexe Aufgaben, die mehrstufiges Reasoning und lange Denkketten erfordern.

In der Praxis ist es üblich, in der Prozesskette häufig System One für schnelles Routing einzusetzen und nur bei tatsächlichem Bedarf an tiefem Reasoning auf stärkere Modelle umzusteigen, um Kosten und Latenz zu minimieren.

## Nächste Schritte

- [5-Minuten-Einführung](/de/quickstart/) — API-Key erhalten und den ersten Aufruf ausführen
- [Kernkonzepte](/de/concepts/system-one/) — Verständnis von System One und Statusmodellen
- [Architekturmuster](/de/patterns/) — Sehen Sie, wie diese Aufrufe in Produktionsumgebungen organisiert werden
