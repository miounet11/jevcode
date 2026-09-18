---
title: "In 5 Minuten einsteigen"
description: "Holen Sie sich den API-Schlüssel, führen Sie den ersten Jev-Aufruf mit cURL oder dem SDK aus und verstehen Sie die Struktur der Antwort."
section: start
order: 20
tags: ['quickstart', 'api', 'sdk']
source: docs.typesafe.ai/introduction/quickstart
translatedFrom: zh
---

## Schritt 1: Im Playground ausprobieren

Öffnen Sie das [Playground](https://console.typesafe.ai/playground) und melden Sie sich an. Fügen Sie beliebigen Text als **state** ein:

```text
Hi, I've been trying to connect my Stripe account for 3 days and it keeps failing.
I'm losing sales. Please help ASAP.
```

Fügen Sie anschließend eine Noul-Frage hinzu:

```json
{
  "urgency": {
    "type": "noul",
    "instructions": "Does this message express urgency?"
  }
}
```

Sie erhalten sofort einen Wert zwischen 0 und 1. Ein Wert nahe 1 bedeutet, dass das Modell die Antwort als „Ja“ einschätzt.

Der Wert des Playgrounds liegt im **schnellen Ausprobieren**: Mischen Sie Fragen der Typen Noul, Choice und Score und rufen Sie sie in einem einzigen Aufruf auf, um alle Ergebnisse gleichzeitig zu sehen und zu bestätigen, ob die Formulierung der Fragen den Erwartungen entspricht.

## Schritt 2: API-Key erhalten

Erstellen Sie einen Key im [Dashboard](https://console.typesafe.ai/settings/keys) und setzen Sie die Umgebungsvariable:

```bash
export TYPESAFE_API_KEY="sk-..."
```

## Schritt 3: API aufrufen

Alle Modelle werden über denselben Endpunkt bereitgestellt:

```http
POST https://api.typesafe.ai/v1/systemone
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

Minimal funktionierendes cURL-Beispiel:

```bash
curl -X POST https://api.typesafe.ai/v1/systemone \
  -H "Authorization: Bearer $TYPESAFE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "jev-latest",
    "state": "Hi, I have been trying to connect my Stripe account for 3 days and it keeps failing. I am losing sales. Please help ASAP.",
    "questions": {
      "department": {
        "type": "choice",
        "instructions": "Which team should handle this",
        "criteria": {
          "billing": "Payment or subscription issues",
          "technical": "Bugs or integration problems",
          "sales": "Pricing or account questions"
        }
      },
      "frustration": {
        "type": "score",
        "instructions": "How frustrated the customer appears",
        "criteria": [
          "Calm, just stating facts",
          "Frustrated but civil",
          "Very angry, strong language"
        ]
      },
      "is_urgent": {
        "type": "noul",
        "instructions": "The message conveys urgency"
      }
    }
  }'
```

## Schritt 4: SDK verwenden (empfohlen)

Das SDK liest standardmäßig `TYPESAFE_API_KEY` aus der Umgebungsvariable und ruft standardmäßig `jev-latest` auf.

### Python

```bash
pip install typesafe-sdk     # oder uv add typesafe-sdk
```

```python
from typesafe_sdk import AsyncTypeSafeClient, Choice, Noul, Score

async def main() -> None:
    async with AsyncTypeSafeClient() as client:
        response = await client.system_one(
            state={"document": "I was charged twice. Please fix this ASAP."},
            questions={
                "billing": Noul(instructions="Is this ticket about billing?"),
                "tone": Choice(
                    instructions="What is the customer's tone?",
                    criteria={"calm": None, "frustrated": None, "angry": None},
                ),
                "urgency": Score(
                    instructions="How urgent is this ticket?",
                    criteria=["can wait", "this week", "today"],
                ),
            },
        )

    print(response.nouls["billing"].noul)
    print(response.choices["tone"].choice)
    print(response.scores["urgency"].score)
```

### TypeScript / JavaScript

```bash
npm install @typesafe-ai/sdk    # erfordert Node.js 20+
```

```ts
import { choice, TypeSafeClient } from "@typesafe-ai/sdk";

const client = new TypeSafeClient();
const response = await client.systemOne({
  state: { document: "I was charged twice. Please fix this ASAP." },
  questions: {
    category: choice("What is this ticket about?", {
      billing: null,
      technical: null,
      other: null,
    }),
  },
});

console.log(response.answers.category.choice);
```

Ein großer Vorteil des TS-SDKs ist, dass **die Antworttypen automatisch aus den Fragen abgeleitet werden**: Die übergebenen `questions` bestimmen den Typ des Rückgabewerts, sodass Tippfehler bei Feldnamen bereits zur Kompilierzeit erkannt werden.

## So sieht die Rückgabe aus

Der Typ jeder Antwort wird durch den `type` der Frage bestimmt:

| Typ | Rückgabefeld | Bedeutung |
| :--- | :--- | :--- |
| `choice` | `choice` / `probabilities` / `confidence` | Ausgewählte Option, Wahrscheinlichkeitsverteilung über die Optionen, Konfidenz |
| `score` | `score` / `legend` / `probabilities` / `confidence` | Position der Punktzahl (kann zwischen zwei Stufen liegen), Beschreibung der Stufen, Wahrscheinlichkeitsverteilung, Konfidenz |
| `noul` | `noul` | Wahrscheinlichkeit, dass die Antwort „Ja“ ist; enthält selbst keine `confidence` |

Wichtige Einschränkung: **Die Antwort liegt immer innerhalb der von Ihnen vorgegebenen Optionen.** Das Modell gibt eine Wahrscheinlichkeitsverteilung über Ihre definierten Optionen zurück und erzeugt keine Werte außerhalb dieser Menge. Daher benötigen Sie in Ihrem Code keinen Parser, um die Semantik wiederherzustellen.

## Häufige Fallstricke

- **`state` im Status wird nur einmal gelesen**: Das Modell liest den state einmal und bewertet dann alle Fragen parallel. Packen Sie daher mehrere Fragen so früh wie möglich in dieselbe Anfrage, da dies kaum zusätzliche Latenzkosten verursacht.
- **Nicht-Texteingaben müssen zuerst konvertiert werden**: Bilder, Audio und Video müssen zunächst in Text oder strukturierte Felder umgewandelt werden, bevor sie als state übergeben werden.
- **Überschreitung des Limits führt zu 429**: Das offizielle SDK führt standardmäßig exponentielle Backoff-Wiederholungen durch und respektiert den `retry-after`-Header; bei direktem HTTP-API-Aufruf müssen Sie dies selbst implementieren.

## Nächste Schritte

- [Choice-Primitiv](/zh/primitives/choice/) — Grundlage für Klassifizierung und Routing
- [Score-Primitiv](/zh/primitives/score/) — Bewertung und Sortierung
- [Noul-Primitiv](/zh/primitives/noul/) — Validierung und Schutzmechanismen
- [Konfidenz](/zh/concepts/confidence/) — Steuerung des Systemverhaltens mittels Konfidenz
