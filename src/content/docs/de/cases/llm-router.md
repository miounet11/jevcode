---
title: "LLM-Router: den Handler mit einer typisierten Entscheidung wählen"
description: "Wie eine Anfrage zu einem Modell oder zu einem Menschen kommt. Immer das größte Modell, Schlüsselwortregeln, ein Embedding-Router, ein Chat-Modell, das ein Label nennt, und eine clavue-jev-Choice plus eine Confidence-Frage. Verzweigen lässt sich auf diese Option."
section: cases
order: 235
tags: ['llm-router', 'model-routing', 'routing', 'comparison']
translatedFrom: en
---

## Die Entscheidung vor dem Modell

Ein LLM-Router antwortet dem Nutzer nicht. Er wählt den Handler, der antwortet. Im selben Posteingang liegen eine Tippfehlerkorrektur, eine Designfrage und eine Nachricht, die zu einem Menschen gehört. Alle drei durch das größte Modell zu schicken funktioniert. Die Tippfehlerkorrektur zahlt den Preis des großen Modells.

Gesucht wird das als **LLM-Router** und **Model Routing**. Gewählt wird eine geschlossene Menge, die du schon benannt hast: ein kleines Modell, ein großes Modell, eine Abfrage, ein Mensch. Diese Wahl ist ein Wert, auf dem das Programm verzweigen kann.

## Fünf Wege zur Route

| Weg | Wie die Route entsteht | Was schiefgehen kann | Was du zahlst |
| :--- | :--- | :--- | :--- |
| **Jede Anfrage an ein Modell** | Es gibt keinen Router | Kleine Aufgaben zahlen den Preis des großen Modells | Dieses Modell, jedes Mal |
| **Schlüsselwort oder Regex** | Eine Wortliste zeigt auf einen Handler | Eine Umschreibung trifft die Liste nicht | Zum Anfragezeitpunkt nichts extra |
| **Embedding-Router** | Die nächste Routenbeschreibung gewinnt | Die Beschreibungen driften von den Handlern weg | Ein Embedding-Aufruf plus den Index |
| **Ein Chat-Modell nennt das Label** | Du bittest es um einen Namen | Der Name kann außerhalb der Menge liegen oder in Prosa stecken | Input und Output dieses Modells |
| **Typisierte Choice (clavue-jev)** | Eine `choice` über die genannten Handler, plus eine `confidence`-Frage | Zurück kommt nur ein Handler, den du genannt hast | Input-Token nach einem erfolgreichen Aufruf. Output ist kostenlos |

Schlüsselwortregeln reichen, wenn die Wörter sich nicht bewegen. Ein Embedding-Router passt, wenn du die Routenbeschreibungen schon pflegst. Ein Chat-Modell passt, wenn die Route selbst ein Satz sein muss. Eine typisierte Choice passt, wenn die Route einer von wenigen Handlern ist und die nächste Zeile sie lesen muss.

## Die Anfrage, die diese Site annimmt

```http
POST https://api.jevcode.ai/v1/judge
Authorization: Bearer jev_...
Content-Type: application/json
```

```json
{
  "state": "Rename this function and add a test. Do not change behavior.",
  "questions": {
    "route": {
      "type": "choice",
      "instructions": "Which handler should run this request?",
      "options": ["small_model", "large_model", "human"]
    },
    "sure": {
      "type": "confidence",
      "instructions": "How sure is that routing judgment?"
    }
  }
}
```

`state` ist Text, 8 bis 4000 Zeichen. `questions` enthält höchstens sechs Einträge. Schlüssel beginnen mit einem Kleinbuchstaben. Eine Choice darf `options` oder eine `criteria`-Map senden. Dieser Server faltet `options` zu Criteria, bevor das Modell sie sieht.

Abgerechnet werden Input-Token nach einem erfolgreichen Aufruf. Output ist kostenlos. Die Zahlen stehen auf der [Preisseite](/de/pricing/).

Eine Antwort nennt das Modell und legt jede Antwort unter denselben Schlüssel:

