---
title: "Cohérence interne : choix"
description: "Ajouter une issue incertaine aux décisions de modération et comparer l'accord des étiquettes avec la part des actions automatiques."
section: cases
order: 150
tags: ['cookbook', 'recipe']
source: "docs.typesafe.ai/cookbooks/consistency_choice_cookbook"
translatedFrom: en
---
Ce cookbook prend un seul post utilisateur limite, applique une grille de modération dessus 15 fois,
et vérifie si chaque réponse reste stable à travers les répétitions. Chaque vérification est un
`Choice`, donc chaque réponse est une étiquette issue d'un ensemble fixe. Dans un pipeline de modération,
cette étiquette est la décision de routage : supprimer ou laisser en ligne, escalader ou résoudre automatiquement, envoyer vers la
file de menace, spam ou générale. Lorsque l'étiquette vacille d'une exécution à l'autre,
le même post est routé vers différents endroits sans bonne raison.

La grille comporte 8 `Choice` questions, et chaque exécution constitue un seul appel qui répond aux 8. Nous effectuons
15
répétitions par condition, où une condition correspond à un modèle plus un paramètre, et nous traçons chaque
étiquette retournée.

Les conditions :

* Les LLM non raisonnants `claude-haiku-4-5` et `gpt-5.4-mini`, à la température `0` et par défaut de l'API.
* Les LLM raisonnants `gpt-5.5` et `claude-opus-4-8`, qui ne disposent pas de réglage de température.
* TypeSafe : un seul appel `system_one` sur les 8 questions `Choice`, avec un champ `uid` frais (une valeur unique jetable) à chaque appel, conformément à la configuration du cookbook noul.

Ce qu'il faut surveiller : les étiquettes sélectionnées peuvent s'inverser au sein d'une seule condition, y compris TypeSafe,
et les conditions sont en désaccord entre elles.

Dans cette exécution, les paramètres de distribution du LLM répètent leurs étiquettes de pluralité de 87,5 % à 100 % du temps, comparé aux 90,8 % de TypeSafe. TypeSafe présente une variation de probabilité moyenne inférieure à cinq des six conditions de distribution du LLM ; Haiku à une température de 0 varie moins. Des probabilités proches permettent toujours des changements de routage : TypeSafe bascule sur 2 des 8 questions.

Pour les décisions d’application, nous exigeons également une probabilité maximale d’au moins `0.60` ; sinon, le résultat est `uncertain` et passe en revue humaine. L’accord de TypeSafe atteint alors 99,2 %, avec des étiquettes automatiques sur 74,2 % des réponses. Nous affichons les sorties brutes et appliquons le même seuil aux conditions de probabilité des LLM, en conservant les abstentions et les modifications visibles.

## Installation

```bash
pip install anthropic openai matplotlib ipython "typesafe-sdk>=0.5.7" cooksafe --extra-index-url https://pypi.typesafe.ai/
```

alors définis `TYPESAFE_API_KEY`, `ANTHROPIC_API_KEY` et `OPENAI_API_KEY`.
Cette exécution utilise `jev-latest` sur l'API de production, échantillonnée le 2026-09-11.

```python
import hashlib
import json
import os
import textwrap
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from secrets import token_hex
from statistics import mean

from time import perf_counter

import anthropic
import matplotlib
import matplotlib.pyplot as plt
import numpy as np
from cooksafe import JsonCache, make_playground_link
from IPython.display import Markdown, display
from matplotlib.colors import ListedColormap
from openai import OpenAI
from typesafe_sdk import Choice, TypeSafeClient

matplotlib.use("Agg")  # headless render

BASE_MODELS = [
    "claude-haiku-4-5",
    "gpt-5.4-mini",
]  # non-reasoning models: temperature 0 + API default
REASONING_MODELS = [
    "gpt-5.5",
    "claude-opus-4-8",
]  # reasoning models: think first, no temperature
TYPESAFE_MODEL = "jev-latest"  # the TypeSafe model
NUM_SAMPLES = 15  # repeated post+rubric calls per condition
MIN_CHOICE_PROBABILITY = 0.60  # illustrative automatic-action threshold

LLM_PRICES = {  # $ per 1M tokens (input, output); prices + model ids as of 2026-07, see README
    "claude-haiku-4-5": (1.00, 5.00),
    "gpt-5.4-mini": (0.75, 4.50),
    "gpt-5.5": (5.00, 30.00),
    "claude-opus-4-8": (5.00, 25.00),
}
TYPESAFE_PRICE = (0.042, 0.00)  # Historical TypeSafe rate, as of 2026-08

anthropic_client = anthropic.Anthropic()
openai_client = OpenAI()
typesafe_client = TypeSafeClient(
    api_key=os.environ["TYPESAFE_API_KEY"],
    base_url="https://api.typesafe.ai",
    timeout=30.0,
)
```

## L'état : un post utilisateur limite, en JSON

La publication ci-dessous est conçue pour rester sur la limite. Le langage est véhément et insultant, visant
en partie une personne et en partie l'argumentation et la communauté. Elle contient une invitation hors plateforme (un lien attirant les gens vers un autre site), un avertissement antérieur sur le
compte, et quatre signalements d'utilisateurs, et le ton menaçant n'est jamais formulé de manière claire.

Il n’y a pas de réponse unique et évidente ici, et c’est là tout le point : de légères différences de formulation ne doivent pas déplacer aléatoirement le même message entre les chemins d’application des règles.

Les LLMs reçoivent `json.dumps(POST)` dans l’invite. TypeSafe reçoit directement le dictionnaire Python.

```python
POST = {
    "post_id": "P-88213",
    "author": {
        "user_id": "u/4471",
        "account_age_days": 38,
        "prior_strikes": 1,
        "followers": 210,
    },
    "context": {
        "surface": "public reply",
        "in_reply_to": "another user defending a game patch",
        "community": "r/gamedebates",
    },
    "content": {
        "text": (
            "Are you seriously this dense? Anyone who defends that patch is a complete clown and "
            "should be embarrassed to even post here. People like you are what's ruining this "
            "community and honestly you need to be dealt with. Come say it to my face, invite's "
            "right here. Keep it up and I'll end your whole channel."
        ),
        "has_link": True,
        "link_domain": "discord.gg",
        "language": "en",
    },
    "reports": {"user_reports": 4, "report_reasons": ["harassment", "spam", "threat"]},
}
```

## La grille : 8 `Choice` questions

Chaque question possède un `key`, une ligne d’instructions et un ensemble d’étiquettes fixe. Les étiquettes au sein d’une question sont mutuellement exclusives (une seule s’applique) et chacune est accompagnée d’une courte description. TypeSafe renvoie une étiquette `choice` sélectionnée ainsi qu’une distribution `probabilities` sur les étiquettes. Les LLM sont invités à utiliser les mêmes ensembles d’étiquettes, ce qui rend chaque ligne comparable.

