---
title: "Kev API compatibility: ein Konformitätsbericht eines Drittanbieters"
description: "Kev-0.8B (MLX, M1 Pro) besteht alle 32 MUST-Anforderungen der Jev API Conformance Suite eines Drittanbieters – 255 Optionen, 10 Score-Stufen, gemischte Fragebatterien, typesafe-sdk Parsing – mit den zwei vom Autor eingereichten SHOULD-Level-Hinweisen."
section: cases
order: 225
tags: ['compatibility', 'conformance', 'kev', 'api']
translatedFrom: en
---
Kompatibilität, die Sie testen können, nicht Kompatibilität, die Sie behaupten

„Kompatibel mit der Jev API“ ist leicht zu sagen und schwer zu verifizieren. Also hat ein Community-Mitglied es als überprüfbare Spezifikation niedergeschrieben: [jevcompat](https://github.com/mandu5/jevcompat)
— 48 Anforderungen an den `POST /v1/systemone`-Vertrag, wobei jeder einzelne die TypeSafe-Dokumente, die OpenAPI-Datei oder den SDK-Quellcode zitiert. Anschließend wurde die Suite gegen die acht meistgestarrten offenen Server ausgeführt, die die API implementieren.

**Kev-0.8B (`2874258`, MLX, M1 Pro) ist einer von zwei Servern, die jedes MUST bestehen: 32/32**, einschließlich:

- choice-Optionen akzeptiert bis zum Limit von 255 Optionen
- Score-Stufen akzeptiert bis zum Limit von 10 Stufen
- `model: "jev-latest"` Alias-Auflösung
- gemischte Batterien — Noul-, Choice- und Score-Fragen in einer Anfrage, Antworten verknüpft
 nach deinen IDs
- Round-Trip von Nicht-ASCII-Text durch Option-Namen
- das offizielle `typesafe-sdk` Parsing jeder Antwortart unverändert

Vollständiger Bericht mit jeder aufgezeichneten Unterhaltung:
[results/kev/report.md](https://github.com/mandu5/jevcompat/blob/main/results/kev/report.md)
— Befehl und Gewichte bedienen in [RUN.md](https://github.com/mandu5/jevcompat/blob/main/results/kev/RUN.md),
reproduzierbar auf deiner eigenen Maschine.

## Was die Konformität nicht abdeckt

Die Suite verfolgt auch SHOULD-Anforderungen (Kev besteht 10 von 12; die zwei
Fehlschläge sind auth-error-Antworten, ungetestet, weil der gemeldete Lauf mit auth
ausgeführt wurde, und eine weitere Prüfung wurde nicht ausgeführt, weil der Server den
Fehler, den sie abdeckt, nie erzeugt hat). Die zwei SHOULD-Level-Notizen, die der Autor
zurückgemeldet hat, sind der interessantere Teil, weil es an beiden Stellen eine Antwort
sein kann, die byte-identisch ist, aber dennoch eine schlechtere Antwort darstellt:

**Score-Vertrauensnormalisierung.** Kev berechnet das Score-Vertrauen als
`1 − E|level − mode| / (L − 1)`; die dokumentierten Beispiele von TypeSafe berechnen
`1 − E|level − mode| / D`, wobei `D` die Streuung der Verteilung ist. Gleiches Evidenz,
unterschiedlicher Nenner — bei einer Frage mit 3 Stufen gemessen, lieferte Kev ein Vertrauen
von 0,7535, während die Referenzformel 0,260 ergibt. Ein Kunde, der Vertrauenszahlen
zwischen verschiedenen Backends vergleicht, wird für die gleiche Urteilsqualität
unterschiedliche Verteilungen sehen. Wenn Sie auf absoluten Schwellenwerten routen (das
[confidence-routing](/en/patterns/confidence-routing/)-Muster), kalibrieren Sie pro
Backend — oder routen Sie auf der rohen Verteilung, die beide Backends bereitstellen.

**Die Verschlechterung bei langen Kontexten ist eine Modelleigenschaft, keine Spezifikationsverletzung.** Der Testbestand besteht; die Genauigkeit jenseits von Kevs 384-Token-Trainingskontext bleibt in der Spezifikation nicht erhalten. Bei den TypeSafe-Auswahlen des Testbestands erzielte Kev-9B einen Wert von 0,92 innerhalb des Trainingskontexts, jedoch 0,75–0,79 bei längeren Dokumenten (Kev-4B: 0,88 / 0,88 / 0,81) — siehe das [long-context recipe](https://github.com/jaredpalmer/kev/issues/48) für die vollständige Aufschlüsselung und die vom Autor vorgeschlagenen Korrekturen. Die [state design](/en/concepts/state/)-Richtlinie gilt für jedes Backend: Halten Sie den Zustand so groß wie die Entscheidung, nicht so groß wie die Seite.

## Der übergeordnete Punkt

Die Spezifikation mit den 48 Anforderungen ist backend-agnostisch. Wenn Sie Kev gegen andere selbst gehostete Jev API-Server evaluieren, führen Sie denselben Testlauf durch und vergleichen Sie die Zahlen, anstatt sich auf READMEs zu verlassen. Die beiden konformen Implementierungen weichen auch außerhalb der Spezifikation in messbarer Weise voneinander ab — etwa bei der Form der Konfidenzverteilung und der Langzeitkontext-Beibehaltung — was genau die Art von Informationen ist, die ein Konformitätsbericht sichtbar macht, während ein Feature-Raster diese verschleiert.

## Los geht’s

- [Kev on GitHub](https://github.com/jaredpalmer/kev) — die Modellfamilie 0.8B–9B
- [jevcompat spec](https://github.com/mandu5/jevcompat/blob/main/SPEC.md) — die 48 Anforderungen
- [HTTP API reference](/en/sdk/http-api/) — der offizielle Vertrag, der getestet wird
- [Confidence-gated routing](/en/patterns/confidence-routing/) — Routing basierend auf Verteilungen, Kalibrierung pro Backend
- [Self-consistency testing](/en/cases/consistency-choice-cookbook/) — Stress-Test für jedes Backend auf die gleiche Weise