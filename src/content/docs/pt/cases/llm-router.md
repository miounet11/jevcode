---
title: "Roteador de LLM: escolher o tratador com uma decisão tipada"
description: "Como enviar cada pedido a um modelo ou a uma pessoa. Sempre o maior modelo, regras de palavras-chave, um roteador por embeddings, um modelo de chat que nomeia um rótulo, e um choice do clavue-jev mais uma pergunta de confidence. O programa ramifica nessa opção."
section: cases
order: 235
tags: ['llm-router', 'model-routing', 'routing', 'comparison']
translatedFrom: en
---

## A decisão à frente do modelo

Um roteador de LLM não responde ao usuário. Ele escolhe o tratador que responde. A mesma caixa tem uma correção de erro de digitação, uma pergunta de desenho e uma mensagem que deve ir para uma pessoa. Enviar as três ao maior modelo funciona. A correção de digitação paga o preço do modelo grande.

Isto é procurado como **roteador de LLM** e **roteamento de modelos**. O que se escolhe é um conjunto fechado que você já nomeou: um modelo pequeno, um modelo grande, uma consulta, uma pessoa. Essa escolha é um valor no qual o programa pode ramificar.

## Cinco formas de obter a rota

| Abordagem | Como a rota é escolhida | O que pode falhar | O que você paga |
| :--- | :--- | :--- | :--- |
| **Cada pedido para um só modelo** | Não há roteador | Tarefas pequenas pagam o preço do modelo grande | Esse modelo, toda vez |
| **Palavras-chave ou regex** | Uma lista de palavras aponta para um tratador | Uma paráfrase não cai na lista | Nada a mais na hora do pedido |
| **Roteador por embeddings** | A descrição de rota mais próxima vence | As descrições se afastam dos tratadores | Uma chamada de embedding, mais o índice |
| **Um modelo de chat nomeia o rótulo** | Você pede que ele responda com um nome | O nome pode ficar fora do conjunto, ou chegar envolvido em prosa | A entrada e a saída desse modelo |
| **Choice tipado (clavue-jev)** | Um `choice` sobre os tratadores listados, mais uma pergunta `confidence` | Só pode devolver um tratador que você listou | Tokens de entrada após uma chamada bem-sucedida. A saída é grátis |

Regras de palavras-chave bastam quando as palavras não mudam. Um roteador por embeddings cabe quando você já mantém as descrições de rota. Um modelo de chat cabe quando a rota em si tem de ser uma frase. Um choice tipado cabe quando a rota é um de poucos tratadores e a linha seguinte tem de lê-la.

## O pedido que este site aceita

```http
POST https://api.jevcode.ai/v1/judge
Authorization: Bearer jev_...
Content-Type: application/json
```

```json
{
  "state": "Rename this function and add a test. Do not change behavior.",
  "questions": {
    "route": {
      "type": "choice",
      "instructions": "Which handler should run this request?",
      "options": ["small_model", "large_model", "human"]
    },
    "sure": {
      "type": "confidence",
      "instructions": "How sure is that routing judgment?"
    }
  }
}
```

`state` é texto, de 8 a 4000 caracteres. `questions` tem no máximo seis. As chaves começam com uma letra minúscula. Um choice pode enviar `options` ou um mapa `criteria`. Este servidor dobra `options` em criteria antes de o modelo vê-los.

A cobrança é por tokens de entrada após uma chamada bem-sucedida. A saída é grátis. Os números estão em [preços](/pt/pricing/).

Uma resposta nomeia o modelo e devolve cada resposta sob a mesma chave:

```json
{
  "model": "clavue-jev",
  "answers": {
    "route": { "choice": "small_model" },
    "sure": { "noul": 0.78 }
  }
}
```

`route.choice` é uma das opções que você enviou. `sure.noul` é um número de 0 a 1 e vem da pergunta de confidence. Esta API não esconde uma confidence dentro do choice. O `0.78` acima mostra a forma do campo. Não é uma precisão medida, e este site não publica um limiar único.

Ramifique nos dois campos. O limiar é seu:

```python
route = body["answers"]["route"]["choice"]
sure = body["answers"]["sure"]["noul"]
cutoff = 0.8  # troque por um limiar medido no seu próprio tráfego

if sure < cutoff or route == "human":
    hand_to_human(state)
elif route == "small_model":
    call_small(state)
else:
    call_large(state)
```

Uma rota errada para uma ferramenta que gasta dinheiro pede um limiar mais alto do que uma rota errada para uma linha de log. Leia um lote do seu próprio tráfego em [comparar](/pt/compare/) ou [experimentar](/pt/try/) antes de fixar o número. O raciocínio está em [confidence](/pt/concepts/confidence/).

O mesmo pedido pode levar mais quatro perguntas. Uma rota, uma pergunta de confidence e algumas de sim/não cabem sob o teto de seis. [Fan-out](/pt/patterns/fan-out/) tem essa forma.

## O que o roteador não faz

Ele não escreve a resposta. O tratador que você escolheu escreve.

Ele não inventa um tratador. Se o certo não está em `options`, o choice ainda devolve um dos nomes que você enviou. Acrescente o tratador, ou acrescente um `noul` que pergunte se algum tratador listado serve, e mande o erro para uma pessoa.

A escrita aberta fica num modelo de texto. O roteador decide qual modelo de texto roda, ou se uma pessoa deve ver o pedido primeiro. Quando o texto volta, outra chamada pode perguntar se é seguro agir sobre ele. Essa segunda chamada é uma [proteção](/pt/cases/llm-guardrails/), não parte da rota.

## Onde essa forma já aparece

O [mapa de casos de uso](/pt/cases/use-case-map/) agrupa projetos públicos que escolhem um modelo com um choice do Jev: roteadores de tarefas de código, um roteador baseado em LiteLLM, um roteador por pedido para um agente de código, e um proxy local que escolhe modelo e nível de esforço. A forma comum é um choice antes da chamada cara. Esta página não acrescenta pontuações para esses projetos.

O [roteamento por intenção](/pt/patterns/intent-routing/) é a mesma decisão, dirigida a uma fila de suporte em vez de a um modelo.

## Para começar

- [API](/pt/api/) — `POST /v1/judge`, o pedido e a resposta
- [Experimentar](/pt/try/) — o caminho anônimo, sem chave
- [System One](/pt/concepts/system-one/) — state, perguntas e o nome do modelo na resposta
- [Confidence](/pt/concepts/confidence/) — a segunda pergunta, e quem define o limiar
- [Preços](/pt/pricing/) — tokens de entrada, saída grátis

## Relacionado

- [Saída estruturada](/pt/cases/structured-output/) — quando o que você precisa é um valor tipado, não uma rota
- [Fan-out](/pt/patterns/fan-out/) — várias perguntas sobre um state
- [Proteções para LLMs](/pt/cases/llm-guardrails/) — a checagem depois que um modelo de texto escreve
- [Mapa de casos de uso](/pt/cases/use-case-map/) — os projetos públicos
