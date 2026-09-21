---
title: "Classificação usando confiança"
description: "Classificar os relatórios anuais da SEC em 75 grupos de indústrias, com uma única escolha para cada, e então ler a própria confiança da resposta para decidir se o grupo é reportado ou se a divisão mais ampla acima dele é reportada."
section: cases
order: 130
tags: ['cookbook', 'recipe']
source: "docs.typesafe.ai/cookbooks/classification_using_confidence"
translatedFrom: en
---
Todas as empresas que apresentam um relatório anual à SEC descrevem seu próprio negócio nele.
Classificamos essas descrições sob a Classificação Industrial Padrão: 75 grupos de
indústria, uma `Choice` pergunta por documento.

A maioria dos registros é simples. Um banco regional é um banco regional. Alguns não são: uma empresa que acabou de vender um de seus dois segmentos, ou uma startup que descreve um negócio que planeja entrar, em vez de um que opera. O modelo precisa escolher um grupo de qualquer maneira, e a resposta para um caso difícil não se parece em nada com a resposta para um caso fácil. Distinguir casos difíceis dos fáceis é normalmente onde o custo incide: um segundo modelo, chamadas extras, revisão humana.

A Choice já te diz isso. Junto com a opção vencedora, ela retorna `confidence`, alto quando quase toda a probabilidade se concentrou em uma única opção e baixo quando se espalhou por várias. Esse único número separa as respostas que você pode confiar das que não pode.

O que fazer com uma resposta não confiável depende dos seus rótulos. Os rótulos SIC formam uma hierarquia:
os grupos industriais se agrupam em divisões mais amplas. Isso torna uma resposta praticamente gratuita. Quando
o modelo não tem certeza do grupo, informe a divisão à qual ele pertence. O rótulo amplo
decorre do mais específico, portanto não há uma segunda chamada.

Em 60 registros, um limiar de confiança de 0,9 os divide ao meio. A metade confiante está certa 90% das vezes; a outra metade, 40%. Reportado um nível acima, esse 40% se torna 70%. Terminamos com uma função `classify()` que retorna um rótulo mais o quão específico ela é, em um pedido por documento.

<!-- mermaid flowchart converted to equivalent tables (this site loads no chart library) -->

*Direção do fluxo: ES-D*

| Nó | Descrição | Grupo |
| :--- | :--- | :--- |
| `doc` | Item 1 'Negócios' / de um 10-K | — |
| `request` | uma solicitação | uma solicitação |
| `q` | Escolha / 75 grupos industriais | uma solicitação |
| `sure` | confiança / ≥ 0,9? | — |
| `grp` | relatar o grupo industrial / ex. 28 | — |
| `div` | relatar sua divisão / ex. manufatura | — |

| De | Condição | Para |
| :--- | :--- | :--- |
| `doc` | — | `request` |
| `sure` | sim | `grp` |
| `sure` | não | `div` |


## Configuração

```bash
pip install ipython matplotlib "typesafe-sdk>=0.5.7" cooksafe --extra-index-url https://pypi.typesafe.ai/
```

então defina `TYPESAFE_API_KEY`. Cada chamada de API é armazenada em cache em `json_cache.json`, que acompanha o cookbook, portanto, o re-renderização reproduz os números publicados sem chamar a API.
Exclua esse arquivo para executar tudo novamente ao vivo.

Os números abaixo vieram de `jev-1.12` em 12/08/2026.

```python
import json
from collections import defaultdict
from pathlib import Path

import matplotlib
import matplotlib.pyplot as plt
from cooksafe import JsonCache, make_playground_link
from IPython.display import Markdown, display
from typesafe_sdk import Choice, TypeSafeClient

matplotlib.use("Agg")  # headless render

import os  # noqa: E402

TYPESAFE_MODEL = "jev-1.12"
CONFIDENT = 0.9  # above this the group is reported; below it, the division

client = TypeSafeClient(
    api_key=os.environ.get(
        "TYPESAFE_API_KEY", "cache-only"
    ),  # keyless kernels replay the cache
    base_url=os.environ.get("TYPESAFE_ENDPOINT"),
    timeout=120.0,
)
json_cache = JsonCache(Path("json_cache.json"))
```

## Construa os dois níveis da taxonomia

`sic_codes.tsv` é a lista setorial que a SEC publica para que os declarantes escolham seus próprios códigos, obtida em 2026-08-10: 444 códigos de quatro dígitos, cada um com um título de indústria. Os dígitos formam uma hierarquia. Os dois primeiros são o **grupo principal** (75 deles aqui, de `01` produção agrícola a `99` não classificável), e faixas fixas de grupos principais compõem as dez **divisões**, a divisão mais ampla do SIC.

Ambos os níveis saem desse único arquivo, sem nenhum modelo envolvido: agrupe os códigos pelos seus dois primeiros dígitos e, em seguida, mapeie esses dígitos para uma divisão.

```python
DIVISIONS = [
    (1, 9, "agriculture, forestry and fishing"),
    (10, 14, "mining"),
    (15, 17, "construction"),
    (20, 39, "manufacturing"),
    (40, 49, "transportation, communications and utilities"),
    (50, 51, "wholesale trade"),
    (52, 59, "retail trade"),
    (60, 67, "finance, insurance and real estate"),
    (70, 89, "services"),
    (91, 99, "public administration"),
]

INDUSTRIES: dict[str, str] = {}
for line in Path("sic_codes.tsv").read_text().splitlines()[1:]:
    code, _office, title = line.split("\t")
    INDUSTRIES[code] = title.lower()

GROUPS: dict[str, list[str]] = defaultdict(list)
for code in sorted(INDUSTRIES):
    GROUPS[code[:2]].append(code)


def division(group: str) -> str:
    number = int(group)
    return next(name for low, high, name in DIVISIONS if low <= number <= high)


print(
    f"{len(INDUSTRIES)} industries -> {len(GROUPS)} major groups -> {len(DIVISIONS)} divisions"
)
print(
    f"  group 35 = {division('35')} / {', '.join(INDUSTRIES[c] for c in GROUPS['35'][:3])} ..."
)
```

