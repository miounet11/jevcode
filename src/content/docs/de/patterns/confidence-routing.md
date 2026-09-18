---
title: "Vertrauensgrad-Routing"
description: "Verwenden Sie die Konfidenz als zweite Entscheidungsachse. Die Antwort sagt Ihnen, „was“ es ist, die Konfidenz sagt Ihnen, „ob“ es ausgeführt werden soll."
section: patterns
order: 30
tags: ['confidence', 'routing', 'safety']
source: docs.typesafe.ai/patterns/confidence-routing
translatedFrom: zh
---

## Welches Problem löst dieses Muster?

Antwort und Konfidenz sind **zwei unabhängige Informationsdimensionen**. Die Verzweigung basierend ausschließlich auf der Antwort bedeutet, die Hälfte der vom Modell bereitgestellten Informationen zu ignorieren.

Die Konfidenz-Routing-Strategie funktioniert so: Zuerst wird die Antwort abgerufen, und dann entscheidet die Konfidenz, ob diese Antwort zuverlässig genug ist, um ausgeführt zu werden. Dies ist die Grundlage für den Aufbau eines sowohl zuverlässigen als auch sicheren Systems.

## Beispiel: Sprachbankbefehle

Stellen Sie sich vor, Sie entwickeln eine sprachbasierte Bankoberfläche, die es Benutzern ermöglicht, Konten über Sprachbefehle zu steuern. Sie möchten natürlich, dass die Konfidenz der Absichtserkennung so hoch wie möglich ist, aber **unterschiedliche Aktionen bergen unterschiedliche Risiken und erfordern daher verschiedene Konfidenzschwellenwerte**.

### Schritt 1: Benutzerabsicht bestimmen

Ein Choice-Aufruf liefert die Absicht, wobei Kandidaten wie `check_balance` (Kontostand prüfen) oder `approve_transfer` (Überweisung genehmigen) enthalten sind.

### Schritt 2: Routing basierend auf Konfidenz

```python
action = response.answers["intent"]

# Für jede Aktion: Wenn die Konfidenz unter 0,6 liegt, an einen menschlichen Agenten weiterleiten
if action.confidence < 0.6:
    route_to_support_agent(account_id)

elif action.choice == "check_balance":
    # Niedriges Risiko. Eine Konfidenz von 0,6 reicht aus.
    show_balance(account_id)

elif action.choice == "approve_transfer":
    if action.confidence > 0.85:
        # Hohes Risiko, aber auch hohe Konfidenz. Ausführung.
        ...
    else:
        # Hohes Risiko, mittlere Konfidenz. Bestätigung einholen.
        ask_user_to_confirm(account_id)
```

## Warum Schwellenwerte gestaffelt sein müssen

Betrachten Sie die drei Schwellenwerte in diesem Code:

| Schwellenwert | Funktion |
| :--- | :--- |
| `< 0,6` immer blockieren | Wenn das Modell Unsicherheit meldet, wird **keine** Aktion ausgeführt |
| `check_balance` Schwellenwert 0,6 | Nur-Lese-Operation; Fehler sind korrigierbar |
| `approve_transfer` Schwellenwert 0,85 | Betrifft Geld; Fehler sind irreversibel |

Dies ist die ingenieurtechnische Umsetzung des Konzepts **„Schwellenwerte skalieren mit dem Risiko“**. **Wenn das gesamte System nur einen einzigen einheitlichen Schwellenwert verwendet, stören Sie entweder bei niedrigrisikobezogenen Aktionen den Benutzer übermäßig oder sind bei hochriskanten Aktionen nicht vorsichtig genug.**

## Entwurfsrichtlinien

**Legen Sie zuerst eine harte Untergrenze fest, dann die aktionsspezifischen Schwellenwerte.** Die harte Untergrenze (im Beispiel 0,6) fängt die vom Modell gemeldete „tatsächliche Unsicherheit“ ab und dient als Sicherheitsnetz. Die aktionsspezifischen Schwellenwerte werden darüber hinaus nach Risiko gestaffelt.

**Machen Sie Schwellenwerte zu expliziten Konfigurationen, statt verstreute „Magic Numbers“ zu verwenden.** Definieren Sie die Schwellenwerte für jede Aktion zentral an einer Stelle, um Audits und Anpassungen zu erleichtern. Wenn ein Fachbereichsanwender fragt: „Warum muss diese Überweisung manuell bestätigt werden?“, können Sie auf einen konkreten Wert verweisen.

**Verwenden Sie Konfidenz nicht als Ersatz für Geschäftsvalidierungen.** Konfidenz ist die Selbsteinschätzung des Modells und ersetzt keine Geschäftsregeln. Deterministische Regeln wie Höchstbeträge oder Berechtigungsprüfungen müssen weiterhin im Code implementiert werden.

**Kalibrieren Sie Schwellenwerte mit echten Daten.** Die offizielle Empfehlung lautet: Die richtigen Schwellenwerte hängen von Ihrer Domäne und der Leistung Ihres Modells in Ihrem spezifischen Anwendungsfall ab. Beginnen Sie mit konservativen Schwellenwerten, testen Sie mit Ihren eigenen Daten und passen Sie diese basierend auf den Beobachtungen an.

## Wann sollte man es nicht verwenden

Wenn eine Entscheidung **keine Konsequenzen hat, wenn sie falsch ist** (z. B. das Taggen von Protokolleinträgen), erhöht das Hinzufügen eines Konfidenzschwellenwerts nur die Komplexität und den manuellen Aufwand. Der Wert des Konfidenz-Routings steht im direkten Verhältnis zur Irreversibilität der Entscheidung.

## Verwandt

- [Konfidenz](/zh/concepts/confidence/) — Das Verhältnis zwischen Konfidenz und Wahrscheinlichkeiten
- [Absichtsrouting](/zh/patterns/intent-routing/) — Wird häufig in Kombination mit Konfidenz-Routing verwendet
- [Kompositbewertung](/zh/patterns/composite-scoring/) — Umgang mit Konfidenz in Szenarien der Ranglistenbildung
