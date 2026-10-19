---
title: "LLM-Strukturausgabe: JSON-Modus, Funktionsaufruf und typisierte Entscheidungen"
description: "Strukturierte Ausgabeoptionen für LLM-Apps im Vergleich — JSON mode, schema-constrained decoding, function calling und TypeSafe typed questions — mit Failure modes, Kosten und dem Zeitpunkt, an dem ein closed-set decision primitive das Abfragen eines Moduls zur Ausgabe von JSON übertrifft."
section: cases
order: 205
tags: ['structured-output', 'json-mode', 'function-calling', 'comparison']
translatedFrom: en
---
## Das Problem, das jede LLM-App trifft

Ein LLM liefert Fließtext. Deine Anwendung benötigt Daten: eine Kategorie, eine Zahl, ein Boolean, eine Struktur. Alles, was danach kommt — Routing, Speicherung, Dashboards, Wiederholungen — hängt davon ab, dass dieser Fließtext jedes Mal parsebare, gültige Ausgaben liefert, nicht nur die meiste Zeit.

Der Branchenname dafür ist **strukturierte Ausgabe**, und es gibt jetzt vier gängige
Wege, dies zu erreichen. Sie unterscheiden sich darin, was sie garantieren, was sie kosten und was kaputtgeht.

## Die vier Optionen auf einen Blick

| Ansatz | Funktionsweise | Garantie | Fehlermodus | Relativer Kostenfaktor |
| :--- | :--- | :--- | :--- | :--- |
| **Prompting für JSON** | Das Modell auffordern, „im JSON-Format zu antworten“ | Keine — es ist ein Vorschlag | Nachgestellte Kommas, Fließtext um das JSON herum, erfundene Felder | 1x Generation (kann lang sein) |
| **JSON-Modus / response_format** | API-Flag, das die Ausgabe auf gültiges JSON beschränkt | Gültige JSON-Syntax | Gültiges JSON mit falscher Struktur oder Typen; Schema-Drift | 1x Generation |
| **Schema-constrained decoding** | Grammatik-/Regex-Einschränkungen während der Token-Abfrage angewendet | Syntax *und* Struktur entsprechen dem Schema | Felder plausibel, aber semantisch falsch gefüllt; erfordert Serverunterstützung | 1x Generation + Serving-Komplexität |
| **Function calling** | Modell wählt eine deklarierte Funktion und Argumente aus | Argumente werden gegen Ihre Signatur validiert | Halluzinierte Argumentwerte außerhalb der Enums; Zerbrechlichkeit bei mehrstufigen Abläufen | 1x Generation |
| **Typisierte Fragen (TypeSafe)** | Geschlossenes Set aus Choice / Score / Noul-Fragen über Ihren Zustand | Typisierte Antwort + vollständige Wahrscheinlichkeitsverteilung + Konfidenz, in einem Durchlauf | Nur das, was Sie nicht gefragt haben — nicht gestellte Fragen können nicht halluzinieren | Nur Token-Eingabe; **Ausgabe ist kostenlos** |

Die ersten vier teilen eine Eigenschaft, über die man ehrlich sein sollte: **das Modell generiert immer noch das Antwort-Token-Token für Token.** Jede der oben genannten Garantien ist eine Schutzmaßnahme rund um die Generierung, kein Ersatz dafür. Die fünfte ersetzt die Generierung durch einen einzelnen Vorwärtsdurchlauf, der eine Verteilung über eine von Ihnen definierte geschlossene Menge ausgibt.

## Warum abgeschlossene Mengen das Fehlerprofil verändern

Mit dem JSON-Modus kann ein Feld wie `"priority": "high"` als `"High"`, `"HIGH"`,
`"priority_high"` oder `2` zurückgegeben werden. Sie schreiben den Validator, die Retry-Schleife und das Fallback.
Bei der schema-gesteuerten Dekodierung ist die Struktur korrekt, aber nichts überprüft, ob der *Wert*
die richtige Beurteilung ist – ein perfekt formatiertes Struct kann dennoch eine falsche Antwort enthalten,
und Sie haben kein Signal dafür, wie sicher das Modell war.

Eine typisierte Frage geht den umgekehrten Ansatz: Der Antwortraum ist vor der Anfrage festgelegt.

```python
from typesafe_sdk import AsyncTypeSafeClient, Choice

async def main() -> None:
    async with AsyncTypeSafeClient() as client:
        response = await client.system_one(
            state=ticket_text,
            questions={
                "priority": Choice(
                    instructions="Which priority does this ticket have?",
                    criteria={
                        "p0": "Outage or data loss, all users affected",
                        "p1": "Major feature broken, workaround exists",
                        "p2": "Minor issue, scheduled work",
                    },
                )
            },
        )

    answer = response.answers["priority"]
    print(answer.choice)                            # "p1"
    print(answer.confidence)                        # 0.93 — route on it directly
```