```
444 industries -> 75 major groups -> 10 divisions
  group 35 = manufacturing / engines & turbines, farm machinery & equipment, lawn & garden tractors & home lawn & gardens equip ...
```

Uma pergunta do Choice precisa de algo para descrever cada opção, e o próprio nome de um grupo nem sempre está presente: 42 dos 75 carregam um título genérico na lista da SEC, e os demais não carregam nenhum. Portanto, cada grupo é descrito pelas indústrias que ele contém, que é exatamente o que alguém que lê o documento compararia de qualquer maneira.

```python
MAX_NAMED = (
    8  # industries listed per group; enough to characterise it without a wall of text
)


def describe(group: str) -> str:
    umbrella = INDUSTRIES.get(f"{group}00")
    inside = [INDUSTRIES[c] for c in GROUPS[group] if c != f"{group}00"][:MAX_NAMED]
    listed = "; ".join(inside)
    return (
        f"{umbrella} — includes: {listed}"
        if umbrella and listed
        else (umbrella or listed)
    )


print(f"group 20: {describe('20')[:150]}")
print(f"\ngroup 65: {describe('65')[:150]}")
```

```
group 20: food and kindred products — includes: meat packing plants; sausages & other prepared meat products; poultry slaughtering and processing; dairy product

group 65: real estate — includes: real estate operators (no developers) & lessors; operators of nonresidential buildings; operators of apartment buildings; less
```

## Os registros

`filings.jsonl` contém 60 relatórios anuais (10-K), cada um reduzido ao Item 1 "Negócios", a seção onde uma empresa descreve o que faz, que é a única parte relevante para um código de indústria. Eles abrangem 1993–2024 e variam de 700 a 2.200 palavras. Cada um traz o código SIC escolhido pelo declarante, além do número de acesso para consultá-lo no EDGAR.

De onde vem esse rótulo importa antes de qualquer número de precisão. É autorreferido:
quem preparou o registro o escolheu uma vez, e ele fica desatualizado quando uma empresa vende o
negócio que os nomes de código e mantém o código. Esses 60 foram filtrados para registros cujos
seu próprio texto suporta o código que carregam, então os números aqui medem a receita em vez de
o estado dos metadados do EDGAR.

```python
FILINGS = [json.loads(line) for line in Path("filings.jsonl").read_text().splitlines()]
example = FILINGS[7]
print(
    f"{len(FILINGS)} filings, {sum(f['words'] for f in FILINGS) // len(FILINGS)} words on average"
)
print(f"\n{example['id']} (filed {example['year']}, accession {example['accession']}):")
print(f"  {example['text'][:230]}...")
print(f"  filer's code: {example['sic']} {INDUSTRIES[example['sic']]}")
```

```
60 filings, 1438 words on average

1389870_2008 (filed 2008, accession 0001079974-09-000155):
  Item 1. DESCRIPTION OF BUSINESS. NARRATIVE DESCRIPTION OF THE BUSINESS Across America Financial Services, Inc. is a corporation which was formed under the laws of the State of Colorado on December 1, 2005. Until March 23, 2007, we...
  filer's code: 6163 loan brokers
```

## Faça uma pergunta do tipo Choice e leia a confiança

Uma `Choice` pergunta cujas opções são os 75 grupos. Toda a taxonomia cabe em uma única solicitação: um Choice funciona de forma confiável até aproximadamente 240 opções, e 75 está bem dentro desse limite.

A resposta retorna com `choice`, o grupo vencedor; `probabilities`, o peso em cada
um dos 75; e `confidence`, que indica quão concentrada era essa distribuição. A receita lê
`confidence` em vez da própria probabilidade do vencedor. Um vencedor com 0,45 e um segundo colocado com
0,44, e um vencedor com 0,45 com o restante do peso espalhado de forma dispersa, são situações
diferentes, e `confidence` é o que as separa.

```python
QUESTION = (
    "Which broad industry does this company operate in? Judge the company's own operations "
    "as this filing describes them."
)


def questions() -> dict:
    return {
        "group": Choice(
            instructions=QUESTION,
            criteria={group: describe(group) for group in sorted(GROUPS)},
        )
    }


@json_cache
def ask(filing_id: str, text: str) -> dict:
    response = client.system_one(
        state=text, questions=questions(), model=TYPESAFE_MODEL
    )
    answer = response.answers["group"]
    return {
        "group": answer.choice,
        "confidence": answer.confidence,
        "probabilities": dict(answer.probabilities),
    }
```

## Retorne o grupo quando tiver certeza, sua divisão quando não

As quatro linhas abaixo são a receita completa. Com confiança de 0,9 ou superior, a resposta é
reportada como um grupo setorial; abaixo disso, a mesma resposta é reportada como a divisão que
esse grupo integra.

Cada registro ainda retorna com um rótulo utilizável. Um que o modelo não conseguiu classificar com confiança retorna um nível acima, em vez de ser descartado ou encaminhado adiante. Se uma divisão for muito ampla para que sua aplicação possa agir, este é o ramo onde você o entrega a uma pessoa.

