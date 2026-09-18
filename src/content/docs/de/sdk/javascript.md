---
title: "JavaScript / TypeScript SDK"
description: "Installieren Sie @typesafe-ai/sdk, um die System-One-API über einen Client mit automatischer Typableitung aufzurufen."
section: sdk
order: 30
tags: ['javascript', 'typescript', 'sdk']
source: docs.typesafe.ai/sdk/javascript
translatedFrom: zh
---

## Installation

Node.js 20 oder höher ist erforderlich:

```bash
npm install @typesafe-ai/sdk
```

Erstellen Sie nach dem Festlegen der Umgebungsvariablen den Client:

```bash
export TYPESAFE_API_KEY="sk-..."
```

## Grundlegende Verwendung

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

## Typableitung

Dies ist der wertvollste Teil der TS SDK: **Die Antworttypen werden automatisch aus den übergebenen Fragen abgeleitet**.

```ts
questions: {
  category: choice("What is this ticket about?", {
    billing: null,
    technical: null,
    other: null,
  }),
}
```

Da die Schlüssel von `criteria` `billing` / `technical` / `other` sind, ist der Typ von `response.answers.category.choice` die Vereinigung dieser drei Literal-Typen. Das Schreiben von `"bililng"` führt zu einem Fehler zur Kompilierzeit, anstatt zur Laufzeit `undefined` zurückzugeben.

Ebenso haben Antworten auf Fragen, die mit `score(...)` erstellt wurden, die Felder `score`, `legend`, `probabilities` und `confidence`; Antworten auf Fragen, die mit `noul(...)` erstellt wurden, enthalten nur `noul`.

Dies bedeutet, dass Sie **keine manuellen Typdefinitionen für Antworten schreiben** müssen und die API-Antworten nicht als `any` behandeln müssen.

## Antwortstruktur

```ts
response.answers.category.choice;        // Ausgewählte Option
response.answers.category.probabilities; // Wahrscheinlichkeiten für jede Option
response.answers.category.confidence;    // Konfidenzwert
```

Alle Fragetypen sind einheitlich unter `response.answers` nach Fragename indiziert; die spezifischen Felder hängen vom Typ der Frage ab.

## Paketstruktur

Die SDK stellt gleichzeitig Produkte im ESM-, CommonJS-Format sowie TypeScript-Deklarationsdateien bereit, sodass sie in verschiedenen Build-Umgebungen direkt verwendet werden können.

Wenn Sie alle Optionen und Standardwerte kennenlernen möchten, können Sie die [client](https://github.com/typesafe-ai/typesafe-sdk-js/blob/v0.6.0/src/client.ts) und [types](https://github.com/typesafe-ai/typesafe-sdk-js/blob/v0.6.0/src/types.ts) der SDK einsehen.

## Verwandte Themen

- [Schnellstart in 5 Minuten](/zh/quickstart/)
- [Fragetypen (Primitives)](/zh/primitives/) — Wie man die drei Arten von Fragen erstellt
- [Fan-Out Parallelisierung](/zh/patterns/fan-out/) — Stellen Sie mehrere Fragen auf einmal
