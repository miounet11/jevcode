---
title: "Content Moderation API: build one from typed questions"
description: "So bauen Sie eine Content-Moderation-API auf TypeSafe typed questions — per-policy Noul checks, severity scoring, category routing, threshold governance you control — im Vergleich zu one-size-fits-all moderation endpoints."
section: cases
order: 215
tags: ['moderation', 'content-moderation', 'guardrails', 'cookbook']
translatedFrom: en
---
## Warum „ein Moderations-Endpunkt“ die falsche Kaufeinheit ist

Die meisten Plattformen verkaufen Moderation als einen einzigen Endpunkt mit festen Labels: Toxizität, Hass,
Gewalt, Sexualität, Selbstverletzung. Das ist praktisch, bis zum ersten Mal, dass die Definition eines Verstoßes bei deinem Produkt
sich von der des Anbieters unterscheidet — ein Markt, der Off-Platform-Zahlungsversuche markieren muss, ein Chat im Spiel, in dem „Trash Talk“ erlaubt ist, aber
Doxxing nicht, ein Gesundheitsforum, in dem Dosierungsfragen im Mittelpunkt stehen.

Ihre Moderationsrichtlinie ist eine **Produktentscheidung**. Die API, die Sie kaufen, sollte sie nicht fest codieren. Was Sie tatsächlich benötigen, ist eine Möglichkeit, die Richtlinie *auszudrücken* — und sie bei Änderungen der Richtlinie anzupassen, ohne dass ein Neutrainieren erforderlich ist und ohne auf einen Anbieter warten zu müssen.

Diese Seite zeigt, wie Sie Moderation aus typisierten Fragen aufbauen: Jede Richtlinienvorschrift ist eine
Frage, jede Antwort enthält eine Wahrscheinlichkeit, und die Schwellenwerte — die eigentliche Richtlinie —
leben in Ihrem Code, versioniert wie Code.

## Die Form: eine Anfrage pro Nachricht, Fragen pro Regel

Eine Nachricht geht ein; eine Anfrage enthält eine Noul-Frage pro Richtlinie plus eine Bewertung für die Schwere; Entscheidungen kommen heraus. Es gibt keinen zweiten Aufruf und keinen pro-Richtlinie-Endpunkt, um zu verteilen.

```python
from typesafe_sdk import AsyncTypeSafeClient, Noul, Score

MODERATION_RULES = {
    "spam": Noul(instructions="Is this message spam or bulk advertising?"),
    "scam": Noul(instructions="Does this message try to defraud or phish the reader?"),
    "pii": Noul(instructions="Does this message contain personal data such as addresses, phone numbers, or IDs?"),
    "offsite_payment": Noul(instructions="Does this message try to move the transaction off the platform (external payment, direct email)?"),
    "severity": Score(
        instructions="If a policy is violated, how much harm would acting on it do?",
        criteria=["none", "minor", "moderate", "severe"],
    ),
}

async def moderate(client: AsyncTypeSafeClient, message: str) -> dict:
    async with client:
        response = await client.system_one(state=message, questions=MODERATION_RULES)
    return {rule: response.answers[rule] for rule in MODERATION_RULES}
```

Die Richtlinie ist die Vorschrift. Das Hinzufügen von „keine medizinische Beratung“ zu einem Gesundheitsforum ist eine Zeile; es wird mit Ihrem nächsten Deploy bereitgestellt, nicht mit der nächsten Modellkarte Ihres Anbieters.

## Schwellenwerte sind die Richtlinie — halten Sie sie in Ihrem Code

Jede Antwort von Noul ist eine Wahrscheinlichkeit. Was als Verletzung zählt, ist die Schwelle, die Sie darauf anwenden, und verschiedene Regeln können unterschiedliche Schwellenwerte haben:

```python
THRESHOLDS = {"spam": 0.90, "scam": 0.85, "pii": 0.70, "offsite_payment": 0.95}
SEVERITY_ESCALATE = 2.5  # between "moderate" and "severe" on the 4-point scale

def decide(answers: dict) -> str:
    if answers["severity"].score >= SEVERITY_ESCALATE:
        return "escalate"    # legal / trust-and-safety queue
    for rule, threshold in THRESHOLDS.items():
        if answers[rule].noul >= threshold:
            return "block"
    if any(answers[rule].noul >= 0.60 for rule in THRESHOLDS):
        return "review"      # send to the human queue
    return "pass"
```

