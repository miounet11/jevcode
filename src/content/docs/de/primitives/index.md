---
title: "Übersicht über die Problem-Primitiven"
description: "Die drei typisierten Frage-Typen Choice, Score und Noul: Was gibt jeder zurück und wie wählt man den richtigen aus."
section: primitives
order: 10
tags: ['primitives', 'choice', 'score', 'noul']
source: docs.typesafe.ai/primitives
translatedFrom: zh
---

## Primitives treten paarweise auf

Die Primitives von TypeSafe sind kleine, typisierte Bausteine, die Sie in Ihrem Code kombinieren. Sie treten immer paarweise auf:

- **Frage (question)**: Definiert eine Entscheidung, die das System-one-Modell für den **Zustand** (state) treffen soll.
- **Antwort (answer)**: Der typisierte Wert, den das Modell zurückgibt.

Sie kombinieren diese Antworten in Ihrem Code, um Entscheidungen zu treffen. Es gibt drei Fragetypen, die jeweils Antworten mit unterschiedlicher Struktur zurückgeben.

| Typ | Fragetyp | Rückgabe |
| :--- | :--- | :--- |
| [Choice](/zh/primitives/choice/) | Welche dieser Optionen? | `choice`, `probabilities`, `confidence` |
| [Score](/zh/primitives/score/) | In welche Kategorie fällt es? | `score`, `legend`, `probabilities`, `confidence` |
| [Noul](/zh/primitives/noul/) | Ist dies wahr? | `noul` (0 bis 1) |

Sie können eine einzelne Frage stellen oder mehrere auf einmal senden. Jede Frage wird unabhängig ausgewertet.

## Auswahl des richtigen Primitives

Der Schlüssel zur Auswahl des Primitives liegt in der **Form der Entscheidung**, nicht im geschäftlichen Bereich:

- **Die Menge der Kandidaten ist endlich und exklusiv** → Choice. Beispiele: Ticket-Klassifizierung, Intent-Erkennung, Aktionsauswahl.
- **Es gibt eine geordnete Dimension oder einen qualitativen Gradienten** → Score. Beispiele: Relevanz, Schweregrad, Zufriedenheit.
- **Es ist nur eine Ja/Nein-Entscheidung erforderlich, die Unschärfe zulässt** → Noul. Beispiele: „Verstößt dieser Inhalt gegen die Richtlinien?“ oder „Fordert der Benutzer eine Rückerstattung?“

Ein häufiger Fehler besteht darin, Score dort zu verwenden, wo Choice angebracht wäre. Wenn es zwischen den Kategorien keine echte Ordnungsbeziehung gibt (z. B. „Rechnung / Technik / Vertrieb“), verwenden Sie Choice. Die erzwungene Verwendung von Score führt zu falschen ordinalen Semantiken, wodurch nachfolgende Schwellenwertentscheidungen ihre Bedeutung verlieren.

Umgekehrt ist die Verwendung von Score bei Vorhandensein eines kontinuierlichen Gradienten effizienter als die Kombination mehrerer Noul-Primitives, da Score die vollständige Verteilung auf einmal liefert.

## Zwei Schlüsseleigenschaften der Antworten

**Jede Antwort ist auf die von Ihnen bereitgestellten Optionen beschränkt.** Das Modell gibt eine Wahrscheinlichkeitsverteilung über die von Ihnen angegebenen Optionen oder Kategorien zurück und erzeugt niemals Werte außerhalb dieser Menge. Dies bedeutet, dass Sie in Ihrem Code keine Werte aus generiertem Fließtext extrahieren müssen – dies ist der wesentliche Unterschied zwischen Jev und dem Ansatz „LLM gibt JSON aus, das dann analysiert wird“.

**Jede Antwort ist unabhängig voneinander.** Die Antwort auf eine Frage dient nicht als versteckter Kontext für eine andere Frage. Diese Einschränkung gewährleistet:

- Die Reihenfolge der Auswertung von Fragen hat keinen Einfluss auf das Ergebnis;
- Sie können sicher mehrere Fragen auf einmal stellen (einschließlich solcher, die nur in bestimmten Zweigen relevant sind), ohne sich um gegenseitige Beeinflussung sorgen zu müssen;
- Die Semantik jeder Antwort kann separat getestet und verifiziert werden.

Diese zweite Eigenschaft führt zu einer sehr praktischen Schlussfolgerung: **Spekulatives Fragen (speculative questions) ist nahezu kostenlos**. Im Ticket-Szenario ist beispielsweise `bug_severity` nur dann relevant, wenn es sich um einen Bug-Bericht handelt, und `refund_requested` nur bei Rechnungsfragen. Wenn Sie diese jedoch alle vorab in dieselbe Anfrage aufnehmen, entsteht kein Geschwindigkeitsnachteil – das Modell wertet alle Fragen parallel aus, und Sie lesen die entsprechenden Antworten nur bei Bedarf.

## Mehrere Fragen auf einmal stellen

```json
{
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
  "frustration": {
    "type": "score",
    "instructions": "How frustrated the user appears",
    "criteria": ["Calm, matter-of-fact", "Frustrated but civil", "Very angry"]
  },
  "refund_requested": {
    "type": "noul",
    "instructions": "The user is explicitly asking for a refund or credit"
  }
}
```

Ein einzelner Aufruf gibt drei unabhängige Antworten zurück. Der Code leitet basierend auf `intent` weiter und liest anschließend die benötigten Felder aus den bereits vorliegenden Ergebnissen.

## Fortgeschrittenes

- [Erweiterte Verwendung von Primitives](/zh/primitives/advanced/) – Schreibweise der Kriterien, Formulierungstechniken, Behandlung von Randfällen
- [Fan-Out-Muster](/zh/patterns/fan-out/) – Wie Sie eine große Anzahl von Fragen in eine einzelne Anfrage packen
- [Vertrauen](/zh/concepts/confidence/) – Steuerung des Verhaltens mit `confidence` und `probabilities`
