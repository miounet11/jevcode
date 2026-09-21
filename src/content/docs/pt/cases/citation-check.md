---
title: "Verificando as citações"
description: "Detecte citações incorretas ou alucinadas verificando-as contra o documento original. Uma pergunta do tipo TypeSafe Choice determina se o contexto da citação sustenta a afirmação, e sua confiança pode sinalizar a citação para revisão humana."
section: cases
order: 120
tags: ['cookbook', 'recipe']
source: "docs.typesafe.ai/cookbooks/citation_check"
translatedFrom: en
---
Um LLM responde a uma pergunta e anexa citações: para cada afirmação, uma seção de um documento fonte e a citação na qual ela se baseia. Algumas dessas citações estão erradas ou são alucinações: a citação pode estar totalmente ausente do documento, ou estar nele palavra por palavra, mas seu contexto diz o oposto da afirmação.

Verificar um por um manualmente é lento: encontrar o documento, localizar a citação dentro dele e, em seguida, ler contexto suficiente para determinar se ele sustenta a afirmação.

Para automatizar essa verificação, primeiro procuramos aspas ausentes com uma correspondência de string comum,
e então usamos uma pergunta `Choice` para ler o contexto de cada aspa restante e decidir
se ela apoia a afirmação.

<!-- mermaid flowchart converted to equivalent tables (this site loads no chart library) -->

*Direção do fluxo: ES-D*

| Nó | Descrição | Grupo |
| :--- | :--- | :--- |
| `cite` | documento fonte + citação | — |
| `match` | é a citação / no fonte? | — |
| `fab` | marcar como fabricado | — |
| `request` | solicitação | solicitação |
| `q` | Choice — como a seção / se relaciona com a alegação? / suporta → marcar verificado / contradiz → marcar contradito / não diz nada → marcar não suportado | solicitação |
| `gate` | confiança / ≥ 0.8? | — |
| `stand` | manter o veredito | — |
| `review` | um humano confirma | — |

| De | Condição | Para |
| :--- | :--- | :--- |
| `cite` | — | `match` |
| `match` | encontrado | `request` |
| `match` | sem cotação | `request` |
| `match` | não encontrado | `fab` |
| `request` | — | `gate` |
| `gate` | — | `stand` |
| `gate` | — | `review` |


Abaixo, oito citações da resposta de um LLM sobre RFC 7519 (JSON Web Token) passam pela
verificação. As quatro precisas retornaram `verified` com confiança de 0,93 ou superior. Todas as quatro
falhas plantadas foram detectadas: uma citação fabricada, uma afirmação contradita e duas citações
sem suporte enviadas a um humano.

`check_citation()`, a função que você constrói aqui, recebe um documento de origem e uma citação
e retorna um dos quatro vereditos: `verified`, `unsupported`, `contradicted`, ou
`fabricated`. Ela também retorna uma confiança que sinaliza aqueles que um humano deve analisar.

## Configuração

```bash
pip install ipython "typesafe-sdk>=0.5.7" cooksafe --extra-index-url https://pypi.typesafe.ai/
```

então defina `TYPESAFE_API_KEY`. Cada chamada de API é armazenada em cache em `json_cache.json`, que vem
incluído no cookbook, portanto, ao reexecutar, os números publicados são reproduzidos em vez de chamar a
API. Exclua esse arquivo para executar tudo em tempo real.

Os números abaixo vieram de `jev-1.12` em 2026-08-16.

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

## Carregue a fonte e as citações

