---
title: "Auswahl"
description: "Choice wählt eine Option aus einer festen Menge aus. Die Antwort enthält die gewählte Option, die Wahrscheinlichkeit für jede Option sowie das Konfidenzniveau."
section: primitives
order: 20
tags: ['choice', 'classification', 'routing']
source: docs.typesafe.ai/primitives/choice
translatedFrom: zh
---

## Wann verwenden?

Verwenden Sie `Choice`, wenn die Antwort auf **eine feste Menge sich gegenseitig ausschließender Optionen** beschränkt ist. Beispiele:

- Welches Team bearbeitet dieses Ticket?
- Zu welcher Kategorie gehört das Produkt?
- In welcher Sprache ist dieser Code geschrieben?

Wenn die Antwort eine Position auf einem kontinuierlichen Spektrum ist, verwenden Sie [Score](/zh/primitives/score/); wenn es sich um eine einfache Ja/Nein-Entscheidung handelt, verwenden Sie [Noul](/zh/primitives/noul/).

Typische Fragebeispiele:

```text
"What programming language is this code written in"
  → options: python, javascript, typescript, go, rust, other

"What type of meeting is this based on the title and description"
  → options: standup, planning, retrospective, one on one, brainstorm, none of the above
```

## Parameter

| Parameter | Erforderlich | Beschreibung |
| :--- | :--- | :--- |
| `type` | Ja | Muss `"choice"` sein |
| `instructions` | Ja | Die eigentliche Frage, die die zu treffende Entscheidung beschreibt |
| `criteria` | Ja | Definition der Optionen. Im Objektformat `{ Option: Beschreibung }`, wobei die Beschreibung `null` sein kann |

Jeder Eintrag in `instructions` und `criteria` kann ein **String, ein Objekt oder ein Array** sein. Beginnen Sie mit Strings; wechseln Sie zu Objekten, wenn eine Option mehrere Anweisungen benötigt (z. B. was abgedeckt wird, was nicht abgedeckt wird, sowie Beispiele).

## Beispiel für eine Anfrage

Klassifizieren Sie Kundensupport-Tickets nach Abteilung:

```python
from typesafe_sdk import Choice, TypeSafeClient

client = TypeSafeClient()

ticket = "Hi, I've been trying to connect my Stripe account for 3 days and it keeps failing."

response = client.system_one(
    state=ticket,
    questions={
        "department": Choice(
            instructions="Which team should handle this ticket?",
            criteria={
                "returns": "Refunds, wrong or damaged items",
                "shipping": "Delivery status, delays, lost packages",
                "billing": "Charges, invoices, payment problems",
            },
        ),
    },
)

print(response.answers["department"].choice)
```

## Rückgabewert

```json
{
  "model": "jev-latest",
  "answers": {
    "department": {
      "type": "choice",
      "choice": "billing",
      "probabilities": {
        "returns": 0.02,
        "shipping": 0.05,
        "billing": 0.93
      },
      "confidence": 0.91
    }
  },
  "usage": { "input_tokens": 360, "output_tokens": 39 }
}
```

| Feld | Bedeutung |
| :--- | :--- |
| `choice` | Der Name der ausgewählten Option |
| `probabilities` | Die Wahrscheinlichkeitsverteilung über jede Option |
| `confidence` | Ein aggregierter Wert für die Konzentration dieser Verteilung, zwischen 0 und 1 |

`probabilities` sind die Rohdaten, die Sie benötigen, um eigene, aussagekräftigere Metriken zu definieren – weitere Einzelheiten finden Sie unter [Confidence](/zh/concepts/confidence/).

## Best Practices

**Bieten Sie immer eine Fallback-Option an.** Fügen Sie eine Option wie `other` oder `none of the above` hinzu, damit das Modell eine Antwort geben kann, wenn keine der anderen Optionen passt, statt gezwungen zu sein, die „am wenigsten schlechte“ Option auszuwählen. Dies reduziert Fehlklassifizierungen in Randfällen erheblich.

**Beschreiben Sie die „Grenzen“ der Optionen.** Der Wert einer Beschreibung liegt darin, klarzustellen, was „inklusive“ und was „exklusive“ ist. Im obigen Beispiel lautet die Beschreibung für `billing` „Charges, invoices, payment problems“ und nicht das vage „Geldbezogene Dinge“.

**Wenn die Optionsnamen eindeutig sind, kann die Beschreibung direkt als `null` übergeben werden.** Zum Beispiel bei einer dreistufigen Tonfall-Klassifizierung: `{ "calm": null, "frustrated": null, "angry": null }` – die Optionsnamen sind bereits eindeutig, und zusätzliche Beschreibungen könnten eher Rauschen einführen.

**Spekulative Fragen verursachen keine zusätzlichen Kosten.** In dem folgenden komplexeren Beispiel ist `return_reason` nur relevant, wenn `department` `returns` ist, und `shipping_issue` nur relevant, wenn `department` `shipping` ist. Wenn Sie sie alle vorab in dieselbe Anfrage aufnehmen, wird die Geschwindigkeit nicht beeinträchtigt – das Modell bewertet alle Fragen parallel. Solche Fragen werden als **spekulative Fragen** (speculative questions) bezeichnet.

**Für tief verschachtelte Klassifizierungen verwenden Sie eine Kette.** Wenn Sie Dokumente in einer tiefen Hierarchie oder einem großen Klassifizierungssystem kategorisieren möchten, verketten Sie die `Choice`-Fragen schrittweise. Es gibt ein offizielles Cookbook, das erklärt, wie man eine Beam Search auf den Wahrscheinlichkeiten von `Choice` ausführt: Dabei werden in jeder Ebene die besten K Pfadkandidaten beibehalten, anstatt gierig nur einen einzigen Pfad zu wählen.

## Verwandt

- [Score](/zh/primitives/score/) — Bewertung auf einer geordneten Skala
- [Noul](/zh/primitives/noul/) — Ja/Nein-Wahrscheinlichkeit
- [Intent Routing Pattern](/zh/patterns/intent-routing/) — Die häufigste Produktionsanwendung für Choice
- [Confidence](/zh/concepts/confidence/) — Steuerung des Verhaltens mit `probabilities` und `confidence`
