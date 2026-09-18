---
title: "Intention Routing"
description: "Klassifizierte Anfragen werden an den am besten geeigneten Prozessor weitergeleitet: deterministische Logik, spezialisierte LLMs oder menschliche Bearbeitung."
section: patterns
order: 20
tags: ['routing', 'classification', 'cost']
source: docs.typesafe.ai/patterns/intent-routing
translatedFrom: zh
---

## Dieses Muster löst welches Problem

Nicht jede Benutzeranfrage erfordert denselben Prozessor. Einige lassen sich mit einer einzigen Datenbankabfrage beantworten; andere benötigen einen LLM mit Domänenkontext; wieder andere müssen manuell bearbeitet werden.

TypeSafe kann vor all diesen Prozessoren platziert werden und fungiert als schnelle, kostengünstige Klassifizierungsschicht, die entscheidet, welcher Prozessor aufgerufen werden soll.

**Kostentreiber im Kern**: Anstatt jede Nachricht an einen teuren LLM zu senden, um zu bestimmen, um welche Art von Anfrage es sich handelt, sollte zuerst klassifiziert und dann basierend auf der Klasse weitergeleitet werden.

## Beispiel: Kundenservice-Routing

Stellen Sie sich ein Kundensystem vor, in dem eingehende Nachrichten an den richtigen Prozessor weitergeleitet werden müssen.

### Schritt 1: Absicht und Komplexität klassifizieren

In einer einzigen Anfrage werden gleichzeitig Absicht, Komplexität und mehrere辅助判断 (Hilfsentscheidungen) abgefragt:

```json
{
  "questions": {
    "intent": {
      "type": "choice",
      "instructions": "The primary intent of this customer message",
      "criteria": {
        "order_status": "Asking about an existing order",
        "product_question": "Asking about a product before buying",
        "return_exchange": "Wants to return or exchange something",
        "complaint": "Unhappy about an experience"
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

### Schritt 2: Routing basierend auf den Klassifizierungsergebnissen

```python
intent = response.answers["intent"]

if intent.choice == "order_status":
    # Deterministische Logik reicht aus: Datenbankabfrage
    lookup_order_status(state["order_id"])

elif intent.choice == "product_question":
    # Domänenkontext erforderlich: an LLM mit Wissensbasis übergeben
    answer_with_catalog_llm(state)

elif intent.choice == "return_exchange":
    start_return_flow(state["order_id"])

elif intent.choice == "complaint":
    # Hohes Risiko: an menschlichen Agenten weiterleiten
    route_to_human_agent(state)
```

## Warum Klassifizierung zuerst Geld spart

Der Schlüssel liegt darin, **die teure Verarbeitung für Anfragen aufzubewahren, die sie wirklich benötigen**.

Angenommen, 70 % der Kundenservice-Nachrichten sind vom Typ `order_status` und können durch eine einzelne Datenbankabfrage gelöst werden. Wenn alle Nachrichten zuerst an ein großes Modell gesendet werden, zahlen Sie für diese 70 % die Kosten des großen Modells, obwohl sie dies nicht benötigen. Eine einmalige, kostengünstige Choice-Klassifizierung kann diesen Teil des Datenverkehrs abfangen.

Hier kommt genau das [Fan-Out-Muster](/zh/patterns/fan-out/) zum Einsatz: Klassifizierung, Schweregrad, ob eine Rückerstattung angefordert wird, Stimmung und andere Entscheidungen werden in einem einzigen Schritt abgefragt, da zusätzliche Abfragen keine Geschwindigkeitskosten verursachen.

## Design-Hinweise

**Die Klassifizierungsausgabe muss direkt verwendbar sein.** Der Wert von `intent.choice` sollte direkt als Schlüssel für die Routing-Tabelle dienen, ohne dass weitere String-Verarbeitungen erforderlich sind.

**Die Granularität der Klassifizierung bestimmt die Systemkomplexität.** Zu wenige Kategorien führen zu einer fehlenden Unterscheidbarkeit im Routing; zu viele Kategorien verringern die Stichprobengröße pro Kategorie und senken die Genauigkeit. Beginnen Sie mit 4–6 Kategorien.

**Spekulative Entscheidungen gemeinsam senden.** Die im obigen Beispiel genannten `bug_severity` und `has_reproducible_steps` sind nur bei bestimmten Absichten relevant, `refund_requested` nur in Rückerstattungsszenarien. Durch das vorzeitige Senden aller Werte entstehen nahezu keine Kosten. Dies ist der Wert des [Fan-Out-Parallelismus](/zh/patterns/fan-out/).

**Kombinieren Sie mit Konfidenz für eine sekundäre Gate-Logik.** Wenn `intent.confidence` niedrig ist, ist die Klassifizierung selbst unzuverlässig. In diesem Fall sollte nicht blindlings geroutet werden, sondern stattdessen ein menschlicher Agent eingeschaltet oder um Klärung gebeten werden. Weitere Einzelheiten finden Sie unter [Konfidenz-Routing](/zh/patterns/confidence-routing/).

**Behalten Sie eine Fallback-Kategorie bei.** Fügen Sie der Klassifizierung Optionen wie `other` hinzu, damit Anfragen, die zu keiner Prozessorart passen, einen Zielort haben, anstatt in die nächstliegende Kategorie gezwungen zu werden.

## Verwandt

- [Choice](/zh/primitives/choice/) — Die grundlegende Primitive dieses Musters
- [Fan-Out-Parallelismus](/zh/patterns/fan-out/) — Abfrage aller Hilfsentscheidungen in einem Schritt
- [Konfidenz-Routing](/zh/patterns/confidence-routing/) — Was tun, wenn die Klassifizierung unzuverlässig ist
- [Composite Scoring](/zh/patterns/composite-scoring/) — Ergänzendes Muster für Sortieranforderungen
