---
title: System One
description: Die System-One-Seite von JevCode. clavue-jev beantwortet einen Zustand mit noul, confidence und choice.
section: concepts
order: 10
tags: ['system-one', 'clavue-jev']
---

## System One

Diese Seite gehört JevCode. Sie beschreibt den Aufruf, den **diese Site tatsächlich annimmt**. Das Modell ist **clavue-jev**, und wir stellen es als das beste Jev der Welt heute hin.

Software braucht einen Wert mit bekanntem Typ. Eine Chat-Antwort ist eine Zeichenkette, die du danach parsen musst. clavue-jev trägt den Typ in der Frage, die Antwort ist schon eine Zahl oder eine deiner Optionen. Nimm es für die Urteile, die den ganzen Tag laufen. Offenes Schreiben gehört zu einem Textmodell; clavue-jev entscheidet, ob dieser Text ausgeführt werden darf.

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

`state` hat 8 bis 4000 Zeichen. `questions` enthält höchstens sechs Einträge. `options` werden zu `criteria` gefaltet, bevor das Modell sie sieht. Die Antwort nennt `model` als `clavue-jev`. Nur ein erfolgreicher Aufruf wird nach Eingabetokens berechnet. Die Ausgabe ist frei. [Preise](/de/pricing/).

- [Zustand](/de/concepts/state/)
- [Sicherheit](/de/concepts/confidence/)
- [Primitive](/de/primitives/)
- [API](/de/api/)
- [Szenen](/de/scenes/)
