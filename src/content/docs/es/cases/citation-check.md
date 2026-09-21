---
title: "Verificación de citas"
description: "Detecta citas erróneas o alucinadas verificándolas contra el documento original. Una pregunta de opción única de TypeSafe determina si el contexto de la cita respalda la afirmación, y su nivel de confianza puede marcar la cita para revisión humana."
section: cases
order: 120
tags: ['cookbook', 'recipe']
source: "docs.typesafe.ai/cookbooks/citation_check"
translatedFrom: en
---
Un modelo de lenguaje grande responde a una pregunta y adjunta citas: para cada afirmación, una sección de un documento fuente y la cita en la que se basa. Algunas de esas citas son incorrectas o alucinadas: la cita puede faltar por completo en el documento, o estar presente palabra por palabra mientras su contexto dice lo contrario de la afirmación.

Revisar uno a uno manualmente es lento: buscar el documento, encontrar la cita dentro de él y luego leer suficiente contexto para determinar si respalda la afirmación.

Para automatizar esa comprobación, primero buscamos comillas faltantes mediante una coincidencia de cadenas ordinaria,
y luego usamos una pregunta `Choice` para leer el contexto de cada comilla restante y decidir
si respalda la afirmación.

<!-- mermaid flowchart converted to equivalent tables (this site loads no chart library) -->

*Dirección del flujo: LR*

| Nodo | Descripción | Grupo |
| :--- | :--- | :--- |
| `cite` | documento fuente + cita | — |
| `match` | ¿es la cita / en el fuente? | — |
| `fab` | marcar como fabricada | — |
| `request` | solicitud | solicitud |
| `q`| Choice — ¿cómo se relaciona la sección / con la afirmación? / apoya → marcar verificada / contradice → marcar contradicha / no dice nada → marcar no soportada | solicitud |
| `gate` | confianza / ≥ 0.8? | — |
| `stand` | dejar que el veredicto se mantenga | — |
| `review` | un humano lo confirma | — |

| De | Condición | A |
| :--- | :--- | :--- |
| `cite` | — | `match` |
| `match` | encontrado | `request` |
| `match` | sin cita | `request` |
| `match` | no encontrado | `fab` |
| `request` | — | `gate` |
| `gate` | — | `stand` |
| `gate` | — | `review` |


A continuación, ocho citas de la respuesta de un LLM sobre RFC 7519 (JSON Web Token) pasan por el
control. Las cuatro precisas volvieron `verified` con una confianza de 0,93 o superior. Se detectaron todos los cuatro
fallos plantados: una cita fabricada, una afirmación contradicha y dos citas sin respaldo
enviadas a un humano.

`check_citation()`, la función que construyes aquí, toma un documento de origen y una cita
y devuelve uno de cuatro veredictos: `verified`, `unsupported`, `contradicted`, o
`fabricated`. También devuelve una confianza que marca aquellos que un humano debería revisar.

## Configuración

```bash
pip install ipython "typesafe-sdk>=0.5.7" cooksafe --extra-index-url https://pypi.typesafe.ai/
```

entonces establece `TYPESAFE_API_KEY`. Cada llamada a la API se almacena en caché en `json_cache.json`, que se incluye con el libro de recetas, por lo que volver a ejecutar reproduce los números publicados en lugar de llamar a la API. Elimina ese archivo para ejecutar todo en tiempo real.

Los números de abajo provienen de `jev-1.12` el 2026-08-16.

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

## Cargar la fuente y las citas

