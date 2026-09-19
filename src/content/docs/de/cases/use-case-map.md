---
title: "Kapazitätskarte und Ökosystembeispiele"
description: "Jev-Fähigkeitskarte, nach Anwendungsfällen organisiert, mit echten Produktionsprojektbeispielen. Sehen Sie, welche Jev-Primitiven in welchen Szenarien eingesetzt werden."
section: cases
order: 10
tags: ['use-cases', 'ecosystem', 'production']
source: docs.typesafe.ai/concepts/use-case-map + awesome-jev
translatedFrom: zh
---

## Wie man diese Karte verwendet

Finden Sie zunächst die Szene, die Ihrem Geschäft am nächsten kommt, sehen Sie sich an, welche Primitiven andere in dieser Szene verwenden und welche Probleme sie lösen, und wenden Sie diese dann auf Ihre eigenen Dokumente und Aktionen an.

Für jede der folgenden Szenarien werden angegeben: **Welches Problem wird gelöst** → **Welche Primitiven werden verwendet** → **Echt-Projekt-Beispiel**.

> Um den **vollständigen Projektindex nach Kategorien sortiert** (mit Star-Anzahl und Sprach-Tags) zu sehen, siehe [Community-Ökosystem-Projekte](/de/ecosystem/).

## Klassifizierung und Routing

**Problem**: Nach Eingang einer Anfrage muss entschieden werden, zu welcher Kategorie sie gehört, und sie dann an die entsprechende Verarbeitungskette weiterleiten.

**Primitive**: Choice (Klassifizierung), Konfidenz zur Steuerung (Gating).

**Echt-Projekt-Beispiel**:

