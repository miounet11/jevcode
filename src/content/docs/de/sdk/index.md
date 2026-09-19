---
title: "SDK und Integration"
description: "Die Wahl zwischen dem offiziellen Client-SDK und der HTTP-API sowie die für KI-Coding-Agents vorgesehenen Skills."
section: sdk
order: 10
tags: ['sdk', 'api']
source: docs.typesafe.ai/sdk
translatedFrom: zh
---

## Drei Integrationsmethoden

| Methode | Geeignet für | Merkmale |
| :--- | :--- | :--- |
| [Python SDK](/de/sdk/python/) | Backend-Dienste, Datenpipelines, Batch-Verarbeitung | Synchroner/Asynchroner Client, typisierte Eingaben, automatische Wiederholung |
| [JavaScript SDK](/de/sdk/javascript/) | Node.js-Dienste, Full-Stack-Anwendungen | TypeScript-Typableitung, Antworttypen werden automatisch aus der Frage abgeleitet |
| HTTP API | Andere Sprachen, leichte Integration | Direktes POST, Wiederholung und Drosselung müssen selbst verarbeitet werden |

Wenn in Ihrem Team KI-Coding-Agents den Integrationscode schreiben, wird empfohlen, zuerst das [TypeSafe agent skill](/de/sdk/agent-skill/) zu installieren. Dadurch weiß der Agent über die genaue Struktur von Anfrage und Antwort Bescheid und vermeidet es, Code basierend auf Vermutungen zu schreiben.

## Gemeinsame Konventionen

Alle SDKs teilen sich dieselben Konventionen:

- **Endpunkt**: `POST https://api.typesafe.ai/v1/systemone`
- **Authentifizierung**: Der Schlüssel wird aus der Umgebungsvariable `TYPESAFE_API_KEY` gelesen; er muss nicht im Code übergeben werden.
- **Standardmodell**: `jev-latest` (wird auf die neueste stabile Version aufgelöst)
- **Wiederholung**: Standardmäßig wird nach einer Backoff-Strategie wiederholt, und der Header `retry-after` in der Antwort wird beachtet.

## Versionsanforderungen

- Python SDK: Paketname `typesafe-sdk`
- JS SDK: Paketname `@typesafe-ai/sdk`, erfordert Node.js 20 oder höher

Das JS SDK stellt drei Artefakte bereit: ESM, CommonJS und TypeScript-Deklarationsdateien.

## Direkter Aufruf der HTTP API

Wenn Sie kein SDK verwenden, müssen Sie zwei Dinge selbst behandeln, die im SDK bereits integriert sind:

**Drosselung und Wiederholung.** Bei mehr als 250.000 Tokens/Sekunde oder 1.200 Anfragen/Minute wird ein `429 Too Many Requests` zurückgegeben. Die Antwort kann den Header `retry-after` enthalten, dem Sie beim Backoff folgen sollten.

**Antwortanalyse.** Die Struktur der Rückgabewerte ist ein Antwortobjekt, das nach dem Fragenamen indiziert ist; jede Fragenklasse hat ihre eigene Feldstruktur. Weitere Details finden Sie in der [API-Referenz](https://docs.typesafe.ai/api).

## Verwandte Themen

- [Python SDK](/de/sdk/python/)
- [JavaScript SDK](/de/sdk/javascript/)
- [Agent skill](/de/sdk/agent-skill/)
- [Schnellstart in 5 Minuten](/de/quickstart/) — Vollständiges, lauffähiges Beispiel