```python
QUESTIONS = {
    "category": (
        "What is the single most applicable content-policy category for this post?",
        {
            "None": "No policy violation of any kind.",
            "Harass": "Insults or demeans a person, with no threat of harm and no protected-class attack.",
            "Hate": "Attacks a person or group over a protected characteristic (race, religion, gender, ...).",
            "Violence": "Makes a credible threat of harm or incites violence against someone.",
            "Spam": "Unsolicited promotion or link spam, with no personal attack.",
            "Sexual": "Sexual or adult content.",
        },
    ),
    "primary_risk": (
        "What is the primary moderation risk that should drive triage for this post?",
        {
            "Harassment": "Personal attack or targeted abuse is the main risk.",
            "Violence": "A threat of harm or intimidation is the main risk.",
            "LinkAbuse": "External-link or off-platform coordination risk is the main risk.",
            "AccountHistory": "Prior account history or repeat behavior is the main risk.",
            "LowRisk": "No meaningful moderation risk is present.",
        },
    ),
    "target": (
        "Who or what is the content primarily directed at?",
        {
            "None": "Not directed at anyone in particular.",
            "Person": "Directed at one specific individual.",
            "Group": "Directed at a protected group or class.",
            "Platform": "Directed at the community or platform itself, not a person.",
        },
    ),
    "action": (
        "What enforcement action should be taken on this post?",
        {
            "Allow": "Leave the post up with no action.",
            "Warn": "Leave the post up but attach a warning label.",
            "Remove": "Remove the post, but do not penalize the account.",
            "Strike": "Remove the post and add a strike to the account.",
            "Escalate": "Take no automated action; hold for a human decision.",
        },
    ),
    "queue": (
        "Which single moderation queue should own this post?",
        {
            "Auto": "Auto-resolve; no human queue needed.",
            "General": "General moderation queue.",
            "Threat": "Threat / violence response queue.",
            "Spam": "Spam and platform-abuse queue.",
            "TSLead": "Trust-and-safety lead / senior queue.",
        },
    ),
    "link_handling": (
        "How should any external link or off-platform invite in the post be handled?",
        {
            "Allow": "Leave the link in place.",
            "RmLink": "Strip or disable the link but keep the post.",
            "Brigade": "Treat the link as coordinated brigading and action it as abuse.",
            "Escalate": "Send the link to a specialist to assess before acting.",
        },
    ),
    "review_path": (
        "Who should make the final call on this post?",
        {
            "Auto": "Automated action; no human review.",
            "Human": "A frontline human moderator makes the call.",
            "Senior": "A senior or specialist reviewer is required.",
            "Legal": "Route to legal or law-enforcement escalation.",
        },
    ),
    "severity": (
        "What is the overall severity of this post?",
        {
            "None": "No violation.",
            "Low": "Rude or dismissive, but essentially harmless.",
            "Medium": "Personal harassment with no clearly credible threat.",
            "High": "Harassment together with a threat that could be read as credible.",
        },
    ),
}
```

## Comment nous posons la question

Chaque appel LLM est une invite contenant `json.dumps(POST)`, les 8 questions et toutes les étiquettes autorisées. Il existe deux formats de réponse. En mode distribution, le modèle renvoie un objet JSON par question avec une probabilité pour chaque étiquette. En mode sélection unique, il renvoie une seule étiquette brute par question, et notre analyse attribue toute la masse de probabilité à cette étiquette.

L’appel TypeSafe est une `system_one` requête sur le même post et les mêmes 8
`Choice` questions, renvoyant une distribution par question.

Chaque requête reçoit également un `uid` frais, une valeur unique jetable qui change à chaque exécution tout en laissant le post et la grille inchangés. Il apparaît dans l'invite du LLM et comme un champ supplémentaire dans l'état TypeSafe. Cette configuration ne permet pas de séparer la sensibilité au champ non pertinent de la variation qui se produirait sur des requêtes identiques.

Chaque assistant renvoie la réponse, un coût estimé et la latence aller-retour.

````python
def argmax_label(values: list, labels: list[str]) -> str | None:
    """The label with the most probability mass, or ``None`` if any value is missing or
    non-numeric -- a partially parsed distribution never yields a confident-looking pick."""
    numeric = [_numeric_value(value) for value in values]
    if any(value is None for value in numeric):
        return None
    return labels[int(np.argmax(numeric))]


def choice_decision_with_uncertainty(values: list, labels: list[str]) -> str | None:
    """Abstain below the action threshold; retain invalid results as parse failures."""
    label = argmax_label(values, labels)
    if label is None:
        return None
    probabilities = [float(value) for value in values]
    if any(value < 0 or value > 1 for value in probabilities):
        return None
    return label if max(probabilities) >= MIN_CHOICE_PROBABILITY else "uncertain"


def choice_decision_annotation(values: list, labels: list[str]) -> str:
    """Show the application decision and top probability in a heatmap cell."""
    decision = choice_decision_with_uncertainty(values, labels)
    if decision is None:
        return ""
    probability = max(float(value) for value in values)
    probability_text = f"{probability:.2f}".removeprefix("0")
    return f"{decision} {probability_text}"


def _numeric_value(value: object) -> float | None:
    """A finite numeric value, or ``None`` if the model emitted something unusable."""
    try:
        numeric = float(value)
    except (TypeError, ValueError):
        return None
    return numeric if np.isfinite(numeric) else None


def parse_distribution(raw: object, labels: list[str]) -> list[float]:
    """Map a model's already-parsed per-question reply to per-label probabilities, in label order
    (distribution-mode answers left un-normalized).

    A single-pick reply is a single label string -> all the mass on that exact label; a
    distribution-mode reply is a dict read label by label. Anything that doesn't match a known label
    or isn't a finite number is left NaN -- we report the gap rather than massaging the reply (e.g.
    stripping an echoed description) to make it fit."""
    if isinstance(raw, str):  # single-pick mode: a single chosen label
        if raw in labels:
            return [1.0 if label == raw else 0.0 for label in labels]
        return [float("nan")] * len(labels)
    if not isinstance(raw, dict):
        return [float("nan")] * len(labels)
    return [
        value if (value := _numeric_value(raw.get(label))) is not None else float("nan")
        for label in labels
    ]


