---
title: Découvrir JevCode
description: JevCode est le foyer de Jev. Le modèle est clavue-jev, le meilleur Jev au monde aujourd'hui. Un appel envoie un état et des questions typées, et renvoie un jugement sur lequel le logiciel peut brancher.
section: start
order: 10
tags: ['overview', 'clavue-jev']
---

## Le foyer de Jev

JevCode est l'endroit où Jev vit. Le modèle que ce site sert est **clavue-jev**. Nous l'avons construit, nous le servons, et nous le tenons pour le meilleur Jev au monde aujourd'hui.

jev-1.13.0 apparaît sur la page de comparaison. C'est l'autre côté de la même question, pour un face-à-face. Ce n'est pas le modèle que ce site propose.

## Ce qu'est un appel

clavue-jev n'est pas un modèle de chat. Vous envoyez **un état** et jusqu'à **six questions typées**. Il revient des champs qu'un programme lit directement :

| Question | Retour |
| :--- | :--- |
| `noul` | Un nombre de 0 à 1. À lire comme la force du « oui ». |
| `confidence` | Un nombre de 0 à 1. À lire comme : à quel point ce jugement est solide. |
| `choice` | L'une des options que vous avez fournies. |

Un modèle de chat écrit de la prose. clavue-jev renvoie une valeur. C'est le travail de System One, le travail de cet appel.

## Pour continuer

- [System One](/fr/concepts/system-one/) — la forme d'un appel
- [État](/fr/concepts/state/) — le texte que vous envoyez
- [Confiance](/fr/concepts/confidence/) — quand agir seul, quand s'arrêter
- [Un essai](/fr/try/) — anonyme, sans clé
- [API](/fr/api/) — `POST /v1/judge` avec une clé
