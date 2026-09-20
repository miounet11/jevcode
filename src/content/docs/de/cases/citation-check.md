---
title: "Überprüfung der Zitate"
description: "Falsche oder halluzinierte Zitate erkennen, indem sie mit dem Quelldokument abgeglichen werden. Eine TypeSafe Choice-Frage entscheidet, ob der Kontext des Zitats die Behauptung unterstützt, und ihr Konfidenzwert kann das Zitat zur menschlichen Überprüfung markieren."
section: cases
order: 120
tags: ['cookbook', 'recipe']
source: "docs.typesafe.ai/cookbooks/citation_check"
translatedFrom: en
---
Ein LLM beantwortet eine Frage und fügt Zitate an: Für jede Behauptung wird ein Abschnitt eines Quelldokuments und das Zitat angegeben, auf dem sie basiert. Einige dieser Zitate sind falsch oder halluziniert: Das Zitat kann im Dokument überhaupt fehlen oder wortwörtlich darin stehen, während sein Kontext das Gegenteil der Behauptung besagt.

Das manuelle Prüfen von jedem einzelnen ist langsam: Das Dokument finden, die Zitation darin finden und dann genug Kontext lesen, um zu entscheiden, ob sie die Behauptung stützt.

Um diese Prüfung zu automatisieren, suchen wir zunächst mit einem einfachen String-Match nach fehlenden Anführungszeichen und verwenden dann eine `Choice`-Frage, um den Kontext jedes verbleibenden Zitats zu lesen und zu entscheiden, ob es die Behauptung unterstützt.

<!-- mermaid flowchart converted to equivalent tables (this site loads no chart library) -->

*Richtung des Flusses: LR*

| Knoten | Beschreibung | Gruppe |
| :--- | :--- | :--- |
| `cite` | Quelldokument + Zitat | — |
| `match` | ist das Zitat / in der Quelle? | — |
| `fab` | als erfunden markieren | — |
| `request` | Anfrage | Anfrage |
| `q` | Choice — wie verhält sich der / Abschnitt zur Behauptung? / unterstützt → als verifiziert markieren / widerspricht → als widerlegt markieren / sagt nichts → als nicht unterstützt markieren | Anfrage |
| `gate` | Konfidenz / ≥ 0.8? | — |
| `stand` | das Urteil bestehen lassen | — |
| `review` | ein Mensch bestätigt es | — |

| Von | Bedingung | Zu |
| :--- | :--- | :--- |
| `cite` | — | `match` |
| `match` | gefunden | `request` |
| `match` | kein Zitat | `request` |
| `match` | nicht gefunden | `fab` |
| `request` | — | `gate` |
| `gate` | — | `stand` |
| `gate` | — | `review` |


Unten durchlaufen acht Zitate aus der Antwort eines LLM zu RFC 7519 (JSON Web Token) die Prüfung. Die vier korrekten kamen mit einer Konfidenz von 0,93 oder höher zurück `verified`. Alle vier eingebauten Fehler wurden erkannt: ein erfundenes Zitat, eine widerlegte Behauptung und zwei nicht belegte Zitate, die an einen Menschen weitergeleitet wurden.

`check_citation()`, die Funktion, die Sie hier erstellen, nimmt ein Quelldokument und einen Zitatbeleg entgegen und gibt eines von vier Urteilen zurück: `verified`, `unsupported`, `contradicted` oder `fabricated`. Sie gibt außerdem ein Konfidenzwert zurück, der diejenigen markiert, die ein Mensch überprüfen sollte.

## Einrichtung

```bash
pip install ipython "typesafe-sdk>=0.5.7" cooksafe --extra-index-url https://pypi.typesafe.ai/
```

legen Sie dann `TYPESAFE_API_KEY` fest. Jeder API-Aufruf wird in `json_cache.json` zwischengespeichert, das mit dem Kochbuch ausgeliefert wird, sodass bei erneutem Ausführen die veröffentlichten Zahlen abgespielt werden, anstatt die API aufzurufen. Löschen Sie diese Datei, um alles live auszuführen.