def rubric_prompt(mode: str, sample_index: int, rubric_hash: str) -> str:
    """The post + all questions (with their label sets) in one prompt; ``mode`` picks the format.

    ``mode="dist"`` asks for a probability distribution over each question's labels; the single-pick
    mode (``mode="single"``) asks for a single label per question. The uid line combines
    ``rubric_hash`` (which rubric version) with ``sample_index`` and a random token, so every repeat
    is a distinct, independent draw and two different rubrics never share a nonce."""
    lines = []
    for key, (instructions, choices) in QUESTIONS.items():
        labels = "\n".join(f"     {label}: {desc}" for label, desc in choices.items())
        lines.append(f"- {key}: {instructions}\n   labels:\n{labels}")
    exclusivity = (
        "\n\nEach question's labels are mutually exclusive: exactly one applies. If a post could "
        "arguably fit more than one, pick the single most severe / most specific label per the "
        "label descriptions."
    )
    if mode == "single":
        answer_format = (
            "\n\nFor each question, pick exactly ONE label.\nRespond with ONLY a JSON object "
            "mapping each question's key to one of that question's bare labels (the label only, "
            "not its description), with one entry per question."
        )
    else:
        answer_format = (
            "\n\nFor each question, give a probability distribution over that question's labels "
            "(values 0.00-1.00 that sum to 1).\nRespond with ONLY a JSON object mapping each "
            "question's key to an object mapping that question's bare labels (the label only, "
            "not its description) to probabilities, with one entry per question."
        )
    return (
        f"uid: {rubric_hash}:{sample_index}:{token_hex(4)}\n\n"
        f"Document (a reported user post):\n{json.dumps(POST, indent=2)}\n\nQuestions:\n"
        + "\n".join(lines)
        + exclusivity
        + answer_format
    )


def _cost(prices: tuple[float, float], input_tokens: int, output_tokens: int) -> float:
    return input_tokens / 1e6 * prices[0] + output_tokens / 1e6 * prices[1]


def _call_llm(model: str, prompt: str, temperature: float | None):
    """One LLM call -> (text, cost_usd, latency_s), routed by model name."""
    reasoning = model in REASONING_MODELS
    started = perf_counter()
    if model.startswith("claude"):
        kwargs = {
            "model": model,
            "max_tokens": 4096,
            "messages": [{"role": "user", "content": prompt}],
        }
        if reasoning:
            kwargs["thinking"] = {"type": "adaptive"}
        elif temperature is not None:
            kwargs["temperature"] = temperature
        response = anthropic_client.messages.create(**kwargs)
        text = next((b.text for b in response.content if b.type == "text"), "")
        usage = (response.usage.input_tokens, response.usage.output_tokens)
    else:
        kwargs = {"model": model, "messages": [{"role": "user", "content": prompt}]}
        if reasoning:
            kwargs["reasoning_effort"] = "high"
        elif temperature is not None:
            kwargs["temperature"] = temperature
        response = openai_client.chat.completions.create(**kwargs)
        text = response.choices[0].message.content
        usage = (response.usage.prompt_tokens, response.usage.completion_tokens)
    return text, _cost(LLM_PRICES[model], *usage), perf_counter() - started


# All samples (LLM and TypeSafe) are cached to ``json_cache.json``, which ships with the cookbook, so
# re-rendering is instant and reproduces the published numbers with no API spend. ``sample_index``
# seeds the uid buster and is part of the cache key, so each of the NUM_SAMPLES repeats is its own
# entry and its own independent draw, not one draw replayed. Delete ``json_cache.json`` to re-sample
# everything live.
json_cache = JsonCache(Path("json_cache.json"))


def _rubric_fingerprint() -> str:
    """Short digest of everything that shapes the prompt/rubric: the state and every question's
    text and label set. Passed into the cached calls below so that editing the post or any question
    changes the cache key and forces a fresh sample, instead of silently serving a stale answer that
    was generated for the old wording."""
    payload = json.dumps([POST, QUESTIONS], sort_keys=True, default=str)
    return hashlib.sha256(payload.encode()).hexdigest()[:12]


RUBRIC_HASH = _rubric_fingerprint()


@json_cache
def _call_typesafe(sample_index: int, rubric_hash: str, model: str):
    """Return distributions, token usage, latency, and model metadata for one call.

    ``rubric_hash`` and ``model`` prevent reuse across rubric or model changes.
    Preserve the returned model because an alias can resolve to a different version later.
    """
    questions = {
        key: Choice(instructions=instructions, criteria=choices)
        for key, (instructions, choices) in QUESTIONS.items()
    }
    started = perf_counter()
    response = typesafe_client.system_one(
        model=model,
        state={"uid": f"{rubric_hash}:{sample_index}:{token_hex(4)}", "post": POST},
        questions=questions,
    )
    distributions = {}
    for key, (_instructions, choices) in QUESTIONS.items():
        probabilities = dict(response.answers[key].probabilities)
        distributions[key] = [
            probabilities.get(label, float("nan")) for label in choices
        ]
    return (
        distributions,
        response.usage.input_tokens,
        response.usage.output_tokens,
        perf_counter() - started,
        {"requested_model": model, "response_model": response.model},
    )


@json_cache
def ask_llm_rubric(
    model: str,
    mode: str,
    temperature: float | None,
    sample_index: int,
    rubric_hash: str,
):
    """One LLM rubric query -> (per-question label distributions keyed by question key, cost_usd,
    latency_s); NaNs if the reply doesn't parse.

    ``mode="dist"`` parses 8 label distributions; the single-pick mode (``mode="single"``) parses 8
    single labels and puts all the mass on each. ``rubric_hash`` goes into the prompt's uid nonce
    (and so the cache key), so an edited state/rubric busts the cache instead of serving a stale
    answer."""
    prompt = rubric_prompt(mode, sample_index, rubric_hash)
    text, cost, latency = _call_llm(model, prompt, temperature)
    # Peel a single ```json ... ``` fence (claude-haiku-4-5 sometimes adds one despite "ONLY a JSON
    # object").
    stripped = text.strip()
    if stripped.startswith("```"):
        stripped = stripped[stripped.find("\n") + 1 :] if "\n" in stripped else ""
        if stripped.rstrip().endswith("```"):
            stripped = stripped.rstrip()[: -len("```")]
    try:
        raw = json.loads(stripped)
    except (ValueError, json.JSONDecodeError):
        raw = {}
    if not isinstance(raw, dict):
        raw = {}
    distributions = {
        key: parse_distribution(raw.get(key), list(choices))
        for key, (_instructions, choices) in QUESTIONS.items()
    }
    return distributions, cost, latency
````

## Conditions expérimentales

### Grille d'expérimentation

| Groupe de modèles | Modèle | Distribution (t=0) | Distribution (par défaut) | Choix unique (t=0) |
| -------------------- | -------------------------------- | :----------------: | :--------------------: | :---------------: |
| Modèles sans raisonnement | `claude-haiku-4-5` | ✓ | ✓ | ✓ |
| Modèles sans raisonnement | `gpt-5.4-mini` | ✓ | ✓ | ✓ |
| Modèles avec raisonnement | `gpt-5.5` | — | ✓ | — |
| Modèles avec raisonnement | `claude-opus-4-8` | — | ✓ | — |
| TypeSafe | `jev-latest` (`typesafe_choice`) | — | ✓ | — |

* Un `✓` indique une condition testée avec 15 répétitions ; un `—` indique une combinaison qui n'est
 pas testée.