```json
{
  "model": "clavue-jev",
  "answers": {
    "route": { "choice": "small_model" },
    "sure": { "noul": 0.78 }
  }
}
```

`route.choice` ist eine der Optionen, die du gesendet hast. `sure.noul` ist eine Zahl von 0 bis 1 und kommt aus der Confidence-Frage. Diese API versteckt keine Confidence in der Choice. Die `0.78` oben zeigt die Form des Feldes. Sie ist keine gemessene Trefferquote, und diese Site veröffentlicht keine einheitliche Schwelle.

Verzweige auf den beiden Feldern. Die Schwelle setzt du:

```python
route = body["answers"]["route"]["choice"]
sure = body["answers"]["sure"]["noul"]
cutoff = 0.8  # ersetzen durch eine Schwelle, die du am eigenen Traffic gemessen hast

if sure < cutoff or route == "human":
    hand_to_human(state)
elif route == "small_model":
    call_small(state)
else:
    call_large(state)
```

Eine falsche Route in ein Werkzeug, das Geld ausgibt, braucht eine höhere Schwelle als eine falsche Route in eine Logzeile. Lies einen Schwung deines eigenen Traffics auf [Vergleich](/de/compare/) oder [Ausprobieren](/de/try/), bevor du die Zahl festlegst. Die Begründung steht auf der Seite [Confidence](/de/concepts/confidence/).

Dieselbe Anfrage kann vier weitere Fragen tragen. Eine Route, eine Confidence-Frage und ein paar Ja/Nein-Fragen bleiben unter der Grenze von sechs. [Fan-out](/de/patterns/fan-out/) ist diese Form.

## Was der Router nicht tut

Er schreibt die Antwort nicht. Der Handler, den du gewählt hast, schreibt sie.

Er erfindet keinen Handler. Fehlt der richtige in `options`, gibt die Choice trotzdem einen der Namen zurück, die du gesendet hast. Nimm den Handler auf, oder nimm ein `noul` dazu, das fragt, ob irgendein genannter Handler passt, und gib den Fehltreffer an einen Menschen.

Offener Text bleibt bei einem Textmodell. Der Router entscheidet, welches Textmodell läuft, oder ob ein Mensch die Anfrage zuerst sehen soll. Wenn der Text zurückkommt, kann ein zweiter Aufruf fragen, ob man danach handeln darf. Dieser zweite Aufruf ist eine [Leitplanke](/de/cases/llm-guardrails/), kein Teil der Route.

## Wo diese Form schon vorkommt

Die [Use-Case-Karte](/de/cases/use-case-map/) bündelt öffentliche Projekte, die ein Modell mit einer Jev-Choice wählen: Router für Coding-Aufgaben, ein Router auf LiteLLM, ein Router pro Anfrage für einen Coding-Agenten und ein lokaler Proxy, der Modell und Aufwand wählt. Die gemeinsame Form ist eine Choice vor dem teuren Aufruf. Diese Seite ergänzt keine Punkte für diese Projekte.

[Intent-Routing](/de/patterns/intent-routing/) ist dieselbe Entscheidung, gerichtet auf eine Support-Warteschlange statt auf ein Modell.

## Einstieg

- [API](/de/api/) — `POST /v1/judge`, Anfrage und Antwort
- [Ausprobieren](/de/try/) — der anonyme Weg, ohne Schlüssel
- [System One](/de/concepts/system-one/) — State, Fragen und der Modellname in der Antwort
- [Confidence](/de/concepts/confidence/) — die zweite Frage und wer die Schwelle setzt
- [Preise](/de/pricing/) — Input-Token, Output kostenlos

## Verwandt

- [Strukturierte Ausgabe](/de/cases/structured-output/) — wenn du einen typisierten Wert brauchst und keine Route
- [Fan-out](/de/patterns/fan-out/) — mehrere Fragen zu einem State
- [Leitplanken für LLMs](/de/cases/llm-guardrails/) — die Prüfung, nachdem ein Textmodell geschrieben hat
- [Use-Case-Karte](/de/cases/use-case-map/) — die öffentlichen Projekte
