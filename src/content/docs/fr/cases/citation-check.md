---
title: "Vérification des citations"
description: "Vérifiez les citations erronées ou hallucinées en les confrontant au document source. Une question TypeSafe Choice permet de déterminer si le contexte de la citation étaye l’affirmation, et son niveau de confiance peut signaler la citation pour examen humain."
section: cases
order: 120
tags: ['cookbook', 'recipe']
source: "docs.typesafe.ai/cookbooks/citation_check"
translatedFrom: en
---
Un LLM répond à une question et joint des citations : pour chaque affirmation, une section d’un document source et la citation sur laquelle elle repose. Certaines de ces citations sont erronées ou hallucinées : la citation peut être totalement absente du document, ou y figurer mot pour mot alors que son contexte contredit l’affirmation.

Vérifier un par un à la main est lent : trouver le document, repérer la citation à l’intérieur, puis lire suffisamment de contexte pour déterminer si elle étaye bien l’affirmation.

Pour automatiser cette vérification, nous cherchons d'abord les guillemets manquants à l'aide d'une correspondance de chaîne ordinaire,
puis nous utilisons une question `Choice` pour lire le contexte de chaque guillemet survivant et décider
s'il étaye l'affirmation.

<!-- mermaid flowchart converted to equivalent tables (this site loads no chart library) -->

*Direction du flux : LR*

| Nœud | Description | Groupe |
| :--- | :--- | :--- |
| `cite` | document source + citation | — |
| `match` | la citation est-elle / dans la source ? | — |
| `fab` | marquer comme fabriqué | — |
| `request` | demande | demande |
| `q`| Choice — comment la section / relate-t-elle à l'affirmation ? / soutient → marquer vérifié / contredit → marquer contredit / ne dit rien → marquer non étayé | demande |
| `gate` | confiance / ≥ 0,8 ? | — |
| `stand` | laisser le verdict en l'état | — |
| `review` | un humain le confirme | — |

| De | Condition | À |
| :--- | :--- | :--- |
| `cite` | — | `match` |
| `match` | trouvé | `request` |
| `match` | pas de citation | `request` |
| `match` | non trouvé | `fab` |
| `request` | — | `gate` |
| `gate` | — | `stand` |
| `gate` | — | `review` |


Ci-dessous, huit citations tirées de la réponse d’un LLM concernant la RFC 7519 (JSON Web Token) sont vérifiées. Les quatre citations exactes ont obtenu une note de `verified` avec une confiance de 0,93 ou plus. Toutes les quatre erreurs introduites ont été détectées : une citation fabriquée, une affirmation contredite et deux citations non étayées transmises à un humain.

`check_citation()`, la fonction que vous construisez ici prend un document source et une citation
et retourne l'un des quatre verdicts : `verified`, `unsupported`, `contradicted`, ou
`fabricated`. Elle retourne également une confiance qui signale ceux qu'un humain doit examiner.

## Installation

```bash
pip install ipython "typesafe-sdk>=0.5.7" cooksafe --extra-index-url https://pypi.typesafe.ai/
```

puis définis `TYPESAFE_API_KEY`. Chaque appel API est mis en cache dans `json_cache.json`, qui est fourni avec le cookbook, donc relancer rejoue les chiffres publiés au lieu d'appeler l'API. Supprime ce fichier pour tout exécuter en temps réel.

Les chiffres ci-dessous proviennent de `jev-1.12` le 2026-08-16.

```python
import json
import os
import re
from pathlib import Path
from time import perf_counter

from cooksafe import JsonCache, make_playground_link
from IPython.display import Markdown, display
from typesafe_sdk import Choice, TypeSafeClient

TYPESAFE_MODEL = "jev-1.12"
AUTO_ACCEPT = 0.8  # start high for more human review as you build trust in the model

client = TypeSafeClient(
    api_key=os.environ.get("TYPESAFE_API_KEY", "cache-only"),
    base_url=os.environ.get("TYPESAFE_ENDPOINT"),
    timeout=120.0,
)
json_cache = JsonCache(Path("json_cache.json"))
```

## Charger la source et les citations

