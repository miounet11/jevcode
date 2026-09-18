---
title: "Fan-out-Parallelität"
description: "Senden Sie viele Fragen (einschließlich hypothetischer) in einem einzigen Aufruf, und lassen Sie den Code entscheiden, welche davon relevant sind."
section: patterns
order: 50
tags: ['fan-out', 'latency', 'cost']
source: docs.typesafe.ai/patterns/fan-out
translatedFrom: zh
---

## Welches Problem löst dieses Muster?

Der herkömmliche Ansatz lautet: „Zuerst klassifizieren, dann basierend auf dem Klassifizierungsergebnis entscheiden, was als Nächstes zu fragen ist.“ Dies erfordert sequenzielle Aufrufe: Das Ergebnis des ersten Aufrufs muss vorliegen, bevor bekannt ist, was im zweiten Schritt zu fragen ist, was zu einer kumulierten Latenz führt.

Der Fan-out-Parallel-Ansatz kehrt dies um: **Alle potenziell notwendigen Fragen werden auf einmal gesendet**, und Ihr Code entscheidet basierend auf dem Klassifizierungsergebnis, welche ignoriert werden sollen. Da das Modell den Zustand nur einmal liest und alle Fragen parallel auswertet, sind die marginalen Kosten für das Stellen weiterer Fragen extrem gering.

## Schlüsselmechanismen

Diese drei Fakten bilden die Grundlage für das Fan-out-Muster:

1. Das Modell **liest den Zustand nur einmal** und wertet dann alle Fragen parallel aus.
2. **Jede Antwort ist unabhängig voneinander** – die Antwort auf eine Frage wird nicht zum versteckten Kontext für eine andere Frage.
3. Das Kontextbudget beträgt 64k Tokens (Zustand + alle Fragen) oder 32k Tokens (Zustand + die längste einzelne Frage).

Punkt 2 ist besonders wichtig: Er stellt sicher, dass das gleichzeitige Senden irrelevanter Fragen die Antworten auf relevante Fragen nicht verfälscht.

## Beispiel: Ticket-Routing

Sie müssen Kundensupport-Tickets bearbeiten, aber verschiedene Ticket-Typen erfordern völlig unterschiedliche Bewertungen. Anstatt zuerst zu klassifizieren und dann nachzufragen, stellen Sie alle Fragen auf einmal.

### Schritt 1: Stellen Sie alle Bewertungen in einer einzigen Anfrage

```json
{
  "questions": {
    "category": {
      "type": "choice",
      "instructions": "What kind of request is this?",
      "criteria": {
        "bug_report": "Reporting something broken",
        "billing": "Payment, invoice, or refund matters",
        "feature_request": "Asking for new functionality"
      }
    },
    "bug_severity": {
      "type": "score",
      "instructions": "How severe is the reported issue",
      "criteria": [
        "Cosmetic; no impact to functionality",
        "Broken or degraded feature; workaround exists",
        "Blocking issue; no workaround exists"
      ]
    },
    "has_reproducible_steps": {
      "type": "noul",
      "instructions": "The user describes specific steps to reproduce the issue"
    },
    "refund_requested": {
      "type": "noul",
      "instructions": "The user is explicitly asking for a refund or credit"
    },
    "frustration": {
      "type": "score",
      "instructions": "How frustrated the user appears",
      "criteria": ["Calm, matter-of-fact", "Frustrated but civil", "Very angry"]
    }
  }
}
```

Hier sind `bug_severity` und `has_reproducible_steps` nur sinnvoll, wenn es sich um einen Bug-Report handelt; `refund_requested` ist nur bei Abrechnungsfragen relevant. **Es handelt sich um spekulative Fragen** – da das zusätzliche Stellen von Fragen keine Geschwindigkeitskosten verursacht, können sie alle vorab gestellt werden.

### Schritt 2: Routing mit Code

```python
category = response.answers["category"]
bug_severity = response.answers["bug_severity"]
bug_repro = response.answers["has_reproducible_steps"]
refund = response.answers["refund_requested"]
frustration = response.answers["frustration"]

if category.choice == "bug_report":
    if bug_severity.score > 1.5 and bug_repro.noul > 0.6:
        escalate_to_engineering(ticket_id, severity="high")
    else:
        add_to_bug_backlog(ticket_id)

elif category.choice == "billing":
    if refund.noul > 0.7:
        route_to_billing_with_flag(ticket_id, refund_likely=True)
    else:
        route_to_billing(ticket_id)

elif category.choice == "feature_request":
    log_feature_request(ticket_id)

# Unabhängig von der Kategorie ist frustration immer nützlich
if frustration.score > 1.5:
    flag_for_priority_response(ticket_id)
```

**Alle Informationen, die für den vollständigen Entscheidungsbaum erforderlich sind, stammen aus einem einzigen Aufruf.** Spekulative Fragen werden ignoriert, wenn sie irrelevant sind, und sparen eine Roundtrip-Zeit ein, wenn sie relevant sind.

## Design-Überlegungen

**Fragen Sie alles, filtern Sie dann.** Verschieben Sie die Entscheidung darüber, „welche Fragen wert sind gestellt zu werden“, von vor dem Aufruf auf nach dem Aufruf. Vor dem Aufruf kennen Sie das Klassifizierungsergebnis nicht und können daher nicht entscheiden; nach dem Aufruf haben Sie die Antworten, und das Filtern ist nur eine normale Verzweigung.

**Achten Sie auf das Kontextbudget.** 64k bezieht sich auf den Zustand plus **alle** Fragen. Wenn Sie Hunderte von Fragen ausgeben möchten (z. B. um eine Reihe von Dokumenten einzeln zu bewerten), wird der Zustand schnell sehr groß. In diesem Fall sollten Sie die Anfrage in mehrere Teile aufteilen oder die [Batch-Nutzung von Score](https://docs.typesafe.ai/patterns) in Betracht ziehen.

**Unterscheiden Sie zwischen „spekulativ“ und „redundant“.** Spekulative Fragen sind solche, die **auch unter anderen Zweigen eine klare Semantik haben**. Wenn die Antwort auf eine Frage in keinem Zweig gelesen wird, ist sie keine spekulative Frage, sondern Verschwendung – auch wenn die Kosten gering sind, macht sie den Code unübersichtlich.

**Kombinieren Sie mit Konfidenz.** Fan-out löst das Problem „Was fragen?“, und Konfidenz-Routing löst das Problem „Wem vertrauen?“. Die Kombination beider ist eine gängige Form für Produktionssysteme: Siehe das Beispiel für die Sprachbank im Abschnitt [Konfidenz-Routing](/zh/patterns/confidence-routing/).

## Verwandt

- [Question Primitives](/zh/primitives/) — Unabhängigkeit und spekulative Fragen
- [State](/zh/concepts/state/) — Kontextbudget und Zustandorganisation
- [Confidence Routing](/zh/patterns/confidence-routing/) — Die zweite Entscheidungsachse
