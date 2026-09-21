---
title: "Extraction de valeurs pré-analysées"
description: "Utilise des expressions régulières pour identifier les adresses e-mail, numéros de téléphone et montants candidats, puis fait sélectionner l'étendue demandée par TypeSafe afin que le code puisse normaliser une valeur littérale."
section: cases
order: 230
tags: ['cookbook', 'recipe']
source: "docs.typesafe.ai/cookbooks/pre_parsed_value_extraction_cookbook"
translatedFrom: en
---
*Une regex trouve les valeurs candidates, TypeSafe choisit celle que la question demande,
et le code le copie textuellement.*

La paire `find` et `pick` ici est celle que vous pouvez pointer dans vos propres documents, et trois
cas traités montrent son utilisation : l'adresse qu'un expéditeur souhaite pour recevoir son reçu, un numéro
de téléphone en tant que `+14155550177`, et un total de facture en tant que `1315.50 USD` signalé comme un frais.

TypeSafe choisit l’une des options que vous lui fournissez, les candidats doivent donc être trouvés
en premier. Une expression régulière les repère, TypeSafe en sélectionne une, et le code copie le choix, en trois étapes :

1. Une expression régulière identifie les valeurs candidates dans le texte. Réglez-la pour qu’elle sur-identifie.
2. TypeSafe détermine quelle valeur candidate correspond à la question, et extrait tout
 attribut dont le code a besoin en aval (devise, pays, si un montant est un
 crédit ou un débit).
3. Le code copie la valeur sélectionnée et la normalise.

Parce que TypeSafe ne choisit jamais qu’au sein des segments trouvés par l’expression régulière, la valeur que vous obtenez
est l’un de ces segments, copié sans modification. Il ne peut pas inventer une valeur ni transposer un
chiffre.

<img src="/img/cases/pre-parsed-value-extraction-cookbook-overview.png" alt="Overview diagram" width="1351" height="348" data-path="cookbooks/pre_parsed_value_extraction_cookbook/overview.png" />

*La regex trouve les valeurs candidates dans le document, TypeSafe en sélectionne une, et le code en aval la normalise et agit en conséquence.*

## Installation

```bash
pip install ipython phonenumbers "typesafe-sdk>=0.5.7" cooksafe --extra-index-url https://pypi.typesafe.ai/
```

alors définis `TYPESAFE_API_KEY`.

```python
import os
import re
from decimal import Decimal
from pathlib import Path

import phonenumbers
from cooksafe import JsonCache, make_playground_link
from IPython.display import Markdown, display
from typesafe_sdk import Choice, Noul, TypeSafeClient

TYPESAFE_MODEL = "jev-1.12"
NONE = "none"  # the escape hatch on every selection: "none of the candidates fits"

# base_url defaults to https://api.typesafe.ai/ ; the env override points at another deployment.
ts = TypeSafeClient(
    api_key=os.environ.get(
        "TYPESAFE_API_KEY", "cache-only"
    ),  # cached re-renders need no key
    base_url=os.environ.get("TYPESAFE_BASE_URL"),
    timeout=30.0,
)
json_cache = JsonCache(Path("json_cache.json"))
```

## Helpers

`find` exécute une expression régulière calibrée pour sur-détecter et déduplique les résultats. `pick` est une
`Choice` question dont les options sont les extraits que `find` renvoie, de sorte que sa réponse est l’un de
ces extraits copié à l’identique, ou `none` lorsqu’aucun candidat ne convient. `classify` est une
`Choice` question portant sur un ensemble fixe d’étiquettes, utilisée ici pour la devise et le
pays.
`is_true` est un `Noul`, utilisé ici pour demander si un montant est un crédit.

Chaque appel est mis en cache dans `json_cache.json`, donc le nouveau rendu n'effectue aucun appel API.

```python
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"\(?\+?\d[\d\s()\-.]{6,}\d")
MONEY_RE = re.compile(r"[$€£¥]\s?\d[\d,]*(?:\.\d{2})?")


def find(pattern: re.Pattern, text: str) -> list[str]:
    """Code-side candidate finder: recall-tuned regex, deduped, in document order."""
    seen: set[str] = set()
    out: list[str] = []
    for match in pattern.findall(text):
        span = match.strip()
        if span and span not in seen:
            seen.add(span)
            out.append(span)
    return out


@json_cache
def pick(document: str, candidates: list[str], question: str) -> dict:
    """TypeSafe selects which found span plays the role. Returns {choice, confidence}.

    The options ARE the candidate spans, so ``choice`` is a verbatim copy of one of them (or the
    ``none`` hatch) - the model chooses, code owns the string."""
    criteria = {c: None for c in candidates} | {
        NONE: "None of these is the requested value."
    }
    answer = ts.system_one(
        state=document,
        questions={"pick": Choice(instructions=question, criteria=criteria)},
        model=TYPESAFE_MODEL,
    ).answers["pick"]
    return {"choice": answer.choice, "confidence": answer.confidence}


@json_cache
def classify(document: str, question: str, options: list[str]) -> dict:
    """A small Choice over a fixed label set (currency, country, ...). Returns {choice, confidence}."""
    answer = ts.system_one(
        state=document,
        questions={
            "q": Choice(instructions=question, criteria={o: None for o in options})
        },
        model=TYPESAFE_MODEL,
    ).answers["q"]
    return {"choice": answer.choice, "confidence": answer.confidence}


@json_cache
def is_true(document: str, question: str) -> float:
    """A yes/no Noul. Returns P(yes)."""
    return (
        ts.system_one(
            state=document,
            questions={"q": Noul(instructions=question)},
            model=TYPESAFE_MODEL,
        )
        .answers["q"]
        .noul
    )
```

