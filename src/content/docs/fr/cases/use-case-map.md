---
title: "Carte des capacités et cas d'utilisation de l'écosystème"
description: "Carte des capacités Jev organisée par cas d'utilisation, accompagnée d'exemples de projets de production réels. Découvrez dans quels scénages les autres ont utilisé quels types de primitives."
section: cases
order: 10
tags: ['use-cases', 'ecosystem', 'production']
source: docs.typesafe.ai/concepts/use-case-map + awesome-jev
translatedFrom: zh
---

## Comment utiliser cette carte

Identifiez d'abord le scénario le plus proche de votre activité, observez quelles primitives les autres utilisent dans ce contexte et quels problèmes elles résolvent, puis adaptez-les à vos propres documents et actions.

Chaque scénario ci-dessous présente la structure suivante : **Problème résolu** → **Primitive utilisée** → **Projet réel**.

> Pour consulter **l'index complet des projets communautaires classés par catégorie** (avec nombre d'étoiles et étiquettes de langage), consultez [Écosystème communautaire](/zh/ecosystem/).

## Classification et routage

**Problème** : Après l'arrivée d'une requête, il faut déterminer à quelle catégorie elle appartient, puis la diriger vers différentes chaînes de traitement.

**Primitive** : Choice (classification), avec le niveau de confiance utilisé pour le contrôle d'accès (gating).

**Projets réels** :

