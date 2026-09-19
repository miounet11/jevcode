---
title: "Modèle System One"
description: "System One est une catégorie de modèles conçus pour des « décisions rapides et structurées ». Jev est le premier, et ses sorties peuvent être directement consommées par des logiciels."
section: concepts
order: 10
tags: ['system-one', 'architecture']
source: docs.typesafe.ai/concepts/system-one
translatedFrom: zh
---

## Définition

Le modèle System One est une catégorie de modèles d'IA spécialement conçus pour **prendre des décisions rapides et structurées que le logiciel peut utiliser directement**. Jev est le modèle phare de TypeSafe et le premier modèle System One.

Le problème central qu'ils résolvent est le suivant : les modèles de langage traditionnels produisent du texte libre, alors que les logiciels ont besoin de valeurs de types déterminés. System One intègre ce processus de conversion au sein du modèle : la déclaration du problème spécifie le type de sortie, et le modèle répond en respectant les contraintes.

## Répartition des tâches avec System Two

Cette appellation s'inspire de la théorie des deux systèmes en sciences cognitives, et sa signification est directe :

| | System One | System Two |
| :--- | :--- | :--- |
| Caractéristiques | Rapide, intuitif, focalisé | Lent, prudent, multi-étapes |
| Tâches typiques | Jugement, classification, notation, validation | Raisonnement complexe, planification en chaîne longue |
| Latence | Faible et prévisible | Plus élevée, augmente avec la longueur de la réflexion |
| Sortie | Typée et contrainte | Texte libre |
| Coût | Faible | Élevé |

Ils ne se remplacent pas. La pratique typique dans les systèmes de production consiste à confier à System One la majorité des jugements fréquents, et à n'escalader vers System Two ou vers un opérateur humain que lorsque un raisonnement approfondi est réellement nécessaire.

## Exemple complet : demande de remboursement

Le flux de travail fourni par la documentation officielle illustre bien la collaboration entre ces deux couches :

1. **Construction de l'état (state)** — Regrouper les messages du service client, les historiques de transactions pertinents et la politique de remboursement dans un seul état.
2. **Questions parallèles** — Poser simultanément trois questions indépendantes : l'utilisateur demande-t-il un remboursement ? Les preuves indiquent-elles un double débit ? La politique permet-elle le remboursement ?
3. **Combinaison dans le code** — Combiner les trois réponses avec des vérifications métier déterministes, puis router vers l'exécution automatique ou une vérification humaine.

Notez l'**indépendance** des questions à l'étape 2 : les trois questions sont mutuellement indépendantes et peuvent être envoyées en une seule fois. C'est ce qui permet de les regrouper dans une seule requête.

## Pourquoi les sorties typées sont si cruciales

Puisque les modèles System One renvoient des **sorties typées et contraintes plutôt que du texte libre**, votre code peut directement vérifier et combiner ces réponses pour constituer des flux de travail prévisibles.

Comparez la complexité du code pour les deux modes d'intégration :

```python
# Méthode traditionnelle : nécessite du parsing, de la validation et la gestion des anomalies de format
raw = llm.complete("Is this ticket about billing? Answer yes or no.")
is_billing = raw.strip().lower().startswith("y")  # Fragile, nombreux cas limites

# System One : la valeur est elle-même typée
response = client.system_one(
    state=ticket,
    questions={"billing": Noul(instructions="Is this ticket about billing?")},
)
is_billing = response.nouls["billing"].noul  # float, 0..1
```

La valeur de retour de la seconde approche est un type déterminé dans son domaine de définition : `Choice` sera toujours l'une des options que vous avez fournies, `Score` se situera toujours dans la plage de valeurs que vous avez définie, et `Noul` sera toujours un nombre flottant compris entre 0 et 1.

## Confiance : permettre au modèle de dire « Je ne suis pas sûr »

Les réponses des modèles System One incluent également une [confiance](/fr/concepts/confidence/), ce qui vous permet de décider quand exécuter directement, quand escalader vers un opérateur humain ou vers un modèle de raisonnement. C'est la base de la construction de systèmes fiables — **si un système ne peut pas exprimer honnêtement son incertitude, il ne peut pas être fiable**.

## Comment appeler l'API

Via le [SDK](/fr/sdk/) client ou l'API HTTP :

```http
POST https://api.typesafe.ai/v1/systemone
```

Le champ `model` dans la requête permet de sélectionner le modèle spécifique. L'alias par défaut est `jev-latest`.

## Pour aller plus loin

- [State](/fr/concepts/state/) — Comment organiser le contexte transmis au modèle
- [Primitives de question](/fr/primitives/) — Les trois types de questions typées
- [Modèles d'architecture](/fr/patterns/) — Comment organiser ces appels en environnement de production
- [Comment construire des systèmes System One](https://docs.typesafe.ai/concepts/how-to-build-with-system-one) — Guide complet des flux de travail officiels
