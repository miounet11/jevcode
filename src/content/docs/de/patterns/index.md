---
title: "Architekturmuster"
description: "Architekturmuster zum Aufbau von Systemen mit TypeSafe. Das Lernen, in „diskreten atomaren Entscheidungen“ zu denken, ist der Schlüssel, um seinen vollen Wert zu entfalten."
section: patterns
order: 10
tags: ['patterns', 'architecture']
source: docs.typesafe.ai/patterns
translatedFrom: zh
---

## Kernkonzept

TypeSafe wurde so konzipiert, dass es **in größere Systeme eingebettet** wird, um dort Entscheidungen zu treffen. Die entscheidende Fähigkeit besteht darin, **diskrete, atomare Entscheidungen** zu treffen und diese dann zu kombinieren, um komplexes Systemverhalten zu erzeugen.

Das bedeutet, dass Sie nicht versuchen sollten, eine komplexe geschäftliche Fragestellung mit einem einzigen Aufruf zu lösen. Stattdessen sollten Sie diese in mehrere unabhängige Urteile aufteilen und diese anschließend mit Ihrem eigenen Code kombinieren. Die Kombinationslogik im Code ist deterministisch, testbar und feinjustierbar – genau das ist die Quelle der Zuverlässigkeit.

Bevor Sie diesen Abschnitt lesen, sollten Sie bitte die [Primitives für Fragen](/de/primitives/) und [Konfidenz](/de/concepts/confidence/) verstanden haben.

## Vier Muster

| Muster | Funktion | Nutzen |
| :--- | :--- | :--- |
| [Fan-Out Parallel](/de/patterns/fan-out/) | Sendet viele Fragen (inklusive hypothetischer) in einem einzigen Aufruf; der Code entscheidet, welche relevant sind | Kosten, Geschwindigkeit |
| [Konfidenz-Routing](/de/patterns/confidence-routing/) | Nutzt Konfidenz als zweite Entscheidungsachse, um sicherere Systeme zu构建en | Zuverlässigkeit, Sicherheit |
| [Composite Scoring](/de/patterns/composite-scoring/) | Führt mehrere Analyse-Dimensionen zu einem einzigen Score zusammen | Kosten, Zuverlässigkeit, Geschwindigkeit |
| [Intent-Routing](/de/patterns/intent-routing/) | Klassifiziert die Benutzerabsicht und leitet sie an den passenden Prozessor weiter | Kosten, Geschwindigkeit |

## Wie sie zusammenarbeiten

Diese vier Muster sind keine sich gegenseitig ausschließenden Optionen, sondern Bausteine, die kombiniert werden können. Ein typisches Produktionssystem verwendet mehrere davon gleichzeitig:

```text
Benutzeranfrage
   │
   ├─ [Intent-Routing] Zuerst wird bestimmt, um welche Art von Anfrage es sich handelt ──┐
   │                                                                                    │
   ├─ [Fan-Out Parallel] Alle potenziell benötigten Urteile werden auf einmal abgefragt ─┤
   │                                                                                    │
   ├─ [Composite Scoring] Kandidatenresultate werden multidimensional bewertet und sortiert ┤
   │                                                                                    │
   └─ [Konfidenz-Routing] Hohe Konfidenz führt zur automatischen Ausführung / niedrige Konfidenz wird an einen Menschen eskaliert ┘
```

**Intent-Routing** steht normalerweise an erster Stelle, da es bestimmt, welche nachgelagerten Verarbeitungswege benötigt werden. **Fan-Out Parallel** durchzieht den gesamten Prozess, da das Bündeln von Fragen in einen einzigen Aufruf nahezu keine zusätzlichen Verzögerungskosten verursacht. **Composite Scoring** wird verwendet, wenn eine Sortierung erforderlich ist. **Konfidenz-Routing** fungiert als letzte Sperrschranke und entscheidet, ob ein Ergebnis automatisch ausgeführt oder an einen Menschen eskaliert wird.

## Designprinzipien

**Atomare Aufteilung.** Stellen Sie jede Frage nur nach einem einzigen Aspekt. Komplexe Fragen, die auf den ersten Blick „bequemer“ erscheinen, weil sie alles auf einmal abfragen, machen es unmöglich zu bestimmen, wo das Modell einen Fehler gemacht hat, und verhindern eine isolierte Feinjustierung.

**Der Code ist für die Kombination zuständig, das Modell für die Urteilsbildung.** Gewichtung, Schwellenwerte und Verzweigungslogik gehören in Ihren Code. Dies sind die Bereiche, die Sie verstehen, testen und anpassen müssen.

**Machen Sie Unsichtbarkeit sichtbar.** Anstatt das Modell dazu zu zwingen, eine Antwort zu geben, sollten Sie die „Unsicherheit“ mithilfe der Konfidenz auf Systemebene sichtbar machen, sodass Ihr Code entscheiden kann, wie damit umgegangen wird.

## Verwandte Themen

- [Primitives für Fragen](/de/primitives/) — Vorwissen erforderlich
- [Konfidenz](/de/concepts/confidence/) — Vorwissen erforderlich
- [Ökosystem-Fälle](/de/cases/use-case-map/) — Wie reale Projekte diese Muster einsetzen