- [Notra](https://github.com/usenotra/notra) — Analyse marketing : Plateforme GEO en production, utilisant le commutateur `NOTRA_JEV_CLASSIFIERS` pour migrer les classificateurs de visibilité de marque du LLM vers la décision booléenne de Jev, avec un seuil de 0,5.
- [jev-router](https://github.com/gargpratyush/jev-router) — Outil de développement : Permet à Jev de choisir parmi des modèles candidats, afin de router les tâches de Claude Code vers le modèle le moins cher capable de les exécuter.
- [jev-router (prismhq)](https://github.com/prismhq/jev-router) — Infrastructure LLM : Routeur open source basé sur LiteLLM, utilisant les décisions de Jev pour sélectionner quel modèle sert chaque requête.
- [pi-jev-router](https://github.com/mejiasd3v/pi-jev-router) — Agent de codage : Ajoute à l'agent de codage Pi la capacité de router automatiquement les modèles par requête, en prenant des décisions via Jev sur Vercel AI Gateway.
- [jcm-router](https://github.com/adarshmishra07/jcm-router) — Agent de codage : Agent local, utilisant les décisions de Jev pour choisir le modèle Claude et l'intensité d'inférence pour chaque message, tout en empêchant la contamination du cache de chat principal.

> **Observation** : Le routage des modèles est l'application la plus dense dans ce scénario. Le modèle commun est « remplacer un appel de modèle coûteux ou une décision humaine par une seule décision Choice peu coûteuse ».

## Notation et classement

**Problème** : Il est nécessaire de classer un ensemble d'éléments selon la pertinence, la qualité ou des critères multidimensionnels.

**Primitive** : Score, combiné avec la [notation composite](/zh/patterns/composite-scoring/) pour fusionner les dimensions multiples.

**Projets réels** :

- [jev-bfs](https://github.com/komikat/jev-bfs) — Outil de recherche : En demandant à Jev de classer les liens sortants de chaque page Wikipédia, il permet de trouver le chemin de liens entre deux entrées de Wikipédia en anglais, tandis que Python contrôle le processus de recherche.
- [Jev Search](https://github.com/superagents-lab/jev-search) — Recherche web : Utilise Noul de Jev pour attribuer des scores de pertinence aux titres et extraits des résultats de Search1API.

## Validation et garde-fous

**Problème** : Le travail généré par l'IA ou les agents, les appels d'outils, les entrées et les sorties doivent être vérifiés avant de pouvoir être traités.

**Primitive** : Noul (décision oui/non), conversion en booléen via un seuil.

**Projets réels** :

- [jev-review](https://github.com/devagrawal09/jev-review) — Génie logiciel : Workflow de revue de code par étapes et tableau de bord local ; Jev agit comme gardien à chaque étape de la revue, et les modifications ne peuvent être avancées qu'après validation.
- [pi-jev](https://github.com/y0usaf/pi-jev) — Sécurité des agents : Ajoute à l'agent de codage Pi des portes de mesure des appels d'outils ; les appels à risque sont vérifiés par Jev avant l'exécution.
- [OpenWork](https://github.com/different-ai/openwork) — Flux de travail d'ingénierie : Intègre Jev à son kit d'évaluation (eval testkit) en tant qu'arbitre de validation, permettant aux travaux produits par les agents d'être contrôlés par des décisions typées plutôt que par des modèles de langage.
- [jev-guard](https://github.com/leepokai/jev-guard) — Sécurité des agents : Protection contre l'injection de prompts et les actions dangereuses pour les agents Claude Code, Codex, Pi et ACP ; Jev décide ce qui doit être intercepté.

## Décisions des agents

**Problème** : Pour chaque étape d'un agent, il faut une couche de décision rapide, typée et interprétable pour déterminer quoi faire.

**Primitive** : Choice (sélection d'action), avec Score/Noul en appui.

**Projets réels** :

- [Jev Ultrafast](https://github.com/browser-use/jev-ultrafast) — Automatisation navigateur : L'agent ultra-rapide de browser-use, où Jev décide de chaque action et de l'élément à cliquer ; le modèle de langage n'est appelé que lorsque la saisie de texte est nécessaire.
- [pi-typesafe-jev](https://github.com/legacybridge-tech/pi-typesafe-jev) — Agent de codage : Expose les décisions de System One sous forme de cinq outils Pi, permettant au modèle d'effectuer des jugements sémantiques à périmètre restreint, tandis que le code et l'utilisateur conservent le contrôle des seuils, des poids et des actions.
- [jev-judgment](https://github.com/HyunjunJeon/jev-judgment) — Agent de codage : Envoie les jugements des agents de codage fermés à Jev, afin que les décisions restent typées, peu coûteuses et comparables entre différents environnements d'exécution.
- [limpet](https://github.com/noplan-inc/limpet) — Agent de codage : Hook d'arrêt, empêche l'agent de se terminer prématurément en utilisant les jugements de Jev sur les conditions de complétion en langage naturel.
- [robo-harness](https://github.com/grmkris/robo-harness) — Robotique : Station de travail pour le bras robotique SO-101 ; Jev décide que le runner sélectionne des pas articulaires bornés parmi des actions candidates typées, sous contrainte budgétaire.

## Modération de contenu et conformité

**Problème** : Déterminer si un contenu est non conforme, s'il contient des informations sensibles ou s'il respecte les politiques.

**Primitive** : Noul.

Il y a peu de projets réels répertoriés (ce domaine en est encore à ses débuts), mais la forme typique est similaire à celle des garde-fous : formuler des questions telles que « contient-il des informations d'identification personnelle » ou « viole-t-il la politique » sous forme de Noul, convertir en booléen selon un seuil, puis entrer dans un flux de travail déterministe.

## Annotation de données et évaluation

**Problème** : Étiqueter un jeu de données ou évaluer la qualité des sorties d'un modèle.

**Primitive** : Les trois types.

**Projets réels** :

- Voir les projets d'évaluation dans les sections « Notation et classement » et « Validation et garde-fous » (par exemple, l'utilisation du kit d'évaluation d'OpenWork).

## Jeux et simulations

**Problème** : Dans un environnement en temps réel, chaque image ou chaque point de décision nécessite une décision rapide.

**Primitive** : Choice (sélection d'action).

**Projets réels** :

- [Jev Ultrafast](https://github.com/browser-use/jev-ultrafast) — Voir ci-dessus.
- [jev-drone](https://github.com/RomanSlack/jev-drone) — Simulation robotique : Drone autonome dans MuJoCo utilisant uniquement la caméra ; le modèle de jugement de Jev est intégré dans la boucle de contrôle, à une fréquence de 2,5 Hz.
- [tsai-sc](https://github.com/phyous/tsai-sc) — Jeu : Contrôle de la version partagée originale de StarCraft via clavier et souris ; à chaque décision, les probabilités d'action de Jev sont enregistrées.

> **Observation** : Ces scénarios sont les plus sensibles à la latence. La boucle de contrôle de 2,5 Hz de `jev-drone` montre que la latence de Jev est désormais compatible avec les chaînes de contrôle en temps réel.

## Recherche sur les modèles de base

**Problème** : Reproduire ou étudier des formes de modèles telles que System One, qui produisent des décisions typées à partir d'une seule propagation avant.

**Projets réels** :

- [decider](https://github.com/Mapika/decider) — Modèle ouvert : Reproduction de la forme System One par affinement de Qwen3.5-2B, produisant des décisions typées avec des probabilités calibrées à partir d'une seule propagation avant.
- [openjev](https://github.com/zhihz/openjev) — Recherche ouverte : Aperçu local indépendant, répondant à des problèmes de probabilité bilingue à partir du contexte, de la question et des réponses candidates, inspiré par TypeSafe Jev.
- [Parallel Constrained Decoding (Qwen2.5-1B-RLCD)](https://huggingface.co/spaces/drinkmoonshine/parallel-constrained-decoding) — Recherche ouverte : Démo Qwen2.5-1B entraînée par RLCD, explorant le décodage parallèle contraint open source comme alternative à Jev.

## Infrastructure et SDK

**Problème** : Intégrer Jev dans les stacks technologiques existantes.

**Projets réels** :

- Voir la [catégorie Infra / SDKs / Integrations de awesome-jev](https://github.com/yibie/awesome-jev/blob/main/categories/infra-sdks-integrations.md), qui recense les liaisons de langages, les intégrations d'agents et les adaptations de passerelles.

## Les quatre directions de la carte des capacités officielle

TypeSafe regroupe les cas d'utilisation en quatre grandes directions, qu'il convient de prendre en compte lors de la conception de scénarios :

**Logiciels automatisés par l'IA** — Alterner l'IA avec des logiciels fiables pour qu'ils puissent s'exécuter des millions de fois en arrière-plan sans supervision humaine. **Le code maîtrise le flux de contrôle, TypeSafe gère les décisions sémantiques et la compréhension du langage.**

**Applications en temps réel** — L'intelligence de pointe atteint des vitesses en temps réel (150 ms), ce qui signifie que les décisions de l'IA peuvent être plus rapides que la perception humaine, suffisantes pour être programmées dans des jeux ou intégrées dans des interfaces utilisateur.

**AI Map Reduce sur les mégadonnées** — Une réduction des coûts de 100 fois permet de traiter des ensembles de données gigantesques : recherche d'informations pertinentes dans de vastes corpus, classification de trajectoires d'agents massives, extraction de caractéristiques pour la prédiction.

**Validation universelle de l'IA** — Valider les prompts d'entrée, les résultats d'extraction, les trajectoires de raisonnement et les appels d'outils de toute autre IA. Détecter les modes d'erreur tels que les contournements de sécurité (jailbreak), les erreurs de citation et les hallucinations, pour un coût qui n'est qu'une petite fraction des appels LLM réels.

## Liens connexes

- [Modèles d'architecture](/zh/patterns/) — Les modèles génériques sous-jacents à ces cas
- [Primitives de problème](/zh/primitives/) — Méthodes de sélection des primitives
- [Liste complète awesome-jev](https://github.com/yibie/awesome-jev) — Liste mise à jour en continu des projets communautaires