Vier Ergebnisse, jeweils in Ihrem Besitz:

- **pass** — Nachricht übermitteln
- **review** — Warteschlange für Menschen, günstigste Methode, um False Positives abzubauen
- **block** — durchsetzen
- **escalate** — der Schweregrad Score hat seine Linie überschritten, z. B. rechtliche Fragen oder Vertrauens- und Sicherheitsaspekte

Vergleichen Sie das mit einem Moderations-Endpunkt, der seine eigenen Kategorienbezeichnungen und ein Flag zurückgibt. Sie können genau eine Sache einstellen: den Flag-Schwellenwert. Die Bezeichnungen, ihre Definitionen und ihre Kalibrierung sind ein Deploy von jemand anderem.

## Warum die Wahrscheinlichkeiten wichtiger sind als die Labels

Ein boolescher Flag verwirft die Informationen, die Sie zur Bedienung eines Moderationssystems benötigen:

**Du kannst die Grenze messen.** Der Anteil der Entscheidungen, die zwischen 0,6 und 0,9 liegen, *ist* deine menschliche Überprüfungsarbeit. Diese Zahl ist vor dem Launch ablesbar, nicht nach einem Haufen Eskalationen. [Selbstkonsistenztests](/en/cases/consistency-choice-cookbook/) erweitern dies: Führe Grenzfälle wiederholt durch die Rubrik und prüfe, ob die Labels stabil bleiben – Label-Wackeln ist der stille Killer der automatisierten Moderation.

**Du kannst dich auf das Konfidenzniveau wie jede andere Entscheidung in der Pipeline stützen.** Das gleiche [confidence-routing](/en/patterns/confidence-routing/)-Muster, das für die Klassifizierung verwendet wird, bleibt unverändert anwendbar: hohe Wahrscheinlichkeit für Aktionen, niedrige Wahrscheinlichkeit für Überprüfungen, und die Aufteilung ist eine Zahl, die du gewählt hast.

**Sie können den Verifier überprüfen.** Da jede Regel eine separate Frage mit einer Verteilung ist, können Sie gelabelte Beispiele pro Regel zurückhalten und die Präzision pro Regel messen — anstatt im Nachhinein festzustellen, dass eine versteckte Kategorie falsch ausgelöst wurde.

## Wo dies im Vergleich zu den Eingabe-Schutzmechanismen steht

[Guardrails for LLMs](/en/cases/llm-guardrails/) behandelt den LLM-spezifischen Fall:
das Filtern von Prompts und Antworten auf Jailbreaks und schädliche Ausgaben im Rahmen eines Modells
Aufrufs. Das hier beschriebene Moderationssystem ist die breitere Produktfläche – Nutzer
Nachrichten, Profile, Einträge, Bewertungen – wo die Regeln aus Ihren Bedingungen stammen
von Service statt von Modellsicherheit. Gleiches Grundprinzip, anderer Regelautor. Viele
Produkte enden damit, beide auszuführen: Produktmoderation bei Nutzerinhalten, Guardrails rund um
das Modell.

## Real moderation systems built this way

- [Jev-Moderation-Bot](https://github.com/brainstormity/Jev-Moderation-Bot) — ein Discord-Bot, bei dem Jev Spam- und Betrüger-Links überprüft, wobei Warnungs- und Timeout-Eskalationsregeln lokal gehalten werden
- [mastra-jev-moderation](https://github.com/CodeAlive-AI/mastra-jev-moderation) — Eingabemoderation für Mastra-Agenten auf TypeSafe Jev, in einer Datei

## Erstelle es

- [Übersicht über die primitiven Typen](/en/primitives/) — Noul und Score im Detail
- [HTTP-API-Referenz](/en/sdk/http-api/) — Struktur von Anfrage und Antwort
- [Sicherheitsrichtlinien für LLMs](/en/cases/llm-guardrails/) — die modellseitige Variante
- [Selbstkonsistenz: Entscheidungen](/en/cases/consistency-choice-cookbook/) — Stresstests der Stabilität der Labels
- [Anwendungsfälle-Karte](/en/cases/use-case-map/) — Moderation und Compliance in den anderen Szenarien