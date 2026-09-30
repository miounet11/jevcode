---
title: État
description: L'état est le texte que clavue-jev juge. Dans cette API, c'est une chaîne de 8 à 4000 caractères, vue par chaque question du même appel.
section: concepts
order: 20
tags: ['state', 'clavue-jev']
---

## Ce que vous envoyez

L'**état** est le texte que clavue-jev juge. Dans `POST /v1/judge`, c'est une chaîne de 8 à 4000 caractères. Chaque question de la même requête voit cette chaîne. Les questions ne lisent pas les réponses des autres.

Mettez dans cette chaîne les faits dont le jugement a besoin : le message, la ligne de politique, les deux noms que vous voulez comparer. Un fait qui n'y figure pas n'existe pas pour le modèle.

```json
{
  "state": "Utilisateur : on m'a facturé deux fois. Politique : un doublon dans les 7 jours est remboursé. Lignes : mardi 18:02, mardi 18:04, même carte, même montant.",
  "questions": {
    "duplicate": {
      "type": "noul",
      "instructions": "Ces lignes montrent-elles un doublon ?"
    }
  }
}
```

## Un état, plusieurs questions

Les questions indépendantes voyagent dans la même requête, six au plus. « Est-ce un doublon ? » et « Quelle file ? » peuvent partir ensemble. Une question qui a besoin de la réponse précédente ne le peut pas : lancez-la en second appel, avec la première réponse écrite dans le nouvel état.

Nommez chaque partie dans le texte si vous envoyez plus d'un fait. « Politique : … Lignes : … » se juge plus facilement que trois blocs sans étiquette.

## Longueur

Moins de 8 caractères est refusé. Plus de 4000 l'est aussi. Si la matière ne tient pas, coupez-la aux lignes dont la question a vraiment besoin, ou répartissez le travail sur deux appels.

- [System One](/fr/concepts/system-one/)
- [Confiance](/fr/concepts/confidence/)
- [API](/fr/api/)
