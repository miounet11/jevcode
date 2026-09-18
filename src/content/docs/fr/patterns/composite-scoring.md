---
title: "Score combiné"
description: "Décomposez les décisions complexes en scores atomiques, puis combinez-les dans le code à l’aide de pondérations que vous maîtrisez entièrement."
section: patterns
order: 40
tags: ['score', 'ranking', 'weights']
source: docs.typesafe.ai/patterns/composite-scoring
translatedFrom: zh
---

## Ce problème que ce模式 résout

Nous avons souvent besoin de **trier un ensemble d'éléments selon plusieurs dimensions simultanément**. Tenter de formuler cela comme une seule question de « score global » est une mauvaise pratique : le score fourni par le modèle est inexplicable, et vous ne savez pas pourquoi il a établi cet ordre.

L'approche du score composé consiste à décomposer le jugement en dimensions indépendantes, à attribuer un score à chacune séparément, puis à les combiner dans le code en utilisant **des poids que vous contrôlez vous-même**.

## Exemple : Filtrage des CV

Supposons que vous traitiez des CV pour des postes d'ingénierie et que vous souhaitiez classer les candidats selon plusieurs critères pour sélectionner les X premiers pour le tour suivant.

### Étape 1 : Attribuer un score indépendant à chaque dimension

Dans un seul appel, demandez quatre Scores : `python_depth`, `team_leadership`, `system_design`, `generalist`. Chaque dimension utilise sa propre définition de niveaux (tiers).

### Étape 2 : Combiner à l'aide de poids

```python
py      = response.answers["python_depth"].score / 4
lead    = response.answers["team_leadership"].score / 4
arch    = response.answers["system_design"].score / 4
general = response.answers["generalist"].score / 4

# Senior IC (Contributeur Individuel Senior)
ic_score = (0.40 * py) + (0.10 * lead) + (0.40 * arch) + (0.10 * general)

# Engineering Manager (Manager d'Ingénierie)
em_score = (0.15 * py) + (0.40 * lead) + (0.20 * arch) + (0.25 * general)
```

Chaque dimension est d'abord normalisée entre 0 et 1, puis pondérée.

## La véritable valeur de ce模式

Le fait d'obtenir un classement à partir de scores pondérés n'est que le bénéfice superficiel. **La véritable valeur réside dans l'explicabilité.**

Notez que les deux postes différents ci-dessus utilisent **le même ensemble de scores, mais avec des poids différents**. Cela signifie que :

- Un seul appel sert simultanément deux directions de recrutement, sans doubler les coûts ;
- Si le classement ne correspond pas à vos attentes, vous pouvez ajuster les poids directement, sans avoir à retoucher le prompt ;
- Lorsque quelqu'un remet en question « pourquoi ce candidat est-il premier », vous pouvez montrer la distribution des scores par dimension et les poids appliqués.

**Aucun détail sur chaque dimension n'est perdu.** Un candidat très fort en Python mais faible en leadership d'équipe sera classé plus haut pour un poste IC et plus bas pour un poste EM. Cette différence est encodée par les poids, et non par une nouvelle évaluation du modèle.

## Débogage par points d'arrêt

Les poids offrent un autre avantage pratique : **vous pouvez trier par dimension individuelle pour diagnostiquer les anomalies.** Si le classement global semble incorrect, commencez par trier uniquement `python_depth` pour voir si cela correspond à votre intuition. Si ce n'est pas le cas, le problème réside dans la définition des niveaux de cette dimension, et non dans les poids. Cette décomposabilité est impossible à obtenir avec « une grande question posée directement au modèle ».

Si vous constatez qu'une dimension manque de pouvoir discriminant (tous les candidats se situant dans le même niveau), cela indique que la définition des niveaux doit être réécrite, et non les poids.

## Interaction avec la confiance

Chaque Score de dimension est accompagné d'un `confidence`. Une dimension à faible confiance est un signal : soit la définition des niveaux est ambiguë, soit l'état (state) manque de critères pour juger.

Une pratique utile consiste à marquer un candidat comme « nécessitant une vérification humaine » si la confiance d'une dimension à fort poids est inférieure à un seuil, plutôt que de laisser un score peu fiable dominer le classement.

## Points de conception

**Les dimensions doivent être orthogonales.** Si deux dimensions sont fortement corrélées (par exemple, « Profondeur Python » et « Compétences en programmation »), la pondération entraînera un double comptage de la même chose. Lors de la conception des dimensions, posez-vous la question : cette dimension peut-elle varier indépendamment ?

**Normalisez les poids pour qu'ils somment à 1.** Cela facilite la compréhension et l'ajustement.

**Normalisez avant de pondérer.** Le nombre de niveaux varie généralement d'une dimension à l'autre. Sans normalisation, les dimensions ayant plus de niveaux auraient un impact disproportionné.

**Les poids sont une décision métier, pas une décision technique.** Qui décide des différences de poids entre les postes IC et EM ? Ce devrait être le service recruteur, pas l'ingénieur. Rendez les poids configurables.

## Liens connexes

- [Score](/zh/primitives/score/) — La primitive de base de ce模式
- [Fan-out parallèle](/zh/patterns/fan-out/) — Demander toutes les dimensions en une seule fois
- [Confiance](/zh/concepts/confidence/) — Gérer les scores de dimensions peu fiables
