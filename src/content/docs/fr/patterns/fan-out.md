---
title: "Fan-out parallèle"
description: "Envoyer un grand nombre de questions (y compris des questions spéculatives) dans un seul appel, puis laisser le code déterminer lesquelles sont pertinentes."
section: patterns
order: 50
tags: ['fan-out', 'latency', 'cost']
source: docs.typesafe.ai/patterns/fan-out
translatedFrom: zh
---

## Ce problème que ce模式 résout

L'approche traditionnelle consiste à « classifier, puis décider de la prochaine question en fonction du résultat de la classification ». Cela nécessite des appels en série : vous ne savez quoi demander lors du deuxième appel qu'après avoir reçu le résultat du premier, ce qui cumule les délais.

Le fan-out parallèle fait l'inverse : **envoyez toutes les questions potentielles en une seule fois**, et votre code décide lesquelles ignorer en fonction des résultats de classification. Comme le modèle ne lit l'état (state) qu'une seule fois et évalue toutes les questions en parallèle, le coût marginal de poser plusieurs questions est extrêmement faible.

## Mécanismes clés

Ces trois faits constituent le fondement du模式 fan-out :

1. Le modèle **lit l'état (state) une seule fois**, puis évalue toutes les questions en parallèle.
2. **Chaque réponse est indépendante** — la réponse à une question ne constitue pas un contexte caché pour une autre question.
3. Le budget de contexte est de 64k tokens (state + toutes les questions), ou de 32k tokens (state + la question individuelle la plus longue).

Le point 2 est particulièrement important : il garantit que le fait d'envoyer ensemble des questions non pertinentes ne pollue pas les réponses aux questions pertinentes.

## Exemple : Aiguillage des tickets

Vous devez traiter des tickets de support client, mais différents types de tickets nécessitent des jugements complètement différents. Au lieu de classifier puis de poser des questions de suivi, posez toutes les questions en une seule fois.

### Étape 1 : Posez toutes les questions d'évaluation dans une seule requête

```json
{
  "questions": {
    "category": {
      "type": "choice",
      "instructions": "What kind of request is this?",
      "criteria": {
        "bug_report": "Reporting something broken",
        "billing": "Payment, invoice, or refund matters",
        "feature_request": "Asking for new functionality"
      }
    },
    "bug_severity": {
      "type": "score",
      "instructions": "How severe is the reported issue",
      "criteria": [
        "Cosmetic; no impact to functionality",
        "Broken or degraded feature; workaround exists",
        "Blocking issue; no workaround exists"
      ]
    },
    "has_reproducible_steps": {
      "type": "noul",
      "instructions": "The user describes specific steps to reproduce the issue"
    },
    "refund_requested": {
      "type": "noul",
      "instructions": "The user is explicitly asking for a refund or credit"
    },
    "frustration": {
      "type": "score",
      "instructions": "How frustrated the user appears",
      "criteria": ["Calm, matter-of-fact", "Frustrated but civil", "Very angry"]
    }
  }
}
```

Ici, `bug_severity` et `has_reproducible_steps` ne sont pertinents que si le ticket est un rapport de bug ; `refund_requested` n'est pertinent que pour les problèmes de facturation. **Ce sont des questions spéculatives** — mais comme poser plusieurs questions n'entraîne aucun coût en termes de vitesse, il suffit de les anticiper toutes.

### Étape 2 : Routage par le code

```python
category = response.answers["category"]
bug_severity = response.answers["bug_severity"]
bug_repro = response.answers["has_reproducible_steps"]
refund = response.answers["refund_requested"]
frustration = response.answers["frustration"]

if category.choice == "bug_report":
    if bug_severity.score > 1.5 and bug_repro.noul > 0.6:
        escalate_to_engineering(ticket_id, severity="high")
    else:
        add_to_bug_backlog(ticket_id)

elif category.choice == "billing":
    if refund.noul > 0.7:
        route_to_billing_with_flag(ticket_id, refund_likely=True)
    else:
        route_to_billing(ticket_id)

elif category.choice == "feature_request":
    log_feature_request(ticket_id)

# La frustration est utile quelle que soit la catégorie
if frustration.score > 1.5:
    flag_for_priority_response(ticket_id)
```

**Toutes les informations nécessaires à l'arbre décisionnel complet proviennent d'un seul appel.** Les questions spéculatives sont ignorées lorsqu'elles ne sont pas pertinentes, et économisent un aller-retour lorsqu'elles le sont.

## Points de conception

**Posez toutes les questions, puis filtrez.** Retardez la décision de « quelles questions méritent d'être posées » d'avant l'appel à après l'appel. Avant l'appel, vous ne connaissez pas le résultat de la classification, vous ne pouvez donc pas juger ; après l'appel, vous avez les réponses, et le filtrage devient une simple branche conditionnelle.

**Faites attention au budget de contexte.** 64k correspond à l'état (state) plus **toutes** les questions. Si vous devez effectuer un fan-out de centaines de questions (par exemple, évaluer un par un un ensemble de documents), l'état (state) grossira rapidement. Dans ce cas, il convient de diviser en plusieurs requêtes ou d'envisager [l'utilisation par lot de Score](https://docs.typesafe.ai/patterns).

**Distinguez « spéculatif » de « redondant ».** Une question spéculative est une question qui a **un sens clair** même dans d'autres branches. Si vous ne lisez jamais la réponse à une question, quelle que soit la branche, ce n'est pas spéculatif, c'est un gaspillage — bien que le coût soit faible, cela alourdit le code.

**Associez-le au routage par confiance (confidence).** Le fan-out résout le « quoi demander », le routage par confiance résout le « à quel point croire ». Leur combinaison est une forme courante dans les systèmes de production : voir l'exemple de la banque vocale dans [le routage par confiance](/zh/patterns/confidence-routing/).

## Liens connexes

- [Primitives de question](/zh/primitives/) — Indépendance et questions spéculatives
- [State](/zh/concepts/state/) — Budget de contexte et organisation de l'état (state)
- [Routage par confiance](/zh/patterns/confidence-routing/) — Deuxième axe de décision