* La colonne par défaut n'envoie aucun argument de température : les modèles non raisonnants utilisent la valeur par défaut de l'API,
 et les modèles raisonnants ainsi que TypeSafe s'exécutent sans paramètre de température.
* Les conditions à sélection unique retournent une étiquette par question.
* La température `0` est couramment suggérée pour la reproductibilité, elle est donc comparée à la valeur par défaut de l'API.

Nous effectuons `NUM_SAMPLES` = 15 répétitions par condition. Chaque répétition possède sa propre clé de cache et compte comme un tirage distinct, et le cache (`json_cache.json`) est livré avec le livre de recettes, donc le nouveau rendu le réutilise et n’effectue aucun appel API. Supprimez le cache pour échantillonner à nouveau en direct.

```python
CONDITIONS = []
for (
    model
) in BASE_MODELS:  # non-reasoning models: dist at t=0 / default, then a single-pick variant
    for temp_value, temp_label in ((0, "0"), (None, "default")):
        CONDITIONS.append(
            {
                "label": f"{model} t={temp_label}",
                "model": model,
                "temp": temp_value,
                "mode": "dist",
            }
        )
    CONDITIONS.append(
        {
            "label": f"{model} single-pick t=0",
            "model": model,
            "temp": 0,
            "mode": "single",
        }
    )
CONDITIONS += [  # reasoning models: one distribution condition each
    {
        "label": f"{model}-reasoning",
        "model": model,
        "temp": None,
        "mode": "dist",
    }
    for model in REASONING_MODELS
]
LABELS = [condition["label"] for condition in CONDITIONS]
TYPESAFE_LABEL = "typesafe_choice"
ALL_LABELS = [*LABELS, TYPESAFE_LABEL]

runs: dict[
    str, list
] = {}  # label -> NUM_SAMPLES samples of {question key: distribution}
stats: dict[str, list] = {}  # label -> NUM_SAMPLES (cost_usd, latency_s) pairs
with ThreadPoolExecutor(max_workers=16) as pool:
    futures = {
        condition["label"]: [
            pool.submit(
                ask_llm_rubric,
                condition["model"],
                condition["mode"],
                condition["temp"],
                sample_index,
                RUBRIC_HASH,
            )
            for sample_index in range(NUM_SAMPLES)
        ]
        for condition in CONDITIONS
    }
    for label, sample_futures in futures.items():
        results = [future.result() for future in sample_futures]
        runs[label] = [result[0] for result in results]
        stats[label] = [(result[1], result[2]) for result in results]

# TypeSafe samples are drawn sequentially, after the LLM pool has closed, so each call's latency is a
# clean round trip rather than one measured under the 16-way LLM thread contention.
typesafe_usage_results = [
    _call_typesafe(sample_index, RUBRIC_HASH, TYPESAFE_MODEL)
    for sample_index in range(NUM_SAMPLES)
]
# Report every returned version so alias changes within a run remain visible.
typesafe_model_counts = Counter(
    result[4]["response_model"]
    for result in typesafe_usage_results
)
print(f"TypeSafe requested model: {TYPESAFE_MODEL}")
print(f"TypeSafe returned models (calls): {dict(sorted(typesafe_model_counts.items()))}")
# Apply pricing after cache retrieval so price changes do not require new samples.
typesafe_results = [
    (distributions, _cost(TYPESAFE_PRICE, input_tokens, output_tokens), latency)
    for distributions, input_tokens, output_tokens, latency, _metadata in typesafe_usage_results
]
typesafe_runs = [result[0] for result in typesafe_results]
stats[TYPESAFE_LABEL] = [(result[1], result[2]) for result in typesafe_results]
```

```
TypeSafe requested model: jev-latest
TypeSafe returned models (calls): {'jev-1.13.0': 15}
```

### Coût + vitesse (par requête de grille)

Les coûts ci-dessous utilisent les hypothèses de prix historiques de la configuration, y compris le taux `speed_latest` pour TypeSafe. Ils ne constituent pas des prix vérifiés `jev-latest` ni les montants actuels de facturation.

Une ligne correspond à un appel complet de grille de 8 questions. `time/call` et `cost/call` font la moyenne des 15 appels, et les colonnes `vs ts_choice` divisent par les chiffres de TypeSafe. Les LLMs s'exécutent dans un pool de 16 voies.

```python
typesafe_cost = mean([cost for cost, _latency in stats["typesafe_choice"]])
typesafe_latency = mean([latency for _cost, latency in stats["typesafe_choice"]])
name_w = max(len(name) for name in ALL_LABELS) + 2  # fit the longest condition label
# Stack comparison headers so the relative speed and cost columns can stay narrow.
print(
    f"{'':<{name_w + 31}}{'speed vs':>11}{'cost vs':>11}\n"
    f"{'condition':<{name_w}}{'calls':>7}{'time/call':>11}{'cost/call':>13}"
    f"{'ts_choice':>11}{'ts_choice':>11}"
)
for name in ALL_LABELS:
    costs, latencies = zip(*stats[name])
    cost = mean(costs)
    latency = mean(latencies)
    print(
        f"{name:<{name_w}}{len(costs):>7}{latency * 1000:>9.0f}ms"
        f"{'$' + format(cost, '.6f'):>13}"
        f"{format(latency / typesafe_latency, '.1f') + 'x':>11}"
        f"{format(cost / typesafe_cost, '.1f') + 'x':>11}"
    )
```

```
                                                                    speed vs    cost vs
condition                           calls  time/call    cost/call  ts_choice  ts_choice
claude-haiku-4-5 t=0                   15     3853ms    $0.003498      33.8x      76.1x
claude-haiku-4-5 t=default             15     3860ms    $0.003494      33.8x      76.0x
claude-haiku-4-5 single-pick t=0       15      992ms    $0.001527       8.7x      33.2x
gpt-5.4-mini t=0                       15     2293ms    $0.002299      20.1x      50.0x
gpt-5.4-mini t=default                 15     1986ms    $0.002164      17.4x      47.1x
gpt-5.4-mini single-pick t=0           15      826ms    $0.000936       7.2x      20.3x
gpt-5.5-reasoning                      15    12978ms    $0.041255     113.7x     897.4x
claude-opus-4-8-reasoning              15    10376ms    $0.028375      90.9x     617.2x
typesafe_choice                        15      114ms    $0.000046       1.0x       1.0x
```

Dans cette exécution `typesafe_choice` présente une latence aller-retour moyenne de 114 ms. Les conditions du LLM varient de 826 ms à 13,0 secondes par appel dans le cadre des paramètres de concurrence susmentionnés.

## Scénario : la décision de chaque échantillon sous forme de carte thermique

Comment le lire :

