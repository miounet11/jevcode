---
title: JevCode kennenlernen
description: JevCode ist das Zuhause von Jev. Das Modell ist clavue-jev, das heute weltweit beste Jev. Ein Aufruf sendet einen Zustand und typisierte Fragen und gibt ein Urteil zurück, auf das Software verzweigen kann.
section: start
order: 10
tags: ['overview', 'clavue-jev']
---

## Das Zuhause von Jev

JevCode ist der Ort, an dem Jev lebt. Das Modell, das diese Seite bereitstellt, ist **clavue-jev**. Wir haben es gebaut, wir stellen es bereit, und wir halten es für das heute weltweit beste Jev.

jev-1.13.0 erscheint auf der Vergleichsseite. Es ist die Gegenseite derselben Frage, zum Nebeneinanderstellen. Es ist nicht das Modell, das diese Seite nach außen anbietet.

## Was ein Aufruf ist

clavue-jev ist kein Chat-Modell. Du sendest **einen Zustand** und bis zu **sechs typisierte Fragen**. Zurück kommen Felder, die ein Programm direkt liest:

| Frage | Rückgabe |
| :--- | :--- |
| `noul` | Eine Zahl von 0 bis 1. Lies sie als Stärke des „Ja". |
| `confidence` | Eine Zahl von 0 bis 1. Lies sie als: wie fest dieses Urteil ist. |
| `choice` | Eine der Optionen, die du genannt hast. |

Ein Chat-Modell schreibt Prosa. clavue-jev gibt einen Wert zurück. Das ist die Aufgabe von System One, die Aufgabe dieses Aufrufs.

## Weiterlesen

- [System One](/de/concepts/system-one/) — die Form eines Aufrufs
- [Zustand](/de/concepts/state/) — der Text, den du sendest
- [Sicherheit](/de/concepts/confidence/) — wann automatisch handeln, wann anhalten
- [Einmal testen](/de/try/) — anonym, ohne Key
- [API](/de/api/) — `POST /v1/judge` mit einem Key