La source est [RFC 7519](https://www.rfc-editor.org/rfc/rfc7519.html) (JSON Web Token),
téléchargée depuis rfc-editor.org et commitée à côté de ce manuel en tant que `rfc7519.txt`. Le code
ci-dessous supprime les en-têtes et pieds de page des pages, puis divise le texte en sections numérotées.

Les huit citations dans `citations.json` ont été rédigées par un LLM en opposition à la RFC. Quatre sont exactes ; nous avons modifié les quatre autres pour qu’elles échouent au contrôle.

```python
def load_source() -> str:
    """RFC 7519 verbatim, minus the page headers and footers that interrupt its paragraphs."""
    lines = []
    for line in Path("rfc7519.txt").read_text().splitlines():
        bare = line.lstrip("\f")
        if re.match(r"Jones, et al\.\s.*\[Page \d+\]$", bare):
            continue
        if re.match(r"RFC 7519\s+JSON Web Token \(JWT\)\s+May 2015$", bare):
            continue
        lines.append(bare)
    return re.sub(r"\n{3,}", "\n\n", "\n".join(lines))


def split_sections(source: str) -> dict[str, str]:
    """Map each numbered section ("4.1.3") to its text, split on the RFC's header lines."""
    boundary = re.compile(r"(?m)^(?:(\d+(?:\.\d+)*)\.  .+|Appendix [A-Z]\..*)$")
    marks = list(boundary.finditer(source))
    sections = {}
    for mark, nxt in zip(marks, marks[1:] + [None]):
        if mark.group(1) is None:  # an appendix header only terminates the section before it
            continue
        sections[mark.group(1)] = source[mark.start() : nxt.start() if nxt else len(source)].strip()
    return sections


SOURCE = load_source()
SECTIONS = split_sections(SOURCE)
CITATIONS = json.loads(Path("citations.json").read_text())

print(f"{len(SOURCE):,} characters, {len(SECTIONS)} numbered sections, {len(CITATIONS)} citations")
print("\nA citation with a quote:")
print(json.dumps(CITATIONS[1], indent=2))
print("\nA claim-only citation:")
print(json.dumps(next(c for c in CITATIONS if c["quote"] is None), indent=2))
```

```
58,365 characters, 45 numbered sections, 8 citations

A citation with a quote:
{
  "id": "aud_reject",
  "claim": "If a validator does not find itself in a token's audience list, it has to reject the token.",
  "quote": "If the principal processing the claim does not identify itself with a value in the \"aud\" claim when this claim is present, then the JWT MUST be rejected.",
  "section": "4.1.3"
}

A claim-only citation:
{
  "id": "iat_future",
  "claim": "The \"iat\" claim requires validators to reject tokens whose issue time is in the future.",
  "quote": null,
  "section": "4.1.6"
}
```

## Trouver chaque citation dans la source

Une citation qui ne figure pas dans la source est fabriquée, et aucun modèle n’est nécessaire pour s’en rendre compte.
Normalisez les espaces et les guillemets courbes afin qu’une citation corresponde malgré les retours à la ligne du RFC, puis recherchez-la en tant que sous-chaîne. Une correspondance indique également la section dont la citation est issue, et cette section correspond au texte que le modèle lira à l’étape suivante.

Une citation peut nommer une section sans en citer le contenu. Il n’y a alors rien à faire correspondre, donc on prend la section nommée par la citation et on passe directement au modèle.

```python
def normalize(text: str) -> str:
    """Collapse whitespace and fold curly quotes, so a quote matches across line wraps."""
    table = str.maketrans({"“": '"', "”": '"', "‘": "'", "’": "'"})
    return re.sub(r"\s+", " ", text.translate(table)).strip()


def find_quote(sections: dict[str, str], quote: str) -> str | None:
    """The number of the section that contains the quote verbatim, or None."""
    needle = normalize(quote)
    for number in sorted(sections, key=lambda n: [int(p) for p in n.split(".")]):
        if needle in normalize(sections[number]):
            return number
    return None


def locate(sections: dict[str, str], citation: dict) -> tuple[str, str | None]:
    """Step 1 for one citation: a status, plus the section step 2 will read."""
    if citation["quote"] is None:
        return "section-only", sections[citation["section"]]
    number = find_quote(sections, citation["quote"])
    if number is None:
        return "missing", None
    return "found", sections[number]


for citation in CITATIONS:
    status, section = locate(SECTIONS, citation)
    where = f"section of {len(section):,} chars" if section else "not in the source"
    print(f"{citation['id']:<18}{status:<14}{where}")
```

```
epoch_seconds     found         section of 3,122 chars
aud_reject        found         section of 761 chars
sig_reporting     missing       not in the source
clock_skew        found         section of 529 chars
exp_required      found         section of 529 chars
pii_encryption    found         section of 1,653 chars
iat_future        section-only  section of 270 chars
duplicate_names   found         section of 918 chars
```

## Vérifier si la source étaye l’affirmation

Une citation qui conserve encore une citation à ce stade correspond mot pour mot à la source. Cela ne suffit pas : la citation peut être exacte et la revendication qui s’appuie dessus rester fausse. Décider de cela nécessite le contexte de la citation, l’étape 1 de la section a trouvée.

Une `Choice` question par citation survivante couvre les trois façons dont une section peut être liée à une affirmation.
L'option avec la probabilité la plus élevée est le verdict, et `AUTO_ACCEPT` (0,8 dans le code ci-dessus) décide de ce qui lui arrive :

* confiance à 0,8 ou plus : le verdict est autonome ;
* en dessous de 0,8 : un humain confirme le verdict avant toute action.

Commencez avec un niveau élevé, puis abaissez le seuil au fur et à mesure que vous observez les performances du modèle sur vos propres documents.

```python
QUESTIONS = {
    "relation": Choice(
        instructions="How does the section relate to the claim?",
        criteria={
            "supports": "The section states the claim or directly implies that it is true",
            "contradicts": "The section states the opposite of the claim or implies it is false",
            "says_nothing": "The section does not address what the claim asserts, either way",
        },
    ),
}

RELATION_TO_VERDICT = {
    "supports": "verified",
    "contradicts": "contradicted",
    "says_nothing": "unsupported",
}


@json_cache
def ask(claim: str, section: str) -> dict:
    started = perf_counter()
    response = client.system_one(
        state={"claim": claim, "section": section},
        questions=QUESTIONS,
        model=TYPESAFE_MODEL,
    )
    answer = response.answers["relation"]
    return {
        "choice": answer.choice,
        "probabilities": answer.probabilities,
        "confidence": answer.confidence,
        "seconds": round(perf_counter() - started, 2),
        "input_tokens": response.usage.input_tokens or 0,
        "output_tokens": response.usage.output_tokens or 0,
    }


def verdict(status: str, answer: dict | None) -> dict:
    """Fold step 1 and step 2 into one of the four labels, plus an auto-or-review flag."""
    if status == "missing":
        # confidence None: no model was called, so there is no model confidence to report
        return {"verdict": "fabricated", "confidence": None, "auto": True}
    return {
        "verdict": RELATION_TO_VERDICT[answer["choice"]],
        "confidence": answer["confidence"],
        "auto": answer["confidence"] >= AUTO_ACCEPT,
    }


def check_citation(sections: dict[str, str], citation: dict) -> dict:
    status, section = locate(sections, citation)
    answer = ask(citation["claim"], section) if section is not None else None
    return {"id": citation["id"], "status": status, "answer": answer, **verdict(status, answer)}
```

## Vérifiez chaque citation

Toutes les huit citations passent la même vérification :

```python
print(f"{'citation':<18}{'quote':<14}{'relation':<14}{'conf':>6}  {'verdict':<13}{'action':>7}")
for citation in CITATIONS:
    result = check_citation(SECTIONS, citation)
    answer = result["answer"]
    relation = answer["choice"] if answer else "-"
    conf = f"{answer['confidence']:.2f}" if answer else "-"
    action = "auto" if result["auto"] else "review"
    print(
        f"{result['id']:<18}{result['status']:<14}{relation:<14}{conf:>6}"
        f"  {result['verdict']:<13}{action:>7}"
    )
```

```
citation          quote         relation        conf  verdict       action
epoch_seconds     found         supports        0.93  verified        auto
aud_reject        found         supports        0.95  verified        auto
sig_reporting     missing       -                  -  fabricated      auto
clock_skew        found         supports        0.99  verified        auto
exp_required      found         contradicts     0.99  contradicted    auto
pii_encryption    found         says_nothing    0.27  unsupported   review
iat_future        section-only  says_nothing    0.56  unsupported   review
duplicate_names   found         supports        0.99  verified        auto
```

Quatre citations sont revenues `verified`, une `fabricated`, une `contradicted`, et deux `unsupported`.

* `epoch_seconds`, `aud_reject`, `clock_skew` et `duplicate_names` sont les quatre exacts.
 Tous sont revenus `verified` avec une confiance de 0,93 ou plus, bien au-dessus de `AUTO_ACCEPT`.
* `sig_reporting` n'a jamais atteint le modèle. Sa citation ne figure pas dans la RFC, donc le simple
 match de chaîne le marque `fabricated`.
* `exp_required` cite la section 4.1.4 mot pour mot, et cette même section indique « L'utilisation de
 cette revendication est FACULTATIVE », donc il est `contradicted`, avec une confiance de 0,99.
* `pii_encryption` et `iat_future` sont revenus `unsupported` avec 0,27 et 0,56, tous deux en dessous
 du seuil, donc les deux ont été envoyés à un humain. `pii_encryption` montre pourquoi le match de chaîne est
 insuffisant à lui seul : sa citation figure dans la source mot pour mot, et la section dont
 elle provient ne dit rien concernant la revendication.

Pour pointer cela vers vos propres données, remplacez `rfc7519.txt` et `citations.json`.
`load_source()` et `split_sections()` sont rédigés pour la mise en page d'un RFC, donc un document
d'une autre forme nécessite son propre analyseur.

La correspondance de chaîne est exacte après normalisation : une citation tronquée ou légèrement reformulée est renvoyée sous la forme `fabricated`. Un système de production qui tolère des citations approximatives aurait besoin d’une correspondance floue à la place.

## Ouvrez-le dans le terrain de jeu

Le lien contient la citation d’une section et la question. Ouvrez-le pour exécuter la même
appel en direct dans le navigateur.

```python
example = next(c for c in CITATIONS if c["id"] == "exp_required")
_, example_section = locate(SECTIONS, example)
playground_link = make_playground_link(
    {"claim": example["claim"], "section": example_section}, QUESTIONS, models=[TYPESAFE_MODEL]
)
display(Markdown(f"🔗 [Open one citation's claim + section in the TypeSafe playground]({playground_link})"))
```

[Ouvrir la revendication et la section d’une citation dans le playground TypeSafe →](https://console.typesafe.ai/playground#share/N4IgJg9gxgrgtgUwHYBcAqCAeKQC4AEIwAOiFADYCGAlnKQaQKIBuCATgJ74BSA6mvjgwAzinzUkFGGAT5KSfFgAO1NpRTUICjYgDcc-CggBrZPgDu1FAAsIMMcUchlj0uOH4kEMc0rlqYAB0pAA0+KTCCFAaWvThIAAsgQCMgUn44U4uTvgAFIyYKmoxCmi0CACU+ADCVLSOSA0Z+GjWsq7OhR15yqrqmtrlVRQ0cOIyqNQAZtQIHjayvcUDhuX4scQKGRBsclMo7BbW1FDWhm08-PgAsgCqAMoCAHIA8gIARrKUUFAISgdgfBTHb4JRsaBzYQSADmgQyrQQTQyYIhwihSGh6ym53aWS6ORGtHwbAQAEcYKo5ud1Dj8LA2CTUPgwOoEAB6HSIzbNO6PfCffkIYEk2lLfpaZmsjlrfyiBCAiS0jrZNyEuDBTZI-AASTgSnICEQqHYHmuAEEAJqg8HMAKyYX4YQQRCOuB+cj4A0IcyUDhhEQwd1cLyCHayGzyLWUIHewQSexzMJGOQ-OxMh0UaDGR2mcxwnUoDy+cgwWS8j5fTzwT5sLVQLQoGhIGEGJ7wdgnAAirPwxdL+dukSx52oHjV7nwLwACmhtS8nmaADLBEAAXxAYRAKL1hYw2DwhBIIBJVBKcSPKA4SkRB9IpwgJxvYTvbCsHco54iMCUSh2hbipAIo6UQlI6jYHPMFzjiCYCUtE5BcLQ+qzJBNJWBOKBsKWoTxPWqBqLB0TCABIBAZE0QrKIrKQbIEA-hAUIHMOCx0nUYwgkh-hUuho5An4kQ4REvrCAA+l4NgwiRZEgSskBUuJchgGAJJokcNIseOlBouwhZhAgVhtLsPocKQq7PiAEiiFhFFaMRt4gAAEhA5jMhAVIseRoEnj2yYaWxAD8pnrpulAqAAaiaAwHiAzDJBuhCRAa0TytcEAyOQwgHgA2iAABWCDMAAtKkyQAEwgAAuquQA)