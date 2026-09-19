---
title: "Noul"
description: "Noul ermöglicht es dem Modell, eine Ja/Nein-Frage zu bewerten und die Wahrscheinlichkeit für die Antwort „Ja“ zurückzugeben. Der Wert liegt direkt im Bereich von 0 bis 1 und enthält kein separates Confidence-Maß."
section: primitives
order: 40
tags: ['noul', 'verification', 'guardrails']
source: docs.typesafe.ai/primitives/noul
translatedFrom: zh
---

## Wann verwenden

Verwenden Sie Noul, wenn die Antwort eine **Ja-oder-Nein-Entscheidung** ist. Beispiele:

- Fordert diese Nachricht eine Rückerstattung an?
- Erwähnt dieser Lebenslauf Erfahrung mit verteilten Systemen?
- Enthält dieser Kommentar personenbezogene Daten?

Wenn die Antwort aus einer Gruppe von Optionen besteht, verwenden Sie [Choice](/de/primitives/choice/); wenn es sich um eine Position auf einem Spektrum handelt, verwenden Sie [Score](/de/primitives/score/).

Beispiele für typische Fragen:

```text
"Is the customer requesting a refund?"
"Does this resume mention experience with distributed systems?"
"Does the message contain personally identifiable information?"
"Does the room have a minifridge?"
```

## Parameter

| Feld | Erforderlich | Beschreibung |
| :--- | :--- | :--- |
| `type` | Ja | Muss `"noul"` sein |
| `instructions` | Ja | Die zu bewertende Ja-oder-Nein-Frage oder Aussage |
| `criteria` | Nein | Optionale `{ true, false }`-Beschreibungen, die klären, was „Ja“ und „Nein“ jeweils bedeuten |

`criteria` ist optional. `instructions` reichen für die meisten Noul-Fragen aus; verwenden Sie `criteria` nur, wenn die Grenze zwischen „Ja“ und „Nein“ subtil ist, um die Bedeutung der beiden Ergebnisse eindeutig festzulegen. **Es wird empfohlen, beide Formulierungen auszuprobieren**, um zu sehen, welche auf Ihren Daten besser funktioniert.

## Beispiel für eine Anfrage

```python
from typesafe_sdk import Noul, TypeSafeClient

client = TypeSafeClient()

response = client.system_one(
    state=ticket_conversation,
    questions={
        "is_human_escalation": Noul(
            instructions="Is the customer asking to speak to a human?",
        ),
        "is_repeat_contact": Noul(
            instructions="Has this customer contacted us about this issue before?",
        ),
    },
)

print(response.nouls["is_human_escalation"].noul)
```

## Rückgabewerte

```json
{
  "model": "jev-latest",
  "answers": {
    "is_human_escalation": {
      "type": "noul",
      "noul": 0.99
    },
    "is_repeat_contact": {
      "type": "noul",
      "noul": 0.93
    }
  },
  "usage": { "input_tokens": 360, "output_tokens": 39 }
}
```

Der Wert von `noul` liegt zwischen 0 und 1 und gibt die Wahrscheinlichkeit an, dass die Antwort **„Ja“** lautet. Für harte Entscheidungen im Code wird dieser Wert üblicherweise anhand eines Schwellenwerts in einen booleschen Wert umgewandelt.

## Noul gibt kein separates confidence zurück

Dies ist ein wichtiger Unterschied zwischen Noul und den beiden anderen Primitiven: **Noul ist selbst die Wahrscheinlichkeit**, daher gibt es kein zusätzliches `confidence`-Feld.

- Nahe 1: Starkes „Ja“
- Nahe 0: Starkes „Nein“
- Nahe 0.5: Wahrscheinlichkeiten für Ja und Nein sind ähnlich

## Die Formulierung entscheidet alles

**Stellen Sie sicher, dass hohe Wahrscheinlichkeiten „Ja“ entsprechen.** Die offizielle Empfehlung lautet, Fragen so zu formulieren, dass die Bedeutung der Rückgabewerte eindeutig ist. Wenn Sie „Is this not urgent?“ (Ist dies nicht dringend?) schreiben, bedeutet 0.9 „nicht dringend“, was für den Codeleser leicht zu verwechseln ist. Schreiben Sie stattdessen „Is this urgent?“ (Ist dies dringend?), dann bedeutet 0.9 „dringend“.

**Definieren Sie einen klaren Beurteilungsmaßstab.** Nehmen wir das Beispiel „Is the candidate strong in Python?“ (Ist der Kandidat stark in Python?): Sie müssen zuerst definieren, was „stark“ bedeutet. Eine unklare Definition macht die Wahrscheinlichkeiten schwer interpretierbar.

**0.5 bedeutet nicht „mittleres Niveau“.** Dies ist der häufigste Missbrauch: 0.5 bedeutet, dass das Modell zwischen Ja und Nein nicht unterscheiden kann, nicht „ein halbes Niveau“. Um die Tiefe einer Fähigkeit zu messen, sollten Sie [Score](/de/primitives/score/) verwenden, um auf definierten Stufen zu punkten.

**Sie können Anweisungen als auszuwertende wahre oder falsche Aussagen formulieren.** Neben Fragen können Sie Anweisungen auch als Aussagen formulieren, deren Wahrheit das Modell bewerten soll. Zum Beispiel für die Tatsache „Der Kunde fordert eine Rückerstattung“. Bei einer Aussage bedeutet ein Wert nahe 1, dass die Aussage wahr ist. **Es lohnt sich, beide Formulierungen mit Ihren eigenen Daten auszuprobieren.**

## Verwandt

- [Choice](/de/primitives/choice/) — Ungeordnete, feste Optionen
- [Score](/de/primitives/score/) — Bewertung auf einer geordneten Skala
- [Confidence](/de/concepts/confidence/) — Warum Noul kein confidence hat
- [Noul in Guardrails](https://docs.typesafe.ai/patterns) — Offizielle Musterbibliothek