* Groupe de lignes extérieur : la question.
* Ligne intérieure : la condition.
* Colonne : un appel complet à la grille d’évaluation.
* Texte de la cellule : la décision de l’application ainsi que la probabilité sur l’étiquette supérieure.
* Couleur de la cellule : la position de l’étiquette au sein de cette question, de sorte qu’une même couleur sur toute une ligne indique la même décision à chaque fois.
* Gris `uncertain` : la probabilité supérieure est inférieure à `0.60`, donc le cas est renvoyé à un examen humain.
* Hachuré `n/a` : la réponse n’a pas pu être analysée en étiquettes exploitables (échec d’analyse).
* Les lignes vides sont de simples espacesurs.

Les conditions à sélection unique conservent leurs étiquettes renvoyées : elles ne fournissent aucune estimation d'incertitude.

```python
GAP = 1  # blank spacer row(s) between question blocks
HEAT_LABELS = ALL_LABELS
rows_per_block = len(HEAT_LABELS)  # rows per question block
pooled_runs = {
    **runs,
    TYPESAFE_LABEL: typesafe_runs,
}

row_index_values, row_text, row_labels, blocks = [], [], [], []
for question_index, (question_key, (question_text, choices)) in enumerate(
    QUESTIONS.items()
):
    labels = list(choices)
    if question_index:  # blank spacer rows (NaN -> rendered white) separate the blocks
        row_index_values.extend([np.nan] * NUM_SAMPLES for _ in range(GAP))
        row_text.extend([[""] * NUM_SAMPLES for _ in range(GAP)])
        row_labels.extend([""] * GAP)
    blocks.append((len(row_index_values), question_key, question_text))
    for label in HEAT_LABELS:
        values_by_sample = [
            pooled_runs[label][sample][question_key] for sample in range(NUM_SAMPLES)
        ]
        picks = [
            choice_decision_with_uncertainty(values, labels) for values in values_by_sample
        ]
        row_index_values.append(
            [
                10 if pick == "uncertain" else labels.index(pick) if pick in labels else np.nan
                for pick in picks
            ]
        )
        row_text.append(
            [choice_decision_annotation(values, labels) for values in values_by_sample]
        )
        row_labels.append(label)

heatmap_matrix = np.array(row_index_values, dtype=float)
# Reserve gray for abstentions while concrete-label colors remain local to each question.
cmap = ListedColormap([*plt.get_cmap("tab10").colors, "#dddddd"])
cmap.set_bad(
    "white"
)  # NaN cells (spacer rows AND unparseable replies) render white here...

fig, ax = plt.subplots(figsize=(15, 0.33 * len(row_index_values) + 1))
ax.imshow(heatmap_matrix, cmap=cmap, vmin=0, vmax=10, aspect="auto")
for row in range(heatmap_matrix.shape[0]):
    is_spacer_row = row_labels[row] == ""  # blank separator between question blocks
    for col in range(heatmap_matrix.shape[1]):
        label_text = row_text[row][col]
        if label_text:
            ax.text(
                col,
                row,
                label_text,
                ha="center",
                va="center",
                fontsize=5.7,
                family="monospace",
                color="black",
            )
        elif (
            not is_spacer_row
        ):  # ...but an unparseable reply gets a hatched "n/a", not blank white
            ax.add_patch(
                plt.Rectangle(
                    (col - 0.5, row - 0.5),
                    1,
                    1,
                    facecolor="#e8e8e8",
                    edgecolor="#b0b0b0",
                    hatch="////",
                    linewidth=0,
                )
            )
            ax.text(
                col,
                row,
                "n/a",
                ha="center",
                va="center",
                fontsize=5,
                family="monospace",
                color="#b30000",
            )

ax.set_xticks(range(NUM_SAMPLES))
ax.set_xticklabels(range(1, NUM_SAMPLES + 1), fontsize=7)
ax.set_xlabel("rubric query")
ax.set_yticks(range(len(row_labels)))
ax.set_yticklabels(row_labels, fontsize=7)
ax.tick_params(length=0)
for edge in ("top", "right", "left", "bottom"):
    ax.spines[edge].set_visible(False)

# outer level of the multi-index: the question key, printed once per block and centered, with the
# question text wrapped right under it
y_axis_transform = ax.get_yaxis_transform()
for start, question_key, question_text in blocks:
    center = start + (rows_per_block - 1) / 2
    ax.text(
        -0.2,
        center - 0.7,
        question_key,
        transform=y_axis_transform,
        ha="right",
        va="center",
        fontsize=8,
        fontweight="bold",
    )
    ax.text(
        -0.2,
        center + 0.1,
        textwrap.fill(question_text, 34),
        transform=y_axis_transform,
        ha="right",
        va="top",
        fontsize=6,
        style="italic",
        color="gray",
    )

ax.set_title(
    f"Every sample's decision + top probability; gray = uncertain (< {MIN_CHOICE_PROBABILITY:.2f})\n"
    f"(rows = question x condition, {NUM_SAMPLES} columns)",
    pad=12,
)
fig.tight_layout()
display(fig)
```

<img src="/img/cases/consistency-choice-cookbook-consistency_choice_cookbook.executed.1.png" alt="output" width="2230" height="4044" data-path="cookbooks/consistency_choice_cookbook/consistency_choice_cookbook.executed.1.png" />

Les questions les plus claires restent stables : `target` est lu comme Personne et `severity` comme Élevé dans tous les cas. Les cas limites se répartissent entre les conditions : `category`, `primary_risk`, `action`, `review_path`, et `link_handling`. Certaines conditions changent également au sein de leurs propres 15 répétitions. Avant l'abstention, TypeSafe modifie son étiquette principale sur `primary_risk` (Harcèlement 11 fois, Violence 4 fois) et `link_handling` (RmLink 8 fois, Brigade 7 fois). Les deux lignes affichent désormais `uncertain` tout au long, car leurs probabilités maximales sont inférieures à `0.60`.

## Écart-type de probabilité

Cela examine les vecteurs de probabilité complets, et non uniquement l'étiquette sélectionnée. Pour chaque condition, nous collectons les 15 distributions pour chaque question, calculons l'écart-type de la probabilité de chaque étiquette à travers les répétitions (dans quelle mesure elle varie d'une exécution à l'autre), puis moyennons ces écarts-types sur toutes les étiquettes et questions. Nous signalons également le plus grand écart-type d'étiquette unique, et comptons les échecs d'analyse séparément.

Le tableau compare chaque condition de LLM à sortie de probabilité contre TypeSafe. Les lignes à choix unique sont exclues, car elles émettent des étiquettes déterminées plutôt que des distributions de probabilité.

