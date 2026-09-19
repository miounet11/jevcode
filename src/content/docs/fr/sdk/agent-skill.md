---
title: "Compétence de l'agent"
description: "Intégrez le skill TypeSafe dans des agents de codage tels que Claude Code et Codex, afin qu'ils disposent du contexte complet de l'API au lieu de devoir deviner."
section: sdk
order: 40
tags: ['agent', 'claude-code', 'codex']
source: docs.typesafe.ai/agent-skill
translatedFrom: zh
---

## Ce problème que résout ce skill

Le skill TypeSafe fournit à votre agent de codage IA le contexte complet de l'API TypeSafe : trois types de [problèmes](/fr/primitives/), des [modèles](/fr/patterns/) d'architecture, ainsi que les meilleures pratiques pour l'évaluation organisationnelle.

**Pourquoi est-il nécessaire** : Sans ce skill, les agents rédigent des requêtes et des champs de réponse par devinette, générant des appels d'API qui semblent plausibles mais n'existent pas réellement. Il s'agit du mode d'échec le plus courant lors de l'intégration d'une nouvelle API par un agent de codage.

## Installation

### Claude Code

```bash
claude plugin marketplace add typesafe-ai/skills
claude plugin install typesafe@typesafe-ai
```

### Autres agents

```bash
npx skills add typesafe-ai/skills --skill typesafe-ai
```

Sélectionnez votre agent lors de l'installation selon les instructions. **L'installation est locale au projet par défaut**, ajoutez `-g` pour une installation globale.

### Laissez l'agent s'installer lui-même

Copiez-collez directement cette invite dans votre agent de codage :

```text
Install the TypeSafe skill. If you're in Claude Code, run `claude plugin marketplace add typesafe-ai/skills`,
then `claude plugin install typesafe@typesafe-ai`. If you're in another agent, run
`npx skills add typesafe-ai/skills --skill typesafe-ai` and select your agent.
Use one installation method. You can read the skill directly at
https://github.com/typesafe-ai/skills/blob/main/skills/typesafe-ai/SKILL.md
(raw: https://raw.githubusercontent.com/typesafe-ai/skills/main/skills/typesafe-ai/SKILL.md).
Then use the TypeSafe skill when working on this project.
```

Vous pouvez également installer manuellement : copiez l'intégralité du répertoire `skills/typesafe-ai` depuis GitHub (**incluant ses fichiers de référence**) dans le répertoire des skills de votre agent.

> **Choisissez une seule méthode d'installation** pour éviter les doublons.

## Mise à jour

Pour le plugin Claude Code :

```bash
claude plugin marketplace update typesafe-ai
claude plugin update typesafe@typesafe-ai
```

Redémarrez ensuite Claude Code ou exécutez `/reload-plugins`. Pour activer les mises à jour automatiques : ouvrez `/plugin`, sélectionnez **Marketplaces → typesafe-ai → Enable auto-update**.

Pour les installations via skills.sh, utilisez `npx skills update`. Pour les installations manuelles, remplacez l'intégralité du répertoire du skill par la dernière version depuis GitHub.

## Bonnes pratiques pour les invites

Mentionner explicitement le skill (« use the TypeSafe skill ») dans une invite fonctionne avec tout agent. Avec le plugin Claude Code, vous pouvez également appeler directement `/typesafe:typesafe-ai`.

**Rechercher des opportunités de refactoring** :

```text
Using the TypeSafe skill, explore the project and find opportunities for using
intelligent judgement to stand in for complex parsing or other fragile code.
```

**Expérimenter avec une vraie clé API** :

```text
Using the TypeSafe skill, run some experiments using the TypeSafe API key that I've
exported to `TYPESAFE_API_KEY`. Propose changes based on the most promising results.
```

**Trouver des cookbooks de référence** :

```text
Using the TypeSafe skill, analyze my code and see if there are any applicable cookbooks
that show how I could refactor my code to be less fragile or complex.
```

## Principes de collaboration avec les agents

Les quatre principes officiels suivants sont recommandés :

1. **Discutez avant d'agir.** Utilisez les invites ci-dessus pour discuter avec l'agent et clarifier la direction.
2. **Examinez la proposition avant l'implémentation.** Confirmez que la solution est raisonnable avant de lui demander d'écrire du code.
3. **Centralisez les constantes.** Les problèmes et les seuils doivent être définis dans un seul fichier pour faciliter la revue. **La capacité des agents à écrire du code est limitée** ; prévoyez des itérations de modification avec l'agent plutôt qu'une solution parfaite du premier coup.
4. **N'acceptez pas les affirmations non vérifiées.** Encouragez l'agent à valider ses propres hypothèses.

## Questions fréquentes

### L'agent n'utilise pas le skill

Avec le plugin Claude Code, appelez directement `/typesafe:typesafe-ai` ; pour les autres agents, spécifiez explicitement « use the TypeSafe skill ». Si le chargement échoue toujours, vérifiez que l'installateur a sélectionné le bon agent, puis redémarrez.

### Le comportement des routes ne correspond pas aux attentes

Vérifiez les problèmes et les seuils. Il est possible que le seuil soit trop élevé (faux négatifs) ou trop bas (faux positifs). Il peut également être nécessaire de formuler les problèmes de manière plus spécifique.

### Utilisation excessive des seuils de confiance

Si votre seul objectif est de **sélectionner la meilleure option**, choisissez simplement celle avec la confiance la plus élevée ; aucun seuil n'est nécessaire. Si vous avez en tête un algorithme statistique précis, vous devriez utiliser `probabilities` plutôt que `confidence`.

### Le code TypeSafe est difficile à réviser

L'élément central nécessitant une revue humaine est la **définition des problèmes** et les **constantes de seuil**. Définissez-les dans un seul fichier de code pour éviter de devoir chercher partout lors de la revue.

### L'agent invente des champs de requête ou de réponse

C'est généralement dû à un skill obsolète. Mettez à jour comme indiqué ci-dessus, puis réessayez.

## Liens connexes

- [Aperçu du SDK](/fr/sdk/) — SDK Python et JS
- [Primitives de problème](/fr/primitives/) — Les trois types de problèmes que l'agent doit comprendre
- [Confiance](/fr/concepts/confidence/) — Comment définir les seuils
