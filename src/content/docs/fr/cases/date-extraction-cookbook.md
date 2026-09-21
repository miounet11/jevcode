---
title: "Extraction de dates"
description: "Extrait les dates absolues et relatives en demandant à TypeSafe les parties nommées dans un document, puis les résout et les valide dans le code à l'aide d'une revue basée sur la confiance."
section: cases
order: 170
tags: ['cookbook', 'recipe']
source: "docs.typesafe.ai/cookbooks/date_extraction_cookbook"
translatedFrom: en
---
*Lire les parties d’une date à partir du texte avec TypeSafe, puis les résoudre en un `date` dans le code.*

La fonction que vous construisez ici, `extract_date(document, role)`, prend un document et une
phrase nommant la date que vous souhaitez, telle que « la date limite de retour du formulaire », et renvoie
un `date` avec une confiance. Elle signale une lecture de faible confiance, ainsi qu'une dont les éléments ne
forment pas du tout une date, y compris une date que le document ne mentionne jamais. La date peut être
écrite en toutes lettres (« 14 août 2027 ») ou indiquée par rapport à aujourd'hui (« demain », « jeudi prochain »).

TypeSafe répond `Choice` aux questions sur la date en un seul appel : quel type de date il s’agit,
et
quel mois, jour, année ou jour de la semaine le texte nomme. Le code transforme ces réponses en un `date`.
Le modèle lit ce que dit le texte et ne fait jamais le calcul calendaire.

Les cellules ci-dessous exécutent cette fonction sur quatre courts documents, affichent chaque date avec son
niveau de confiance, et séparent les résultats en ceux que le code accepte et ceux qu'une personne devrait
examiner.

<img src="/img/cases/date-extraction-cookbook-overview.png" alt="Overview diagram" width="1351" height="348" data-path="cookbooks/date_extraction_cookbook/overview.png" />

*TypeSafe lit la façon dont la date est écrite et quelles parties le texte nomme. Le code transforme ces réponses en `date`, en comptant à partir d’aujourd’hui lorsque la date est relative, et soit l’accepte, soit l’envoie en revue.*

## Installation

```bash
pip install ipython "typesafe-sdk>=0.5.7" cooksafe --extra-index-url https://pypi.typesafe.ai/
```

alors définis `TYPESAFE_API_KEY`.

```python
import os
from datetime import date, timedelta
from pathlib import Path

from cooksafe import JsonCache, make_playground_link
from IPython.display import Markdown, display
from typesafe_sdk import Choice, TypeSafeClient

TYPESAFE_MODEL = "jev-1.12"
TODAY = date(
    2026, 7, 30
)  # fixed reference "today" so relative dates resolve reproducibly
REVIEW_BELOW = 0.60  # gate: a date below this confidence is flagged for a human

MONTHS = {
    "January": 1,
    "February": 2,
    "March": 3,
    "April": 4,
    "May": 5,
    "June": 6,
    "July": 7,
    "August": 8,
    "September": 9,
    "October": 10,
    "November": 11,
    "December": 12,
}
WEEKDAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
]
YEAR_WINDOW = list(range(1900, 2051))  # 1900..2050

# Cached to json_cache.json (shipped with the cookbook, so re-rendering replays the published
# results with no API spend); delete it to re-run live.
json_cache = JsonCache(Path("json_cache.json"))
```

```python
# The demo cells below run when this file is executed as the cookbook; the constants and the pure
# resolve/assemble code stay importable, so the calendar math can be unit-tested on its own.
if __name__ == "__cookbook__":
    client = TypeSafeClient(
        api_key=os.environ.get(
            "TYPESAFE_API_KEY", "cache-only"
        ),  # cached re-renders need no key
        base_url=os.environ.get("TYPESAFE_BASE_URL"),
        timeout=30.0,
    )
```

## Les questions