## Email : choisir la bonne adresse selon le rôle

Quatre adresses dans les en-têtes. Le corps demande que le reçu soit envoyé à une adresse personnelle au lieu de l'alias de facturation `To:`, donc la réponse dépend de la lecture du corps. Deux questions ici : quelle adresse reçoit le reçu, et quelle adresse a envoyé le message.

```python
EMAIL_DOC = """From: Dana Whit <dana.whit@acme-corp.com>
To: billing@acme-corp.com
Cc: orders@acme-corp.com
Reply-To: dana.personal@gmail.com

Hi team - please don't use the billing alias for this one. Send my receipt to my
personal address instead. Thanks, Dana."""

emails = find(EMAIL_RE, EMAIL_DOC)
receipt = pick(
    EMAIL_DOC, emails, "Which email address does the sender want their receipt sent to?"
)
sender = pick(
    EMAIL_DOC, emails, "Which email address did this message come from (the From line)?"
)

print("candidates :", emails)
# code copies the picked value verbatim and normalizes (lowercase); it never re-types it
print(
    f"receipt -> : {receipt['choice'].lower():<28} (conf {receipt['confidence']:.2f})"
)
print(f"sender  -> : {sender['choice'].lower():<28} (conf {sender['confidence']:.2f})")
```

```
candidates : ['dana.whit@acme-corp.com', 'billing@acme-corp.com', 'orders@acme-corp.com', 'dana.personal@gmail.com']
receipt -> : dana.personal@gmail.com      (conf 0.98)
sender  -> : dana.whit@acme-corp.com      (conf 1.00)
```

`receipt` est l’adresse Gmail personnelle figurant sur la ligne `Reply-To:`, ce que demande le corps ; `sender` est celle sur la ligne `From`. Il s’agit de copies de correspondances issues d’une expression régulière, converties en minuscules dans le code.

## Téléphone : sélectionnez le mobile, normaliser en E.164

Trois numéros, aucun ne comportant un indicatif pays. TypeSafe sélectionne le mobile et lit le pays dans le texte ; `phonenumbers` combine ces deux réponses en E.164, le format international qui commence par un `+` et l'indicatif pays.

```python
PHONE_DOC = """Reach our San Francisco office at these numbers: main desk (415) 555-0199,
billing fax (415) 555-0142, and my direct cell (415) 555-0177. Call the cell if it's urgent."""

phones = find(PHONE_RE, PHONE_DOC)
mobile = pick(PHONE_DOC, phones, "Which of these is the direct mobile / cell number?")
region = classify(
    PHONE_DOC,
    "In what country is this office located?",
    ["US", "GB", "DE", "FR", "CA", "AU"],
)

# code copies the picked value and normalizes it with the model-supplied country
parsed = phonenumbers.parse(mobile["choice"], region["choice"])
e164 = phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)

print("candidates :", phones)
print(f"mobile  -> : {mobile['choice']}  (conf {mobile['confidence']:.2f})")
print(f"country -> : {region['choice']}  (conf {region['confidence']:.2f})")
print(f"E.164   -> : {e164}")
```

```
candidates : ['(415) 555-0199', '(415) 555-0142', '(415) 555-0177']
mobile  -> : (415) 555-0177  (conf 1.00)
country -> : US  (conf 0.90)
E.164   -> : +14155550177
```

Rien dans les chiffres n’indique quel numéro est le mobile ou dans quel pays il se trouve ; ce sont les mots qui l’entourent qui le font. TypeSafe lit ces mots, et `phonenumbers` formate le numéro sélectionné comme `+14155550177`.

## Argent : choisissez le montant, classez la devise, indiquez crédit vs charge

Une facture avec quatre montants. TypeSafe sélectionne le total dû et le crédit, lit la devise, et indique chaque montant sélectionné comme une charge ou un crédit. Le code copie chaque chaîne sélectionnée et l'analyse dans un `Decimal`.