```python
def probability_std_stats(samples: list) -> tuple[float, float, float]:
    """Mean label std dev, max label std dev, parse-failure rate."""
    label_stds = []
    parse_failures = []
    for question_key in QUESTIONS:
        arr = np.array(
            [sample[question_key] for sample in samples],
            dtype=float,
        )
        parse_failures.extend(np.isnan(arr).any(axis=1).tolist())
        label_stds.extend(np.nanstd(arr, axis=0).tolist())
    return (
        float(np.nanmean(label_stds)),
        float(np.nanmax(label_stds)),
        float(np.mean(parse_failures)),
    )


PROBABILITY_OUTPUT_LABELS = [
    condition["label"] for condition in CONDITIONS if condition["mode"] == "dist"
] + [TYPESAFE_LABEL]
probability_std_by_label = {
    label: probability_std_stats(pooled_runs[label])
    for label in PROBABILITY_OUTPUT_LABELS
}
typesafe_mean_std = probability_std_by_label[TYPESAFE_LABEL][0]

print(
    f"{'condition':<{name_w}}{'mean prob std':>15}{'max prob std':>14}"
    f"{'parse fail':>12}{'x TypeSafe':>12}"
)
for label in PROBABILITY_OUTPUT_LABELS:
    mean_std, max_std, parse_failure_rate = probability_std_by_label[label]
    relative_std = mean_std / typesafe_mean_std
    print(
        f"{label:<{name_w}}{mean_std:>15.4f}{max_std:>14.4f}"
        f"{parse_failure_rate:>11.0%}{relative_std:>12.2f}x"
    )
```

```
condition                           mean prob std  max prob std  parse fail  x TypeSafe
claude-haiku-4-5 t=0                       0.0012        0.0221         0%        0.12x
claude-haiku-4-5 t=default                 0.0516        0.3150         1%        5.29x
gpt-5.4-mini t=0                           0.0312        0.0905         0%        3.20x
gpt-5.4-mini t=default                     0.0543        0.2303         0%        5.56x
gpt-5.5-reasoning                          0.0305        0.1047         0%        3.12x
claude-opus-4-8-reasoning                  0.0245        0.0693         0%        2.52x
typesafe_choice                            0.0098        0.0515         0%        1.00x
```

Dans cette exécution, TypeSafe présente un écart-type moyen de probabilité de `0.0098` et un écart-type maximal d'étiquette unique de `0.0515`. Haiku à une température de 0 affiche un écart-type moyen plus faible de `0.0012`. Les cinq autres conditions de probabilité des LLM s'échelonnent de `0.0245` à `0.0543`, soit environ `2.5x` à `5.6x` de la moyenne TypeSafe. De petites variations peuvent toujours inverser l'étiquette principale lorsque deux étiquettes sont proches.

## Intrigue : accord de décision avec une issue incertaine

Renvoie `uncertain` lorsque la probabilité maximale est inférieure à `0.60`. Pour chaque condition de sortie de probabilité et question, compte la décision d’application la plus fréquente, y compris `uncertain`, et divise par les 15 tirages au total. Les échecs d’analyse sont comptabilisés contre l’accord. Chaque barre moyenne le score sur l’ensemble des 8 questions, avec l’accord le plus élevé en premier.

Les conditions LLM à sélection unique sont exclues car elles ne fournissent aucune estimation d'incertitude.

```python
# Compute policy decisions and agreement once for both this chart and the comparison table.
decisions_by_condition = {}
policy_agreement_by_condition = {}
for label in PROBABILITY_OUTPUT_LABELS:
    decisions = [
        [
            choice_decision_with_uncertainty(sample[key], list(choices))
            for sample in pooled_runs[label]
        ]
        for key, (_instructions, choices) in QUESTIONS.items()
    ]
    decisions_by_condition[label] = decisions
    shares = [
        max(Counter(value for value in row if value is not None).values(), default=0)
        / NUM_SAMPLES
        for row in decisions
    ]
    policy_agreement_by_condition[label] = mean(shares)

# Sort by the measured agreement, keeping TypeSafe's color independent of its rank.
bar_labels = sorted(
    PROBABILITY_OUTPUT_LABELS, key=policy_agreement_by_condition.__getitem__, reverse=True
)
rates = [policy_agreement_by_condition[label] for label in bar_labels]

fig_bar, bar_ax = plt.subplots(figsize=(7, 0.45 * len(bar_labels) + 1))
positions = range(len(bar_labels))
bar_ax.barh(
    list(positions),
    rates,
    color=["#2b8cbe" if label == TYPESAFE_LABEL else "#fe9929" for label in bar_labels],
    alpha=0.85,
)
for label, position, rate in zip(bar_labels, positions, rates):
    marker = "*" if label == "claude-haiku-4-5 t=0" else ""
    bar_ax.text(
        rate + 0.01, position, f"{rate:.1%}{marker}", va="center", fontsize=8, color="gray"
    )
bar_ax.set_yticks(list(positions))
bar_ax.set_yticklabels(bar_labels, fontsize=8)
bar_ax.invert_yaxis()  # first condition on top
bar_ax.set_xlim(0, 1.08)
bar_ax.set_xticks(np.linspace(0, 1, 6))
bar_ax.set_xlabel("decision agreement across 15 re-runs (mean over 8 questions)")
for edge in ("top", "right", "left"):
    bar_ax.spines[edge].set_visible(False)
bar_ax.tick_params(length=0)
fig_bar.suptitle("Decision agreement including uncertain outcomes", y=1.0)
# Keep the caveat inside the exported chart so it travels with the 100% annotation.
fig_bar.text(
    0.01,
    0.01,
    "* Haiku t=0: 100% repeatability does not imply correctness.\n"
    "  This experiment does not measure accuracy.",
    fontsize=8,
)
fig_bar.tight_layout(rect=(0, 0.11, 1, 1))
display(fig_bar)
```

<img src="/img/cases/consistency-choice-cookbook-consistency_choice_cookbook.executed.2.png" alt="output" width="1052" height="651" data-path="cookbooks/consistency_choice_cookbook/consistency_choice_cookbook.executed.2.png" />

Sous la même règle `0.60`, Haiku à une température de 0 a obtenu 100 %. TypeSafe a obtenu 99,2 %, et les autres conditions de LLM se situaient entre 84,2 % et 94,2 %. TypeSafe a renvoyé `uncertain` sur 25,8 % des réponses et a agi automatiquement sur les 74,2 % restants ; Haiku à une température de 0 ne s’est jamais abstenu. Ces pourcentages mesurent uniquement la répétabilité. Le tableau ci-dessous présente les taux d’accord brut et d’abstention à côté de l’accord de politique dans ce graphique.

## Laissez des probabilités incertaines produire une décision incertaine

Un petit changement de probabilité peut inverser deux étiquettes proches. L’application n’est pas obligée d’agir sur le gagnant : retourner `uncertain` lorsque la probabilité la plus élevée est inférieure à `0.60`, et envoyer ce cas à un humain. À exactement `0.60`, sélectionner l’étiquette la plus élevée. Cela utilise les probabilités retournées, et non le champ `confidence` séparé de l’API, et n’ajoute aucun appel au modèle.

Le seuil est une politique d’application illustrative, et non une garantie calibrée ou un
seuil choisi pour maximiser l’accord de cette exécution. Choisissez des seuils de production en vous
appuyant sur des exemples étiquetés ainsi que sur le coût des actions incorrectes et de la revue humaine.