Sept `Choice` questions sont envoyées en un seul appel. `mode` indique comment la date est écrite :
`absolute`
pour une date qui nomme un mois, `relative` pour une date écrite par rapport à aujourd'hui, et `none`
lorsque le document ne mentionne pas la date du tout.

Les six autres lisent les morceaux. Une date absolue nécessite `month`, `day` et `year`. Une relative nécessite `day_anchor` : aujourd’hui, demain, après-demain, ou un jour de la semaine nommé. Lorsqu’il s’agit d’un jour de la semaine, `weekday` et `week_offset` précisent lequel et quelle semaine. Le code ne lit que les morceaux que `mode` demande.

`year` propose une option par an de 1900 à 2050, plus deux échappatoires. `none` signifie que le texte ne mentionne aucune année et que le code en insère une. `out_of_range` signifie que le texte indique une année hors de la liste, et que le code signale ce cas au lieu de deviner. Si une liste aussi longue vous dérange, extrayez d'abord les nombres semblables à des années du texte et ne proposez au modèle que ceux-ci.

```python
def date_questions(role: str) -> dict[str, Choice]:
    """Seven typed choices that read a date's shape and parts off the text -- no math."""
    absent = "The document does not state this, or it is not this kind of date."
    return {
        "mode": Choice(
            instructions=(
                f"How is {role} written? 'absolute' = a calendar date naming a month (e.g. "
                "'August 14', 'the 3rd of March'); 'relative' = given relative to today (today, "
                "tomorrow, the day after tomorrow, or a named weekday such as 'next Thursday'); "
                "'none' = the document does not state this date."
            ),
            criteria={"absolute": None, "relative": None, "none": None},
        ),
        "month": Choice(
            instructions=f"If {role} is an absolute calendar date, which month is it in?",
            criteria={m: None for m in MONTHS} | {"none": absent},
        ),
        "day": Choice(
            instructions=f"If {role} is an absolute calendar date, which day of the month (1-31)?",
            criteria={str(d): None for d in range(1, 32)} | {"none": absent},
        ),
        "year": Choice(
            instructions=(
                f"If {role} is an absolute calendar date, which year? Pick 'none' if the document "
                "states no year (code infers it), or 'out_of_range' if a year is stated but not "
                "in the list."
            ),
            criteria={str(y): None for y in YEAR_WINDOW}
            | {
                "out_of_range": "A year is stated for this date but is outside the listed range.",
                "none": "No year is stated for this date.",
            },
        ),
        "day_anchor": Choice(
            instructions=(
                f"If {role} is relative to today, which day is it? 'today', 'tomorrow', "
                "'day_after' (the day after tomorrow), or 'weekday' (a named day of the week)."
            ),
            criteria={
                "today": None,
                "tomorrow": None,
                "day_after": None,
                "weekday": None,
                "none": absent,
            },
        ),
        "weekday": Choice(
            instructions=f"If {role} names a day of the week, which one?",
            criteria={w: None for w in WEEKDAYS} | {"none": absent},
        ),
        "week_offset": Choice(
            instructions=(
                f"If {role} names a weekday, which week is it in? 'next' for 'next Thursday' or "
                "'Thursday next week'; 'current' for 'this Thursday'; 'none' for a bare weekday "
                "with no qualifier (just 'Thursday' / 'on Thursday')."
            ),
            criteria={"current": None, "next": None, "none": absent},
        ),
    }
```

## Résous-le dans le code

`read_parts` prend la décision. `assemble` transforme les réponses en un `date` : il complète l'année lorsque le texte ne la précise pas, et il détermine le jour exact correspondant à un jour de la semaine nommé. Ces deux éléments comptent à partir de `TODAY`, qui est fixé afin que les dates relatives soient identiques à chaque exécution. `assemble` signale également la confiance la plus faible parmi les éléments utilisés, de sorte qu'une réponse peu fiable sur l'un des éléments peut entraîner un examen de la date entière.