La fuente es [RFC 7519](https://www.rfc-editor.org/rfc/rfc7519.html) (JSON Web Token),
obtenida de rfc-editor.org y comprometida junto a este cookbook como `rfc7519.txt`. El código
de abajo elimina los encabezados y pies de página, luego divide el texto en secciones numeradas.

Los ocho citados en `citations.json` fueron escritos por un modelo de lenguaje frente al RFC. Cuatro son
precisos; editamos los otros cuatro para que fallaran la verificación.

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

## Encuentra cada cita en la fuente

Una cita que no está en la fuente es fabricada, y no se necesita ningún modelo para descubrirlo.
Normaliza los espacios en blanco y las comillas curvas para que una cita siga coincidiendo a través de los saltos de línea
del RFC, luego búscala como una subcadena. Una coincidencia también indica de qué sección proviene la cita,
y esa sección es el texto que el modelo lee en el siguiente paso.

Una cita puede nombrar una sección sin citar nada de ella. No hay nada que coincidir
en ese caso, así que toma la sección que la cita nombra y ve directamente al modelo.

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

## Verificar si la fuente respalda la afirmación

Una cita que aún conserva una comilla en este punto coincide palabra por palabra con la fuente. Eso no es suficiente: la cita puede ser precisa y la afirmación construida sobre ella aún así ser incorrecta. Decidirlo requiere el contexto de la cita, el paso de la sección 1 encontrado.

Una `Choice` pregunta por cada cita sobreviviente cubre las tres formas en que una sección puede relacionarse con una afirmación.
La opción con la mayor probabilidad es el veredicto, y `AUTO_ACCEPT` (0.8 en el código anterior) decide qué sucede con ella:

* confianza igual o superior a 0.8: el veredicto se mantiene por sí mismo;
* inferior a 0.8: un humano confirma el veredicto antes de que se actúe sobre él.

Empieza alto y baja el umbral a medida que veas cómo se comporta el modelo con tus propios documentos.

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

## Verifica cada cita

Los ocho citaciones pasan la misma verificación:

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

Volvieron cuatro citas `verified`, una `fabricated`, una `contradicted` y dos `unsupported`.

* `epoch_seconds`, `aud_reject`, `clock_skew` y `duplicate_names` son los cuatro correctos.
 Todos devolvieron `verified` con una confianza de 0,93 o superior, muy por encima de `AUTO_ACCEPT`.
* `sig_reporting` nunca llegó al modelo. Su cita no está en la RFC, por lo que la
 coincidencia de cadena por sí sola lo marca como `fabricated`.
* `exp_required` cita la sección 4.1.4 palabra por palabra, y la misma sección dice "El uso de
 esta afirmación es OPCIONAL", por lo que es `contradicted`, con una confianza de 0,99.
* `pii_encryption` y `iat_future` devolvieron `unsupported` con valores de 0,27 y 0,56, ambos por debajo
 del umbral, por lo que ambos fueron asignados a un humano. `pii_encryption` muestra por qué la coincidencia de cadena no es
 suficiente por sí sola: su cita está en la fuente palabra por palabra, y la sección de la que
 proviene no dice nada sobre la afirmación.

Para apuntar esto a tus propios datos, reemplaza `rfc7519.txt` y `citations.json`.
`load_source()` y `split_sections()` están escritos para la disposición de un RFC, por lo que un documento
de otra forma necesita su propio análisis.

La coincidencia de cadenas es exacta tras la normalización: una cita que está truncada o ligeramente reescrita vuelve como `fabricated`. Un sistema de producción que tolere citas descuidadas necesitaría coincidencia difusa en su lugar.

## Ábrelo en el playground

El enlace contiene la afirmación y la sección de una cita, además de la pregunta. Ábrelo para ejecutar la misma llamada en vivo en el navegador.

```python
example = next(c for c in CITATIONS if c["id"] == "exp_required")
_, example_section = locate(SECTIONS, example)
playground_link = make_playground_link(
    {"claim": example["claim"], "section": example_section}, QUESTIONS, models=[TYPESAFE_MODEL]
)
display(Markdown(f"🔗 [Open one citation's claim + section in the TypeSafe playground]({playground_link})"))
```

[Abre la reclamación y la sección de una cita en el playground de TypeSafe →](https://console.typesafe.ai/playground#share/N4IgJg9gxgrgtgUwHYBcAqCAeKQC4AEIwAOiFADYCGAlnKQaQKIBuCATgJ74BSA6mvjgwAzinzUkFGGAT5KSfFgAO1NpRTUICjYgDcc-CggBrZPgDu1FAAsIMMcUchlj0uOH4kEMc0rlqYAB0pAA0+KTCCFAaWvThIAAsgQCMgUn44U4uTvgAFIyYKmoxCmi0CACU+ADCVLSOSA0Z+GjWsq7OhR15yqrqmtrlVRQ0cOIyqNQAZtQIHjayvcUDhuX4scQKGRBsclMo7BbW1FDWhm08-PgAsgCqAMoCAHIA8gIARrKUUFAISgdgfBTHb4JRsaBzYQSADmgQyrQQTQyYIhwihSGh6ym53aWS6ORGtHwbAQAEcYKo5ud1Dj8LA2CTUPgwOoEAB6HSIzbNO6PfCffkIYEk2lLfpaZmsjlrfyiBCAiS0jrZNyEuDBTZI-AASTgSnICEQqHYHmuAEEAJqg8HMAKyYX4YQQRCOuB+cj4A0IcyUDhhEQwd1cLyCHayGzyLWUIHewQSexzMJGOQ-OxMh0UaDGR2mcxwnUoDy+cgwWS8j5fTzwT5sLVQLQoGhIGEGJ7wdgnAAirPwxdL+dukSx52oHjV7nwLwACmhtS8nmaADLBEAAXxAYRAKL1hYw2DwhBIIBJVBKcSPKA4SkRB9IpwgJxvYTvbCsHco54iMCUSh2hbipAIo6UQlI6jYHPMFzjiCYCUtE5BcLQ+qzJBNJWBOKBsKWoTxPWqBqLB0TCABIBAZE0QrKIrKQbIEA-hAUIHMOCx0nUYwgkh-hUuho5An4kQ4REvrCAA+l4NgwiRZEgSskBUuJchgGAJJokcNIseOlBouwhZhAgVhtLsPocKQq7PiAEiiFhFFaMRt4gAAEhA5jMhAVIseRoEnj2yYaWxAD8pnrpulAqAAaiaAwHiAzDJBuhCRAa0TytcEAyOQwgHgA2iAABWCDMAAtKkyQAEwgAAuquQA)