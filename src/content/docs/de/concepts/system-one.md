---
title: "System One-Modell"
description: "System One ist eine Klasse von Modellen, die für „schnelle, strukturierte Entscheidungen“ entwickelt wurden. Jev ist das erste dieser Modelle, dessen Ausgabe von Software direkt verarbeitet werden kann."
section: concepts
order: 10
tags: ['system-one', 'architecture']
source: docs.typesafe.ai/concepts/system-one
translatedFrom: zh
---

## Definition

System One-Modelle sind eine Klasse von KI-Modellen, die speziell dafür entwickelt wurden, **schnelle, strukturierte Entscheidungen zu treffen, die Software direkt verwenden kann**. Jev ist das Flaggschiff-Modell von TypeSafe und das erste System-One-Modell.

Das Kernproblem, das sie lösen, ist: Traditionelle Sprachmodelle geben freien Text aus, während Software Werte mit bestimmten Typen benötigt. System One integriert diesen Konvertierungsprozess direkt in das Modell – die Problemstellung definiert den Ausgabetyp, und das Modell liefert Ergebnisse entsprechend der Einschränkungen.

## Aufgabenteilung mit System Two

Diese Benennung lehnt sich an die Zwei-System-Theorie aus der Kognitionswissenschaft an; die Bedeutung ist direkt:

| | System One | System Two |
| :--- | :--- | :--- |
| Merkmale | Schnell, intuitiv, fokussiert | Langsam, bedacht, mehrstufig |
| Typische Aufgaben | Urteilen, Klassifizieren, Bewerten, Validieren | Komplexe Schlussfolgerungen, lange Planungsketten |
| Latenz | Niedrig und vorhersagbar | Höher, wächst mit der Denklänge |
| Ausgabe | Typisiert, eingeschränkt | Freier Text |
| Kosten | Niedrig | Hoch |

Sie ersetzen sich nicht gegenseitig. In Produktionssystemen ist es üblich, dass System One die meisten häufigen Urteile übernimmt und nur bei tatsächlichem Bedarf an tieferer Schlussfolgerung auf System Two oder menschliche Überprüfung umgeschaltet wird.

## Ein vollständiges Beispiel: Rückerstattungsantrag

Der in der offiziellen Dokumentation beschriebene Ablauf veranschaulicht gut, wie diese beiden Ebenen zusammenarbeiten:

1. **State konstruieren** – Kundenservice-Nachrichten, relevante Transaktionsaufzeichnungen und Rückerstattungsrichtlinien zu einem State zusammenfassen.
2. **Parallele Fragen stellen** – drei unabhängige Fragen gleichzeitig stellen: Hat der Benutzer eine Rückerstattung angefordert? Deuten die Beweise auf eine doppelte Abbuchung hin? Unterstützt die Richtlinie eine Rückerstattung?
3. **Im Code kombinieren** – Die drei Antworten mit deterministischen Geschäftsprüfungen verknüpfen und dann zur Ausführung oder zur manuellen Überprüfung routen.

Beachten Sie die **Unabhängigkeit** der Fragen in Schritt 2: Die drei Fragen beeinflussen sich nicht gegenseitig und können in einem einzigen Aufruf gesendet werden. Dies ist die Voraussetzung dafür, sie in eine einzelne Anfrage zu packen.

## Warum typisierte Ausgaben so entscheidend sind

Da System One-Modelle **typisierte, eingeschränkte Ausgaben anstelle von freiem Text** zurückgeben, kann Ihr Code diese Antworten direkt prüfen und kombinieren, um vorhersagbare Workflows zu bilden.

Ein Vergleich der Code-Komplexität bei zwei Integrationsansätzen:

```python
# Traditioneller Ansatz: Erfordert Parsing, Validierung und Behandlung von Formatfehlern
raw = llm.complete("Is this ticket about billing? Answer yes or no.")
is_billing = raw.strip().lower().startswith("y")  # Fragil, viele Randfälle

# System One: Der Wert ist selbst typisiert
response = client.system_one(
    state=ticket,
    questions={"billing": Noul(instructions="Is this ticket about billing?")},
)
is_billing = response.nouls["billing"].noul  # float, 0..1
```

Der Rückgabewert des zweiten Ansatzes ist ein deterministischer Typ innerhalb des Definitionsbereichs – `Choice` ist immer nur eine der von Ihnen angegebenen Optionen, `Score` liegt immer in der von Ihnen angegebenen Intervallklasse, und `Noul` ist immer eine Gleitkommazahl zwischen 0 und 1.

## Konfidenz: Das Modell kann „Ich bin unsicher“ sagen

Die Antworten der System One-Modelle enthalten zudem [confidence](/de/concepts/confidence/), sodass Sie entscheiden können, wann Sie direkt ausführen und wann Sie auf menschliche Überprüfung oder ein reasoning-Modell zurückgreifen. Dies ist die Grundlage für den Aufbau vertrauenswürdiger Systeme – **ein System, das Unsicherheit nicht ehrlich ausdrücken kann, kann nicht vertraut werden**.

## Aufrufmethode

Über das Client-[SDK](/de/sdk/) oder die HTTP-API aufrufen:

```http
POST https://api.typesafe.ai/v1/systemone
```

Das Feld `model` in der Anfrage wählt das spezifische Modell aus. Der Standard-Alias ist `jev-latest`.

## Weiterführende Literatur

- [State](/de/concepts/state/) – Wie Sie den Kontext für das Modell organisieren
- [Frage-Primitiven](/de/primitives/) – Drei Arten von typisierten Fragen
- [Architekturmuster](/de/patterns/) – Organisation dieser Aufrufe in Produktionsumgebungen
- [So erstellen Sie System-One-Systeme](https://docs.typesafe.ai/concepts/how-to-build-with-system-one) – Offizielle umfassende Anleitung zu Workflows
