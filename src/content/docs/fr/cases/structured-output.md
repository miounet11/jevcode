---
title: "Sortie structurée LLM : appel de fonction et décisions typées"
description: "Options de sortie structurées pour les applications LLM comparées — JSON mode, schema-constrained decoding, function calling, et TypeSafe typed questions — avec les modes de défaillance, le coût, et quand un primitive de décision closed-set bat la demande d’émission de JSON par un modèle."
section: cases
order: 205
tags: ['structured-output', 'json-mode', 'function-calling', 'comparison']
translatedFrom: en
---
## Le problème que rencontre toute application LLM

Un LLM renvoie du texte. Votre application a besoin de données : une catégorie, un nombre, un booléen, une structure. Tout ce qui suit — routage, stockage, tableaux de bord, tentatives de reconnexion — dépend du fait que ce texte devienne une sortie analysable et valide **à chaque fois**, et non la plupart du temps.

Le nom de l’industrie pour cela est **structured output**, et il existe désormais quatre méthodes principales pour l’obtenir. Elles diffèrent par ce qu’elles garantissent, leur coût et ce qui peut échouer.

## Les quatre options en un coup d'œil

| Approche | Comment ça marche | Garantie | Mode d'échec | Coût relatif |
| :--- | :--- | :--- | :--- | :--- |
| **Prompting for JSON** | Demander au modèle de « répondre en JSON » | Aucune — c'est une suggestion | Virgules finales, prose autour du JSON, champs inventés | 1x génération (peut être long) |
| **JSON mode / response_format** | Indicateur API qui contraint la sortie à un JSON valide | Syntaxe JSON valide | JSON valide mais de forme ou de types incorrects ; dérive de schéma | 1x génération |
| **Schema-constrained decoding** | Contraintes de grammaire/régularité appliquées lors de l'échantillonnage des tokens | La syntaxe *et* la forme correspondent au schéma | Champs remplis de manière plausible mais sémantiquement incorrects ; nécessite un support serveur | 1x génération + complexité de service |
| **Function calling** | Le modèle choisit une fonction déclarée et ses arguments | Arguments validés par rapport à votre signature | Valeurs d'arguments hallucinées hors des énumérations ; fragilité multi-étapes | 1x génération |
| **Typed questions (TypeSafe)** | Questions à choix fermé / Score / Noul sur votre état | Réponse typée + distribution de probabilité complète + confiance, en un seul passage | Ce que vous n'avez pas demandé — les questions non posées ne peuvent pas halluciner | Entrée de tokens uniquement ; **la sortie est gratuite** |

Les quatre premiers partagent une propriété qu’il est honnête de reconnaître : **le modèle génère toujours le jeton de réponse token par token.** Chaque garantie ci-dessus est une barrière de protection autour de la génération, et non un remplacement de celle-ci. Le cinquième remplace la génération par un seul passage avant qui émet une distribution sur un ensemble fermé que vous avez défini.

## Pourquoi les ensembles fermés modifient le profil de défaillance

Avec le mode JSON, un champ comme `"priority": "high"` peut revenir sous forme de `"High"`, `"HIGH"`,
`"priority_high"`, ou `2`. Vous écrivez le validateur, la boucle de retry, et le fallback.
Avec le décodage contraint par schéma, la forme est correcte mais rien ne vérifie que le *valeur*
est le bon jugement — une structure parfaitement formatée peut toujours contenir une mauvaise réponse,
et vous n'avez aucun signal sur la certitude du modèle.

Une question typée adopte l’approche inverse : l’espace de réponse est fixé avant que la requête n’existe.

```python
from typesafe_sdk import AsyncTypeSafeClient, Choice

async def main() -> None:
    async with AsyncTypeSafeClient() as client:
        response = await client.system_one(
            state=ticket_text,
            questions={
                "priority": Choice(
                    instructions="Which priority does this ticket have?",
                    criteria={
                        "p0": "Outage or data loss, all users affected",
                        "p1": "Major feature broken, workaround exists",
                        "p2": "Minor issue, scheduled work",
                    },
                )
            },
        )

    answer = response.answers["priority"]
    print(answer.choice)                            # "p1"
    print(answer.confidence)                        # 0.93 — route on it directly
```