« jeudi prochain » peut désigner deux jours différents, donc le code décide duquel. Un jour de semaine sans qualificatif signifie le prochain à venir ou celui d’aujourd’hui. `next` signifie la semaine calendaire suivante, et `current` signifie cette semaine.

```python
@json_cache
def read_parts(document: str, role: str) -> dict:
    """One TypeSafe call -> {part: {choice, confidence}} for the seven questions."""
    answers = client.system_one(
        state=document, questions=date_questions(role), model=TYPESAFE_MODEL
    ).answers
    return {
        part: {"choice": ans.choice, "confidence": ans.confidence}
        for part, ans in answers.items()
    }


def resolve_weekday(today: date, weekday: str, week_offset: str) -> date:
    """Which date a named weekday points to, by our stated convention: a bare weekday is the next
    occurrence on or after today; 'next' is the following calendar week; 'current' is this week."""
    w = WEEKDAYS.index(weekday)
    this_monday = today - timedelta(days=today.weekday())
    if week_offset == "next":
        return this_monday + timedelta(days=7 + w)
    if week_offset == "current":
        return this_monday + timedelta(days=w)
    return today + timedelta(days=(w - today.weekday()) % 7)


def assemble(parts: dict, today: date = TODAY) -> dict:
    """Resolve the parts TypeSafe read into a concrete date, in code. Confidence is the weakest of
    the parts the shape actually used."""
    mode = parts["mode"]["choice"]
    confs = [parts["mode"]["confidence"]]

    def result(resolved: date | None, note: str) -> dict:
        usable = [c for c in confs if c is not None]
        confidence = min(usable) if usable else None
        needs_review = (
            resolved is None or confidence is None or confidence < REVIEW_BELOW
        )
        return {
            "date": resolved,
            "confidence": confidence,
            "needs_review": needs_review,
            "note": note,
        }

    if mode == "none":
        return result(None, "no such date stated")

    if mode == "absolute":
        month, day, year = (
            parts["month"]["choice"],
            parts["day"]["choice"],
            parts["year"]["choice"],
        )
        confs += [
            parts["month"]["confidence"],
            parts["day"]["confidence"],
            parts["year"]["confidence"],
        ]
        if "none" in (month, day) or not day.isdigit() or month not in MONTHS:
            return result(None, "absolute date incomplete")
        if (
            year == "out_of_range"
        ):  # a year is stated but off the list -> flag, don't guess
            return result(None, f"year outside {YEAR_WINDOW[0]}-{YEAR_WINDOW[-1]}")
        if (
            year == "none"
        ):  # no year stated -> infer this year, bumped to next if well past
            try:
                resolved = date(today.year, MONTHS[month], int(day))
            except (
                ValueError
            ):  # e.g. February 30 -- an inconsistent read, not a real date
                return result(None, f"impossible date: {month} {day}")
            if resolved < today - timedelta(days=31):
                resolved = date(today.year + 1, MONTHS[month], int(day))
            return result(resolved, "")
        try:  # a stated, in-range year
            return result(date(int(year), MONTHS[month], int(day)), "")
        except ValueError:
            return result(None, f"impossible date: {year}-{month}-{day}")

    if mode == "relative":
        anchor = parts["day_anchor"]["choice"]
        confs.append(parts["day_anchor"]["confidence"])
        if anchor == "today":
            return result(today, "")
        if anchor == "tomorrow":
            return result(today + timedelta(days=1), "")
        if anchor == "day_after":
            return result(today + timedelta(days=2), "")
        if anchor == "weekday":
            weekday, offset = parts["weekday"]["choice"], parts["week_offset"]["choice"]
            confs += [
                parts["weekday"]["confidence"],
                parts["week_offset"]["confidence"],
            ]
            if weekday not in WEEKDAYS:
                return result(None, "relative weekday not read")
            return result(resolve_weekday(today, weekday, offset), "")
        return result(None, "relative day not read")

    return result(None, f"unrecognized mode: {mode}")


def extract_date(document: str, role: str) -> dict:
    return assemble(read_parts(document, role))
```

