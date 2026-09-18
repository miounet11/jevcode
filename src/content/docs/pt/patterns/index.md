---
title: "Padrão de arquitetura"
description: "Padrões de arquitetura para construir sistemas com TypeSafe. Aprender a pensar em termos de «decisões atômicas discretas» é a chave para desbloquear todo o seu valor."
section: patterns
order: 10
tags: ['patterns', 'architecture']
source: docs.typesafe.ai/patterns
translatedFrom: zh
---

## Ideia Central

O TypeSafe foi projetado para ser **incorporado a sistemas maiores**, onde atua na tomada de decisões. A habilidade fundamental é: **pensar em termos de decisões discretas e atômicas**, permitindo que essas decisões se combinem para gerar comportamentos complexos do sistema.

Isso significa não tentar resolver um problema de negócios complexo com uma única chamada. Em vez disso, divida-o em várias julgamentos independentes e combine-os usando seu próprio código. A lógica de composição no código é determinística, testável e ajustável — esta é a fonte da confiabilidade.

Antes de ler esta seção, certifique-se de compreender os [Primitivos de Prompt](/zh/primitives/) e o [Conceito de Confiança](/zh/concepts/confidence/).

## Quatro Padrões

| Padrão | O que faz | Benefícios |
| :--- | :--- | :--- |
| [Fan-out Paralelo](/zh/patterns/fan-out/) | Envia muitas perguntas (incluindo especulativas) em uma única chamada; o código decide quais são relevantes | Custo, Velocidade |
| [Roteamento por Confiança](/zh/patterns/confidence-routing/) | Usa a confiança como um segundo eixo de decisão para construir sistemas mais seguros | Confiabilidade, Segurança |
| [Pontuação Composta](/zh/patterns/composite-scoring/) | Combina múltiplas dimensões de análise em uma única pontuação | Custo, Confiabilidade, Velocidade |
| [Roteamento por Intent](/zh/patterns/intent-routing/) | Classifica a intenção do usuário e roteia para o processador adequado | Custo, Velocidade |

## Como Eles Funcionam em Conjunto

Estes quatro padrões não são opções mutuamente exclusivas, mas componentes que podem ser sobrepostos. Um sistema de produção típico utiliza vários deles simultaneamente:

```text
Requisição do Usuário
   │
   ├─ [Roteamento por Intent] Primeiro, determina-se o tipo de requisição ──┐
   │                                                                      │
   ├─ [Fan-out Paralelo] Faz-se todas as perguntas necessárias de uma vez ─┤
   │                                                                      │
   ├─ [Pontuação Composta] Classificam-se e ordenam-se os resultados candidatos por múltiplas dimensões ─┤
   │                                                                      │
   └─ [Roteamento por Confiança] Execução automática para alta confiança / Escalação para humano para baixa confiança ┘
```

O **Roteamento por Intent** geralmente vem primeiro, pois determina quais fluxos de processamento são necessários nas etapas subsequentes. O **Fan-out Paralelo** permeia todo o processo, pois agrupar perguntas em uma única chamada tem custo de latência quase nulo. A **Pontuação Composta** é usada quando é necessário classificar os resultados. O **Roteamento por Confiança** atua como a última barreira, decidindo se o resultado deve ser executado automaticamente ou escalado para um humano.

## Princípios de Design

**Divisão Atômica.** Cada pergunta deve abordar apenas uma coisa. Perguntas compostas que parecem "mais convenientes de fazer de uma vez" impedem que você identifique em qual parte o modelo falhou e dificultam o ajuste individual.

**O código é responsável pela composição; o modelo é responsável pelo julgamento.** Ponderação, limiares e lógica de ramificação devem ficar no seu código. Estas são as partes que você precisa ser capaz de ler, testar e ajustar os parâmetros.

**Torne a incerteza visível.** Em vez de forçar o modelo a fornecer uma resposta, use a confiança para expor a "incerteza" ao nível do sistema, permitindo que seu código decida como lidar com ela.

## Relacionado

- [Primitivos de Prompt](/zh/primitives/) — Conhecimento prévio necessário
- [Conceito de Confiança](/zh/concepts/confidence/) — Conhecimento prévio necessário
- [Casos de Uso no Ecossistema](/zh/cases/use-case-map/) — Como projetos reais utilizam esses padrões