Die untenstehenden Zahlen stammen von `jev-1.12` vom 16.08.2026.

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

## Die Quelle und die Zitate laden

Die Quelle ist [RFC 7519](https://www.rfc-editor.org/rfc/rfc7519.html) (JSON Web Token),
abgerufen von rfc-editor.org und neben diesem Kochbuch als `rfc7519.txt` gespeichert. Der Code
unten entfernt die Seitenkopf- und -fußzeilen und teilt den Text dann in nummerierte Abschnitte auf.

Die acht Zitate in `citations.json` wurden von einem LLM gegen den RFC verfasst. Vier davon sind korrekt; wir haben die anderen vier so bearbeitet, dass sie die Prüfung nicht bestehen.

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

## Finde jedes Zitat in der Quelle

> Ein Zitat, das nicht in der Quelle steht, ist erfunden, und dafür ist kein Modell nötig, um das herauszufinden.
> Leerzeichen und geschweifte Anführungszeichen normalisieren, damit ein Zitat über die
> Zeilenumbrüche des RFC hinweg noch übereinstimmt, und dann nach ihm als Teilstring suchen. Ein Treffer sagt auch, aus welchem Abschnitt das Zitat stammt, und dieser Abschnitt ist der Text, den das Modell im nächsten Schritt liest.

Eine Zitation kann einen Abschnitt benennen, ohne etwas daraus zu zitieren. In diesem Fall gibt es nichts zu vergleichen, also gehe direkt zum Modell, das die Zitation benennt.

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

## Überprüfen Sie, ob die Quelle die Behauptung unterstützt

Eine Zitation, die an dieser Stelle noch ein Zitat enthält, stimmt wortwörtlich mit der Quelle überein. Das reicht jedoch nicht aus: Das Zitat kann korrekt sein und die darauf aufbauende Behauptung dennoch falsch. Die Entscheidung dazu erfordert den Kontext des Zitats sowie den in Schritt 1 ermittelten Abschnitt.

Eine `Choice` Frage pro überlebender Zitation deckt die drei Arten ab, wie ein Abschnitt
zu einem Anspruch in Beziehung stehen kann.
Die Option mit der höchsten Wahrscheinlichkeit ist das Urteil, und `AUTO_ACCEPT` (0,8 im obigen
Code) entscheidet, was damit geschieht:

* Konfidenz bei oder über 0,8: das Urteil steht für sich;
* unter 0,8: ein Mensch bestätigt das Urteil, bevor etwas darauf reagiert.

Beginne hoch, und senke die Schwelle, je nachdem, wie das Modell bei deinen eigenen Dokumenten abschneidet.

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

## Überprüfe jede Zitation

Alle acht Zitate durchlaufen dieselbe Prüfung:

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

Vier Zitate kamen zurück `verified`, eines `fabricated`, eines `contradicted` und zwei `unsupported`.

* `epoch_seconds`, `aud_reject`, `clock_skew` und `duplicate_names` sind die vier korrekten.
 Alle von ihnen wurden mit einer Konfidenz von 0,93 oder höher `verified` zurückgegeben, deutlich über `AUTO_ACCEPT`.
* `sig_reporting` hat das Modell nie erreicht. Sein Zitat steht nicht in der RFC, daher markiert die reine
 String-Übereinstimmung es als `fabricated`.
* `exp_required` zitiert Abschnitt 4.1.4 wortwörtlich, und derselbe Abschnitt besagt „Die Verwendung dieser
 Behauptung ist OPTIONAL“, weshalb es als `contradicted` gilt, bei einer Konfidenz von 0,99.
* `pii_encryption` und `iat_future` wurden mit `unsupported` bei 0,27 und 0,56 zurückgegeben, beide unter
 der Schwelle, daher wurden beide einem Menschen zur Prüfung übergeben. `pii_encryption` zeigt, warum die String-Übereinstimmung
 allein nicht ausreicht: Sein Zitat steht wortwörtlich in der Quelle, und der Abschnitt, aus dem es stammt,
 sagt nichts über die Behauptung aus.

Um dies auf deine eigenen Daten zu richten, ersetze `rfc7519.txt` und `citations.json`.
`load_source()` und `split_sections()` sind für das Layout eines RFCs geschrieben, daher benötigt ein Dokument
anderer Form eine eigene Parsing-Logik.

Die Übereinstimmung ist nach Normalisierung exakt: Ein Zitat, das abgeschnitten oder leicht umformuliert wurde, wird als `fabricated` zurückgegeben. Ein Produktionssystem, das mit schlampigen Zitaten umgehen kann, müsste stattdessen Fuzzy-Matching verwenden.

## Öffnen Sie es im Playground

Der Link enthält die Behauptung und den Abschnitt einer Zitation sowie die Frage. Öffnen Sie ihn, um denselben Aufruf live im Browser auszuführen.

```python
example = next(c for c in CITATIONS if c["id"] == "exp_required")
_, example_section = locate(SECTIONS, example)
playground_link = make_playground_link(
    {"claim": example["claim"], "section": example_section}, QUESTIONS, models=[TYPESAFE_MODEL]
)
display(Markdown(f"🔗 [Open one citation's claim + section in the TypeSafe playground]({playground_link})"))
```

[Öffnen Sie die Behauptung + den Abschnitt einer Zitation im TypeSafe-Playground →](https://console.typesafe.ai/playground#share/N4IgJg9gxgrgtgUwHYBcAqCAeKQC4AEIwAOiFADYCGAlnKQaQKIBuCATgJ74BSA6mvjgwAzinzUkFGGAT5KSfFgAO1NpRTUICjYgDcc-CggBrZPgDu1FAAsIMMcUchlj0uOH4kEMc0rlqYAB0pAA0+KTCCFAaWvThIAAsgQCMgUn44U4uTvgAFIyYKmoxCmi0CACU+ADCVLSOSA0Z+GjWsq7OhR15yqrqmtrlVRQ0cOIyqNQAZtQIHjayvcUDhuX4scQKGRBsclMo7BbW1FDWhm08-PgAsgCqAMoCAHIA8gIARrKUUFAISgdgfBTHb4JRsaBzYQSADmgQyrQQTQyYIhwihSGh6ym53aWS6ORGtHwbAQAEcYKo5ud1Dj8LA2CTUPgwOoEAB6HSIzbNO6PfCffkIYEk2lLfpaZmsjlrfyiBCAiS0jrZNyEuDBTZI-AASTgSnICEQqHYHmuAEEAJqg8HMAKyYX4YQQRCOuB+cj4A0IcyUDhhEQwd1cLyCHayGzyLWUIHewQSexzMJGOQ-OxMh0UaDGR2mcxwnUoDy+cgwWS8j5fTzwT5sLVQLQoGhIGEGJ7wdgnAAirPwxdL+dukSx52oHjV7nwLwACmhtS8nmaADLBEAAXxAYRAKL1hYw2DwhBIIBJVBKcSPKA4SkRB9IpwgJxvYTvbCsHco54iMCUSh2hbipAIo6UQlI6jYHPMFzjiCYCUtE5BcLQ+qzJBNJWBOKBsKWoTxPWqBqLB0TCABIBAZE0QrKIrKQbIEA-hAUIHMOCx0nUYwgkh-hUuho5An4kQ4REvrCAA+l4NgwiRZEgSskBUuJchgGAJJokcNIseOlBouwhZhAgVhtLsPocKQq7PiAEiiFhFFaMRt4gAAEhA5jMhAVIseRoEnj2yYaWxAD8pnrpulAqAAaiaAwHiAzDJBuhCRAa0TytcEAyOQwgHgA2iAABWCDMAAtKkyQAEwgAAuquQA)