---
title: "HTTP-API-Referenz"
description: "Rufen Sie den TypeSafe-Auswertungsendpunkt direkt auf – Anforderungsstruktur, die Fragearten noul / choice / score, Antwortstrukturen und Fehlerbehandlung."
section: sdk
order: 50
tags: ['api', 'http', 'reference']
source: docs.typesafe.ai/api
translatedFrom: en
---
## Endpunkt

```http
POST https://api.typesafe.ai/v1/systemone
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

Sende eine `state` mit einer Karte von getippten `questions` und erhalte pro Frage eine `answer` zurück.

## Anfragetext

```json
{
  "state": "Help! My payouts have been failing for 3 days.",
  "model": "jev-latest",
  "questions": {
    "is_urgent": {
      "type": "noul",
      "instructions": "Does this convey urgency?"
    }
  }
}
```

| Feld | Typ | Erforderlich | Beschreibung |
| :--- | :--- | :--- | :--- |
| `state` | string \| object \| array | Ja | Der zu bewertende Inhalt. Ein einfacher String für Text oder strukturierte Daten für Chat-Protokolle, Datensätze oder den aktuellen Zustand Ihrer Anwendung |
| `model` | string | Ja | Das Modell, das die Anfrage verarbeitet. Verwenden Sie `jev-latest`, TypeSafes Flaggschiff-Modell; weitere Modelle und Aliase finden Sie auf der offiziellen Models-Seite |
| `questions` | map&lt;string, Question&gt; | Ja | Eine Map von typisierten Fragen |

Sie wählen die Schlüssel in `questions`, und jede Antwort wird unter dem **gleichen Schlüssel** zurückgegeben. Dieser Schlüssel wird nicht an das zugrunde liegende Modell gesendet und nicht bei der Inferenz verwendet, sodass Sie ihn nach Ihrer Geschäftsdomäne benennen können (`department`, `is_urgent`).

## Die drei Fragetypen

Ein `Question` wird durch sein `type`-Feld unterschieden; es gibt drei. Alle drei teilen `type` und `instructions`, und jeder fügt sein eigenes `criteria` hinzu.

`instructions` hat den Typ `string | object | array`.

### noul — eine Ja/Nein-Entscheidung

Eine Ja/Nein-Frage. **Gibt die Wahrscheinlichkeit zurück, dass die Antwort Ja ist.**

```json
{
  "is_urgent": {
    "type": "noul",
    "instructions": "Does this convey urgency?",
    "criteria": {
      "true": "Explicitly time-sensitive",
      "false": "No urgency expressed"
    }
  }
}
```

`criteria` ist optional und beschreibt, was „ja“ und „nein“ bedeuten:

| Schlüssel | Beschreibung |
| :--- | :--- |
| `true` | Was ein Wert nahe 1 („Ja“) bedeutet |
| `false` | Was ein Wert nahe 0 („Nein“) bedeutet |

### choice — aus Optionen wählen

Wähle eine Option aus einer von dir definierten Menge und gib die gewählte Option **sowie die vollständige Wahrscheinlichkeitsverteilung** zurück.

```json
{
  "department": {
    "type": "choice",
    "instructions": "Which team should handle this?",
    "criteria": {
      "billing": "Payments, invoicing, refunds",
      "technical": "Bugs, outages, integrations",
      "sales": "Pricing, upgrades, new accounts"
    }
  }
}
```

`criteria` ist erforderlich, vom Typ `map⦇0⦈`: Optionenamen, die einer Rubrikbeschreibung zugeordnet sind. Verwenden Sie `null` als Wert, wenn eine Option keine weitere Erklärung benötigt.

### score — entlang einer Skala bewerten

Bewerte `state` anhand eines von dir definierten Kriterienkatalogs und gib einen **wahrscheinlichkeitsgewichteten Wert über deine Stufen** zurück.

```json
{
  "frustration": {
    "type": "score",
    "instructions": "How frustrated is the customer?",
    "criteria": ["Calm", "Frustrated", "Very angry"]
  }
}
```

`criteria` ist erforderlich und ein **geordnetes Array** von Level-Beschreibungen. Du musst mindestens zwei Level angeben.

## Antwortkörper

Jede Frage erzeugt eine Antwort, verknüpft mit der von Ihnen angegebenen ID.

```json
{
  "model": "jev-latest",
  "answers": {
    "is_urgent": {
      "type": "noul",
      "noul": 0.92
    }
  },
  "usage": { "input_tokens": 312, "output_tokens": 48 }
}
```

| Feld | Typ | Beschreibung |
| :--- | :--- | :--- |
| `model` | string | Das Modell, das die Bewertung durchgeführt hat |
| `answers` | map&lt;string, Answer&gt; | Eine Antwort pro Frage, identisch mit `questions` indiziert |
| `usage` | object | Token-Nutzung für die Anfrage: `input_tokens`, `output_tokens` |

### Antwortformen nach Typ

Jede Antwort trägt eine `type`, die ihrer Frage entspricht. `choice` und `score` Antworten tragen zudem `confidence` (zwischen 0 und 1), das aus der Wahrscheinlichkeitsverteilung dieser Antwort abgeleitet wird (siehe die offizielle Confidence-Seite).

**noul Antwort**

| Feld | Typ | Beschreibung |
| :--- | :--- | :--- |
| `noul` | Zahl | Die Ja/Nein-Antwort, von 0 (Nein) bis 1 (Ja) |

```json
{ "type": "noul", "noul": 0.92 }
```

**Auswahlantwort**

| Feld | Typ | Beschreibung |
| :--- | :--- | :--- |
| `choice` | string | Die Option mit der höchsten Wahrscheinlichkeit |
| `probabilities` | map&lt;string, number&gt; | Wahrscheinlichkeit pro Option; summiert sich zu 1 |
| `confidence` | number | Wie sicher das Modell ist, abgeleitet aus den Wahrscheinlichkeiten |

```json
{
  "type": "choice",
  "choice": "technical",
  "probabilities": { "billing": 0.08, "technical": 0.85, "sales": 0.07 },
  "confidence": 0.82
}
```

**Antwort bewerten**

| Feld | Typ | Beschreibung |
| :--- | :--- | :--- |
| `score` | number | Der wahrscheinlichkeitsgewichtete Wert, der **zwischen den Stufen liegen kann** |
| `legend` | map&lt;string, string&gt; | Ordnet jeden Stufenindex seiner Beschreibung zu |
| `probabilities` | map&lt;string, number&gt; | Wahrscheinlichkeit pro Stufe (String-Schlüssel); summiert sich zu 1 |
| `confidence` | number | Wie sicher das Modell ist, abgeleitet aus den Wahrscheinlichkeiten |

```json
{
  "type": "score",
  "score": 1.6,
  "legend": { "0": "Calm", "1": "Frustrated", "2": "Very angry" },
  "probabilities": { "0": 0.05, "1": 0.3, "2": 0.65 },
  "confidence": 0.78
}
```

Beachte, wie `score` mit `probabilities` zusammenhängt: Die drei Ebenen-Wahrscheinlichkeiten betragen 0,05 / 0,3 / 0,65, gewichtet zu einem `score` von 1,6. `score` muss also keine ganze Zahl sein – was genau den Unterschied zu `choice` ausmacht: `choice` bietet dir eine diskrete Option, während `score` „etwas zwischen zwei Ebenen“ ausdrücken kann.

## Fehler

Fehler verwenden standardmäßige HTTP-Statuscodes, mit einem JSON-Body, der beschreibt, was schiefgelaufen ist.

| Status | Bedeutung |
| :--- | :--- |
| `401 Unauthorized` | Der API-Schlüssel fehlt oder ist ungültig. Überprüfen Sie den `Authorization`-Header |
| `422 Unprocessable Entity` | Der Anforderungstext hat die Validierung nicht bestanden, z. B. ein fehlendes Pflichtfeld oder eine fehlerhafte Frage. Der Text verweist auf das fehlerhafte Feld |
| `429 Too Many Requests` | Sie haben Ihr Rate-Limit überschritten. Wiederholen Sie die Anfrage nach einer kurzen Verzögerung |
| `529 Overloaded` | TypeSafe ist vorübergehend überlastet. Wiederholen Sie die Anfrage nach einer kurzen Verzögerung |

### Umgang mit Ratenbegrenzungen

Bei `429` oder `529` **mit exponentieller Backoff wiederholen**, anstatt sofort erneut zu versuchen. Wenn Sie ein offizielles SDK verwenden, übernimmt dessen Standard-Wiederholungsrichtlinie dies automatisch, sodass kein zusätzlicher Code erforderlich ist.