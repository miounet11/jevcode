---
title: "Kombinierte Bewertung"
description: "Zerlege komplexe Entscheidungen in atomare Scores und kombiniere sie im Code mit Gewichten, die du vollständig kontrollierst."
section: patterns
order: 40
tags: ['score', 'ranking', 'weights']
source: docs.typesafe.ai/patterns/composite-scoring
translatedFrom: zh
---

## Welches Problem löst dieses Muster?

Oft müssen wir eine Gruppe von Elementen **gleichzeitig nach mehreren Dimensionen** sortieren. Es ist schlecht, die „Gesamtbewertung“ einfach als eine einzige Frage an das Modell zu stellen: Die vom Modell vergebenen Scores sind nicht erklärbar, und Sie wissen nicht, warum es die Elemente so anordnet.

Der Ansatz der kombinierten Bewertung besteht darin, die Entscheidung in unabhängige Dimensionen aufzuteilen, jede separat zu bewerten und diese dann im Code mit **Ihnen kontrollierten Gewichten** zusammenzuführen.

## Beispiel: Lebenslauf-Sichtung

Angenommen, Sie bearbeiten Lebensläufe für Ingenieurpositionen und möchten Kandidaten nach mehreren Kriterien sortieren, um die Top-X-Kandidaten für die nächste Runde auszuwählen.

### Schritt 1: Separate Bewertung jeder Dimension

Fragen Sie in einem einzigen Aufruf vier Scores ab: `python_depth`, `team_leadership`, `system_design`, `generalist`. Jede Dimension verwendet ihre eigenen Definitionen für die Bewertungskategorien (Bins).

### Schritt 2: Zusammenführung mit Gewichten

```python
py      = response.answers["python_depth"].score / 4
lead    = response.answers["team_leadership"].score / 4
arch    = response.answers["system_design"].score / 4
general = response.answers["generalist"].score / 4

# Senior IC (Senior Individual Contributor)
ic_score = (0.40 * py) + (0.10 * lead) + (0.40 * arch) + (0.10 * general)

# Engineering Manager
em_score = (0.15 * py) + (0.40 * lead) + (0.20 * arch) + (0.25 * general)
```

Jede Dimension wird zunächst auf 0–1 normiert und dann gewichtet.

## Der wahre Wert dieses Musters

Die gewichtete Sortierung ist nur der offensichtliche Vorteil. **Der wahre Wert liegt in der Erklärbarkeit.**

Beachten Sie, dass für zwei verschiedene Rollen **dieselben Scores, aber unterschiedliche Gewichte** verwendet wurden. Das bedeutet:

- Ein einziger Aufruf bedient zwei verschiedene Rekrutierungsziele, ohne dass sich die Kosten verdoppeln.
- Wenn die Rangfolge nicht den Erwartungen entspricht, können Sie die Gewichte direkt anpassen, ohne den Prompt neu zu optimieren.
- Wenn jemand fragt: „Warum steht dieser Kandidat an erster Stelle?“, können Sie die Verteilung der Scores pro Dimension und die angewendeten Gewichte darlegen.

**Keine Details der einzelnen Dimensionen gehen verloren.** Ein Kandidat mit starken Python-Kenntnissen, aber schwacher Führungserfahrung, steht auf der IC-Position vorne und auf der EM-Position hinten – dieser Unterschied wird durch die Gewichte kodiert, nicht durch eine neue Entscheidung des Modells.

## Debugging an Haltepunkten

Gewichte bieten einen weiteren praktischen Vorteil: **Sie können nach einzelnen Dimensionen sortieren, um Anomalien zu untersuchen.** Wenn die Gesamtrangfolge seltsam erscheint, sortieren Sie zunächst nur nach `python_depth`, um zu prüfen, ob dies der Intuition entspricht. Wenn dies nicht der Fall ist, liegt das Problem in der Definition der Bewertungskategorien für diese Dimension und nicht in den Gewichten. Diese Zerlegbarkeit ist mit der Methode „eine große Frage direkt an das Modell stellen“ nicht möglich.

Wenn Sie feststellen, dass eine Dimension keine ausreichende Unterscheidungskraft bietet (alle Kandidaten landen in derselben Kategorie), müssen Sie die Definition der Bewertungskategorien überarbeiten, anstatt die Gewichte anzupassen.

## Zusammenarbeit mit der Konfidenz

Jeder Dimension-Score ist mit einem `confidence`-Wert versehen. Ein niedriger Konfidenzwert ist ein Signal: Entweder sind die Definitionen der Bewertungskategorien mehrdeutig, oder im `state` fehlen die notwendigen Informationen für die Beurteilung.

Eine bewährte Praxis ist: Wenn die Konfidenz einer hochgewichteten Dimension unter einem bestimmten Schwellenwert liegt, markieren Sie den Kandidaten als „muss manuell überprüft werden“, anstatt ihn von einem unzuverlässigen Score dominieren zu lassen.

## Entwurfsrichtlinien

**Die Dimensionen müssen orthogonal sein.** Wenn zwei Dimensionen stark korrelieren (z. B. „Python-Tiefe“ und „Programmierfähigkeit“), führt die Gewichtung zu einer doppelten Zählung desselben Merkmals. Fragen Sie sich beim Design der Dimensionen: Kann sich diese Dimension unabhängig von den anderen verändern?

**Gewichte auf eine Summe von 1 normieren.** Dies erleichtert das Verständnis und die Anpassung.

**Zuerst normieren, dann gewichten.** Die Anzahl der Bewertungskategorien (Bins) variiert oft zwischen den Dimensionen. Ohne Normierung erhalten Dimensionen mit mehr Kategorien einen unverhältnismäßig großen Einfluss.

**Gewichte sind eine geschäftliche, keine technische Entscheidung.** Wer entscheidet über die Gewichtsunterschiede zwischen der IC- und der EM-Position? Das sollte der Fachbereich (Hiring Manager) sein, nicht der Ingenieur. Machen Sie die Gewichte konfigurierbar.

## Verwandt

- [Score](/zh/primitives/score/) — Die grundlegende Primitive dieses Musters
- [Fan-Out](/zh/patterns/fan-out/) — Abfrage aller Dimensionen in einem Schritt
- [Confidence](/zh/concepts/confidence/) — Umgang mit unzuverlässigen Dimension-Scores
