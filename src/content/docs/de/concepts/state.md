---
title: "Zustand"
description: "State ist das, was Sie das Modell bewerten lassen sollen. Verstehen Sie seine drei Formen, wie Sie den Kontext organisieren und welche Einschränkungen es in Bezug auf die Sprachunterstützung gibt."
section: concepts
order: 20
tags: ['state', 'context']
source: docs.typesafe.ai/concepts/state
translatedFrom: zh
---

## Was ist State?

**State** ist das, was Sie das System-One-Modell bewerten lassen. Es kann eine Kundenservice-Nachricht, ein Textabschnitt oder der aktuelle Zustand Ihrer Anwendung sein. Sie geben ihn im `state`-Feld der API-Anfrage zusammen mit der Frage, die Sie stellen möchten, an.

Bei jeder Anfrage wird **ein State** zur Bewertung von **einer oder mehreren Fragen** verwendet. Alle Fragen sehen denselben State und werden **unabhängig** voneinander ausgewertet. Sie können in einer einzigen Anfrage [Choice](/de/primitives/choice/)-, [Score](/de/primitives/score/)- und [Noul](/de/primitives/noul/)-Fragen mischen.

## Drei Formen

### String

Der einfachste State ist ein gewöhnlicher String:

```python
state = "My card was charged twice."
```

Dies eignet sich für einfache Szenarien, bei denen nur ein Textabschnitt erforderlich ist.

### Objekt

Wenn Entscheidungen den Vergleich mehrerer Teile erfordern, verwenden Sie ein Objekt, um die relevanten Informationen zusammenzufassen, wobei jeder Teil einen beschreibenden Namen trägt:

```json
{
  "ticket": {
    "subject": "Duplicate charge",
    "messages": [
      {"from": "customer", "text": "I was charged twice for order A-104. Please refund the duplicate."},
      {"from": "support", "text": "We are checking the charges."}
    ]
  },
  "order": {
    "id": "A-104",
    "charges": [
      {"amount_usd": 49, "status": "captured"},
      {"amount_usd": 49, "status": "captured"}
    ]
  },
  "refund_policy": "Duplicate charges are eligible for a refund."
}
```

Beachten Sie, dass dies **ein** State ist, obwohl er gleichzeitig einen Dialog, eine Bestellung und eine Richtlinie enthält. Die Richtlinie empfiehlt: **Verwenden Sie für die meisten Anfragen Objekte**, damit jeder Teil einen beschreibenden Namen hat und die Beziehungen klar bleiben.

### Array

Geeignet für Sequenzen von Nachrichten oder Datensätzen:

```python
state = ["Hi", "My customer number is TS1337.", "My card was charged twice."]
```

| Format | Geeignet für | Beispiel |
| :--- | :--- | :--- |
| String | Eine Nachricht, ein Artikel, ein Textabschnitt | `"My card was charged twice."` |
| Objekt | Benannte Felder, zusammenhängende Datensätze, Anwendungszustand | Siehe JSON oben |
| Array | Sequenz von Nachrichten oder Datensätzen | Siehe Array oben |

## Trennung von Inhalt und Frage

Dies ist eines der wichtigsten mentalen Modelle bei der Verwendung von Jev:

- **State enthält Inhalte und unterstützende Fakten.** Anfragen auf Rückerstattung, Bestellungsdaten und Rückerstattungsrichtlinien gehören in den State.
- **Fragen definieren die zu treffenden Urteile.** „Fordert der Benutzer eine Rückerstattung?“ oder „Unterstützt die Richtlinie die Rückerstattung?“ sind Fragen.

Schreiben Sie keine Urteilslogik in den State. Der State sollte das sein, was Sie vor die Experten legen würden – stellen Sie sich vor, Sie präsentieren einem Gremium von Experten die Unterlagen und bitten sie, jeweils ein Urteil zu fällen.

## Sprachunterstützung

Jev akzeptiert **reinen Text**. Der State muss ein String, ein JSON-Objekt oder ein Array von Texten sein.

- **Nicht unterstützt** werden Bilder, Audio und Video.
- Nicht-Texteingaben müssen vorverarbeitet werden, um sie in Text oder strukturierte Felder umzuwandeln, bevor sie als State übergeben werden.
- **Die Hauptsprache des Jev-Trainings ist Englisch.** Andere Sprachen (einschließlich Chinesisch, Japanisch und Koreanisch) werden akzeptiert, die Genauigkeit ist jedoch derzeit geringer.

Der letzte Punkt ist insbesondere für chinesischsprachige Nutzer wichtig: Wenn Ihr Geschäft chinesische Inhalte umfasst, wird empfohlen, die Genauigkeit zunächst mit echten Daten zu validieren, bevor Sie kritische Pfade in Produktion nehmen. Für Entscheidungen mit hohem Risiko erwägen Sie, im State eine englische Zusammenfassung hinzuzufügen oder bei niedriger Konfidenz manuell einzugreifen.

## Budget und Einschränkungen

- 64k Tokens pro Anfrage für den Kontext: Dies deckt `state` plus **alle** Fragen ab.
- 32k Tokens: Dies deckt `state` plus **die längste Frage** ab.
- Das Modell liest den State nur einmal und bewertet dann alle Fragen parallel. Daher verursacht das Bündeln mehrerer Fragen in einer Anfrage fast keine zusätzlichen Verzögerungskosten – siehe [Fan-Out-Muster](/de/patterns/fan-out/).
- Die Genauigkeit variiert mit der Größe des States; dies wird im Abschnitt `Jev 1.13 jaggedness` ausführlich erörtert.

## Verwandte Themen

- [Frage-Primitiven](/de/primitives/) — Wie Sie Fragen mit Anweisungen und Kriterien organisieren
- [Konfidenz](/de/concepts/confidence/) — Steuerung des Verhaltens anhand der Rückgabewerte
- [API-Referenz](https://docs.typesafe.ai/api) — Anforderungsschema
