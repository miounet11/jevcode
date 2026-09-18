---
title: "Visão geral dos primitivos de problema"
description: "As três categorias de problemas tipados: Choice, Score e Noul — o que cada uma retorna e como escolher."
section: primitives
order: 10
tags: ['primitives', 'choice', 'score', 'noul']
source: docs.typesafe.ai/primitives
translatedFrom: zh
---

## As primitivas aparecem em pares

As primitivas do TypeSafe são pequenos componentes tipados que você combina no código. Elas aparecem em pares:

- **Pergunta (question)**: Define uma decisão que o modelo do System One deve tomar sobre o **estado**.
- **Resposta (answer)**: O valor tipado retornado pelo modelo.

Você combina essas respostas no código para tomar decisões. Existem três tipos de perguntas, cada um retornando respostas com estruturas diferentes.

| Tipo | O que responde | Retorna |
| :--- | :--- | :--- |
| [Choice](/zh/primitives/choice/) | Qual opção escolher? | `choice`, `probabilities`, `confidence` |
| [Score](/zh/primitives/score/) | Em qual categoria se encaixa? | `score`, `legend`, `probabilities`, `confidence` |
| [Noul](/zh/primitives/noul/) | Isso é verdadeiro? | `noul` (0 a 1) |

Você pode fazer apenas uma pergunta ou enviar várias de uma vez. Cada pergunta é avaliada independentemente.

## Como escolher a primitiva

A chave para escolher a primitiva é observar a **forma da decisão**, e não o domínio de negócios:

- **O conjunto de candidatos é finito e mutuamente exclusivo** → Choice. Exemplos: classificação de tickets, identificação de intenção, escolha de ação.
- **Existe uma dimensão ou gradiente de qualidade ordenado** → Score. Exemplos: relevância, gravidade, satisfação.
- **Você precisa apenas de uma decisão Sim/Não, permitindo ambiguidade** → Noul. Exemplos: "Este conteúdo viola as regras?", "O usuário está solicitando um reembolso?".

Um erro comum é usar Score para o que deveria ser Choice. Se não houver uma relação de ordem real entre as categorias (como "Fatura / Suporte Técnico / Vendas"), use Choice. Forçar o uso de Score introduz uma semântica ordinal falsa, tornando as verificações de limiar subsequentes sem sentido.

Por outro lado, se existir um gradiente contínuo, usar Score é mais eficiente do que compor múltiplos Noul, pois o Score fornece a distribuição completa de uma vez.

## Duas propriedades-chave das respostas

**Cada resposta é restrita às opções que você forneceu.** O modelo retorna uma distribuição de probabilidade sobre as opções ou categorias que você definiu, nunca gerando valores fora desse conjunto. Isso significa que não é necessário extrair o valor a partir de texto gerado no código — esta é a diferença fundamental entre o Jev e a abordagem de "fazer o LLM produzir JSON e analisá-lo".

**Cada resposta é independente.** A resposta de uma pergunta não se torna um contexto oculto para outra pergunta. Essa restrição garante que:

- A ordem de avaliação das perguntas não afeta os resultados;
- É seguro fazer muitas perguntas de uma vez (incluindo aquelas que só fazem sentido em certos ramos), sem se preocupar com contaminação mútua;
- A semântica de cada resposta pode ser testada e verificada isoladamente.

A segunda propriedade traz uma implicação muito prática: **perguntas especulativas (speculative questions) são praticamente gratuitas**. Por exemplo, em um cenário de tickets, `bug_severity` só faz sentido se o ticket for um relatório de bug, e `refund_requested` só faz sentido para problemas relacionados a faturas. No entanto, colocá-los todos antecipadamente na mesma solicitação não causa perda de velocidade — o modelo avalia todas as perguntas em paralelo, e você lê apenas a resposta necessária quando precisar.

## Fazer várias perguntas de uma vez

```json
{
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
  "frustration": {
    "type": "score",
    "instructions": "How frustrated the user appears",
    "criteria": ["Calm, matter-of-fact", "Frustrated but civil", "Very angry"]
  },
  "refund_requested": {
    "type": "noul",
    "instructions": "The user is explicitly asking for a refund or credit"
  }
}
```

Uma única chamada retorna três respostas independentes. O código faz a roteamento com base no `intent` e, em seguida, lê os campos necessários a partir dos resultados já obtidos.

## Avançado

- [Uso avançado de primitivas](/zh/primitives/advanced/) — Como escrever `criteria`, técnicas de redação e tratamento de casos limite
- [Padrão Fan-out](/zh/patterns/fan-out/) — Como agrupar muitas perguntas em uma única solicitação
- [Confiança](/zh/concepts/confidence/) — Como usar `confidence` e `probabilities` para controlar o comportamento
