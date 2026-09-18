---
title: "Agenten-Fähigkeit"
description: "Integrieren Sie TypeSafe Skills in Claude Code, Codex und andere Coding-Agents, um ihnen den vollständigen API-Kontext zu geben, anstatt auf Vermutungen zu setzen."
section: sdk
order: 40
tags: ['agent', 'claude-code', 'codex']
source: docs.typesafe.ai/agent-skill
translatedFrom: zh
---

## Dieses Skill löst folgendes Problem

Das TypeSafe-Agent-Skill bietet Ihrem KI-Codierungs-Agenten den vollständigen Kontext der TypeSafe-API: drei Kategorien von [Problemtypen](/zh/primitives/), architektonische [Muster](/zh/patterns/) und bewährte Praktiken für die Bewertung durch Ihre Organisation.

**Warum ist es erforderlich?** Ein Agent ohne Skill erstellt Anfragen- und Antwortfelder auf Basis von Vermutungen, was zu API-Aufrufen führt, die zwar plausibel aussehen, aber in der Realität nicht existieren. Dies ist das häufigste Fehlermuster bei der Integration neuer APIs durch Codierungs-Agenten.

## Installation

### Claude Code

```bash
claude plugin marketplace add typesafe-ai/skills
claude plugin install typesafe@typesafe-ai
```

### Andere Agenten

```bash
npx skills add typesafe-ai/skills --skill typesafe-ai
```

Wählen Sie bei der Installation Ihren Agenten entsprechend den Anweisungen aus. **Standardmäßig wird die Installation im Projektverzeichnis lokal durchgeführt.** Fügen Sie `-g` hinzu, um global zu installieren.

### Den Agenten selbst installieren lassen

Fügen Sie diesen Prompt direkt in die Eingabe Ihres Codierungs-Agenten ein:

```text
Install the TypeSafe skill. If you're in Claude Code, run `claude plugin marketplace add typesafe-ai/skills`,
then `claude plugin install typesafe@typesafe-ai`. If you're in another agent, run
`npx skills add typesafe-ai/skills --skill typesafe-ai` and select your agent.
Use one installation method. You can read the skill directly at
https://github.com/typesafe-ai/skills/blob/main/skills/typesafe-ai/SKILL.md
(raw: https://raw.githubusercontent.com/typesafe-ai/skills/main/skills/typesafe-ai/SKILL.md).
Then use the TypeSafe skill when working on this project.
```

Sie können die Installation auch manuell durchführen: Kopieren Sie den gesamten Ordner `skills/typesafe-ai` von GitHub (**einschließlich der Referenzdateien**) in das Skills-Verzeichnis Ihres Agenten.

> **Wählen Sie nur eine Installationsmethode**, um doppelte Kopien zu vermeiden.

## Updates

Für das Claude Code-Plugin:

```bash
claude plugin marketplace update typesafe-ai
claude plugin update typesafe@typesafe-ai
```

Starten Sie anschließend Claude Code neu oder führen Sie `/reload-plugins` aus. Um automatische Updates zu aktivieren: Öffnen Sie `/plugin`, wählen Sie **Marketplaces → typesafe-ai → Enable auto-update**.

Für über skills.sh installierte Skills verwenden Sie `npx skills update`. Bei manueller Kopie ersetzen Sie den Skill-Ordner durch die neueste Version von GitHub.

## Nützliche Prompts

Es ist in jedem Agenten wirksam, im Prompt explizit auf das Skill zu verweisen („use the TypeSafe skill“). Wenn Sie das Claude Code-Plugin verwenden, können Sie auch direkt `/typesafe:typesafe-ai` aufrufen.

**Chancen zur Refaktorierung finden**:

```text
Using the TypeSafe skill, explore the project and find opportunities for using
intelligent judgement to stand in for complex parsing or other fragile code.
```

**Experimente mit einem echten API-Schlüssel durchführen**:

```text
Using the TypeSafe skill, run some experiments using the TypeSafe API key that I've
exported to `TYPESAFE_API_KEY`. Propose changes based on the most promising results.
```

**Passende Cookbooks finden**:

```text
Using the TypeSafe skill, analyze my code and see if there are any applicable cookbooks
that show how I could refactor my code to be less fragile or complex.
```

## Grundsätze für die Zusammenarbeit mit Agenten

Die vier offiziellen Grundsätze sollten befolgt werden:

1. **Zuerst diskutieren, dann handeln.** Nutzen Sie die oben genannten Prompts, um mit dem Agenten zu kommunizieren und die Richtung klar zu definieren.
2. **Lösungsvorschläge vor der Implementierung prüfen.** Bestätigen Sie, dass der Vorschlag sinnvoll ist, bevor Sie den Agenten den Code schreiben lassen.
3. **Konstanten an einer zentralen Stelle bündeln.** Probleme und Schwellenwerte sollten in einer einzigen Datei definiert werden, um die Überprüfung zu erleichtern. **Die Fähigkeit von Agenten, Code zu schreiben, ist begrenzt**; planen Sie daher eine iterative Zusammenarbeit zur Anpassung ein, anstatt eine perfekte Lösung vom ersten Versuch zu erwarten.
4. **Nicht ungeprüfte Behauptungen akzeptieren.** Ermutigen Sie den Agenten, seine eigenen Annahmen zu validieren.

## Häufig gestellte Fragen

### Der Agent verwendet das Skill nicht

Rufen Sie unter dem Claude Code-Plugin direkt `/typesafe:typesafe-ai` auf; bei anderen Agenten geben Sie explizit „use the TypeSafe skill“ an. Falls das Skill weiterhin nicht geladen wird, stellen Sie sicher, dass der Installer den richtigen Agenten ausgewählt hat, und starten Sie neu.

### Das Routing-Verhalten entspricht nicht den Erwartungen

Überprüfen Sie die Problemdefinitionen und Schwellenwerte. Möglicherweise sind die Schwellenwerte zu hoch eingestellt (Übersehen von Problemen) oder zu niedrig (Falschmeldungen). Es kann auch erforderlich sein, die Problemstellung präziser zu formulieren.

### Übermäßige Verwendung von Konfidenz-Schwellenwerten

Wenn Sie lediglich **die beste Option auswählen** möchten, reicht es aus, die Option mit der höchsten Konfidenz zu wählen; ein Schwellenwert ist nicht erforderlich. Wenn Sie spezifische statistische Algorithmen im Sinn haben, benötigen Sie stattdessen `probabilities` anstelle von `confidence`.

### TypeSafe-Code ist schwer zu überprüfen

Der Kernbereich, der einer manuellen Überprüfung bedarf, sind die **Problemdefinitionen** und **Schwellenwert-Konstanten**. Definieren Sie diese zentral in einer einzigen Code-Datei, um das Durchsuchen während der Überprüfung zu vermeiden.

### Der Agent hat Anfrage- oder Antwortfelder erfunden

Dies ist meist auf ein veraltetes Skill zurückzuführen. Aktualisieren Sie das Skill gemäß der oben beschriebenen Methode und versuchen Sie es erneut.

## Weiterführende Informationen

- [SDK-Übersicht](/zh/sdk/) — Python- und JS-SDK
- [Problem-Primitiven](/zh/primitives/) — Die drei Problemarten, die der Agent verstehen muss
- [Konfidenz](/zh/concepts/confidence/) — Wie Schwellenwerte festgelegt werden
