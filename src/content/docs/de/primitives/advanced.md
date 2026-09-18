---
title: "Strukturierte Fragen"
description: "instructions und criteria akzeptieren beide JSON-Strukturen. Das System One-Modell wurde darauf trainiert, diese Strukturen zu verstehen; deren gezielte Nutzung kann die Genauigkeit komplexer Entscheidungen erheblich steigern."
section: primitives
order: 90
tags: ['instructions', 'criteria', 'structure']
source: docs.typesafe.ai/primitives/advanced
translatedFrom: zh
---

## Wo Strukturen verwendet werden können

Die folgenden Felder akzeptieren `string`, `object`, `array` oder `null`:

| Feld | Anwendbar auf |
| :--- | :--- |
| `instructions` | Choice, Score, Noul |
| Werte von `criteria` (Beschreibung der Choice-Optionen) | Choice |
| Einträge von `criteria` (Beschreibung der Score-Stufen) | Score |
| `criteria.true` / `criteria.false` | Noul |

**System One-Modelle sind darauf trainiert, Strukturen zu verstehen.** Dies ist keine Einschränkung, die umgangen werden muss, sondern eine Fähigkeit, die Sie aktiv nutzen sollten.

## Wann Sie strukturierte Schreibweisen verwenden sollten

- **Wenn sie die Klarheit verbessert.** Wenn eine Frage mehrere Teile enthält, ist die Verwendung von JSON, um die Teile in benannte Schlüssel einzufügen, deutlich lesbarer, als sie zu einem einzigen Template-String zusammenzufügen.
- **Wenn die Frage gestützte Daten benötigt.** Schemas, Klassifizierungssysteme und Datenbankzeilen sind von Natur aus JSON. Übergeben Sie sie als Ganzes oder nur die relevanten Unterfelder, anstatt sie in einen String zu serialisieren und dem Modell zu übergeben.

## Strukturierte Instructions: Eine wiederverwendbare Feldbeschreibung

Ein häufiges Muster besteht darin, ein `field`-Objekt zu verwenden, um das **zu überprüfende Feld** zu beschreiben, und dann mehrere Fragen über Schlüssel darauf zu verweisen.

Sehen Sie sich das Beispiel zur Rechnungswahrheitsprüfung an. `state` ist ein Rechnungstext:

```text
Invoice #4471 issued March 3, 2026 to Beaver Dam Logistics for $12,840.00, net 30.
```

Dann treibt **dieselbe `field`-Struktur** vier verschiedene Arten von Entscheidungen an – ein Noul zur Validierung eines Werts, ein Choice zur Auswahl eines Werts aus einer Kandidatenliste und zwei Scores, die den Wert auf eine Skala setzen:

```json
{
  "questions": {
    "invoice_number_is_correct": {
      "type": "noul",
      "instructions": {
        "field": {
          "name": "invoice_number",
          "type": "string",
          "description": "The identifier printed on the invoice."
        },
        "extracted_value": "4471",
        "question": "Does `extracted_value` match the `field` as it appears in `source_text`?"
      }
    },
    "customer_name": {
      "type": "choice",
      "instructions": {
        "field": {
          "name": "customer_name",
          "type": "string",
          "description": "The organization the invoice was issued to."
        },
        "question": "Which option is the value of `field` in `source_text`?"
      },
      "criteria": {
        "Beaver Logistics": null,
        "Dam Logistics": null,
        "Beaver Dam Logistics": null,
        "Beaver": null,
        "Dam": null
      }
    },
    "payment_terms": {
      "type": "score",
      "instructions": {
        "field": {
          "name": "payment_terms",
          "type": "integer",
          "unit": "days",
          "description": "Days allowed for payment, from terms such as \"net 30\"."
        },
        "question": "How many days does the `field` in `source_text` allow for payment?"
      },
      "criteria": ["Due on receipt", "Net 15", "Net 30", "Net 60", "Net 90 or longer"]
    }
  }
}
```

Der Wert dieses Beispiels liegt in der Demonstration der **Wiederverwendbarkeit von Strukturen**: In `field` werden Name, Typ, Einheit und Beschreibung deklariert, und jede Frage muss lediglich angeben, „welche Entscheidung getroffen werden soll“. Für strukturierte Extraktionsszenarien ist dies weitaus stabiler, als für jede Frage einen eigenen natürlichen Sprachprompt zu schreiben, da die Semantik des Felds nur einmal definiert wird.

Beachten Sie auch das Choice für `customer_name`: Die Optionen sind eine Gruppe **leicht zu verwechselnder, ähnlicher Strings** (Beaver Logistics / Dam Logistics / Beaver Dam Logistics / Beaver / Dam). Das „Auswählen des korrekten Werts aus ähnlichen Kandidaten“ ist eine typische Stärke von Choice; die Verwendung von Noul für jede einzelne Prüfung wäre sowohl langsamer als auch anfälliger für Inkonsistenzen.

## Strukturierte Score-Kriterien

Jeder Eintrag im `criteria`-Array von Score kann ein Objekt sein, um der Stufe zusätzliche Informationen hinzuzufügen (z. B. numerische Intervalle, Beispiele).

## Strukturierte Noul-Kriterien

Die `criteria` von Noul sind optional. Wenn die Grenze zwischen Ja und Nein subtil ist, ermöglichen Ihnen strukturierte Beschreibungen für `true` und `false`, auf beiden Seiten Definitionen und Beispiele anzugeben, um die Grenze eindeutig festzulegen.

## Hierarchische Klassifizierung: Verkettete Choices

Um eine Einordnung in einem tiefen Klassifizierungssystem vorzunehmen, **rufen Sie Choice schichtweise auf**, anstatt den gesamten Klassifizierungsbaum auf einmal in die Optionen einer einzigen Frage zu packen.

So gehen Sie vor: Fragen Sie in der ersten Schicht nach der übergeordneten Abteilung, wobei die Optionen die einzelnen Abteilungen sind und der Wert die Struktur des **Unterbahums** dieser Abteilung darstellt. Prüfen Sie anhand der `probabilities`, ob die Aufspaltung nah beieinander liegt – wenn ja, erkunden Sie beide Zweige.

Sobald eine Abteilung ausgewählt wurde, verwenden Sie in der nächsten Schicht die untergeordneten Knoten dieser Abteilung als Optionen und deren Unterbäume als Werte, wiederholen Sie dies, bis Sie die Blattknoten erreichen. Im Code kann dies eine Schleife über verschachtelte Wörterbücher sein, wobei die `criteria` jeder Frage dem aktuellen Knoten entsprechen.

Es gibt ein offizielles Hierarchical Classification Cookbook, das eine ähnliche Baumtraversierung zeigt, einschließlich der Strategie, bei nah beieinander liegenden Wahrscheinlichkeiten mehrere Kandidatenpfade mit Beam Search zu behalten.

> **Hinweis**: Unterbäume können sehr groß werden. Wenn ein Zweig zu groß wird, kürzen Sie den Wert auf seine direkten untergeordneten Knoten plus eine kleine Stichprobe von Blattknoten.

## Verwandte Themen

- [Choice](/zh/primitives/choice/) / [Score](/zh/primitives/score/) / [Noul](/zh/primitives/noul/)
- [Fan-Out-Muster](/zh/patterns/fan-out/) – Bündeln Sie viele Fragen in einer einzigen Anfrage
- [So erstellen Sie ein System-One-System](https://docs.typesafe.ai/concepts/how-to-build-with-system-one) – Der offizielle vollständige Workflow
