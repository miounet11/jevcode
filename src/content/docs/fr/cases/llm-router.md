---
title: "Routeur LLM : choisir le gestionnaire par une décision typée"
description: "Comment envoyer chaque requête à un modèle ou à une personne. Toujours le plus grand modèle, des règles de mots-clés, un routeur par plongements, un modèle de chat qui nomme une étiquette, et un choice clavue-jev plus une question de confidence. On branche sur cette option."
section: cases
order: 235
tags: ['llm-router', 'model-routing', 'routing', 'comparison']
translatedFrom: en
---

## La décision devant le modèle

Un routeur LLM ne répond pas à l'utilisateur. Il choisit le gestionnaire qui répond. La même boîte contient une correction de typo, une question de conception, et un message qui doit aller à une personne. Envoyer les trois au plus grand modèle fonctionne. La correction de typo paie le prix du grand modèle.

On cherche ce travail sous **routeur LLM** et **routage de modèles**. Ce que l'on choisit est un ensemble fermé, déjà nommé : un petit modèle, un grand modèle, une recherche, une personne. Ce choix est une valeur sur laquelle le programme peut brancher.

## Cinq façons d'obtenir la route

| Approche | Comment la route est choisie | Ce qui peut mal tourner | Ce que vous payez |
| :--- | :--- | :--- | :--- |
| **Chaque requête vers un seul modèle** | Il n'y a pas de routeur | Les petites tâches paient le prix du grand modèle | Ce modèle, à chaque fois |
| **Mots-clés ou expression régulière** | Une liste de mots pointe vers un gestionnaire | Une reformulation rate la liste | Rien de plus au moment de la requête |
| **Routeur par plongements** | La description de route la plus proche gagne | Les descriptions s'éloignent des gestionnaires | Un appel de plongement, plus l'index |
| **Un modèle de chat nomme l'étiquette** | Vous lui demandez de répondre par un nom | Le nom peut sortir de l'ensemble, ou arriver enveloppé dans une phrase | L'entrée et la sortie de ce modèle |
| **Choix typé (clavue-jev)** | Un `choice` sur les gestionnaires listés, plus une question `confidence` | Il ne peut renvoyer qu'un gestionnaire listé | Jetons d'entrée après un appel réussi. La sortie est gratuite |

Les règles de mots-clés suffisent quand les mots ne bougent pas. Un routeur par plongements convient quand vous tenez déjà les descriptions de route. Un modèle de chat convient quand la route elle-même doit être une phrase. Un choix typé convient quand la route est l'un de quelques gestionnaires et que la ligne suivante doit la lire.

## La requête que ce site accepte

```http
POST https://api.jevcode.ai/v1/judge
Authorization: Bearer jev_...
Content-Type: application/json
```

```json
{
  "state": "Rename this function and add a test. Do not change behavior.",
  "questions": {
    "route": {
      "type": "choice",
      "instructions": "Which handler should run this request?",
      "options": ["small_model", "large_model", "human"]
    },
    "sure": {
      "type": "confidence",
      "instructions": "How sure is that routing judgment?"
    }
  }
}
```

`state` est du texte, de 8 à 4000 caractères. `questions` en contient six au plus. Les clés commencent par une lettre minuscule. Un choice peut envoyer `options` ou une table `criteria`. Ce serveur replie `options` en criteria avant que le modèle ne les voie.

La facturation porte sur les jetons d'entrée après un appel réussi. La sortie est gratuite. Les chiffres sont sur la page [tarifs](/fr/pricing/).

Une réponse nomme le modèle et renvoie chaque réponse sous la même clé :

```json
{
  "model": "clavue-jev",
  "answers": {
    "route": { "choice": "small_model" },
    "sure": { "noul": 0.78 }
  }
}
```

`route.choice` est l'une des options envoyées. `sure.noul` est un nombre de 0 à 1, issu de la question de confidence. Cette API ne cache pas de confidence dans le choice. Le `0.78` ci-dessus montre la forme du champ. Ce n'est pas une précision mesurée, et ce site ne publie pas de seuil unique.

Branchez sur les deux champs. Le seuil est le vôtre :

```python
route = body["answers"]["route"]["choice"]
sure = body["answers"]["sure"]["noul"]
cutoff = 0.8  # remplacez par un seuil mesuré sur votre propre trafic

if sure < cutoff or route == "human":
    hand_to_human(state)
elif route == "small_model":
    call_small(state)
else:
    call_large(state)
```

Une mauvaise route vers un outil qui dépense de l'argent demande un seuil plus haut qu'une mauvaise route vers une ligne de journal. Lisez un lot de votre propre trafic sur [comparer](/fr/compare/) ou [essayer](/fr/try/) avant de figer le nombre. Le raisonnement est sur la page [confidence](/fr/concepts/confidence/).

La même requête peut porter quatre questions de plus. Une route, une question de confidence et quelques oui/non tiennent sous le plafond de six. Le [fan-out](/fr/patterns/fan-out/) a cette forme.

## Ce que le routeur ne fait pas

Il n'écrit pas la réponse. Le gestionnaire choisi l'écrit.

Il n'invente pas de gestionnaire. Si le bon manque dans `options`, le choice renvoie quand même l'un des noms envoyés. Ajoutez le gestionnaire, ou ajoutez un `noul` qui demande si l'un des gestionnaires listés convient, et envoyez l'échec à une personne.

L'écriture ouverte reste sur un modèle de texte. Le routeur décide quel modèle de texte tourne, ou si une personne doit voir la requête d'abord. Quand le texte revient, un autre appel peut demander s'il est sûr d'agir dessus. Ce second appel est un [garde-fou](/fr/cases/llm-guardrails/), pas une partie de la route.

## Où cette forme apparaît déjà

La [carte des cas d'usage](/fr/cases/use-case-map/) groupe des projets publics qui choisissent un modèle avec un choice Jev : des routeurs de tâches de code, un routeur fondé sur LiteLLM, un routeur par requête pour un agent de code, et un proxy local qui choisit un modèle et un niveau d'effort. La forme commune est un choice devant l'appel coûteux. Cette page n'ajoute pas de scores pour ces projets.

Le [routage d'intention](/fr/patterns/intent-routing/) est la même décision, dirigée vers une file de support plutôt que vers un modèle.

## Pour commencer

- [API](/fr/api/) — `POST /v1/judge`, la requête et la réponse
- [Essayer](/fr/try/) — le chemin anonyme, sans clé
- [System One](/fr/concepts/system-one/) — state, questions, et le nom du modèle dans la réponse
- [Confidence](/fr/concepts/confidence/) — la seconde question, et qui fixe le seuil
- [Tarifs](/fr/pricing/) — jetons d'entrée, sortie gratuite

## Voir aussi

- [Sortie structurée](/fr/cases/structured-output/) — quand il vous faut une valeur typée, pas une route
- [Fan-out](/fr/patterns/fan-out/) — plusieurs questions sur un même state
- [Garde-fous pour LLM](/fr/cases/llm-guardrails/) — le contrôle après l'écriture d'un modèle de texte
- [Carte des cas d'usage](/fr/cases/use-case-map/) — les projets publics