## Exécuter

Six questions réparties dans quatre courts documents : deux dates issues d’un contrat qui précise ses années,
une date limite de formulaire indiquée sans année, une enquête qui se clôt « aujourd’hui », un avis prévu pour
« jeudi prochain », et une date que le formulaire ne mentionne jamais. Tous ces éléments se résolvent par rapport à `TODAY` =
2026-07-30, un jeudi.

```python
CONTRACT = "This agreement is effective January 1, 2025 and expires December 31, 2027."
FORM = "Please return the signed form by August 14."
SURVEY = "Heads up - the customer survey closes today at 5pm."
REVIEW = "Let's schedule the design review for next Thursday."

# (document, question phrase, expected date) -- the expected value is only for the scorecard.
EXAMPLES = [
    (CONTRACT, "the date the agreement takes effect", date(2025, 1, 1)),
    (CONTRACT, "the date the agreement expires", date(2027, 12, 31)),
    (FORM, "the deadline to return the form", date(2026, 8, 14)),
    (FORM, "the date of the kickoff call", None),
    (SURVEY, "the date the survey closes", date(2026, 7, 30)),
    (REVIEW, "the date of the design review", date(2026, 8, 6)),
]

if __name__ == "__cookbook__":
    print(f"{'':3}{'question':<38}{'expected':<12}{'got':<12}{'conf':>6}  flags")
    print("-" * 84)
    for document, role, expected in EXAMPLES:
        r = extract_date(document, role)
        got = r["date"].isoformat() if r["date"] else "none"
        exp = expected.isoformat() if expected else "none"
        mark = "OK" if r["date"] == expected else "XX"
        conf = f"{r['confidence']:.2f}" if r["confidence"] is not None else " n/a"
        flags = "  <== review" if r["needs_review"] else ""
        if r["note"]:
            flags += f"  ({r['note']})"
        print(f"{mark:<3}{role:<38}{exp:<12}{got:<12}{conf:>6}{flags}")
```

```
   question                              expected    got           conf  flags
------------------------------------------------------------------------------------
OK the date the agreement takes effect   2025-01-01  2025-01-01    0.97
OK the date the agreement expires        2027-12-31  2027-12-31    0.91
OK the deadline to return the form       2026-08-14  2026-08-14    0.95
OK the date of the kickoff call          none        none          0.46  <== review  (absolute date incomplete)
OK the date the survey closes            2026-07-30  2026-07-30    0.94
OK the date of the design review         2026-08-06  2026-08-06    0.92
```

Le contrat indique ses deux années, donc celles-ci ont été extraites du texte. Le formulaire ne mentionne aucune année,
le code a donc rempli 2026 : il prend l'année en cours et passe à la suivante uniquement lorsque la
date est déjà dépassée de plus d'un mois. « aujourd'hui » et « jeudi prochain » sont passés par la même
fonction que les dates écrites en toutes lettres.

La réunion de lancement est celle que le formulaire ne mentionne jamais. Il y a une date dans ce formulaire, pas celle-ci, et la note `absolute date incomplete` signifie que `mode` est revenu `absolute` sans mois associé. La date est revenue vide, la confiance est de 0,46, et la ligne est signalée pour une personne.

## Confiance pour router

Chaque réponse revient avec une confiance calibrée, et la confiance d’une date est la plus faible parmi les éléments qui l’ont constituée. Une date sous `REVIEW_BELOW` = 0.60 est transmise à une personne, et il en va de même pour une date que le code n’a pas pu assembler. Le reste passe directement.