```python
def classify(filing: dict) -> dict:
    answer = ask(filing["id"], filing["text"])
    sure = answer["confidence"] >= CONFIDENT
    return {
        "level": "group" if sure else "division",
        "label": answer["group"] if sure else division(answer["group"]),
        "confidence": answer["confidence"],
        "group": answer["group"],
    }


def show(filing: dict) -> None:
    result = classify(filing)
    named = describe(result["group"]).split(" — ")[0][:46]
    print(
        f"  {filing['id']:>13}  conf {result['confidence']:.2f}  -> {result['level']:<8} "
        f"{result['label']:<14} (group {result['group']}: {named})"
    )


print("three filings the model was sure about:")
for f in sorted(FILINGS, key=lambda f: -ask(f["id"], f["text"])["confidence"])[:3]:
    show(f)
print("\nthree it was not:")
for f in sorted(FILINGS, key=lambda f: ask(f["id"], f["text"])["confidence"])[:3]:
    show(f)
```

```
three filings the model was sure about:
    310158_1996  conf 1.00  -> group    28             (group 28: chemicals & allied products)
     33416_1998  conf 1.00  -> group    63             (group 63: life insurance; accident & health insurance; h)
    352541_1996  conf 1.00  -> group    49             (group 49: electric, gas & sanitary services)

three it was not:
   1372167_2013  conf 0.22  -> division manufacturing  (group 38: search, detection, navagation, guidance, aeron)
   1398633_2009  conf 0.23  -> division wholesale trade (group 50: wholesale-durable goods)
     46653_1999  conf 0.29  -> division services       (group 87: services-engineering, accounting, research, ma)
```

As confianças alinham-se com a dificuldade de classificação de cada registro. Os três com 1,00 são um fabricante farmacêutico, uma seguradora de vida e uma empresa de serviços públicos; todos os três são holding companies no papel, mas cada uma tem um negócio dominante que o registro nomeia explicitamente. Os três na parte inferior são mais difíceis por razões que você pode ler no texto. Dois são empresas em estágio de desenvolvimento descrevendo um negócio que pretendem iniciar (Nevaeh "pretende operar como desenvolvedora de software", Barricode foi "organizada para entrar na indústria de software de segurança de computador"), e o terceiro tinha dois segmentos e vendeu um deles semanas antes do registro. Esses três retornam como uma divisão em vez de um grupo.

`classify()` é a receita completa. Aponte `ask()` para seus próprios documentos e reescreva
`describe()` para sua própria taxonomia, e o resto se aplica automaticamente.

## O que a resposta mais ampla proporciona

Tod as 60 inscrições, pontuadas contra o código escolhido por cada declarante, sob ambas as políticas: nomear um grupo sempre, ou reportar a divisão sempre que a confiança cair abaixo de 0,9.

```python
def correct(filing: dict, result: dict) -> bool:
    gold_group = filing["sic"][:2]
    if result["level"] == "group":
        return result["label"] == gold_group
    return result["label"] == division(gold_group)


results = [(f, classify(f)) for f in FILINGS]
sure = [(f, r) for f, r in results if r["level"] == "group"]
unsure = [(f, r) for f, r in results if r["level"] == "division"]

forced = sum(r["group"] == f["sic"][:2] for f, r in results)
broadened = sum(correct(f, r) for f, r in results)

print(f"forced to name a group every time      {forced}/{len(results)} right")
print(
    f"  of those, the {len(sure)} it was sure about  "
    f"{sum(r['group'] == f['sic'][:2] for f, r in sure)}/{len(sure)} right"
)
print(
    f"  and the {len(unsure)} it was not           "
    f"{sum(r['group'] == f['sic'][:2] for f, r in unsure)}/{len(unsure)} right"
)
print(
    f"\nletting it answer coarsely when unsure  {broadened}/{len(results)} useful answers"
)
```

```
forced to name a group every time      39/60 right
  of those, the 30 it was sure about  27/30 right
  and the 30 it was not           12/30 right

letting it answer coarsely when unsure  48/60 useful answers
```

Onde o modelo estava seguro, o grupo que nomeou está certo nove vezes em dez. Onde não estava,
nomear um grupo estava errado mais frequentemente do que certo, em 40%. Relatar essas mesmas respostas como uma
divisão as eleva para 70%.

O gráfico coloca as duas políticas lado a lado, divididas pela certeza do modelo.

```python
labels = ["sure\n(group reported)", "unsure\n(division reported)"]
forced_split = [
    sum(r["group"] == f["sic"][:2] for f, r in sure) / len(sure),
    sum(r["group"] == f["sic"][:2] for f, r in unsure) / len(unsure),
]
broad_split = [
    sum(correct(f, r) for f, r in sure) / len(sure),
    sum(correct(f, r) for f, r in unsure) / len(unsure),
]

fig, ax = plt.subplots(figsize=(7, 3.6))
x = range(len(labels))
ax.bar(
    [i - 0.19 for i in x],
    forced_split,
    0.38,
    label="always name a group",
    color="#c8ccd4",
)
ax.bar(
    [i + 0.19 for i in x],
    broad_split,
    0.38,
    label="answer broadly when unsure",
    color="#3b6ea5",
)
for i, (a, b) in enumerate(zip(forced_split, broad_split)):
    ax.text(i - 0.19, a + 0.02, f"{a:.0%}", ha="center", fontsize=9)
    ax.text(i + 0.19, b + 0.02, f"{b:.0%}", ha="center", fontsize=9)
ax.set_xticks(list(x))
ax.set_xticklabels(
    [f"{lab}\nn={n}" for lab, n in zip(labels, [len(sure), len(unsure)])]
)
ax.set_ylabel("labels that are right")
ax.set_ylim(0, 1.12)
ax.set_title("Where the broader answer helps: the filings it was unsure about")
ax.legend(frameon=False, loc="upper right")
ax.spines[["top", "right"]].set_visible(False)
plt.tight_layout()
display(fig)
```

<img src="/img/cases/classification-using-confidence-classification_using_confidence.executed.1.png" alt="output" width="1034" height="523" data-path="cookbooks/classification_using_confidence/classification_using_confidence.executed.1.png" />

