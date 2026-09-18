---
title: "Paralelismo Fan-out"
description: "Envie uma grande quantidade de perguntas (incluindo as especulativas) em uma única chamada, e deixe que o código determine quais são relevantes."
section: patterns
order: 50
tags: ['fan-out', 'latency', 'cost']
source: docs.typesafe.ai/patterns/fan-out
translatedFrom: zh
---

## O que este padrão resolve

A abordagem tradicional é «classificar primeiro, e depois decidir o que perguntar em seguida com base no resultado da classificação». Isso requer chamadas em série: só sabes o que perguntar na segunda chamada depois de receberes o resultado da primeira, o que acumula latência.

O padrão Fan-out (disparo em paralelo) faz o oposto: **envia todas as perguntas possíveis de uma só vez**, e é o teu código que decide ignorar quais com base nos resultados da classificação. Como o modelo lê o estado apenas uma vez e avalia todas as perguntas em paralelo, o custo marginal de fazer mais perguntas é extremamente baixo.

## Mecanismos chave

Estes três factos são a base para a validade do padrão Fan-out:

1. O modelo **lê o estado apenas uma vez** e avalia todas as perguntas em paralelo.
2. **Cada resposta é independente** — a resposta a uma pergunta não se torna um contexto oculto para outra pergunta.
3. O orçamento de contexto é de 64k tokens (estado + todas as perguntas) ou 32k tokens (estado + a pergunta individual mais longa).

O ponto 2 é particularmente importante: garante que enviar perguntas não relacionadas em conjunto não contamina as respostas das perguntas relevantes.

## Exemplo: Triagem de Tickets

Precisas processar tickets de suporte ao cliente, mas tipos diferentes de tickets exigem julgamentos completamente diferentes. Em vez de classificar primeiro e depois fazer perguntas de acompanhamento, pergunta tudo de uma vez.

### Passo 1: Fazer todas as perguntas de julgamento numa única solicitação

```json
{
  "questions": {
    "category": {
      "type": "choice",
      "instructions": "What kind of request is this?",
      "criteria": {
        "bug_report": "Reporting something broken",
        "billing": "Payment, invoice, or refund matters",
        "feature_request": "Asking for new functionality"
      }
    },
    "bug_severity": {
      "type": "score",
      "instructions": "How severe is the reported issue",
      "criteria": [
        "Cosmetic; no impact to functionality",
        "Broken or degraded feature; workaround exists",
        "Blocking issue; no workaround exists"
      ]
    },
    "has_reproducible_steps": {
      "type": "noul",
      "instructions": "The user describes specific steps to reproduce the issue"
    },
    "refund_requested": {
      "type": "noul",
      "instructions": "The user is explicitly asking for a refund or credit"
    },
    "frustration": {
      "type": "score",
      "instructions": "How frustrated the user appears",
      "criteria": ["Calm, matter-of-fact", "Frustrated but civil", "Very angry"]
    }
  }
}
```

Aqui, `bug_severity` e `has_reproducible_steps` só fazem sentido se o ticket for um relatório de bug; `refund_requested` só faz sentido sob problemas de faturação. **São perguntas especulativas** — mas como fazer mais perguntas não tem custo de velocidade, envia-as todas antecipadamente.

### Passo 2: Roteamento via código

```python
category = response.answers["category"]
bug_severity = response.answers["bug_severity"]
bug_repro = response.answers["has_reproducible_steps"]
refund = response.answers["refund_requested"]
frustration = response.answers["frustration"]

if category.choice == "bug_report":
    if bug_severity.score > 1.5 and bug_repro.noul > 0.6:
        escalate_to_engineering(ticket_id, severity="high")
    else:
        add_to_bug_backlog(ticket_id)

elif category.choice == "billing":
    if refund.noul > 0.7:
        route_to_billing_with_flag(ticket_id, refund_likely=True)
    else:
        route_to_billing(ticket_id)

elif category.choice == "feature_request":
    log_feature_request(ticket_id)

# A frustração é útil independentemente da categoria
if frustration.score > 1.5:
    flag_for_priority_response(ticket_id)
```

**Toda a informação necessária para a árvore de decisão completa vem de uma única chamada.** As perguntas especulativas são ignoradas quando não são relevantes e poupam uma ida e volta quando são relevantes.

## Pontos de design

**Pergunta tudo primeiro, filtra depois.** Adia a decisão de «quais perguntas valem a pena fazer» para depois da chamada. Antes da chamada, não sabes o resultado da classificação e, portanto, não podes decidir; depois da chamada, tens as respostas, e a filtragem torna-se uma simples ramificação de código.

**Atenção ao orçamento de contexto.** Os 64k referem-se ao estado mais **todas** as perguntas. Se fores fazer fan-out de centenas de perguntas (por exemplo, avaliar um conjunto de documentos individualmente), o estado crescerá rapidamente. Nesse caso, deves dividir em múltiplas solicitações ou considerar [o uso em lote do Score](https://docs.typesafe.ai/patterns).

**Distingue entre «especulativo» e «redundante».** Perguntas especulativas são aquelas que têm um significado claro **mesmo sob outros ramos**. Se a resposta a uma pergunta nunca for lida em nenhum ramo, não é especulativa, é desperdício — embora o custo seja baixo, isso torna o código confuso.

**Combina com roteamento por confiança.** O Fan-out resolve «o que perguntar», e o roteamento por confiança resolve «em que acreditar». A combinação dos dois é uma forma comum em sistemas de produção: vê o exemplo do banco de voz no [roteamento por confiança](/zh/patterns/confidence-routing/).

## Relacionados

- [Primitivos de Pergunta](/zh/primitives/) — Independência e perguntas especulativas
- [State](/zh/concepts/state/) — Orçamento de contexto e organização do state
- [Roteamento por Confiança](/zh/patterns/confidence-routing/) — O segundo eixo de decisão