```python
if __name__ == "__cookbook__":
    confident = [
        (doc, role)
        for doc, role, _ in EXAMPLES
        if not extract_date(doc, role)["needs_review"]
    ]
    review = [
        (doc, role)
        for doc, role, _ in EXAMPLES
        if extract_date(doc, role)["needs_review"]
    ]
    print(f"auto-accept ({len(confident)}):")
    for _doc, role in confident:
        print(f"  - {role}")
    print(f"\nsend to review ({len(review)}):")
    for _doc, role in review:
        r = extract_date(_doc, role)
        print(
            f"  - {role}  (conf {r['confidence']:.2f} / {r['note'] or 'low confidence'})"
        )
```

```
auto-accept (5):
  - the date the agreement takes effect
  - the date the agreement expires
  - the deadline to return the form
  - the date the survey closes
  - the date of the design review

send to review (1):
  - the date of the kickoff call  (conf 0.46 / absolute date incomplete)
```

## Ouvrez-le dans le playground TypeSafe

Le lien ci-dessous porte le message « jeudi prochain » et les mêmes questions que le code envoie.
Ouvrez-le pour voir les réponses et leurs niveaux de confiance, et pour modifier la formulation sans écrire
de code.

```python
if __name__ == "__cookbook__":
    playground_link = make_playground_link(
        REVIEW, date_questions("the date of the design review"), models=[TYPESAFE_MODEL]
    )
    display(
        Markdown(
            f"🔗 [Open this document + questions in the TypeSafe playground]({playground_link})"
        )
    )
```

