---
title: "LLM structured output: JSON mode, function calling, e typed decisions"
description: "Opções de saída estruturada para aplicativos LLM comparadas — modo JSON, decodificação com restrições de esquema, chamada de função e perguntas tipadas TypeSafe — com modos de falha, custo e quando uma primitiva de decisão de conjunto fechado supera a solicitação de um modelo para emitir JSON."
section: cases
order: 205
tags: ['structured-output', 'json-mode', 'function-calling', 'comparison']
translatedFrom: en
---
## O problema que toda app de LLM enfrenta

Um LLM retorna prosa. Sua aplicação precisa de dados: uma categoria, um número, um booleano, uma estrutura. Tudo o que vem a seguir — roteamento, armazenamento, painéis, novas tentativas — depende dessa prosa se tornar uma saída analisável e válida **todas as vezes**, e não a maioria das vezes.

O nome do setor para isso é **saída estruturada**, e agora existem quatro maneiras principais de obtê-la. Elas diferem no que garantem, no que custam e no que quebra.

## As quatro opções em resumo

| Abordagem | Como funciona | Garantia | Modo de falha | Custo relativo |
| :--- | :--- | :--- | :--- | :--- |
| **Prompting para JSON** | Peça ao modelo para "responder em JSON" | Nenhuma — é uma sugestão | Vírgulas finais, prosa ao redor do JSON, campos inventados | 1x geração (pode ser longo) |
| **Modo JSON / response_format** | Sinalizador da API que restringe a saída para JSON válido | Sintaxe JSON válida | JSON válido com a forma ou tipos errados; derivação de esquema | 1x geração |
| **Decodificação com restrição de esquema** | Restrições de gramática/regex aplicadas durante a amostragem de tokens | Sintaxe *e* forma correspondem ao esquema | Preenchimento de campos plausíveis, mas semanticamente incorretos; precisa de suporte do servidor | 1x geração + complexidade de serviço |
| **Chamada de função** | O modelo escolhe uma função declarada e seus argumentos | Argumentos validados contra sua assinatura | Valores de argumento alucinados fora dos enums; fragilidade em múltiplos passos | 1x geração |
| **Perguntas tipadas (TypeSafe)** | Escolha de conjunto fechado / Pontuação / Perguntas Noul sobre seu estado | Resposta tipada + distribuição de probabilidade completa + confiança, em uma única passagem | Apenas o que você não perguntou — perguntas não feitas não podem alucinar | Apenas entrada de token; **a saída é gratuita** |

Os quatro primeiros compartilham uma propriedade que vale a pena ser honesto sobre: **o modelo ainda gera o token da resposta token por token.** Cada garantia acima é uma faixa de proteção em torno da geração, não uma substituição para ela. O quinto substitui a geração por uma única passagem direta que emite uma distribuição sobre um conjunto fechado que você definiu.

## Por que conjuntos fechados alteram o perfil de falha

Com o modo JSON, um campo como `"priority": "high"` pode retornar como `"High"`, `"HIGH"`,
`"priority_high"`, ou `2`. Você escreve o validador, o loop de retry e o fallback.
Com o decodificação restrita por schema, a forma está correta, mas nada verifica se o *valor*
é o julgamento certo — uma estrutura perfeitamente formatada ainda pode conter uma resposta errada,
e você não tem sinal de quão certo o modelo estava.

Uma pergunta tipada adota a abordagem oposta: o espaço de resposta é fixado antes de a solicitação existir.

```python
from typesafe_sdk import AsyncTypeSafeClient, Choice

async def main() -> None:
    async with AsyncTypeSafeClient() as client:
        response = await client.system_one(
            state=ticket_text,
            questions={
                "priority": Choice(
                    instructions="Which priority does this ticket have?",
                    criteria={
                        "p0": "Outage or data loss, all users affected",
                        "p1": "Major feature broken, workaround exists",
                        "p2": "Minor issue, scheduled work",
                    },
                )
            },
        )

    answer = response.answers["priority"]
    print(answer.choice)                            # "p1"
    print(answer.confidence)                        # 0.93 — route on it directly
```

O que você recebe de volta não é uma string para analisar. É um **valor tipado com uma distribuição de probabilidade sobre exatamente as opções que você declarou** — `p0: 0.02, p1: 0.93, p2: 0.05` —
mais um número de confiança. Não há JSON para validar, não há enum para normalizar, não há loop de
tentativa para saída malformada, porque saída malformada não pode ser produzida.

## Como isso se parece na prática

**Chamada de função com argumentos enum.** Se as assinaturas das suas funções já usam
`Literal` tipos, esses conjuntos fechados mapeiam um-para-um para perguntas Choice — veja o
[cookbook de chamada de função](/en/cases/function-calling/) para um exemplo completo de assistente de negociação
onde linguagem natural se torna chamadas tipadas com confiança por argumento.

**Pipelines de extração.** Para extrair valores de documentos, o mapa de perguntas *é*
o esquema — uma entrada por campo, com a semântica definida exatamente uma vez. O
[cascata de extração de dados estruturados](/en/cases/sde-cascade/) mostra uma versão de duas etapas
com uma etapa de verificação.

**Guardrails and classification.** Yes/no checks (is this a jailbreak? does this
contain PII?) are Noul questions — a probability, not a parsed string. See
[guardrails for LLMs](/en/cases/llm-guardrails/).

**Tratamento da incerteza.** A distribuição de probabilidades é a parte que o modo JSON não pode
fornecer. [Classificação usando confiança](/en/cases/classification-using-confidence/)
e [roteamento com porta de confiança](/en/patterns/confidence-routing/) mostram o que ela permite:
aceitação automática acima de um limite, revisão humana abaixo, medido nos seus próprios dados.

## A tabela honesta de compensações

| | Modo JSON / chamada de função | Perguntas tipadas |
| :--- | :--- | :--- |
| Geração de texto aberto | Sim — o esquema pode conter strings livres | Não — as respostas vêm de conjuntos fechados |
| Validade da saída | Validada após a geração | Garantida pela construção |
| Sinal de confiança | Às vezes (logprobs, se expostos) | Sempre — distribuição completa por pergunta |
| Motor de custo | Tokens de saída gerados | Apenas tokens de entrada (saída gratuita) |
| Alterações no esquema | Editar o esquema JSON, re-prompt | Editar o mapa de perguntas, mesma forma de solicitação |
| Melhor para | Rascunhos, resumos, texto criativo com alguma estrutura | Decisões: classificação, roteamento, pontuação, verificação |

As duas abordagens são complementares, não concorrentes. Um pipeline que precisa de um *brief* gerado *e* de uma decisão de roteamento paga pela geração uma vez, e toma a decisão com uma pergunta tipada em vez de analisá-la no mesmo JSON.

## Começando

- [Visão geral de primitivos](/en/primitives/) — Escolha, Pontuação, Noul e quando cada um se aplica
- [Referência da API HTTP](/en/sdk/http-api/) — as formas de solicitação/resposta
- [Início rápido](/en/quickstart/) — primeira pergunta tipada em cinco minutos
- [Playground](/en/playground/) — experimente perguntas contra o estado atual, sem cadastro

## Relacionados

- [Chamada de função](/en/cases/function-calling/) — linguagem natural para chamadas de função tipadas
- [Extração em cascata de dados estruturados](/en/cases/sde-cascade/) — extração em duas etapas com verificação
- [Roteamento com limite de confiança](/en/patterns/confidence-routing/) — o padrão que a distribuição permite
- [Mapa de casos de uso](/en/cases/use-case-map/) — onde cada primitivo aparece na produção