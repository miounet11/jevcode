---
title: "Python SDK"
description: "Installieren Sie typesafe-sdk und rufen Sie die System One API mit einem synchronen oder asynchronen Client auf."
section: sdk
order: 20
tags: ['python', 'sdk', 'async']
source: docs.typesafe.ai/sdk/python
translatedFrom: zh
---

## Installation

```bash
# Mit uv
uv add typesafe-sdk

# Oder mit pip
pip install typesafe-sdk
```

Anschließend setzen Sie die Umgebungsvariable (erstellen Sie einen Schlüssel im [Console](https://console.typesafe.ai/)):

```bash
export TYPESAFE_API_KEY="sk-..."
```

Der Client liest diese Umgebungsvariable automatisch aus und ruft standardmäßig `jev-latest` auf.

## Asynchroner Client (empfohlen)

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

Beachten Sie drei Punkte:

1. `state` kann direkt als String, Dictionary oder Liste übergeben werden; der SDK übernimmt die Serialisierung.
2. Die drei Fragetypen werden mit `Noul(...)` / `Choice(...)` / `Score(...)` konstruiert; das Feld `type` wird vom SDK automatisch ausgefüllt.
3. **Die Antwort ist nach Fragetyp gruppiert** —— `response.nouls`, `response.choices`, `response.scores`, jeweils indexiert nach dem Namen der Frage.

## Fragetyp-Konstruktoren

| Konstruktor | Parameter | Beschreibung |
| :--- | :--- | :--- |
| `Noul(instructions, criteria=None)` | `criteria` optional, `{ true, false }` | Ja/Nein-Wahrscheinlichkeit |
| `Choice(instructions, criteria)` | `criteria` ist `{ Option: Beschreibung oder None }` | Wählt eine aus festen Optionen |
| `Score(instructions, criteria)` | `criteria` ist ein **geordnetes Array** | Punktzahl auf einer geordneten Skala |

## Synchroner Client

Falls die Umgebung keine Verwendung von Async ermöglicht, steht auch eine synchrone Version zur Verfügung:

```python
from typesafe_sdk import TypeSafeClient, Noul

client = TypeSafeClient()

response = client.system_one(
    state="I was charged twice.",
    questions={"billing": Noul(instructions="Is this about billing?")},
)

print(response.nouls["billing"].noul)
```

## Fehler und Wiederholungen

Der SDK wiederholt Anfragen standardmäßig gemäß einer Backoff-Strategie und respektiert den vom Server zurückgegebenen `retry-after`-Header. Dies ist deutlich bequemer als der direkte Aufruf der HTTP API —— da die Rate-Limits dynamisch angepasst werden und das offizielle Dokumentationsmaterial explizit darauf hinweist, dass sich die Limits jederzeit ändern können.

## Weiterführende Links

- [Vollständige Python SDK API-Referenz](https://docs.typesafe.ai/sdk/python/api/clients/async/client)
- [Schnellstart in 5 Minuten](/de/quickstart/)
- [Fan-Out Parallel](/de/patterns/fan-out/) — Stellen Sie mehrere Fragen gleichzeitig