Ce que vous recevez n’est pas une chaîne à analyser. Il s’agit d’une **valeur typée avec une distribution de probabilité sur exactement les options que vous avez déclarées** — `p0: 0.02, p1: 0.93, p2: 0.05` —
ainsi que d’un nombre de confiance. Il n’y a pas de JSON à valider, pas d’énumération à normaliser, pas de boucle de nouvelle tentative pour une sortie malformée, car une sortie malformée ne peut pas être produite.

## Ce à quoi cela ressemble en pratique

**Appels de fonction avec des arguments énumérés.** Si les signatures de vos fonctions utilisent déjà des types `Literal`, ces ensembles fermés correspondent un-à-un aux questions de type Choice — consultez le [guide de cuisine sur les appels de fonction](/en/cases/function-calling/) pour un exemple complet d'assistant de trading où le langage naturel devient des appels typés avec une confiance par argument.

**Pipelines d’extraction.** Pour extraire des valeurs de documents, la carte de question *est*
le schéma — une entrée par champ, avec la sémantique définie exactement une fois. Le
[cascade d’extraction de données structurées](/en/cases/sde-cascade/) montre une version à deux étapes
avec une passe de vérification.

**Cadres de sécurité et classification.** Les vérifications oui/non (s’agit-il d’un jailbreak ? contient-il des données d’identification personnelle ?) sont des questions Noul — une probabilité, pas une chaîne analysée. Voir [cadres de sécurité pour les LLM](/en/cases/llm-guardrails/).

**Gestion de l'incertitude.** La distribution de probabilité est la partie que le mode JSON ne peut pas vous fournir. [Classification par confiance](/en/cases/classification-using-confidence/)
et [acheminement à seuil de confiance](/en/patterns/confidence-routing/) montrent ce qu'elle permet :
acceptation automatique au-dessus d'un seuil, revue humaine en dessous, mesuré sur vos propres données.

## Le tableau honnête des compromis

| | Mode JSON / appel de fonction | Questions typées |
| :--- | :--- | :--- |
| Génération de texte ouverte | Oui — le schéma peut contenir des chaînes libres | Non — les réponses proviennent d'ensembles fermés |
| Validité de la sortie | Validée après génération | Garantie par construction |
| Signal de confiance | Parfois (logprobs, si exposés) | Toujours — distribution complète par question |
| Facteur de coût | Tokens de sortie générés | Tokens d'entrée uniquement (sortie gratuite) |
| Modifications du schéma | Modifier le schéma JSON, relancer l'invite | Modifier la carte de questions, même forme de requête |
| Idéal pour | Brouillons, résumés, textes créatifs avec une certaine structure | Décisions : classification, routage, notation, vérification |

Les deux approches se complètent, elles ne sont pas concurrentes. Un pipeline qui nécessite un brief généré *et* une décision de routage paie la génération une seule fois, et prend la décision avec une question typée plutôt que de l’extraire du même JSON.

## Commencer

- [Vue d'ensemble des primitives](/en/primitives/) — Choice, Score, Noul et quand chacune s'applique
- [Référence de l'API HTTP](/en/sdk/http-api/) — les formes de la requête/réponse
- [Démarrage rapide](/en/quickstart/) — première question tapée en cinq minutes
- [Playground](/en/playground/) — essayez des questions sur l'état en direct, sans inscription

## Related

- [Appels de fonction](/en/cases/function-calling/) — langage naturel vers appels de fonction typés
- [Extraction en cascade de données structurées](/en/cases/sde-cascade/) — extraction en deux étapes avec vérification
- [Routage à seuil de confiance](/en/patterns/confidence-routing/) — le pattern que la distribution permet
- [Cartographie des cas d'usage](/en/cases/use-case-map/) — où chaque primitive apparaît en production