Nous appliquons la même règle à chaque condition de sortie de probabilité. Les réponses des LLM à sélection unique
ne disposent pas d'estimation de probabilité ; leurs vecteurs one-hot synthétiques ne peuvent pas mesurer l'incertitude,
elles sont donc exclues du tableau de concordance et du tableau.

```python
def agreement_rate(samples: list) -> float:
    """Mean over questions of the raw plurality label's share across all NUM_SAMPLES draws.

    Parse failures count against agreement because a failed route is not a repeated decision.
    """
    shares = []
    for question_key, (_instructions, choices) in QUESTIONS.items():
        labels = list(choices)
        picks = [
            argmax_label(samples[sample][question_key], labels)
            for sample in range(NUM_SAMPLES)
        ]
        picks = [pick for pick in picks if pick is not None]
        if not picks:
            shares.append(0.0)
            continue
        top = Counter(picks).most_common(1)[0][1]
        shares.append(top / NUM_SAMPLES)
    return mean(shares) if shares else float("nan")


# Keep failures separate from abstentions and count conflicting concrete actions per question.
print(
    f"{'condition':<{name_w}}{'raw agree':>12}{'policy agree':>14}"
    f"{'uncertain':>12}{'automatic':>12}{'conflicts':>11}"
)
for label in PROBABILITY_OUTPUT_LABELS:
    decisions = decisions_by_condition[label]
    flat = [value for row in decisions for value in row]
    uncertain_rate = mean(value == "uncertain" for value in flat)
    automatic_rate = mean(value not in (None, "uncertain") for value in flat)
    conflicts = sum(
        len({value for value in row if value not in (None, "uncertain")}) > 1
        for row in decisions
    )
    print(
        f"{label:<{name_w}}{agreement_rate(pooled_runs[label]):>11.1%}"
        f"{policy_agreement_by_condition[label]:>13.1%}{uncertain_rate:>11.1%}"
        f"{automatic_rate:>11.1%}{conflicts:>11}"
    )
```

```
condition                            raw agree  policy agree   uncertain   automatic  conflicts
claude-haiku-4-5 t=0                   100.0%       100.0%       0.0%     100.0%          0
claude-haiku-4-5 t=default              87.5%        86.7%       0.8%      98.3%          2
gpt-5.4-mini t=0                        99.2%        87.5%      12.5%      87.5%          0
gpt-5.4-mini t=default                  90.8%        84.2%      22.5%      77.5%          2
gpt-5.5-reasoning                       90.0%        93.3%      30.8%      69.2%          1
claude-opus-4-8-reasoning               92.5%        94.2%      33.3%      66.7%          0
typesafe_choice                         90.8%        99.2%      25.8%      74.2%          0
```

`policy agree` compte `uncertain` comme une décision ; les échecs d’analyse comptent contre l’accord.
`automatic` est la part de toutes les réponses qui sélectionnent une étiquette. `conflicts` compte les questions
avec plus d’une étiquette concrète à travers les répétitions, en ignorant les abstentions. Ces mesures
décritent la répétabilité et la fréquence d’action de l’application, et non si ses actions sont
correctes.

L’accord de TypeSafe est passé de 90,8 % à 99,2 %. Parmi les réponses, 25,8 % étaient incertaines et 74,2 % automatiques. `primary_risk` et `link_handling` sont revenus incertains à chaque répétition ; `category` a alterné entre Violence et `uncertain`, franchissant le seuil d’action sur certaines répétitions et non sur d’autres. Aucune question n’a produit deux libellés TypeSafe concrets différents. Rien de tout cela ne montre une exactitude ou une supériorité : Haiku à une température de 0 avait un accord de 100 % ici, sans abstentions.

```python
# Show every TypeSafe decision while retaining the top probability behind it.
policy_decisions = decisions_by_condition[TYPESAFE_LABEL]
policy_values = []
for row, (_key, (_instructions, choices)) in zip(policy_decisions, QUESTIONS.items()):
    labels = list(choices)
    policy_values.append([
        10 if value == "uncertain" else labels.index(value) if value is not None else np.nan
        for value in row
    ])
policy_cmap = ListedColormap([*plt.get_cmap("tab10").colors, "#dddddd"])
policy_cmap.set_bad("white")
fig_policy, ax_policy = plt.subplots(figsize=(13, 4))
ax_policy.imshow(policy_values, cmap=policy_cmap, vmin=0, vmax=10, aspect="auto")
for row_index, key in enumerate(QUESTIONS):
    for sample_index in range(NUM_SAMPLES):
        decision = policy_decisions[row_index][sample_index]
        probability = max(typesafe_runs[sample_index][key])
        ax_policy.text(sample_index, row_index, f"{decision or 'n/a'}\n{probability:.2f}",
                       ha="center", va="center", fontsize=6)
ax_policy.set_yticks(range(len(QUESTIONS)), list(QUESTIONS))
ax_policy.set_xticks(range(NUM_SAMPLES), range(1, NUM_SAMPLES + 1))
ax_policy.set_xlabel("rubric query")
ax_policy.set_title(
    "TypeSafe application decisions: gray means uncertain "
    f"(top probability < {MIN_CHOICE_PROBABILITY:.2f})"
)
fig_policy.tight_layout()
display(fig_policy)
```

<img src="/img/cases/consistency-choice-cookbook-consistency_choice_cookbook.executed.3.png" alt="output" width="1932" height="584" data-path="cookbooks/consistency_choice_cookbook/consistency_choice_cookbook.executed.3.png" />

Cette politique ne rend pas le modèle déterministe. S’abstenir peut remplacer des étiquettes concurrentes par le même résultat de revue humaine, mais une probabilité proche de `0.60` peut toujours basculer entre une étiquette concrète et `uncertain`. Les statistiques de probabilité et la colonne `raw agree` du tableau rapportent toujours les sorties du modèle original.

## Ouvrez-le dans le playground TypeSafe

Le lien ci-dessous ouvre le même article et la même grille dans le playground : un article, les mêmes 8
`Choice`s, et TypeSafe `jev-latest`.

```python
playground_link = make_playground_link(
    {"post": POST},
    {
        key: Choice(instructions=instructions, criteria=choices)
        for key, (instructions, choices) in QUESTIONS.items()
    },
    models=[TYPESAFE_MODEL],
)
display(
    Markdown(
        f"🔗 [Open this post + rubric in the TypeSafe playground]({playground_link})"
    )
)
```