Was Sie zurückbekommen, ist keine Zeichenkette zum Parsen. Es ist ein **stark typisierter Wert mit einer Wahrscheinlichkeitsverteilung über genau die Optionen, die Sie deklariert haben** — `p0: 0.02, p1: 0.93, p2: 0.05` —
sowie eine Konfidenzzahl. Es gibt kein zu validierendes JSON, kein zu normalisierendes Enum und keine Retry-Schleife für fehlerhafte Ausgaben, weil fehlerhafte Ausgaben nicht erzeugt werden können.

## Was das in der Praxis aussieht

**Funktionsaufrufe mit enum-Argumenten.** Wenn Ihre Funktionssignaturen bereits `Literal`-Typen verwenden, bilden diese geschlossenen Mengen eins-zu-eins Choice-Fragen ab – siehe das [function calling cookbook](/en/cases/function-calling/) für ein vollständiges Trading-Assistant-Beispiel, bei dem natürliche Sprache in typisierte Aufrufe mit Konfidenz pro Argument übergeht.

**Extraktions-Pipelines.** Zum Herausziehen von Werten aus Dokumenten ist die Fragekarte *der*
Schema — ein Eintrag pro Feld, mit der Semantik, die genau einmal definiert ist. Die
[Strukturierte Daten-Extraktionskaskade](/en/cases/sde-cascade/) zeigt eine zweistufige Version
mit einer Verifizierungsdurchlauf.

**Sicherheitsrichtlinien und Klassifizierung.** Ja/Nein-Prüfungen (Handelt es sich um einen Jailbreak? Enthält dies personenbezogene Daten?) sind Noul-Fragen — eine Wahrscheinlichkeit, keine analysierte Zeichenkette. Siehe [Sicherheitsrichtlinien für LLMs](/en/cases/llm-guardrails/).

**Unsicherheitsbewältigung.** Die Wahrscheinlichkeitsverteilung ist der Teil, den der JSON-Modus nicht liefern kann. [Klassifizierung unter Verwendung von Konfidenz](/en/cases/classification-using-confidence/)
und [konfidenzgesteuertes Routing](/en/patterns/confidence-routing/) zeigen, was dies ermöglicht:
Auto-Akzeptierung oberhalb eines Schwellenwerts, menschliche Überprüfung darunter, gemessen an Ihren eigenen Daten.

## Der ehrliche Kompromiss

| | JSON-Modus / Funktionsaufruf | Getypte Fragen |
| :--- | :--- | :--- |
| Offene Textgenerierung | Ja — das Schema kann freie Strings enthalten | Nein — Antworten stammen aus geschlossenen Mengen |
| Ausgabevalidität | Nach der Generierung validiert | Durch Konstruktion garantiert |
| Konfidenzsignal | Manchmal (logprobs, falls freigegeben) | Immer — vollständige Verteilung pro Frage |
| Kostentreiber | Generierte Ausgabetokens | Nur Eingabetokens (Ausgabe kostenlos) |
| Schemaänderungen | JSON-Schema bearbeiten, erneut prompten | Fragenkarte bearbeiten, gleiche Anfragestruktur |
| Beste Anwendung | Entwürfe, Zusammenfassungen, kreative Texte mit gewisser Struktur | Entscheidungen: Klassifizierung, Routing, Bewertung, Verifizierung |

Die beiden Ansätze ergänzen sich, sie sind keine Konkurrenten. Eine Pipeline, die einen generierten *Brief* **und** eine Routing-Entscheidung benötigt, zahlt einmal für die Generierung und trifft die Entscheidung mit einer typisierten Frage, anstatt sie aus demselben JSON herauszuparsen.

## Los geht’s

- [Einführung in die Primitive](/en/primitives/) — Choice, Score, Noul und wann jede gilt
- [HTTP-API-Referenz](/en/sdk/http-api/) — die Request-/Response-Strukturen
- [Schnellstart](/en/quickstart/) — erste getippte Frage in fünf Minuten
- [Playground](/en/playground/) — Fragen gegen den Live-Status testen, keine Anmeldung erforderlich

## Related

- [Function calling](/en/cases/function-calling/) — natürliche Sprache zu typisierten Funktionsaufrufen
- [Structured data extraction cascade](/en/cases/sde-cascade/) — zweistufige Extraktion mit Verifizierung
- [Confidence-gated routing](/en/patterns/confidence-routing/) — das Muster, das die Verteilung ermöglicht
- [Use-case map](/en/cases/use-case-map/) — wo jede Primitive in der Produktion auftaucht