## Abra no playground

Este link de compartilhamento contém um registro e a pergunta de 75 opções, permitindo que você visualize a distribuição e a confiança que ela gera sem precisar escrever nenhum código.

```python
playground_link = make_playground_link(
    example["text"], questions(), models=[TYPESAFE_MODEL]
)
display(
    Markdown(
        f"🔗 [Open the filing + question in the TypeSafe playground]({playground_link})"
    )
)
```

[Abra o registro + a pergunta no playground do TypeSafe →](https://console.typesafe.ai/playground#share/N4IgJg9gxgrgtgUwHYBcAqCAeKQC4AEIAkignPgIwB0+AIgKIDKAwgEpEAKaRA8gHL4eAMXwAhAKqMifJoxp8Agq1YLuANXp0mbTt36CRaABKaJUmY0b4FUAE4QAzg+uJbASygBDfELdJPSFBungA2+IwItgBuHggOADT4RIE0bs7eUBC2AA5ZnihuEEj4AO4AFh5lpZ7OAGZZiGD4MEhgkfgoZQj4IZ4lzhC1HV3hKPndg-jMECF5kPhFdAhQZABG7RSJAEwADDsArDTiqG5hALKetlBVWwDM23sA7Ikl3a+23d7lMyEAngC0EBKSAQTQcMFWDjcYGCtl+CyGzE82VItls3l8-kCwTCAHF7DBsolklAqIl6rZXH98ABrJBA4o1ax2RzOBSuDzeVgIUL4egOMakKZZbJUAAUgBwCZgKLiAXAIAJQ0HjFABSARgl3hFB2Dx2z2G3RhHygKCyA0RMrQ+GR2XsUVBiXBqwAVssUB0IAb8AharU3W57SCnAjrfgPgBzNIodEFRYlNydL0RWDuApxa2tPmYa4BcPdaZwOBpKFFRKdbq2z0x7wObJ+QG+kM2ezB9mRTk+PwBIK8iLRWIJJIpfBizHdnHhSIxFYOeUeqaW-AOMqXBBlGZtWzmsPLLJNRYXK5VTb4XZ6haM-CVsP5byrGppGiMPwrBdcQCYBM5VjAoUHnGkd16UgmlNL1K1yBxQWtE0AwTNx00mMdsV7KcBy9aUuHwI03TNLDlmhKCE2qf9inLfB1gFfA-FROJ3UmDCrQCJokJ7MI+2ndMmLfNBPyXFcPnXEJN2cUDa3rQYhhYid2LQ0CiyQNwiwAL0+JB4VyUgTl5SZMiQWoQg8OihmoyJaJoNARmXVdtyklD+xnUpTIWYEoNWeEGJedcsKjdxv2A0NTTGMJJk2AAObV4gAFkeAA2PjrPnMiGPigSN0iAZiiya1VggGB3UPa5T3uU8niVVV1U1Sgtl1fUAgWWxwwCNwlPyQpin8Rpwk8P18CMS4ctsJJEgAGWG5gyXwCkqXhOkGWtZxGG67o+tsAaxB-Pw4mcWgEHtWZskQVBhTgbIAnhSVFp6laBoVTzKio9JfVOYJ-PjRNcsG3oGtolK1zS2xElxWhRAUId7QFQ6UEHUbmESTxww+KDQMrGI2gWbJIlapBw3wLw6yCqjSJGKaQ28WY6smAASLZ9h1PYdnnTJ7UGiAMZjPwcawDGkEghxzIqZxyeKEomTAGAJnKpANThKqHm1GgjCBXbIkSH0-Rg+1BBNCB1kGigYt1UKXgrTxoQRIYyNtF83FOsIuM8KA7HFpoTI+SixYlhYYE+iA6tAy7lv6rKdr21nIeO061Lh9InDccMQRAz0A96oO9ZGsaaAUd0yIcTxEA6RSEGN71UFMl3UE9MnfcZNFczIZB3TeqoAHUfrOXLUFN4oOHcRB0-Gu7CoA7rame8Ymibr3Bp7uICNQRIzlsGgAGkQjIBwlJoVvyKyexXiaSmKFuar6cm+xyFbyj25aMY-HwHvC-7+cUYI9HMYKbHceRBNeVApn2lZu-Dm3pMDc15vzACQsHrelRsgFYTQ3IZmaDzZY3soKViLE4LI8J6RCjFGRCUfAICkAVKUCoQ9nD0hKFhcWWtTS60oAbEqOwACciQWhr2DLpZmwFM4hDCFbbEtsMzlxopRB2Tt0w31OF6IhQoAIe3qrjIoPDQT80+NkbIBkvCrDXoTMR7oYyezInI7oAEKBbAAKRXnaAEKW5AsArBRITL0ysjqdHyI5Sapswh-xUZEd0Z0rxZFjJlC2IxBFBGEVxU68IyKux+oou+5R7peEgl6G02jPC6O6EYi8sjiHdCsvwg0HxuqonIt0CgoVrFswzPYzOgS1IF3zlbLKoEyKKLAOMEMJjClwxKblKGYxWjAMiTbXkLRNwFKFHATwvw4bZ0sjMCYKI2q9JGIrISKtKnKKQKo0RnoPrKMLIsKybtvQAEcNS+M9GRIZAomJjPcEI3kecO5GS9Lgw0sE2gIPhFQLYWwaD-HwLcfAoKOCsB4BwHgjB6C0EEBwegKg9B8CsNvVcoY2ihwOg3JcYw8wnMjr8JU3s8K4vDo8ol6xGrCy6MLDRKMoLHO-L+LaV5eiZWKEQ+0cAGFsOYTFMlg0tF1RFiJSuJp5qhjgCExqNL7A0naBSE5rhWI7l5LRHp0YAi5xgkUPmggeUQD5Qwig+ozxGy8Q3Mu+jK7FAUAjBA9cjqTDOJEPMg0uIcC5SGbkWQ6XNVanGBMVQZTQrEIUe+-E5krDypyMI0wch5FCSOCNPB5RwyvO4KIPTpizHRPMTIKb2aljIaZRBxzvj8IBAyKCTooQwk1IkZsrIXDti8Mya5aQ4KLGTaKF4uUhL4FcESyeGaXhhusFCnglTgE529jEGIn8G4JlJTOyNJRh0gQZZUzI+dq2CT+ICFyYIIRNthBu8QuRihQFmL+HGZEx07NeKUHdD1wSfA9ATEKRtqlsMijFLYv1JVegzb9QSwkXGOJXNjboqrQjBXCQgNwet-2hUA8Bz9zsRFe2GU8z+5y4hlVDLUGAtbEgwhCHlVyD5BxkQg8RqD6V30Uf3MCAKxDtJDF2PECgQH4gsOw8R7cBYSXHTlcURgpooA0kzukHc4IQifM6ABXVPMHahOLtu9j+AVya28IFHj1pNH2EwIpcY1I7ijtOAZM5-EEKIggKc6TsmaQ4aglxB5IyYTYyOLer097HDAMmM+z1Oz7lPRWFuPD2FtaxcmBB3TI71gHomOSiSsRYtcXi6aLcIqlwrPNtluLaGcIA3wIvFea84AbyHXpt2cdihq39IZpZ3QCiHqGMFx96iTmrE2k0A9EmUv7jZj0qZ7QyIdW6AoJSpBCqiEKA4IIcCi5DlJIkLKDgXOGnbHmtN5YPiDH6710L4T1Pok0wa4oAEnSumlX-AJXc9kfzzNiOI0dR1ZAQxR6kMJVs-kguXcDzrXWfI9d9b1mZfUUyGAGhqTUWrabw2RD4PaPjh0mJ4GAMJ-KjyxBqx5pBIZ1HPpungAyig40nmRG0doTNkQ0-qtNiCc6OZY4loYEGuJJRcySzOs7oFkW0cgSCEwhijzXggvK+BcH4F+Agd0xZcOnU0lDQC49GYC5C2myYcyUAVK4ogToEB9xDB-Ah9pZT3vkS0+2Xkfh1ZppfDRvzON7wmkdwIkE8AijBDLBCSIsAH3D0zAETo6JMCExd21I1EGVzpBCLtnosQUFNDqlgKMYzxhHVVcz232OhgxHRGEZ3-pFhu7x8AowRA1DEj0jR5ALU8MaTXUhuJIwJSDdsE0fSMBZT4FLz+IXkaxU83nA7THqkmg4oQPtEBOfP5cXpHtUp390wePdF4YocrNZR9yuGKo96-CJo6O4UIzge1yb+I6Lo2Quh94XV0cgh+YDH69EIWgoMGemt5JWDOLzHhp4GAHmtiJ-OWG-mUASJ-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-hZiUdZuCsifZsUIE-RC5lJqMD055qk-hhkx7v1qgy6tju4JGP4GaRiUjCuCro3B+qiPJD0osEIHHbYNLFqPWXsCwlREMN4MwGHp-E4c2XRI7L6WANGYg4RBXEgnnJxVBAcxDvOFgJpLup1pEHc2mrYZ1p6AVMeG86wi4mKq+GFiMOiyGI8-QS85QDi07RA1ixS7qIKgg6XEg-aqGGnUUJnodH8tYODuHKBAi5xV6Lc12Gizqpi-VVUHWXS3i70ASyhlhPc0MDSxQJSzQMkIRcFHOW7BjCaKU3Nty-iu6pg3hjg-6ggPgwpCjusljl3HafmVE1cLPt6L6G6CCvgPsBCiAIkCABgiiA4BgNgHgIQMAAADogAIy5TZAhsEDBsgBSkYyRv4AhvXAQCxAhuJCJupiO7xvRs7AUDxshvwwUmDPewAH2Biy3b-AsjZAOCpsJsgA7BbB5sgAFseBFtl45rm7-AGQ52bMABkGYlmYQYtOIRNNbIbeojbzboe8xbbkZM4o7dboUjbFItEcI87rCS7aQFt4YiQZQ0iK+mYuqmiHM872ojbpu7tZ+n8gAKASEz3p45xAED+UjpQ2nBlW-YOAADctmq2C+XKprER57wUbsJ7DbAbIbg28x8kCJyivIfbBk8cCd8kHMX7EH8Afg0HmQsHaeCHQoR5Ux3QSH2MJ7twjbTsaMGM0YKy8A+Afb6hxbYQjUn7WE7g89n8ybYQfbjHjk-CTH7HNHTJTIo8C+TQXMhavNs7cQX7fHnHgn8EI6Eng44FJ7kUZ7l7OMfbx9cIF2zZQVKl89UAtmIIZezgYoLh5GC+s4J7+wjbH2mMYQuiYAOM5d6ICWzgoKTWbQWk9nQkHZUnE2Dd-B2yW4X7tnbbDnTnRQuqrnPZ9ISAHnHe3njn1bHrtb+sjbh9UQ8IukAozzt2Cwc5t55EPneylEoKzndRsWN71ebQDgBAIsqIjoCA7wiQdYGMBkIIiQ8B-HuQ7waeIIJX0Y2JoSJ7jwpHhqg3eXoKQ7v8RajlkXLntJ+AVXgQ7uD73o-t0Y5+26tgNI87uwS7EA5ueGNIfgYATLlYZbmuy3d7NXBAYd7oC1J3n8E+UMX7ucP4DxzgfbmN7QtocNq4vFPID3pbQ3THuQgzMsDgvQH+ZQEx+7TQgBW0yHcraG6kIP2rX7sQuMZS5AfbtQ9gKkxQNXuJr3MZCc5IBPyA3X7R0Q-ezzCYiQ9o6nUTR303Km6tX7u+5PZ8E9UMjPCA27OacQU4X2+AzoecX3Yvv7HPTJ6Id8iz7bl3yXabIAWwubYHMbOsEinoF3oPS3t7q3tXuMccq4HFyvtbQKjbpA2ApwBHdmivev13hvBA9BvsYA26gY3i9BHgtmPHnXxCVtKH9goBHvVPtR3vBnizg4OF5paMo8DCfbUIIQNIX7dICYduUfqfCkVpqIrwlwvvKenPlwFHkvzzHZe3JHGvNoq4HH+XWNhOm7CPpb244fFJkvSJpw+fhuYQTv97Rvh0Md-HOUvwDgUdk03sCky4HZQ6O3uMswnQgvfbSG8ETQjUlIDcTH26A-0fxYcQUd6NTQzoLQhQiWtGtgeftgX7W-yAMdiQlNe-nXFQQk+Bg-fbzukeo-yCm4a-ZOX7mCKw-CAIP+zqDZIKS2ua3gUAkLo8oYe3FThrxoyYV+O26I7rr21YjgzOE-BMGgjnC99buS4PoFH265coM+dmQcKF1CB-87MyAqQsPmQAupKsWiX4NQMSCJ8Ju07XkNQKUaYUmOcqQbHonXCIAweHwVvpyFeiHcEEPnSXiNm3qoBzeIbGmOlwRJ-QR05GWwNnzQRX9xB+mJQVBnH5qCsBHwRIKZ09CEhBIAoMuPKCk7RY-s+g6dggCsFd0bB6gnAsYPfTm5LBctXRD73C78cEK2uVQc4PsFXhwafaHmPfgXxRBBezdDyoOG+7WD+OAoXkqPGwBoIeBaQAAX+2g4BCDB3QPHm4BSHAcUu8gmKI21OhsxJey-dBNAOcC4C1u2QCjNkAL5g9kQ7QTPsELZg5QeKTQr9mUMiCdCqK5dLuKxj7ZyFJOeyA5O0PaB9tehq0Sik33NwmcgykXIAVuAAD0ow2cD0N6ACgPAg4eoDIj7aYd-IMw+3OXyKGq9RuGvEEP0BmFG96hXg5cKFlFTy1N2wCaYS8new9D2w5uRNHcJeGPC2Ozwh4Vu2p7URkeOUdyn8OBFPDPBBkAEcz0ESfCd47lHNGCOxiUCf2gAkENB3uFwit2nPNZiwRLZojwwf-JqPUFSxvkQKdWELgbWAReA+8cg1Xouw17XAyAvw-jpUPmFK99e1XNbqdx-Cbcnc9IJHEHVxiv5fhWwmoAUEj7DFQgjoX4KgCqBNYkAqw55qsF1iddf2FGRwOgM9DhhthmwzlNKJ95u0U8CopUUplFr8dYuUQCjKXQXzSi9swXJRjCCCCnNxR7I4OpLxygjJz8qA0no-kuBxpKGMoktv908JMc74MQSjvx2jEBgbCwQeOI4BlFCMMmM4FDoUHbL+jqhRglwoDmTE7CDOjaEZDOA8G7ZkQVGZXBFlkGdc14uYIXkXTCotdIg5GQQf7wcCm5dhe3FhKUOVz2A141HYQWpy-Y1AgxKmYISumZ72BBgwCM0WkMxGZCIiAY7cBRwHGUNceMHEIPO1vpW9yskvPwEZw6DB4mO6ohPsaKLFhliEF-ELjUEtKI0HYNIZnpBFCA4wcUaEPtmeKmEXiZRzgdcJBC-YiCW6UEL8aKlzHy5lgGIjIUAJxHbDfxDvDHsgnBCaIQk6COCbsMBqbjlwLqFAFKMvFRM84CEwMehKgDOAVxiQJTucLrKNt6xc5ODkDyxorjeRK3PvgQHqDXieQlWVwaBPlA7jQOBAENvpE8QGiagTHEScGE46GiRYhgoXk4BZSDRdEDIELoaLexDCXR4ksieBLmRoxJg9Qo8DUCggaTOeEOHdr8DO645tEb3NgfRzn7zIiJYPAPpEHhCfjHRxw6oQSMCAKENswRKttR2mFwTfu1QncZXwEkgBzBC+d9Dt0HC6JpReg-wA5E-E-A3hrJSfiCLaHhSwg23GkNFLglxSKGpfJKZ-EIFihMgyqBYIGCNEZSEiGMfjvMQoiY9A6CQ0gBFPqBTJlKQgyzJD0QDs9P4LkhvmxyGCxclaBIZwIBw6lzIZYAY9ZDjgQF+B4Ab3XcK0EqidiF8duPqWpxDBDTIgI0pRkFFPGFS3xRRZKQi2eaYlJgW0tENBzGk7i4BoUwDjGR4F6c+INsOsJ-HvBogLOVGZ5nVkSDKoOy3XHxEx3rprxRG+mJiKaBmCS9yBDJHitJKCGH07cCAHtESBAROJ3QC+ZYEgODHWg0MX7fyfAEGyfxkhdgpjgjOARIyJ6eKeeKjLhroyNuFJLGZSBxnPEJ++UwCaANEENprJbbe6SuL-5PTIAZoR0ObQp5Qto+G4DmJL025wB2ZEfbXGKiFBZSRwOUW3oNGXCsxLOVE6zhr2QAnN0wfbadoTLGG1EmZcaC2k5P44UybYkML9gdWKAyc+8VPKLotz7YCDugds-jmv087OArZ2QDyTlyG5tQ7+G0vtvOLBmtB2uOMM2ZtBlh9tfZ-stgesmjlGdnJVySmZQIUhFSHY5s2OWnJth6iFgBwgTnUDk68Vs5ls5GR4Ok7FzWSwnc0tcBjmpzfZNswmGLBy4TgJu2UssAtyFkX4fEuEVgY+PSg7iShOs+mQHgM7fc5yGMgOufmbn4pXBI2M-nnOyA4CDerE4JM128jty-I6yRPlq2HZxIfiU0dKG9zejXA8w+fRPufLKD9DM8miS4PkB-BfsZ5m3ahgKPblvIH5MYZ+T9hdlMk6BMYM0F+3XBW5dBmSYINZSY6vyGZoCyCHDMl61EeYL8+mT73g6w9kp8YF5JzGRkty4FygzPDXk9B9tYEE5XBQ3B3GXC7pxCLKPaHIScIAZck+DINAZE7wYQYwzuUPwiI5R2FPAmhYNDoUeAJC4NCocaSwTtSv2nC3VKrL4W503ZTHU2FcHRC1B3Q0wkRaOLQx2BykGipReUhLh6zJeuszaMEIRo7iWRoUl8UeCrGLZUc-gPNI1FRzxloQ3YDbJ4HhL+AqGvIBwCP1tnZJU02CUzE2PmKILMBdg0cXlE9DOdIZdrHcPGSAjAJ4uXnfjvAXYL7IdqunWQZj1aCCi4qotQbmThiVh0jyJk7eWKnyZQV5uMwSRXU2ajAIB8ZsU3MMOUR7s3xu0AcFkoDkFLVURS2qbRG04wKPALlOOf7SXDNYr8vigaPkACUBBQgvwMMeXh5j5KN+fneZYTE6Ub9+Oa8FCjuN7Ea9XQrwEIKDKT7Mw4ZRA7XHDK-b7KF8oMv7kECul6c-+G0d+Ysu+nLKsIPwdvvMSdaJwfFAndsR6BH7JKn+Z3G-s4EEX3p0wrgyADxyH4eBfgEKyqfDTWmJ0nSEJAzv5QWEUTIJNiMITiqCAp5+OP3b1NQSjCf95xBIgUPAG6BXLDlqctfKtPVrztIoOwRtnL0OVu9Bw7XBAP8BXAUY347MdETeFODB8wQN85KYKw9HapgRZOJler1CnN0sOTob2PeFIg-EiIb-RlsqrqhlASg6kUSbrOmw-EmV-E2tp3OSmZBfC7QBTgXMUUeCzVn8VwQqpCAeDcRPvOGXAuSmJD0QeYSRSiy7BhA5kJkInAhmcr6l1ahS-hWfFQzH5s4PxJFUytum1t6uhqvVEit5q1CjebQOGkuB5B2to1qq1NSEl5qTB8e0a2Hkyu1mhTFFfcnmGmtRyrYugYsGXDouaXKU1ZqEDMczJrW1gi1tiw1GyKbWggdFSKvYX8DqWlyKhaGJFR0D9UeiFOTK0eaFNa7uyTiBcujm20Y68Tzh0UK3nGt7XrJrVGaggJcGux4V9WFsPddQWLVS5vyMa5JZcH8pMrzFtbItIUFIBrwt6-XeAsfxbrx5fVH69cF+rWY-qwqBc19YUgA3b07VGMhGMiCqBTysagg3OESm-VB0wqX7cDW5VAJpI7cJOP9TOrXgxAqaWGsADhuAR4bDURfHJISrnKxICNbS4jQpwJGFgQN+dHNXiUU7LAmVuy0KQMqgCJAuOifJqGMEh4dr0wR69bm6AZlMb5cT8jdUyBZyU02oX7ddbyC46Kbe0u2e2dvM267yigKmuTWptFg+Q3AempACgqk0+8ENVqsTc4APRGywAt4yXkSvY22kBsQ2K-iyWQmMC3uwm5abZvna0xG2NaOIKEG5Vix0Q1GjFWABqHry8BIW3OGvH+Bypc64KhhaHMjVpaTYCNBIYSC0Qy8EtYW5LZlrXBCKdGmiAyPrIgnUIi6pPQrUluyF2D+ObsuKa8IEpX9BIoWpLQgPPEubsuicxYOSrIQrJEt3KnrTskYHMCC+SsvtpwMjgWcOtI2orZWD9CxwigWHV4hqnnlHRE+eWyrZv062jaK2AuM-pLzZg2wn8WqchTtqKwqKLlw2zhEVsaCJoqxncWvv+PxhXbKZ4cXbRVsZXnD9gcqpNYduW0tDBoaiupHzIe1dbwtZfZmqzGUoibw1fbM7h-kjAChP+4IVoBIuh1Hbq+CFFrvBFfDRbJeuCfDfVu5VhsYsyOvOlUPNyg9Ftj2pLVTvbCi9oZfXIIRTv+AmzyAAYwYuaQmLjLcdRWtkUWG9Gcj56dOpXozph3-A1xVHcgN+GT4EpQNBs2dVfkC0mqQ2ehU4P8EC6Yl5xO7WGauAE08Uqe3m6kBJp10hBO2BM78S5v11zi5RBKtoGFpdHW7itfAxwhY1d0gymRN9VlSpV12F1waVKfLGMI915pEdrNd9hhqD027-+ACozu7RDxwZAcRScPf7sTXa7493OrQV6vE1xa1uHulnZD0z1x7FCx2-ZMgHgjWUCU77QLZWpfW57ccWZD4k0sY4zBjFFGyfFbpb0RLmtFjC3THsKEq99gi65vZXvx0RSl+Yi3bGXvfbMSbuxe3PdfyQCD9gsamIjOXp3CV7aiyJLLvPxBEF7Txue9WRnob0A6qFk+nxDyosaNa0E5ITAfCMMXXb3QJ+pfc713236H9OBE-RXtv3gaywUQZJYaipUAVx5QdREjvo91LyKkhwk7RUl2x3asU-+7-bruNB7hqepkEtJyzGA1ST9gW59Tnsr1A9kpZ3PwE9xxj4sI9uesg892lZxBAtPGm-brv-6-sYJERa3Z-o3ke7UdOMD-TEnsBWwVKC+t2AAbYPpCOD2IiIurKPafwSd9e8Q+gZt00qxDtByveuA1H5NTQqcxqPnDkOn7K9sXAvSodPkqGK2t4dsvx0DU269w7QfBUYcAPx6lDovSiSrxigsqrhzRXkJtonAqrspVknpH4d5ABGgZhIt4qEYCBdyIJUAXzVOJIg7D5iqOP0JuE7zijwaZceI5LLWU0kE0hqCiRUVSN2cwS-EGiI5vH6BA2Nfg-yG3oggJgAlARjmFiqgDzsYoQOwSaCDs78dijZeE9D2p5i-ZhsSDIiA8U+xg90o625iiMZVyLKsB+dN7uuGoJCEUWqpE4nZpmO5H5j+G9g1iOAFrGgSdgUEERDyXbH9NP2agoqQCNNKoEJaTVmyzeVQJXeMQwCWySbpbRgF80SCCgD11DywQqCVMP9o8Na6wpAJoZWqh+EGlnj6UKsW7sHARN4M7fWzTwbwFp1Ca8IaE1uFhN+6ej8-XmiNjRLhHTk+OLLvNy0xfgnikvX3eYezq0Rw4oBDiG0ZCm1sDIPUUWsW2sqjjHYc8VRfpg+KJh2T12FYCAscCfba+z26hhJ2NHILWSMkiacYsOE1AbkBpQUy4re5oIVTPMDk8KYLgoA9Eqpzk2su1OOUT18ELE7EbaPZ6QABp18GMb54rUmlEnNo03pz1aoviKJlfW6bZr8qplsWKFU1XKFzh6J4i3jv51wjnSigiSgoKEYnpCRJZfnd+OGa+a1bw4ju9rdeRDOFEPi7bfkvk3Apx6vTPSO05LxwoPE-TqqIlUaLYLeh3T1J8s+0i6BxMamjsD5B4K5S2MYQsCWLCjoDOsZF59cCYnEC3UeHr94HLlB5jZFyZeOMiewL8FCAGldUwkHoXnjoguRuzGZ+fWkOT0clpy85o+aAXMPVmOCZiavRDA6LPMMdWS7tuafcO1tL6ig99YOBnHyQcYjhzrnnCrY0asaswRzmMkYOxa+RRvdcI+ZsMQamRjwEEwpzl2TG51AW84Y8GZMhsoLDJgJL2kFXIWwCqFx9NaA+xrYmOUF7LuAex7HHDEjNEldjH978JK8jIXCzLygu2HmjO4KaeWhCN2xqC3XYCxAFg2P5fgC0jjf8DyzmkZEKFkldhZk1QWsyByyOc5rnJpnfOrmgcMlqkN7HoO220i29s2U8hH0fF20v8DUs7gNL9Eh8BRYtPwWXToJ-i63pczEJaKTFxRY1w40AyduwCCTchYH34ECYRl7C1CtzTpRhzd5ifUhds1KXFxnB5wB8FOhxN518F4gxZd0spb1kdYE0Ggn46kKOgLQoicpoUszh-gXI+cAlcWBJWmtzF8zdlbiDFa00RVlKyQoIh3IMrgOXTfkdKvIXJdicP+YlcMgpWGrvkJqzpcUsFXigVVnAuWCqL4XgraV-A7kj2rbj4LLBoK5ZbgBW4ft1FW3AeuROuXgrLnRi9VwXQucPMTRUJH1Zyu7Glx6QRa5BGWvGhVr5x+i9Ay3AVBGhPanLS5KOP4maMkIedqvUbZQXD6KmKoIeqL1G8oLWWBKXPzPykSQwkAaLgbmOPuighUFqWFuGSnlCpjX8HAqrTDVjCoLDgE7lRecLexsLDIkNfirapjX+LH2n+IXzKsOB-g7OiU4qu9iRhqGFNvaS0aOvlX6bYQXoJMvyx0XgrLW364mCJvU32bNNxPYLfg1qsV+1Nlo59Y6NxXFLQ9LxXBZV6hRILwV0ENiR8ODsVbtbUKIhYVs5XdsxOda4DYIAEXgVcrLLqgd1shtQogVw2xzbuuPDGhZrJAvHk+ujnHbNNoxSCHbAmXteLSxIHVSsXmlcKcLDa-xd9v0DyNtm0W8dsLBEiBEZQEfufhGFZiuL5+EO9cHjukk7c3N-xTjvoszKz1R0cS8FdLOl2d8YBnqQIbjvU3udoa0m1iRQnsXK7cLaK6rditQswBRPRmrI0qjGhUMPrQCb9maxMkAqagmVecMwzfXgrCnWW+cIvqNtXY6hJitaF9CKKmRLCOayAFi6Ah-O5Mx5NKo34hsAAvirzyW5d86jbZuOQiqCu8myH86MPCEgBb5hSBJ5pAdZPMAB+fACqDxxEoyIn934IPzmgHWeCCm4UtLmAQ1c7Apm9+2QCoDn2z7KXJtnWDUDpQ2oAbEAFEAoBoPIIG3UEO3DaAp4A2AAbRACugog-wagBYhAAABdM+0AA)