[Ouvrir cette publication + la grille dans le playground TypeSafe →](https://console.typesafe.ai/playground#share/N4IgJg9gxgrgtgUwHYBcAqCAeKQC4AEIwAOiAA4QDOKpBJ5VKA+gJZi36kAKAtABx8ATAEYAzKQA0nEAEMYKABYQATh3oxKCZa3Z5pMAPQAWIwHZhk6TKhQIMVExkBzBEzAyAnpQ6i+U0mTKLCpM1EEA1gjeesL+IABmEAA2SRAA7lrRBCIADAC+cbaoWDR69JQwyvHWCBwBMABGSSxQ+MoIZEkelqQsSEztnR5MKBB1skgQilr4GjNgCPHIYH1O+DL4TjKI+GQyKFAKPSC2cHD2LCjdeqTKBluICw37UaQF0kUoyKV0pF-Y4wAgu18B47PhNEE7JQuvhFCxKPgFkhNAB+fCApBgpAIfBpJRIxbLRGKfa7faHfAI9b4U6dBBfWmpNJIdZIMAQpQwJIchq4hBwZ7KZQySiaDmjfAIABuyF2jHwCi0CAAdPguAgIPT8M1IqDwTIQfj9gByRHKGB9VZwhTU07nJCXDxsjlKHHUWFgmD4HEICUQfB8wkyJIoPGXBRqgDCEB2lE8VLDkrgzuqUAQUj60suCDNbRYTgUYaV7TVAGkEB1E7MyC78ABJE0pKXs-WVPFKJK4w4yJA4pIq44KUVMZpIcIcFAWjPSMfhNyxmR9cYrSi2ZRgFVOJzHJK9pwwZy1G4gZBvOKDFQoLL4dSQgYdK83owXx-KZjtUUQFEcADapGHEUxUQVBjkoPY4GORRP1KABdPIEJAKRyGUWMyGvDBsD0IhSCgF4nBUa5fhAK4yGPAhcKUFpj0KIIviCGQ1FIAA5b9yOkVj5WaKBnWzZJ9mCVkIHiNlnXCPpN2OAAJQ1RRvUh6xRblr3wFRCUQXtEQ2MjlEob8pDSCMfQDaCEDJYTFUNOA60mXZUK+KAvjAHgoD3MV1hQFBrHCQckOkGSviBTzvK03ZMm-VTlE2VCYFrCBZSi7T7IQRy-VpQDrHohEUBafAAAoRXTKR2maJxBKkFx2S0KQVVqgBKXy4gANWCLskHTcYAFkZEiUKoHaFYmlxUzzJEwDrLUvooBzRE+La9N1i2PpqAhWNNRxRrpAAZQg8YAFUUWSFocw5QJYymQTIp1PpwghCCDKM2ydL0pAQw8ryoB844tqwQ8knGH7MD+q6ZDAZTaW-L5UF895ehRKcYEcwT5JAAB1Ycw2paYIVWLt8DgBUZDIToWhkIaIeKVAeAobjnTwr4COUVM1PhREKGoVFz2kQIWDgQ1hiCSgJzKP4PDI8ZDggajjn6nMGKYkAZKAygQJ+aQNV0783v2D7bpZw0XCc9YGjmKkSSVfGl1ZQWvr80gWuSZAOpPQEbRg1Sxqsq6+hyuA2AEiKsYtvm+nzIXNtIAAZG7ARNzRxgAUWwLRXqSHg5yu4T4mpvcUESZRrNsFQVlenKIpts2bVxEPrYRW24kBGw7FQKTssI8YuChRKm-sYs26Zq7BjMsM+WHPioqD6urbD+vpEj9IACU6-GTiNMdJAnHibl8YgBYRTL2uhcrwIom+GG4mWhGke-FH0bJSe7N5-md73gPD9u0kw0oLkeSRIJZThAxFw+B842mpOzFAnMQCwxIgbBkCtSLsUolLZ2tE5YsEYiLEArEcQrymEiFg7RUocjJL2bEuJQ57HfC0bkhoI4gA1i9cYAARQhKUjbmRxHdFKLB4i5QkiwbMYMQz0IAOIxTICwthxCPI0jOg5I2TgJFXVcnJehXBc750gieVhRCOFJgtvaC4VwrqdH2FoxMmgkjxCkJMMM2lwpIHPtIS+Fpr4-hPOjAMaljSY3Nt2SG3xH58yCLCFYei0r7CgTAzKgkEFiyQScKiqCPh0S0BghWgIUjpHGJHMyADsYQJrOGRQxl1juPoajQ0SBcn5OGhbIpsVAzyHetYBQNI0jVOtHuPkA5jgLwFPFRJAyCYFIaYwKQJswyQGMmGMiqcWAAC96m4msLYXu9CtpThYJEcYIyhlV3lCtXsJCwAkIhNsvUkpsZrObigehCc1whheOMNAPVcS2TkKMPmHD3EAG5FTJA5KAjYCh4C9kJNNSgglnFwzCIjA+t8MYtnzumVW5SD6cjsL-IMXlIhCVZKzI5kCuakAAI4wAQJS+J4sTyS2lnbE4aT5ZYMBPIMYLt2U8HaHpJIsoAW2TBXzVkFKqUfMrAsSSjLRHIC0CGcYMqcQiiSC-OVmLRWUvoWgBQMFXk6uHvgAw+A5pO1xDyigKJcQatVN9XaJ4drbDrGYvOKg4A8DJqba1Wqtp5NBq8i01B3Xsh4PGJYJiuyg0NRCZAwQopetJSAVxCLkbjHRi0dp0KN54wJq-dVlLKVYu5BydIhLbRs0YNEuIc4mDDnZGOHcWDEES2STRVJ6DMHESycyWpMgxm4gzpQvc6Z6ELzgNHccANtlxSiquMmeNsYZymfgSIVZCmMHoQAISCFsBY-qDULpuusRERcNx9BeLybdoNrQnIxZdS4R7jZzAeU83OiSfqtgPeOOEAYNjgR4SGbK36j2aHcnyfOqykYb1hYm+GbjEXjCkukQtv8yFSmTsoVO10v1qSzjncxrqqRIGzIyUOa6VpBlrWALsYBK3SHaNmBAaQmB7EUDSxJ9KUm4WZRk1l7KgTsp+ZE-5ZShUQvoywRj9CpLgpqS7EBqFUBjlxKJ1kOa1VqT5r1Q5eEUibJjSoIE0bHQ4ain+6aAGVricYzMak7QKVsKlXEPJWx-ongXnYRkkouwuaunuNIPBkCooFEEqIOm37QaTe4pFAZv7Yo5JplZICz0qp0yqiKRKIG0dIJoBKTo2PNpQa2rj7aFY4MSZxOa4XjjzzSHsmACwrqrj9mKQRM4l1RE0KgDBKRnTjS7GKehnU-QsHgB3Rxb0MrASCYZUptlXJmWULCfqw3yYjXudJAsRwTxKzkui0YhsSwlPaRsNbNoyTrJxWasyJDj0DRYENCLsHk031Tcih+QzlUqpy+kkxFkMsVreHkPysgyAsCapkQS2FpTCGB1Y9hfpOq7wQEkSgehfwgAAFYynTi8agIB4JAA)