```python
MONEY_DOC = """Invoice INV-2087.
Subtotal: $1,200.00
Sales tax: $115.50
Total due: $1,315.50
A $50.00 courtesy credit from last month has already been applied."""

amounts = find(MONEY_RE, MONEY_DOC)
currency = classify(
    MONEY_DOC,
    "What currency are these amounts in?",
    ["USD", "EUR", "GBP", "JPY", "CAD"],
)
total = pick(MONEY_DOC, amounts, "Which amount is the total the customer must pay?")
credit = pick(
    MONEY_DOC, amounts, "Which amount is the courtesy credit that was applied?"
)


def to_decimal(value: str) -> Decimal:
    """Copy the picked value and parse the number in code (US grouping/decimal here)."""
    return Decimal(re.sub(r"[^\d.]", "", value))


for label, chosen in [("total due", total), ("credit", credit)]:
    is_credit = is_true(
        MONEY_DOC,
        f"Is the amount {chosen['choice']} a credit or refund to the customer, not a charge?",
    )
    kind = "credit" if is_credit > 0.5 else "charge"
    print(
        f"{label:<10}: {chosen['choice']:<10} -> {to_decimal(chosen['choice'])} {currency['choice']} "
        f"({kind}, P(credit)={is_credit:.2f})"
    )
print("\ncandidates :", amounts)
```

```
total due : $1,315.50  -> 1315.50 USD (charge, P(credit)=0.01)
credit    : $50.00     -> 50.00 USD (credit, P(credit)=0.99)

candidates : ['$1,200.00', '$115.50', '$1,315.50', '$50.00']
```

Le montant total dû est de 1 315,50 $ et le crédit est de 50,00 $, tous deux en USD. Le crédit ou le débit
`Noul` répond 0,01 sur le total et 0,99 sur le crédit, de sorte que le code connaît le
signe de chaque `Decimal` qu'il analyse.

> `to_decimal` suppose que la virgule sert de séparateur de milliers et que le point est le séparateur décimal. Cela `$1,315.50` ; dans `€1.315,50`, c'est l'inverse. Posez une question à `Noul` concernant la convention utilisée par le document, puis effectuez une bifurcation en conséquence dans le code.

## Ouvrez-le dans le playground TypeSafe

Un lien de partage qui ouvre la filière de courriels dans le navigateur, avec la question de réception sur elle
et les quatre adresses que l'expression régulière a trouvées parmi ses options.

```python
receipt_criteria = {e: None for e in emails} | {
    NONE: "None of these is the requested value."
}
playground_link = make_playground_link(
    EMAIL_DOC,
    {
        "receipt": Choice(
            instructions="Which email address does the sender want their receipt sent to?",
            criteria=receipt_criteria,
        )
    },
    models=[TYPESAFE_MODEL],
)
display(
    Markdown(
        f"🔗 [Open this thread + selection in the TypeSafe playground]({playground_link})"
    )
)
```

[Ouvrir ce fil + la sélection dans le playground TypeSafe →](https://console.typesafe.ai/playground#share/N4IgJg9gxgrgtgUwHYBcAqCAeKQC4AEIAYgE4RwEAiAhktfgOoAWAlivgDxi3UB0A7qxQABalEQBaKBBIAHXtLgA+ADpI0EAgCMWAG10skAc1HiEUmfMVqAwlAIywCEgGdTk6XIXk1AJQSyugCeEhoE3HS8ss4uEHS6wkZw1HrecGpqABIs+CgI1HD4EviB+S4I+JBIAOTsMOW5TBU6+oZG+NQG1C74AGYyjSw9cQi8+ADKyGD4cEH4JAhQCCyy7CgQM0Fq0a5xnR1gYAsuPYYuedRgY2hMtADWLgA0+DSRIM8gsmRwqy4Y2HhCMAVCAFksVigQQRgSAUEFolD8CCoEwICwliDnsiSGxnCxqIiYRE+II2O5zJ4rD5AUgYPosSAWgZjOSLF5rDS6boGY4YqzKWlEbT6UjwDwojE9gkkildILOSKQUgRoiQQA5Eb4CC9RoIBpDXXzBAARxgery0wAbp0zbwQQBfBlnFAkGBQFAsOIuVUgZjopj4BDJPQHI56nqQPWG8pIJwkfD8WhrJoseNg5arfAxtYQAD8Dvt70I1FkLAAajFPUhASBLQBGIsgcq6RYWgCyECcuhcgIA2iAAFYIS0SOu8OsAJhAAF17UA)

## Deux limites

* Une question `Choice` autorise au maximum 255 options. Avec plus de candidats que cela, affinez
 en deux
 étapes : sélectionnez d'abord la section, puis l'élément à l'intérieur.
* La recherche des candidats est la partie qui demande du travail. Les adresses e-mail, les numéros de téléphone et les montants
 ont des expressions régulières qui les couvrent ; un nom n'en a pas, donc ses candidats doivent provenir d'une
 liste que vous avez déjà, ou d'un recognisseur d'entités nommées ou d'un LLM qui les propose. TypeSafe choisit ensuite celui que la question demande.