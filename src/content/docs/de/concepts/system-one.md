---
title: System One
description: Die System-One-Seite von JevCode. clavue-jev beantwortet einen Zustand mit noul, confidence und choice.
section: concepts
order: 10
tags: ['system-one', 'clavue-jev']
---

## Geschrieben auf JevCode

Diese Seite gehört uns. Sie beschreibt den Aufruf, den **diese Site** tatsächlich bereitstellt.

JevCode ist das Zuhause von Jev. Das Modell ist **clavue-jev**, und wir stellen es als das heute weltweit beste Jev auf. Ein System-One-Aufruf bedeutet hier: ein Zustand, ein paar typisierte Fragen, und eine Antwort, die sich `clavue-jev` nennt.

## Wofür es da ist

Software braucht einen Wert mit bekanntem Typ. Die Antwort eines Chats ist eine Zeichenkette, die du später parsen musst. clavue-jev legt den Typ auf die Seite der Frage, also ist die Antwort bereits eine Zahl oder eine deiner Optionen.

Nutze es für Urteile, die den ganzen Tag laufen. Welche Warteschlange, ob diese Zeile im Rahmen liegt, ob diese Aktion durchgehen darf. Für offenes Schreiben nimm ein Textmodell, und lass clavue-jev urteilen, ob der Text laufen darf.

## Der Aufruf

```http
POST https://api.jevcode.ai/v1/judge
Authorization: Bearer jev_...
Content-Type: application/json
```

```json
{
  "state": "The invoice was paid twice on Tuesday.",
  "questions": {
    "duplicate": {
      "type": "noul",
      "instructions": "Does this describe a duplicate charge?"
    },
    "sure": {
      "type": "confidence",
      "instructions": "How sure is that judgment?"
    },
    "lane": {
      "type": "choice",
      "instructions": "Which queue should take it?",
      "options": ["billing", "fraud", "ignore"]
    }
  }
}
```

`state` ist Text von 8 bis 4000 Zeichen. `questions` sind höchstens sechs. Die Namen beginnen mit Kleinbuchstaben. Ein choice kommt als `options` oder als `criteria`; dieser Server faltet `options` zu criteria, bevor er das Modell ruft.

Die Antwort trägt `"model": "clavue-jev"`. Nach einem erfolgreichen Aufruf wird über die Eingabe-Token abgerechnet. Die Ausgabe ist kostenlos. Die Zahlen stehen unter [Preise](/de/pricing/).

## Weiterlesen

- [Zustand](/de/concepts/state/)
- [Sicherheit](/de/concepts/confidence/)
- [Choice, Noul und die übrigen](/de/primitives/)
- [API](/de/api/)
- [Live](/de/scenes/)
