---
title: "Vertrauenswürdigkeit"
description: "confidence ist eine statistische Größe, die aus der Wahrscheinlichkeitsverteilung abgeleitet wird. Verstehen Sie den Zusammenhang mit probabilities und wie Sie den Schwellenwert risikoadaptiv skalieren."
section: concepts
order: 30
tags: ['confidence', 'probabilities', 'threshold']
source: docs.typesafe.ai/confidence
translatedFrom: zh
---

## Die Beziehung zwischen den beiden Feldern

Alle Antworten vom Typ `Choice` und `Score` verfügen über eine Eigenschaft namens `probabilities`, die die **Wahrscheinlichkeitsverteilung** über die einzelnen Optionen (`Choice`) bzw. Score-Stufen (`Score`) angibt.

Die **Form** dieser Verteilung gibt Aufschluss darüber, wie sicher das Modell ist: Eine Konzentration auf ein bestimmtes Ergebnis deutet auf eine hohe Sicherheit hin, während eine breite Streuung auf Unsicherheit schließen lässt.

Die Eigenschaft `confidence` komprimiert diese Form zu einem einzelnen Wert zwischen 0 und 1, sodass Sie Schwellenwerte festlegen können, ohne selbst mathematische Berechnungen anstellen zu müssen.

> **Hinweis**: `Noul`-Antworten verfügen **nicht** über `confidence`, da der Wert selbst bereits eine Wahrscheinlichkeit zwischen 0 und 1 darstellt.

## Bedeutung der Verteilungsform

- **Niedrige `Choice`-Konfidenz** bedeutet in der Regel, dass keine der Optionen die anderen deutlich übertrifft.
- **Niedrige `Score`-Konfidenz** deutet oft darauf hin, dass die Definition der Score-Stufen mehrdeutig ist, multidimensional ist oder dass die Informationen im `state` nicht ausreichen, um eine eindeutige Einschätzung vorzunehmen.

## „Ich weiß es nicht“ ist ein nützliches Signal

Ein intelligentes System – ob menschlich oder maschinell – kann nicht vertraut werden, wenn es Unsicherheit nicht ehrlich kommunizieren kann.

Die Konfidenz bietet dem Modell einen integrierten Mechanismus, um zu sagen: „Hier bin ich unsicher.“ Dies ermöglicht es Ihrem Code, je nach Grad der Sicherheit unterschiedliches Verhalten zu implementieren, was die Grundlage für den Aufbau wirklich zuverlässiger Systeme bildet.

## Drei Zweige

Ein praktischer Ausgangspunkt besteht darin, die Konfidenz in drei Bereiche aufzuteilen, die jeweils unterschiedlichem Systemverhalten entsprechen:

- **Hohe Konfidenz**: Automatische Ausführung. Das Modell hat eine klare Einschätzung, kein menschliches Eingreifen ist erforderlich.
- **Mittlere Konfidenz**: Vorsichtiges Fortfahren. Das Modell liefert eine plausible Antwort, ist sich aber unsicher. Je nach Kontext kann der Benutzer zur Bestätigung aufgefordert, der Vorgang zur Überprüfung markiert oder zunächst weitere Informationen gesammelt werden.
- **Niedrige Konfidenz**: Keine Ausführung. Übergabe an einen Menschen, Anforderung von Klärungen oder Fallback auf andere Systeme. Das Modell signalisiert damit, dass es nicht genügend Informationen hat oder diese Frage nicht für es geeignet ist.

**Wo die Grenzen gezogen werden, hängt vom Risikoniveau ab.**

## Schwellenwerte skalieren mit dem Risiko

Dies ist die wichtigste praktische Regel: **Der Konfidenz-Schwellenwert ist keine einzelne Zahl.**

Innerhalb desselben Systems sollten verschiedene Aktionen unterschiedliche Schwellenwerte basierend auf den „Konsequenzen eines Fehlers“ festlegen.

```python
response = client.system_one(
    state=user_message,
    questions={
        "action": Choice(
            instructions="What is the user trying to do?",
            criteria={
                "check_balance": "View account balance",
                "approve_transfer": "Approve the pending withdrawal request",
                "support": "Get help with an issue",
            },
        ),
    },
)

action = response.answers["action"]
confidence = action.confidence

if confidence < 0.5:
    # Das Modell ist tatsächlich unsicher. Nicht raten.
    route_to_human(user_message)

elif action.choice == "check_balance":
    # Niedriges Risiko. Ein falscher Bildschirm ist korrigierbar.
    show_balance(account_id)

elif action.choice == "approve_transfer":
    if confidence > 0.9:
        # Hohes Risiko + hohe Konfidenz. Mit Bestätigung ausführen.
        confirm_then_execute(account_id)
    else:
        # Hohes Risiko + mittlere Konfidenz. Vorher verifizieren.
        ask_user_to_confirm(account_id)
```

Dieser Code enthält drei verschiedene Schwellenwerte, die jeweils einem anderen Risikoniveau entsprechen:

| Aktion | Risiko | Schwellenwert |
| :--- | :--- | :--- |
| Alles unter 0.5 blockieren | — | Harter Untererfassungswert, um Fälle zu erfassen, in denen das Modell seine eigene Unsicherheit meldet |
| `check_balance` | Niedrig, schreibgeschützt und korrigierbar | Ab 0.5 automatisch ausführen |
| `approve_transfer` | Hoch, betrifft Geldbeträge | Erfordert > 0.9 und erfordert weiterhin eine Benutzerbestätigung |

Der Schwellenwert von `0.5` fängt Fälle ab, in denen das Modell selbst meldet: „Ich bin tatsächlich unsicher.“ Darüber hinaus liegt der Schwellenwert für die Ausführung einer zerstörerischen Aktion deutlich höher als der für eine schreibgeschützte Operation. **Ihr Code kodifiziert Ihre Risikotoleranz.**

> **Hinweis**: Die korrekten Schwellenwertwerte hängen von Ihrer Domäne und der tatsächlichen Leistung des Modells in Ihrem Anwendungsfall ab. Beginnen Sie mit konservativen Schwellenwerten, testen Sie diese mit Ihren eigenen Daten und passen Sie sie basierend auf den Beobachtungen an.

## Eigene Metriken definieren

Das offiziell bereitgestellte `confidence` ist eine praktische Metrik, die für die meisten Anwendungsfälle geeignet ist, aber Sie sind nicht an diese Definition gebunden. Je nachdem, was Sie bewerten, können andere Metriken besser geeignet sein – genau aus diesem Grund wird auch `probabilities` zurückgegeben: Sie haben die vollständige Verteilung und können Ihre eigenen Berechnungen anstellen.

Zum Beispiel kann die Wahrscheinlichkeitsdifferenz (Margin) zwischen zwei Kandidatenoptionen in bestimmten Szenarien besser widerspiegeln, ob eine automatische Ausführung sinnvoll ist, als der Grad der Konzentration. Oder Sie betrachten nur die Top-1-Wahrscheinlichkeit und ignorieren den Rest. Die Wahl liegt bei Ihnen.

## Verwandte Themen

- [Choice](/zh/primitives/choice/) / [Score](/zh/primitives/score/) — Die beiden Primitiven mit Konfidenz
- [Noul](/zh/primitives/noul/) — Ohne Konfidenz, selbst ein Wahrscheinlichkeitswert
- [Konfidenz-Routing-Muster](/zh/patterns/confidence-routing/) — Konfidenz als Routing-Signal in der Pipeline verwenden