A fonte é [RFC 7519](https://www.rfc-editor.org/rfc/rfc7519.html) (JSON Web Token),
obtida em rfc-editor.org e comprometida ao lado deste cookbook como `rfc7519.txt`. O código
abaixo remove os cabeçalhos e rodapés das páginas, então divide o texto em seções numeradas.

Os oito citações em `citations.json` foram escritas por um LLM contra o RFC. Quatro são
precisas; editamos as outras quatro para falhar na verificação.

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

## Encontre cada citação na fonte

Uma citação que não está na fonte é fabricada, e nenhum modelo é necessário para descobrir isso.
Normalize o espaço em branco e as aspas curvas para que uma citação ainda corresponda nas quebras de linha do RFC,
então procure por ela como uma substring. Uma correspondência também diz qual seção a citação veio
de, e essa seção é o texto que o modelo lê na próxima etapa.

Uma citação pode nomear uma seção sem citar nada dela. Não há nada para corresponder
nesse caso, então pegue a seção nomeada pela citação e vá diretamente para o modelo.

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

## Verifique se a fonte suporta a afirmação

Uma citação que ainda possui uma aspas neste ponto corresponde à palavra por palavra da fonte. Isso
não é suficiente: a citação pode estar correta e a afirmação construída sobre ela ainda estar errada.
Decidir isso requer o contexto da citação, a etapa da seção 1 encontrada.

Uma `Choice` pergunta por citação sobrevivente abrange as três maneiras pelas quais uma seção pode se relacionar
com uma afirmação.
A opção com a maior probabilidade é o veredito, e `AUTO_ACCEPT` (0,8 no código acima) decide o que acontece com ela:

* confiança igual ou superior a 0,8: o veredito permanece por si só;
* abaixo de 0,8: um humano confirma o veredito antes que qualquer ação seja tomada sobre ele.

Comece alto e reduza o limite conforme você observar o desempenho do modelo nos seus próprios documentos.

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

## Verifique cada citação

Todos os oito citações passam pela mesma verificação:

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

Quatro citações retornaram `verified`, uma `fabricated`, uma `contradicted` e duas `unsupported`.

* `epoch_seconds`, `aud_reject`, `clock_skew` e `duplicate_names` são os quatro corretos.
 Todos retornaram `verified` com confiança de 0,93 ou superior, bem acima de `AUTO_ACCEPT`.
* `sig_reporting` nunca chegou ao modelo. Sua citação não está no RFC, portanto a correspondência
 de string por si só o marca como `fabricated`.
* `exp_required` cita a seção 4.1.4 palavra por palavra, e a mesma seção afirma "O uso
 desta declaração é OPCIONAL", portanto é `contradicted`, com confiança de 0,99.
* `pii_encryption` e `iat_future` retornaram `unsupported` com 0,27 e 0,56, ambos abaixo
 do limite, então ambos foram enviados para um humano. `pii_encryption` mostra por que a correspondência
 de string não é suficiente por si só: sua citação está na fonte palavra por palavra, e a seção da qual
 veio não diz nada sobre a declaração.

Para apontar isso para seus próprios dados, substitua `rfc7519.txt` e `citations.json`.
`load_source()` e `split_sections()` são escritos para o layout de um RFC, então um documento de
outra forma precisa de sua própria análise.

A correspondência de strings é exata após a normalização: uma citação que foi truncada ou levemente reescrita retorna como `fabricated`. Um sistema de produção que tolera citações descuidadas precisaria de correspondência difusa em vez disso.

## Abra no playground

O link contém a afirmação e a seção de uma citação, além da pergunta. Abra-o para executar a mesma
chamada ao vivo no navegador.

```python
example = next(c for c in CITATIONS if c["id"] == "exp_required")
_, example_section = locate(SECTIONS, example)
playground_link = make_playground_link(
    {"claim": example["claim"], "section": example_section}, QUESTIONS, models=[TYPESAFE_MODEL]
)
display(Markdown(f"🔗 [Open one citation's claim + section in the TypeSafe playground]({playground_link})"))
```

[Abra a alegação + seção de uma citação no playground do TypeSafe →](https://console.typesafe.ai/playground#share/N4IgJg9gxgrgtgUwHYBcAqCAeKQC4AEIwAOiFADYCGAlnKQaQKIBuCATgJ74BSA6mvjgwAzinzUkFGGAT5KSfFgAO1NpRTUICjYgDcc-CggBrZPgDu1FAAsIMMcUchlj0uOH4kEMc0rlqYAB0pAA0+KTCCFAaWvThIAAsgQCMgUn44U4uTvgAFIyYKmoxCmi0CACU+ADCVLSOSA0Z+GjWsq7OhR15yqrqmtrlVRQ0cOIyqNQAZtQIHjayvcUDhuX4scQKGRBsclMo7BbW1FDWhm08-PgAsgCqAMoCAHIA8gIARrKUUFAISgdgfBTHb4JRsaBzYQSADmgQyrQQTQyYIhwihSGh6ym53aWS6ORGtHwbAQAEcYKo5ud1Dj8LA2CTUPgwOoEAB6HSIzbNO6PfCffkIYEk2lLfpaZmsjlrfyiBCAiS0jrZNyEuDBTZI-AASTgSnICEQqHYHmuAEEAJqg8HMAKyYX4YQQRCOuB+cj4A0IcyUDhhEQwd1cLyCHayGzyLWUIHewQSexzMJGOQ-OxMh0UaDGR2mcxwnUoDy+cgwWS8j5fTzwT5sLVQLQoGhIGEGJ7wdgnAAirPwxdL+dukSx52oHjV7nwLwACmhtS8nmaADLBEAAXxAYRAKL1hYw2DwhBIIBJVBKcSPKA4SkRB9IpwgJxvYTvbCsHco54iMCUSh2hbipAIo6UQlI6jYHPMFzjiCYCUtE5BcLQ+qzJBNJWBOKBsKWoTxPWqBqLB0TCABIBAZE0QrKIrKQbIEA-hAUIHMOCx0nUYwgkh-hUuho5An4kQ4REvrCAA+l4NgwiRZEgSskBUuJchgGAJJokcNIseOlBouwhZhAgVhtLsPocKQq7PiAEiiFhFFaMRt4gAAEhA5jMhAVIseRoEnj2yYaWxAD8pnrpulAqAAaiaAwHiAzDJBuhCRAa0TytcEAyOQwgHgA2iAABWCDMAAtKkyQAEwgAAuquQA)