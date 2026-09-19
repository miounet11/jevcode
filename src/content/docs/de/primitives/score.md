---
title: "Punktzahl"
description: "Score weist dem Inhalt eine Bewertung basierend auf einer geordneten, beschreibenden Skala zu. Die Antwort besteht aus dem Score, der Wahrscheinlichkeit jeder Stufe und dem Konfidenzwert; der Score kann zwischen zwei Stufen liegen."
section: primitives
order: 30
tags: ['score', 'ranking', 'rating']
source: docs.typesafe.ai/primitives/score
translatedFrom: zh
---

## Wann verwenden?

Wenn die Antwort auf einem **kontinuierlichen Spektrum** liegt, das durch eine Reihe von Stufen beschrieben werden kann, verwenden Sie `Score`. Beispiele:

- Wie schwerwiegend ist ein Bug?
- Wie zufrieden ist ein Kunde?
- Wie tiefgehend sind die Python-Kenntnisse eines Bewerbers?

Wenn die Antwort aus einer festen Auswahl von Optionen besteht und zwischen diesen Optionen **keine Ordnungsbeziehung** besteht, verwenden Sie [Choice](/de/primitives/choice/); handelt es sich um eine Ja/Nein-Frage, verwenden Sie [Noul](/de/primitives/noul/).

Typische Beispielprobleme:

```text
"How severe is the bug being reported?"
  → 0: Cosmetic; no impact to functionality
  → 1: Broken or degraded feature, but workaround exists
  → 2: Blocking issue; no workaround exists

"How formal is this outfit based on the description"
  → 0: gym clothes
  → 1: casual
  → 2: business casual
  → 3: formal
  → 4: black tie
```

Beachten Sie, dass die Stufen im zweiten Beispiel von 0 bis 4 **geordnet** sind – von der lockersten bis zur formellsten Kleidung. Dies ist der entscheidende Unterschied zwischen `Score` und `Choice`. Im Gegensatz dazu gibt es zwischen `{ billing, technical, sales }` keine echte Ordnungsbeziehung; die erzwungene Verwendung von `Score` würde nur eine falsche ordinale Semantik einführen.

## Parameter

| Parameter | Erforderlich | Beschreibung |
| :--- | :--- | :--- |
| `type` | Ja | Muss `"score"` sein |
| `instructions` | Ja | Die eigentliche Frage |
| `criteria` | Ja | **Array von Stufen**, sortiert von niedrig nach hoch; die Beschreibung jedes Elements definiert die jeweilige Stufe |

Im Gegensatz zu `criteria` bei `Choice`, das ein Objekt ist, ist `criteria` bei `Score` ein **geordnetes Array**. Die Reihenfolge des Arrays entspricht der Richtung der Skala.

Wie bei `Choice` kann jedes Element in `criteria` auch ein String, ein Objekt oder ein Array sein – verwenden Sie ein Objekt, wenn eine Stufe mehr Erläuterungen erfordert.

## Beispiel für eine Anfrage

```python
from typesafe_sdk import Score, TypeSafeClient

client = TypeSafeClient()

bug = "The export button throws a CORS error when saving to Google Sheets. It works in Chrome, but a few of our customers only use Safari."

response = client.system_one(
    state=bug,
    questions={
        "bug_severity": Score(
            instructions="How severe is the reported issue?",
            criteria=[
                "Cosmetic; no impact to functionality",
                "Broken or degraded feature, but workaround exists",
                "Blocking issue; no workaround exists",
            ],
        ),
    },
)

print(response.answers["bug_severity"].score)
```

## Rückgabewert

Das entscheidende Merkmal der `Score`-Antwort ist, dass `score` **zwischen zwei Stufen liegen kann** – er repräsentiert eine Position auf der Skala und nicht den Index einer Stufe.

| Feld | Bedeutung |
| :--- | :--- |
| `score` | Position auf der Skala, kann eine Dezimalzahl sein |
| `legend` | Wiederholt Ihre Stufenbeschreibungen mit ihren Indizes, um die Zuordnung zu den semantischen Bedeutungen im Code zu erleichtern |
| `probabilities` | Wahrscheinlichkeitsverteilung auf jeder Stufe |
| `confidence` | Konzentrationsgrad der Verteilung, Wert zwischen 0 und 1 |

Angenommen, das obige Beispiel gibt `score: 1.4` zurück: Dies bedeutet, dass das Modell die Schwere des Problems als zwischen „defektes oder beeinträchtigtes Feature, aber mit Workaround“ und „blockierendes Problem ohne Workaround“ einstuft, wobei die Tendenz zur ersten Stufe geht. Diese **Kontinuität ist der Kernvorteil von `Score` gegenüber der Kombination mehrerer `Noul`-Aufrufe** – ein einziger Aufruf liefert die vollständige Verteilungsinformation, anstatt mehrere unabhängige Urteile zu erhalten.

Der Zweck von `legend` ist es, den Rückgabewert selbsterklärend zu machen: Sie müssen im Code keine separate Konstantentabelle für die Stufenpflegen, um Zahlen wieder in semantische Bedeutungen zu übersetzen.

## Wichtige Hinweise

**Stufenbeschreibungen müssen diskriminierbar sein.** Die Beschreibung jeder Stufe sollte es einer anderen Person ermöglichen, die Grenzen konsistent zu beurteilen. Beschreibungen wie `"Calm, matter-of-fact"` / `"Frustrated but civil"` / `"Very angry"` sind diskriminierbar; `"Niedrig / Mittel / Hoch"` ist dies nicht.

**Halten Sie die Anzahl der Stufen zwischen 3 und 5.** Zu wenige Stufen führen zu einem Verlust an Unterscheidungsvermögen, zu viele Stufen lassen die Grenzen zwischen benachbarten Stufen verschwimmen, was das Konfidenzniveau senkt.

**Konzentrieren Sie sich auf `confidence` und nicht nur auf `score`.** Ein niedriges Score-Konfidenzniveau deutet normalerweise darauf hin, dass die Stufendefinitionen mehrdeutig sind, die Skala multidimensional ist oder die `state`-Informationen unzureichend sind. In diesem Fall ist die richtige Reaktion die Verbesserung der Stufendefinitionen, anstatt einen willkürlichen Wert zu erzwingen.

**Im Ranking-Kontext ist `Score` das primäre Primitive.** Relevanz-Ranking, Qualitätsbewertungen und Risikoklassifizierungen eignen sich gut für `Score`, kombiniert mit dem [Composite Scoring Pattern](/de/patterns/composite-scoring/), um mehrere Dimensionen gewichtet zu kombinieren.

## Verwandt

- [Choice](/de/primitives/choice/) — Ungeordnete feste Optionen
- [Noul](/de/primitives/noul/) — Ja/Nein-Wahrscheinlichkeiten
- [Composite Scoring Pattern](/de/patterns/composite-scoring/) — Gewichtung und Synthese mehrerer Dimensionen
- [Confidence](/de/concepts/confidence/) — Was bedeutet ein niedriges Konfidenzniveau?
