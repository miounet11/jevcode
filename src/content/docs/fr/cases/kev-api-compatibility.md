---
title: "Compatibilité de l'API Kev : un rapport de conformité tiers"
description: "Kev-0.8B (MLX, M1 Pro) passe les 32 exigences MUST d'un ensemble de conformité API tierce Jev — 255 options, 10 niveaux de score, batteries de questions mixtes, analyse du type-safe-sdk — avec les deux notes de niveau SHOULD que l'auteur a consignées."
section: cases
order: 225
tags: ['compatibility', 'conformance', 'kev', 'api']
translatedFrom: en
---
## La compatibilité que vous pouvez tester, pas celle que vous annoncez

« Compatible avec l’API Jev » est facile à dire et difficile à vérifier. Un membre de la communauté l’a donc consigné sous forme de spécification testable : [jevcompat](https://github.com/mandu5/jevcompat)
— 48 exigences pour le contrat `POST /v1/systemone`, chacune citant les docs de TypeSafe, le fichier OpenAPI ou le code source du SDK. Ensuite, la suite a été exécutée contre les huit serveurs open source les plus étoilés implémentant l’API.

**Kev-0.8B (`2874258`, MLX, M1 Pro) est l’un des deux serveurs à réussir tous les tests MUST : 32/32**, y compris :

- choix d'options acceptés jusqu'à la limite de 255 options
- niveaux de score acceptés jusqu'à la limite de 10 niveaux
- résolution d'alias `model: "jev-latest"`
- batteries mixtes — questions de type noul, choice et score dans une seule requête, réponses indexées par vos ids
- passage à travers le cycle des noms d'options pour le texte non-ASCII
- le parsing officiel `typesafe-sdk` de chaque type de réponse sans modification

Rapport complet avec chaque échange enregistré :
[results/kev/report.md](https://github.com/mandu5/jevcompat/blob/main/results/kev/report.md)
— servir les commandes et les poids dans [RUN.md](https://github.com/mandu5/jevcompat/blob/main/results/kev/RUN.md),
reproductible sur votre propre machine.

## Ce que la conformité ne couvre pas

La suite suit également les exigences de niveau SHOULD (Kev passe 12 sur 14 ; les deux
échecs concernent des réponses d'erreur d'authentification, non testées car l'exécution signalée a été lancée avec l'authentification désactivée, et un autre contrôle n'a pas été exercé car le serveur n'a jamais produit l'erreur qu'il couvre). Les deux notes de niveau SHOULD que l'auteur a rétro-ingérées sont la partie la plus intéressante, car ce sont deux endroits où une réponse identique en octets peut
tout de même être une réponse moins bonne :

**Normalisation de la confiance du score.** Kev calcule la confiance du score comme
`1 − E|level − mode| / (L − 1)` ; les exemples documentés de TypeSafe calculent
`1 − E|level − mode| / D`, où `D` est l'étalement de la distribution. Même preuve,
dénominateur différent — mesuré sur une question à 3 niveaux, Kev a renvoyé une confiance
de 0,7535 alors que la formule de référence donne 0,260. Un client comparant les scores
de confiance entre différents backends verra des distributions différentes pour une qualité
de jugement identique. Si vous effectuez un routage sur des seuils absolus (le
[confidence-routing](/en/patterns/confidence-routing/) pattern), calibrez par
backend — ou effectuez le routage sur la distribution brute, que les deux backends exposent.

**La dégradation du contexte long est une propriété du modèle, pas une violation de la spécification.** La suite passe ; la précision au-delà du contexte d'entraînement de 384 tokens de Kev ne survit pas dans la spécification. Sur les sélections TypeSafe de la suite, Kev-9B a obtenu 0,92 à l'intérieur du contexte d'entraînement mais 0,75–0,79 sur des documents plus longs (Kev-4B : 0,88 / 0,88 / 0,81) — voir la [recette de contexte long](https://github.com/jaredpalmer/kev/issues/48) pour le détail complet et les correctifs proposés par l'auteur. Les directives de [conception de l'état](/en/concepts/state/) s'appliquent à tout backend : gardez l'état de la taille de la décision, pas de la taille de la page.

## Le point de vue plus large

La spécification à 48 exigences est indépendante du backend. Si vous évaluez Kev par rapport à d'autres serveurs d'API Jev auto-hébergés, exécutez le même ensemble de tests et comparez les chiffres plutôt que les fichiers README. Les deux implémentations conformes divergent également de manière mesurable en dehors du périmètre de la spécification — forme de la distribution de confiance, rétention sur longs contextes — ce qui est exactement le genre de choses qu'un rapport de conformité rend visible et qu'une grille de fonctionnalités masque.

## Commencer

- [Kev sur GitHub](https://github.com/jaredpalmer/kev) — la famille de modèles 0.8B–9B
- [spécification jevcompat](https://github.com/mandu5/jevcompat/blob/main/SPEC.md) — les 48 exigences
- [référence de l'API HTTP](/en/sdk/http-api/) — le contrat officiel testé
- [Routage à seuil de confiance](/en/patterns/confidence-routing/) — routage sur les distributions, calibration par backend
- [Tests de cohérence interne](/en/cases/consistency-choice-cookbook/) — stresser n'importe quel backend de la même manière