[Ouvrir ce document + les questions dans le playground TypeSafe →](https://console.typesafe.ai/playground#share/N4IgJg9gxgrgtgUwHYBcAqCAeKQC4AEIAMgigOQDO+FUAFgmDADYL4r35gIUCWA5knwAnBADceCAO74AZhCH4kWFPjS0YQimACGATwB0IADSEADkIhxTKChmx5CwADog4ELi4LOQKXaYSe+C50EDxQAcZBIFBCPCgIsdqB3toARhQQTDDxgUjMTCYuIkzaKDyiEQR5TAVRSBBKufkAvoUgPEgUKEIwUGUNFIEuABIQ0jxU7Kw68fgQMmwcXLwCwmIS0pKxKPFIAPz4ZGkZWfFk+AC8+Nr4UNosSDoKM6xI2nAdfNf4bqi0+AAKBD6Pj6Q4AQRgfBgXXwAEYACxkExkKb4ADMQjAcwWAFltEI6GQAJQAbkOxVK5QQ5yufGpgkpZQqbAgrJ0ukBKHcehM3LcQgskj5Sz01xk8QU-PkQpM8m+b0Q2MkCAQAGsOdRev9tFQyEpsKp1JoOSTyfqGjTLotptB4MgVJBuIoICouqVWOwJpwPfoXK0or92MkXL5-ENorRQuEXG0YnEEjwkg5vAApbR5Am6Jo1NoAMQQqR6WZztRc+MJtFLbXB5h4TGrUXx2Yc1TLIFTMEarfybU7TBbVV7UUh0K6jZcAGUENYEHBUgkJyAAPJ9CALoRLgByEAq88XPdzUQAIghwvvN4f2-VuwQXGpbbBEKhOBBnfU3SgPYsJnKFHF8G9D8fyoNUOmxeYfXiP0QADFwOi6Ho+h4AYIwASQWNEXhxG1OG4fhGXWKRAKoDNrnSTJslYO4HieKCEBMSRaDCf4g3+b0AI6PZ-TaDkQx8PxKiiEIwgiONtkTZMvBcOElwAJiXdElwRJcAFYlwANiXAB2JcAA4lwATiXOEAAYTNkq82jhBSrKiOElLsmSVKckA4XU1y4S0zzdM8gzPOM1y5PMoLLKHI8XDk2zwvbOTHJito5JchKojkjyUsi7yMpAOTfOyuT-PywLsvREKSrCxRhxcG8hPvJY7WfR03yoYD3VmL0KD-QCVCA10QPwMDHhwl4YLg9pOm6Xp+k6dDMNFWZIKw-DVhEcRiO9Mjjko2YaOQOiXkY5i6B9TlFo4NjAThABadE4WJbjYLaXQEAJfiw1qyNozE4SJMSfi4UM0yysqiK3MBiq22swHopB9sAdM+LYah0zkqR+zAfStGZMBrKsbB0y8rx+HCqJwHitJsyTMMuEIaqsGbKphzGdRyH0fcxncdZ7G4UJrn6ZJvmAYBqngpF2nQYBqKRcRwXDKSkXMdluTObpyXedVuWBY1uTydl0qqdug2Yb1mWNfRFmzcVs2VYlwz0XV230S1x3dY1hFgdlhFxbhwyEWNt3TdthELaDq2g5tn2EQdyPncj13bdUj2NdU72odU-2E8Dn3VJD7Ow+ziO0+jtPY7T+OfY0pPbY01P0Y0jOK6zqGNNz5v8+bwu6+LuvS7r8uoe0qufe02vse0huB6b9HtNb6f2+nzux+7sfe7H-v0b0oeob00ewb0ieN6n7G9Nn4-5+Pxe9+XvfV739fscBqnqafg+H6PsHfaf8+P8vgHDOvv+t8-73xykDLeqUga72CqZV+oCEbySBqfOB39oGX2gdfaBt9oEgOCpTIKpkaYIIZvgpmJCkG4JQQQtBBCMEEKwQQnBMDwGRRgVAmBsDgpxQQfLfBaVuHUNytw+hOsEH63wYbcRHCEbv2CubURlD0TUPtqI+h6JGHuwQV7TRUiEQyJRuQlGlCETUKjpo+hCJGGJyXBAbIAB9eYtihAZj4B9cE+BnoEhItQL88RsRyClMxKg2FUjZC8TYmwPAuC4SYBMXxwhnHAljHUS0EYdzuJev+KgbUGCyHlB1eio02gIUmshVCDgXAYVwthM60xlqETWuMUiggtqnGovcPaniDr4CYixdJBIDgAAUwhqkODVc4PA5qPntC+bJLU2QeIUACKA7hWAdBkAkKgcRiRdTIOE+xMhHEJPGQsG4CyvHZOxCElQwEOjRNiYUqIHJbEZhCJeaSAlwzlM+qJJJwRfpJjejyQceNpSCjGEuJ52gJQHmyiqdUfFXI1QjA+V8T4HSvnfH1bJIEuqcTmSofJg0IILBGjxKIxSkLTUGF8ypWFvw1LwisepGwvFMmpKydkvJulHX+JqDiKADioiBciQ4oKhQirIJC6FQhzgAjpZyKFkpWQCiFNsuYCgyBwo1HoWVNxFQ5M1AyrVxIHkuC1Qi9570IwiRjJEP5CY-opnLA0C1eM0AwG4K6vmAB1BgSgtB6CXGoDQAbgV8zzLEL1dNJylA0FG0Gk4uzxuvCkr5KLIBopfE6fF3jvwdVxT1HNhLwLDV9GS+CE1KUoRmjSyZ9EcJLSZWsBpih3jOhuIautWrDq9MtA9MaWr9kyAoKQN6glrVRh+Xa6I-ypL4G8LAQUDolwGhQCu1Nd4QDpoaui7NLpPx5sCQWrxwFi1DUgqSx65LK1TWrdSzdtL5qsAZcsAizaWX6tIt01U2rdA9uOlqrxnF9ijOUOcfxoHDTBpNDq9VhxoOhsUMob96oyDmkXSIVA4H5SokCUaENppzRjNyQoG4qQCSsHNWKSQcR-j1HwAARxgPcCZEhFkACsYQqDIAh00+AAD0hwGj4Zg7oEko1miRBANoUwPAABqGzq0OBAKIOEUmR0sD6AwXEKymAUAcAAbRAOxsQV04T6BsiAAAus0IAA)