---
title: "API de moderação de conteúdo: construa uma a partir de perguntas tipadas"
description: "Como construir uma API de moderação de conteúdo em TypeSafe typed questions — verificações Noul por política, pontuação de severidade, roteamento por categoria, governança de limiares sob seu controle — comparado com endpoints de moderação genéricos."
section: cases
order: 215
tags: ['moderation', 'content-moderation', 'guardrails', 'cookbook']
translatedFrom: en
---
## Por que "um ponto de extremidade de moderação" é a unidade de compra errada

A maioria das plataformas vende moderação como um único ponto de extremidade com rótulos fixos: toxicidade, ódio, violência, sexual, autolesão. Isso é conveniente até a primeira vez que a definição de violação do seu produto difere da do fornecedor — um mercado que deve sinalizar tentativas de pagamento fora da plataforma, um chat de jogos onde "falar mal" é permitido, mas doxxing não é, um fórum de saúde onde perguntas sobre dosagem são o ponto.

A sua política de moderação é uma **decisão de produto**. A API que compra não deve codificá-la de forma rígida. O que realmente precisa é de uma forma de *expressar* a política — e de a alterar quando a política muda, sem re-treinar nada e sem esperar por um fornecedor.

Esta página mostra como construir moderação a partir de perguntas digitadas: cada regra de política é uma
pergunta, cada resposta carrega uma probabilidade, e os limiares — a política real —
vivem no seu código, versionados como código.

## A forma: uma solicitação por mensagem, perguntas por regra

Uma mensagem entra; uma solicitação carrega uma Noul question por regra de política mais uma Pontuação para a gravidade; as decisões saem. Não há segunda chamada e não há ponto de extremidade por regra para distribuir.

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

A política é a ditadura. Adicionar "sem aconselhamento médico" a um fórum de saúde é uma linha; ela é enviada com o seu próximo deploy, não com o próximo cartão de modelo do seu fornecedor.

## Os limites são a política — mantenha-os no seu código

Cada resposta do Noul é uma probabilidade. O que conta como uma violação é o limiar que você aplica a ela, e regras diferentes podem ter limiares diferentes:

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

Quatro resultados, cada um de sua propriedade:

- **pass** — entregar a mensagem
- **review** — fila humana, a maneira mais barata de reduzir falsos positivos
- **block** — impor
- **escalate** — a pontuação de severidade ultrapassou o limite, por exemplo, questões legais ou confiança e segurança

Compare isso com um endpoint de moderação que retorna seus próprios rótulos de categoria e uma
flag. Você pode ajustar exatamente uma coisa: o limite da flag. Os rótulos, suas definições,
e sua calibração são de uma implementação de outra pessoa.

## Por que as probabilidades importam mais do que os rótulos

Uma flag booleana descarta a informação de que você precisa para operar um sistema de moderação:

**Você pode medir a fronteira.** A parcela de decisões que caem entre 0,6 e 0,9
*é* a sua carga de trabalho de revisão humana. Esse número é legível antes do lançamento, não depois de
uma pilha de escalonamentos. [Teste de consistência própria](/en/cases/consistency-choice-cookbook/)
estende isso: execute posts de fronteira através do rubro repetidamente e verifique se
os rótulos se mantêm estáveis — a oscilação de rótulos é o assassino silencioso da moderação automatizada.

**Você pode filtrar com base na confiança como qualquer outra decisão no pipeline.** O mesmo
padrão de [roteamento por confiança](/en/patterns/confidence-routing/) usado para classificação
se aplica inalterado: atuações de alta probabilidade, revisões de baixa probabilidade, e a divisão é um
número que você escolheu.

**Você pode verificar o verificador.** Como cada regra é uma pergunta separada com uma
distribuição, você pode reservar exemplos rotulados por regra e medir a precisão por
regra — em vez de descobrir por meio de um ciclo de notícias que uma categoria oculta estava
falhando.

## Onde isso se situa ao lado dos guardrails de entrada

[Guardrails for LLMs](/en/cases/llm-guardrails/) cobre o caso específico de LLMs:
filtragem de prompts e conclusões por violações e saídas prejudiciais em torno de uma chamada de modelo. O sistema de moderação descrito aqui é a superfície de produto mais ampla — mensagens de usuários, perfis, listagens, avaliações — onde as regras vêm dos seus termos de serviço, e não da segurança do modelo. A mesma primitiva, diferente autor das regras. Muitos produtos acabam executando ambos: moderação de produto no conteúdo do usuário, guardrails em torno do modelo.

## Sistemas de moderação reais construídos dessa forma

- [Jev-Moderation-Bot](https://github.com/brainstormity/Jev-Moderation-Bot) — um bot do Discord onde Jev verifica links de spam e golpes, com regras de escalada de aviso e tempo de espera mantidas localmente
- [mastra-jev-moderation](https://github.com/CodeAlive-AI/mastra-jev-moderation) — moderação de entrada para agentes Mastra no Jev TypeSafe, em um único arquivo

## Construa

- [Visão geral das primitivas](/en/primitives/) — Noul e Score em detalhes
- [Referência da API HTTP](/en/sdk/http-api/) — formas de solicitação/resposta
- [Cercas de segurança para LLMs](/en/cases/llm-guardrails/) — a variante voltada ao modelo
- [Autoconsistência: escolhas](/en/cases/consistency-choice-cookbook/) — teste de estresse da estabilidade de rótulos
- [Mapa de casos de uso](/en/cases/use-case-map/) — moderação e conformidade entre os outros cenários