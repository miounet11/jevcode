---
title: "Pontuação combinada"
description: "Divida as decisões complexas em pontuações atômicas e combine-as no código usando pesos sob seu controle total."
section: patterns
order: 40
tags: ['score', 'ranking', 'weights']
source: docs.typesafe.ai/patterns/composite-scoring
translatedFrom: zh
---

## Qual problema este padrão resolve

Frequentemente, precisamos classificar um conjunto de itens com base em **múltiplas dimensões simultaneamente**. Escrever diretamente uma "pontuação composta" como uma única pergunta é uma má prática: a pontuação fornecida pelo modelo é inexplicável, e você não sabe por que ele classificou os itens daquela maneira.

A abordagem de pontuação composta consiste em dividir o julgamento em dimensões independentes, atribuindo uma pontuação separada para cada uma, e depois combiná-las no código usando **pesos sob seu próprio controle**.

## Exemplo: Triagem de Currículos

Suponha que você esteja processando currículos para uma vaga de engenharia e queira classificar os candidatos com base em vários critérios, selecionando finalmente os top X para a próxima fase.

### Passo 1: Pontuar cada dimensão independentemente

Faça uma única chamada para obter quatro Scores: `python_depth`, `team_leadership`, `system_design` e `generalist`, definindo os níveis (tiers) próprios para cada dimensão.

### Passo 2: Combinar usando pesos

```python
py      = response.answers["python_depth"].score / 4
lead    = response.answers["team_leadership"].score / 4
arch    = response.answers["system_design"].score / 4
general = response.answers["generalist"].score / 4

# Senior IC (Contribuidor Individual Sênior)
ic_score = (0.40 * py) + (0.10 * lead) + (0.40 * arch) + (0.10 * general)

# Engineering Manager (Gerente de Engenharia)
em_score = (0.15 * py) + (0.40 * lead) + (0.20 * arch) + (0.25 * general)
```

Cada dimensão é normalizada para 0–1 antes de ser ponderada.

## O verdadeiro valor deste padrão

Obter uma classificação baseada em pesos é apenas um benefício superficial. **O verdadeiro valor é a explicabilidade.**

Observe que duas vagas diferentes acima usaram **o mesmo conjunto de pontuações, mas pesos diferentes**. Isso significa que:

- Uma única chamada atende a duas direções de contratação, sem dobrar o custo;
- Se a classificação não corresponder às expectativas, você pode ajustar os pesos diretamente, sem precisar redefinir o prompt;
- Quando alguém questiona "por que este candidato está em primeiro lugar?", você pode mostrar a distribuição das pontuações por dimensão e os pesos aplicados.

**Nenhum detalhe de cada dimensão é perdido.** Um candidato forte em Python, mas fraco em liderança de equipe, será classificado mais alto para a vaga de IC e mais baixo para a vaga de EM — essa diferença é codificada pelos pesos, não por um novo julgamento do modelo.

## Depuração em pontos de interrupção

Os pesos oferecem outra vantagem prática: **você pode classificar por uma única dimensão para investigar anomalias.** Se a classificação composta parecer incorreta, classifique primeiro apenas por `python_depth` para ver se está de acordo com a intuição. Se não estiver, o problema está na definição dos níveis (tiers) dessa dimensão, e não nos pesos. Essa decomposição é algo que "perguntar diretamente ao modelo sobre um grande problema" não consegue oferecer.

Se você descobrir que uma dimensão específica tem baixa capacidade de discriminação (todos os candidatos estão concentrados no mesmo nível), isso indica que a definição dos níveis precisa ser reescrita, e não o ajuste dos pesos.

## Compatibilidade com Confiança

Cada Score de dimensão inclui `confidence`. Uma dimensão com baixa confiança é um sinal de alerta: ou a definição dos níveis é ambígua, ou o estado atual falta informações suficientes para o julgamento.

Uma prática útil é: se a confiança de uma dimensão de alto peso estiver abaixo de um determinado limiar, marque o candidato como "requer revisão humana", em vez de permitir que uma pontuação não confiável domine a classificação.

## Pontos de Design

**As dimensões devem ser ortogonais.** Se duas dimensões estiverem altamente correlacionadas (por exemplo, "Profundidade em Python" e "Habilidade de Programação"), a ponderação calculará o mesmo aspecto duas vezes. Ao projetar as dimensões, pergunte-se: esta dimensão pode variar independentemente?

**Os pesos devem ser normalizados para somar 1.** Isso facilita a compreensão e o ajuste.

**Normalize antes de ponderar.** O número de níveis (tiers) geralmente difere entre as dimensões; sem normalização, as dimensões com mais níveis teriam uma influência desproporcional.

**Os pesos são uma decisão de negócio, não técnica.** Quem decide a diferença de pesos entre as vagas de IC e EM? Deve ser a área contratante, não o engenheiro. Torne os pesos configuráveis.

## Relacionado

- [Score](/zh/primitives/score/) — O primitivo fundamental deste padrão
- [Fan-out Paralelo](/zh/patterns/fan-out/) — Perguntar todas as dimensões de uma vez
- [Confiança](/zh/concepts/confidence/) — Lidar com pontuações de dimensões não confiáveis
