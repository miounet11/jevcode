---
title: "Roteamento de intenção"
description: "As solicitações classificadas são roteadas para o processador mais adequado: lógica determinística, LLM dedicado ou humano."
section: patterns
order: 20
tags: ['routing', 'classification', 'cost']
source: docs.typesafe.ai/patterns/intent-routing
translatedFrom: zh
---

## O que este padrão resolve

Nem todo pedido de usuário requer o mesmo processador. Alguns podem ser respondidos com uma única consulta ao banco de dados; outros exigem um LLM com contexto de domínio; e outros ainda devem ser tratados manualmente.

O TypeSafe pode ser posicionado **à frente** de todos esses processadores, atuando como uma camada rápida e econômica de classificação, decidindo qual processador deve ser acionado.

**Motivação central de custo**: Em vez de enviar cada mensagem para um LLM caro para determinar o tipo de pedido, classifique primeiro e, em seguida, roteie com base no tipo.

## Exemplo: Roteamento de Atendimento ao Cliente

Imagine um sistema de atendimento ao cliente, onde as mensagens recebidas precisam ser roteadas para o processador correto.

### Passo 1: Classificar intenção e complexidade

Uma única solicitação pode perguntar simultaneamente sobre intenção, complexidade e vários critérios auxiliares:

```json
{
  "questions": {
    "intent": {
      "type": "choice",
      "instructions": "The primary intent of this customer message",
      "criteria": {
        "order_status": "Asking about an existing order",
        "product_question": "Asking about a product before buying",
        "return_exchange": "Wants to return or exchange something",
        "complaint": "Unhappy about an experience"
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

### Passo 2: Roteamento com base nos resultados da classificação

```python
intent = response.answers["intent"]

if intent.choice == "order_status":
    # Lógica determinística é suficiente: consultar o banco de dados
    lookup_order_status(state["order_id"])

elif intent.choice == "product_question":
    # Requer contexto de domínio: enviar para um LLM com base de conhecimento
    answer_with_catalog_llm(state)

elif intent.choice == "return_exchange":
    start_return_flow(state["order_id"])

elif intent.choice == "complaint":
    # Alto risco: transferir para um agente humano
    route_to_human_agent(state)
```

## Por que classificar primeiro economiza dinheiro

A chave é **reservar o processamento caro para os pedidos que realmente o necessitam**.

Suponha que 70% das mensagens de atendimento ao cliente sejam do tipo `order_status`, que podem ser resolvidas com uma única consulta ao banco de dados. Se todas as mensagens forem enviadas primeiro para um modelo grande, você paga o custo do LLM para esses 70%, embora não precisassem disso. Ao realizar uma classificação Choice econômica primeiro, esse volume de tráfego pode ser desviado.

Este é exatamente o [Padrão Fan-out](/pt/patterns/fan-out/): classificar, avaliar a gravidade, verificar se há solicitação de reembolso e analisar o estado emocional em uma única chamada, pois fazer mais perguntas não gera custo de latência.

## Pontos de design

**A saída da classificação deve ser diretamente utilizável.** O valor de `intent.choice` deve poder ser usado diretamente como chave na tabela de roteamento, sem necessidade de processamento adicional de strings.

**A granularidade da classificação determina a complexidade do sistema.** Poucas categorias resultam em roteamento sem distinção; muitas categorias reduzem o número de amostras por categoria, diminuindo a precisão. Comece com 4 a 6 categorias.

**Envie julgamentos especulativos em conjunto.** No exemplo acima, `bug_severity` e `has_reproducible_steps` só fazem sentido para certas intenções, e `refund_requested` só é relevante em cenários de reembolso. Enviá-los todos antecipadamente tem um custo quase nulo. Este é o valor do [Fan-out paralelo](/pt/patterns/fan-out/).

**Use a confiança para um segundo controle de acesso (gate).** Se `intent.confidence` estiver baixa, isso indica que a classificação em si não é confiável. Nesse caso, não se deve rotear cegamente, mas sim transferir para um humano ou solicitar esclarecimentos. Consulte [Roteamento por Confiança](/pt/patterns/confidence-routing/).

**Mantenha uma categoria de fallback.** Adicione opções como `other` à classificação, para que pedidos que não correspondam a nenhum tipo de processador tenham um destino, em vez de serem forçados à categoria mais próxima.

## Relacionado

- [Choice](/pt/primitives/choice/) — O primitivo fundamental deste padrão
- [Fan-out paralelo](/pt/patterns/fan-out/) — Fazer todas as perguntas auxiliares de uma vez
- [Roteamento por Confiança](/pt/patterns/confidence-routing/) — O que fazer quando a classificação não é confiável
- [Composite Scoring](/pt/patterns/composite-scoring/) — Um padrão complementar necessário para ordenação