- [Notra](https://github.com/usenotra/notra) — Marketing-Analyse: GEO-Plattform in der Produktionsumgebung. Der Brand-Visibility-Klassifizierer wurde mit dem Schalter `NOTRA_JEV_CLASSIFIERS` von LLM auf Jevs boolesche Entscheidung migriert, mit einem Schwellenwert von 0,5.
- [jev-router](https://github.com/gargpratyush/jev-router) — Entwicklungstool: Ermöglicht Jev, das beste Modell aus einer Kandidatenliste auszuwählen, um Claude Code-Aufgaben an das günstigste und kompetente Modell zu routen.
- [jev-router (prismhq)](https://github.com/prismhq/jev-router) — LLM-Infrastruktur: Open-Source-Router auf Basis von LiteLLM, der Jev-Entscheidungen nutzt, um auszuwählen, welches Modell jede Anfrage bedient.
- [pi-jev-router](https://github.com/mejiasd3v/pi-jev-router) — Coding-Agent: Fügt dem Pi-Coding-Agenten die Fähigkeit hinzu, Modelle pro Anfrage automatisch zu routen, indem Jev auf dem Vercel AI Gateway Entscheidungen trifft.
- [jcm-router](https://github.com/adarshmishra07/jcm-router) — Coding-Agent: Lokaler Agent, der Jev-Entscheidungen nutzt, um für jede Nachricht das Claude-Modell und die Inferenzstärke auszuwählen, während der Haupt-Chat-Cache vor Verunreinigungen geschützt bleibt.

> **Beobachtung**: Modell-Routing ist in diesem Szenario die intensivste Anwendungsrichtung. Das gemeinsame Muster ist: „Eine einmalige, kostengünstige Choice-Entscheidung ersetzt einen teuren Modellaufruf oder eine manuelle Beurteilung.“

## Scoring und Sortierung

**Problem**: Eine Gruppe von Elementen muss nach Relevanz, Qualität oder multidimensionalen Kriterien sortiert werden.

**Primitive**: Score, kombiniert mit [Composite Scoring](/de/patterns/composite-scoring/), um mehrere Dimensionen zusammenzuführen.

**Echt-Projekt-Beispiel**:

- [jev-bfs](https://github.com/komikat/jev-bfs) — Suchtool: Findet den Linkpfad zwischen zwei Einträgen im englischen Wikipedia, indem Jev die ausgehenden Links jeder Wikipedia-Seite sortiert, während Python den Suchprozess steuert.
- [Jev Search](https://github.com/superagents-lab/jev-search) — Websuche: Nutzt Jevs Noul, um Relevanzscores für Titel und Zusammenfassungen der Suchergebnisse von Search1API zu vergeben.

## Validierung und Guardrails

**Problem**: Von KI oder Agenten erzeugte Arbeiten, Tool-Aufrufe, Eingaben und Ausgaben müssen überprüft werden, bevor sie fortgesetzt werden können.

**Primitive**: Noul (Ja/Nein-Entscheidung), Schwellenwert wird in Boolesch umgewandelt.

**Echt-Projekt-Beispiel**:

- [jev-review](https://github.com/devagrawal09/jev-review) — Software-Engineering: Phasenweiser Code-Review-Workflow und lokales Dashboard. Jev wacht über jede Review-Phase; Änderungen können erst fortgesetzt werden, wenn sie bestanden sind.
- [pi-jev](https://github.com/y0usaf/pi-jev) — Agentensicherheit: Fügt dem Pi-Coding-Agenten messbare Tool-Aufruf-Tore hinzu. Risiko-Aufrufe werden vor der Ausführung von Jev überprüft.
- [OpenWork](https://github.com/different-ai/openwork) — Engineering-Workflow: Bindet Jev in seinen Eval-Testkit als Validierungs-Schiedsrichter ein, sodass die Arbeit der Agenten durch typisierte Urteile statt durch Textmodelle überwacht wird.
- [jev-guard](https://github.com/leepokai/jev-guard) — Agentensicherheit: Schutz vor Prompt-Injection und gefährlichen Aktionen für Claude Code, Codex, Pi und ACP-Agenten. Jev entscheidet, was blockiert wird.

## Agenten-Entscheidungen

**Problem**: Für jeden Schritt eines Agenten ist eine schnelle, typisierte und erklärbare Entscheidungsschicht erforderlich.

**Primitive**: Choice (Aktionsauswahl), Score/Noul zur Unterstützung.

**Echt-Projekt-Beispiel**:

- [Jev Ultrafast](https://github.com/browser-use/jev-ultrafast) — Browser-Automatisierung: Der ultraschnelle Agent von browser-use. Jev entscheidet über jede Aktion und welches Element geklickt wird; Sprachmodelle werden nur aufgerufen, wenn Texteingaben erforderlich sind.
- [pi-typesafe-jev](https://github.com/legacybridge-tech/pi-typesafe-jev) — Coding-Agent: Stellt System-One-Entscheidungen als fünf Pi-Tools bereit, sodass das Modell semantische Entscheidungen im engen Umfang trifft, während Code und Benutzer die Kontrolle über Schwellenwerte, Gewichte und Aktionen behalten.
- [jev-judgment](https://github.com/HyunjunJeon/jev-judgment) — Coding-Agent: Sendet geschlossene Coding-Agent-Entscheidungen an Jev, um die Urteile typisiert, kostengünstig und über verschiedene Laufzeiten hinweg vergleichbar zu halten.
- [limpet](https://github.com/noplan-inc/limpet) — Coding-Agent: Stop-Hook. Verhindert, dass der Agent zu früh aufhört, indem Jev die Beendigungsbedingungen in natürlicher Sprache bewertet.
- [robo-harness](https://github.com/grmkris/robo-harness) — Robotik: SO-101 Roboterarm-Arbeitsplatz. Jev trifft die Entscheidung für den Runner, um begrenzte Gelenk-Schritte aus typisierten Kandidatenaktionen auszuwählen, begrenzt durch ein Budget.

## Content-Moderation und Compliance

**Problem**: Beurteilen, ob Inhalte gegen Richtlinien verstoßen, sensible Informationen enthalten oder konform sind.

**Primitive**: Noul.

Hierzu gibt es weniger echte Projektbeispiele (dieser Bereich befindet sich noch in den Anfängen), aber die typische Form ist ähnlich wie bei Guardrails: Fragen wie „Enthält es personenbezogene Daten?“ oder „Verstößt es gegen Richtlinien?“ werden als Noul formuliert, nach Schwellenwerten in Boolesch umgewandelt und führen dann in deterministische Workflows.

## Datenannotation und Bewertung

**Problem**: Datensätze beschriften oder die Qualität von KI-Ausgaben bewerten.

**Primitive**: Alle drei Typen.

**Echt-Projekt-Beispiel**:

- Siehe Bewertungsprojekte in den Abschnitten „Scoring und Sortierung“ und „Validierung und Guardrails“ (z. B. die Verwendung von OpenWorks Eval-Testkit).

## Spiele und Simulation

**Problem**: In Echtzeitumgebungen ist bei jedem Frame oder jedem Entscheidungspunkt eine schnelle Beurteilung erforderlich.

**Primitive**: Choice (Aktionsauswahl).

**Echt-Projekt-Beispiel**:

- [Jev Ultrafast](https://github.com/browser-use/jev-ultrafast) — Siehe oben.
- [jev-drone](https://github.com/RomanSlack/jev-drone) — Robotik-Simulation: Autonomes Drohnenmodell in MuJoCo, das nur auf Kamerasdaten basiert. Der Jev-Entscheidungsmodell-Loop wird mit einer Frequenz von 2,5 Hz in die Steuerungsschleife eingebunden.
- [tsai-sc](https://github.com/phyous/tsai-sc) — Spiel: Steuert die freigegebene Originalversion von StarCraft über Tastatur und Maus. Bei jeder Entscheidung werden die Jev-Aktionswahrscheinlichkeiten protokolliert.

> **Beobachtung**: Diese Szenarien sind am empfindlichsten gegenüber Latenz. Der 2,5-Hz-Steuerloop von `jev-drone` zeigt, dass Jevs Latenz bereits in Echtzeit-Steuerungslinks integriert werden kann.

## Grundlagenmodell-Forschung

**Problem**: Nachbildung oder Erforschung von Modellformen wie System One, die „eine einmalige Forward-Propagation für typisierte Entscheidungen“ ausgeben.

**Echt-Projekt-Beispiel**:

- [decider](https://github.com/Mapika/decider) — Open-Source-Modell: Feinabstimmung von Qwen3.5-2B zur Nachbildung der System-One-Form, die bei einer einmaligen Forward-Propagation typisierte Entscheidungen mit kalibrierten Wahrscheinlichkeiten ausgibt.
- [openjev](https://github.com/zhihz/openjev) — Offene Forschung: Unabhängige lokale Vorschau, die basierend auf Kontext, Frage und Kandidatenantworten Wahrscheinlichkeitsfragen auf bilingualer Ebene beantwortet, inspiriert von TypeSafe Jev.
- [Parallel Constrained Decoding (Qwen2.5-1B-RLCD)](https://huggingface.co/spaces/drinkmoonshine/parallel-constrained-decoding) — Offene Forschung: RLCD-geschultes Qwen2.5-1B-Demo, das erforscht, ob Open-Source-Parallel-Constrained-Decoding als Alternative zu Jev dienen kann.

## Infrastruktur und SDKs

**Problem**: Jev in bestehende technische Stacks integrieren.

**Echt-Projekt-Beispiel**:

- Siehe [awesome-jev Infra / SDKs / Integrations-Kategorie](https://github.com/yibie/awesome-jev/blob/main/categories/infra-sdks-integrations.md), die verschiedene Sprachbindungen, Agenten-Integrationen und Gateway-Anpassungen auflistet.

## Die vier Richtungen der offiziellen TypSafe-Kapazitätskarte

TypSafe fasst die Anwendungsfälle in vier große Richtungen zusammen, die beim Entwerfen von Szenarien als Referenz dienen sollten:

**KI-automatisierte Software** — KI und zuverlässige Software werden verschachtelt orchestriert, sodass sie im Hintergrund Millionen von Durchläufen ohne menschliche Mitwirkung ausführen können. **Code steuert den Kontrollfluss, TypeSafe verarbeitet semantische Entscheidungen und Sprachverständnis.**

**Echtzeit-Anwendungen** — Fortschrittliche Intelligenz erreicht Echtzeitgeschwindigkeit (150 ms). Das bedeutet, dass KI-Entscheidungen schneller sein können als die menschliche Wahrnehmung und ausreichend schnell, um in Spiele oder UIs eingebettet zu werden.

**AI Map Reduce auf großen Datenmengen** — Eine 100-fache Kostenreduzierung ermöglicht die Verarbeitung riesiger Datensätze: Suche nach relevanten Informationen in großen Korpora, Klassifizierung massiver Agenten-Tracks, Extrahieren von Features für Vorhersagen.

**Generische KI-Validierung** — Validierung der Eingabe-Prompts, Extraktionsergebnisse, Inferenz-Tracks und Tool-Aufrufe anderer KIs. Erkennung von Jailbreaks, Zitationsfehlern, Halluzinationen und anderen Fehlermustern; die Kosten betragen nur einen kleinen Teil eines tatsächlichen LLM-Aufrufs.

## Verwandt

- [Architekturmuster](/de/patterns/) — Die allgemeinen Muster hinter diesen Beispielen
- [Problem-Primitiven](/de/primitives/) — Methoden zur Auswahl der Primitiven
- [awesome-jev vollständige Liste](https://github.com/yibie/awesome-jev) — Die ständig aktualisierte Liste der Community-Projekte
