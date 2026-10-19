---
title: "API de modération des contenus : en construire un à partir de questions typées"
description: "Comment construire une API de modération de contenu sur des questions typées TypeSafe — vérifications Noul par politique, notation de la gravité, routage par catégorie, gouvernance des seuils sous votre contrôle — comparé aux endpoints de modération uniques."
section: cases
order: 215
tags: ['moderation', 'content-moderation', 'guardrails', 'cookbook']
translatedFrom: en
---
## Pourquoi « un point de terminaison de modération » est la mauvaise unité d’achat

La plupart des plateformes vendent la modération comme un seul point de terminaison avec des étiquettes fixes : toxicité, haine, violence, sexualité, auto-mutilation. C’est pratique jusqu’à la première fois que la définition d’une violation de votre produit diffère de celle du fournisseur — un marché qui doit signaler les tentatives de paiement hors plateforme, un chat de jeu où les « provocations » sont autorisées mais pas le doxxing, un forum de santé où les questions sur les posologies sont l’essentiel.

Votre politique de modération est une **décision produit**. L’API que vous achetez ne doit pas la coder en dur. Ce dont vous avez réellement besoin, c’est d’un moyen de *exprimer* la politique — et de la modifier lorsque la politique change, sans réentraîner quoi que ce soit et sans attendre un fournisseur.

Cette page explique comment construire la modération à partir de questions typées : chaque règle de politique est une
question, chaque réponse porte une probabilité, et les seuils — la politique réelle —
vivent dans votre code, versionnés comme du code.

## La forme : une requête par message, des questions par règle

Un message entre ; une requête porte une question Noul par règle de politique ainsi qu’un Score
de sévérité ; des décisions sortent. Il n’y a pas d’appel secondaire ni de point de terminaison par règle pour
déclencher des appels en parallèle.

```python
from typesafe_sdk import AsyncTypeSafeClient, Noul, Score

MODERATION_RULES = {
    "spam": Noul(instructions="Is this message spam or bulk advertising?"),
    "scam": Noul(instructions="Does this message try to defraud or phish the reader?"),
    "pii": Noul(instructions="Does this message contain personal data such as addresses, phone numbers, or IDs?"),
    "offsite_payment": Noul(instructions="Does this message try to move the transaction off the platform (external payment, direct email)?"),
    "severity": Score(
        instructions="If a policy is violated, how much harm would acting on it do?",
        criteria=["none", "minor", "moderate", "severe"],
    ),
}

async def moderate(client: AsyncTypeSafeClient, message: str) -> dict:
    async with client:
        response = await client.system_one(state=message, questions=MODERATION_RULES)
    return {rule: response.answers[rule] for rule in MODERATION_RULES}
```

La politique est la dict. Ajouter « pas de conseils médicaux » à un forum de santé tient en une ligne ; cela est livré avec votre prochain déploiement, et non avec la prochaine fiche de modèle de votre fournisseur.

## Les seuils sont la politique — gardez-les dans votre code

Chaque réponse de Noul est une probabilité. Ce qui compte comme une violation, c’est le seuil que vous lui appliquez, et différentes règles peuvent porter des seuils différents :

```python
THRESHOLDS = {"spam": 0.90, "scam": 0.85, "pii": 0.70, "offsite_payment": 0.95}
SEVERITY_ESCALATE = 2.5  # between "moderate" and "severe" on the 4-point scale

def decide(answers: dict) -> str:
    if answers["severity"].score >= SEVERITY_ESCALATE:
        return "escalate"    # legal / trust-and-safety queue
    for rule, threshold in THRESHOLDS.items():
        if answers[rule].noul >= threshold:
            return "block"
    if any(answers[rule].noul >= 0.60 for rule in THRESHOLDS):
        return "review"      # send to the human queue
    return "pass"
```

Quatre issues, chacune vous appartenant :

- **pass** — transmettre le message
- **review** — file d’attente humaine, moyen le moins coûteux de réduire les faux positifs
- **block** — faire respecter
- **escalate** — le Score de gravité repoussé au-delà de sa limite, par exemple juridique ou sécurité et confiance

Comparez cela avec un point de terminaison de modération qui renvoie ses propres étiquettes de catégorie et un
indicateur. Vous pouvez régler exactement une chose : le seuil de l'indicateur. Les étiquettes, leurs définitions,
et leur calibration relèvent du déploiement de quelqu'un d'autre.

## Pourquoi les probabilités comptent plus que les étiquettes

Un booléen jette à la poubelle l’information dont vous avez besoin pour faire fonctionner un système de modération :

**Vous pouvez mesurer la zone limite.** La part des décisions situées entre 0,6 et 0,9
*est* votre charge de travail de révision humaine. Ce chiffre est lisible avant le lancement, et non après un
tas d’escalades. [Test de cohérence interne](/en/cases/consistency-choice-cookbook/)
étend cette approche : passez les publications borderline par la grille d’évaluation à plusieurs reprises et vérifiez si
les étiquettes restent stables — l’instabilité des étiquettes est le tueur silencieux de la modération automatisée.

**Vous pouvez verrouiller en fonction de la confiance comme toute autre décision dans la chaîne de traitement.** Le même
[circuit de routage de la confiance](/en/patterns/confidence-routing/) utilisé pour la classification
s'applique sans changement : les actions à forte probabilité, les revues à faible probabilité, et la séparation est un
nombre que vous avez choisi.

**Vous pouvez vérifier le vérificateur.** Étant donné que chaque règle est une question distincte avec une distribution, vous pouvez conserver des exemples étiquetés par règle et mesurer la précision par règle — au lieu de découvrir par cycle d’actualités qu’une catégorie cachée était en erreur.

## Où cela se situe par rapport aux garde-fous d'entrée

[Guardrails for LLMs](/en/cases/llm-guardrails/) couvre le cas spécifique des LLM :
le filtrage des invites et des réponses pour détecter les contournements et les sorties nuisibles autour d’un appel de modèle. Le système de modération décrit ici est la surface produit plus large — messages des utilisateurs, profils, annonces, avis — où les règles proviennent de vos conditions d’utilisation plutôt que de la sécurité du modèle. Même primitive, mais auteurs de règles différents. De nombreux produits finissent par utiliser les deux : modération des produits sur le contenu des utilisateurs, et guardrails autour du modèle.

## Les systèmes de modération réels conçus de cette manière

- [Jev-Moderation-Bot](https://github.com/brainstormity/Jev-Moderation-Bot) — un bot Discord où Jev vérifie les liens de spam et d'escroquerie, avec des règles d'escalade d'avertissement et de timeout conservées localement
- [mastra-jev-moderation](https://github.com/CodeAlive-AI/mastra-jev-moderation) — modération des entrées pour les agents Mastra sur TypeSafe Jev, dans un seul fichier

## Construisons-le

- [Vue d'ensemble des primitives](/en/primitives/) — Noul et Score en détail
- [Référence de l'API HTTP](/en/sdk/http-api/) — formes de requête/réponse
- [Garde-fou pour les LLM](/en/cases/llm-guardrails/) — la variante orientée modèle
- [Auto-consistance : choix](/en/cases/consistency-choice-cookbook/) — test de stress de la stabilité des étiquettes
- [Carte des cas d'usage](/en/cases/use-case-map/) — modération et conformité parmi les autres scénarios