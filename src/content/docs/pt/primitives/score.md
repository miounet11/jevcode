---
title: "Pontuação"
description: "Score atribui uma pontuação ao conteúdo com base em categorias descritivas ordenadas. A resposta consiste na pontuação, na probabilidade de cada categoria e no nível de confiança, sendo que a pontuação pode cair entre duas categorias."
section: primitives
order: 30
tags: ['score', 'ranking', 'rating']
source: docs.typesafe.ai/primitives/score
translatedFrom: zh
---

## Quando usar

Use o Score quando a resposta estiver em um **contínuo que pode ser descrito por várias faixas**. Por exemplo:

- A gravidade de um bug
- O nível de satisfação de um cliente
- A profundidade da experiência em Python de um candidato

Se a resposta for um conjunto de opções fixas e não houver **relação de ordem** entre as opções, use [Choice](/pt/primitives/choice/); se for apenas sim ou não, use [Noul](/pt/primitives/noul/).

Exemplos típicos de perguntas:

```text
"Qual a gravidade do bug relatado?"
  → 0: Estético; sem impacto na funcionalidade
  → 1: Funcionalidade quebrada ou degradada, mas existe uma solução alternativa
  → 2: Problema bloqueante; não existe solução alternativa

"Quão formal é esta roupa com base na descrição?"
  → 0: Roupa de academia
  → 1: Casual
  → 2: Casual de negócios
  → 3: Formal
  → 4: Black tie
```

Note que no segundo exemplo, as faixas de 0 a 4 são **ordenadas** — da mais casual à mais formal. Este é o ponto crucial que diferencia Score de Choice. Por outro lado, `{ billing, technical, sales }` não possui uma verdadeira relação de ordem; forçar o uso de Score apenas introduziria uma semântica ordinal falsa.

## Parâmetros

| Parâmetro | Obrigatório | Descrição |
| :--- | :--- | :--- |
| `type` | Sim | Deve ser `"score"` |
| `instructions` | Sim | A pergunta em si |
| `criteria` | Sim | **Array de faixas**, ordenadas do menor para o maior; a descrição de cada item define a respectiva faixa |

Diferente do `criteria` do Choice, que é um objeto, o `criteria` do Score é um **array ordenado**. A ordem do array define a direção da dimensão.

Assim como no Choice, cada item no `criteria` pode ser uma string, um objeto ou um array — use um objeto quando uma faixa específica precisar de mais detalhes.

## Exemplo de requisição

```python
from typesafe_sdk import Score, TypeSafeClient

client = TypeSafeClient()

bug = "O botão de exportação gera um erro CORS ao salvar no Google Sheets. Funciona no Chrome, mas alguns de nossos clientes usam apenas o Safari."

response = client.system_one(
    state=bug,
    questions={
        "bug_severity": Score(
            instructions="Qual a gravidade do problema relatado?",
            criteria=[
                "Estético; sem impacto na funcionalidade",
                "Funcionalidade quebrada ou degradada, mas existe uma solução alternativa",
                "Problema bloqueante; não existe solução alternativa",
            ],
        ),
    },
)

print(response.answers["bug_severity"].score)
```

## Resposta

A característica principal da resposta do Score é que o `score` **pode cair entre duas faixas** — ele representa uma posição na dimensão, não um índice de faixa.

| Campo | Significado |
| :--- | :--- |
| `score` | Posição na dimensão, pode ser um número decimal |
| `legend` | Repetição das definições das faixas numeradas, facilitando o mapeamento de volta para o semântico no código |
| `probabilities` | Distribuição de probabilidade em cada faixa |
| `confidence` | Grau de concentração da distribuição, de 0 a 1 |

Suponha que o exemplo acima retorne `score: 1.4`: isso indica que o modelo considera que a gravidade do problema está entre "funcionalidade quebrada com solução alternativa" e "completamente bloqueante", tendendo para a primeira faixa. Essa **continuidade é a vantagem central do Score em relação à "combinação de vários Noul"** — uma única chamada fornece informações completas de distribuição, em vez de vários julgamentos independentes.

O papel do `legend` é tornar a resposta autoexplicativa: você não precisa manter uma tabela de constantes de faixa separada no código para traduzir os números de volta para o semântico.

## Pontos de atenção

**As descrições das faixas devem ser discrimináveis.** A descrição de cada faixa deve permitir que outra pessoa identifique consistentemente os limites. Descrições como `"Calmo, factual"`, `"Frustrado, mas civilizado"` e `"Muito irritado"` são discrimináveis; `"Baixo / Médio / Alto"` não são.

**Mantenha o número de faixas entre 3 e 5.** Poucas faixas perdem poder de distinção; muitas tornam os limites entre faixas adjacentes vagos, o que reduz a confiança.

**Observe o `confidence` em vez de olhar apenas para o `score`.** Um score com baixa confiança geralmente significa que as definições das faixas são ambíguas, a dimensão é multidimensional ou as informações do `state` são insuficientes. A resposta correta nesse caso é melhorar as definições das faixas, em vez de forçar a obtenção de um valor.

**Em cenários de classificação, o Score é o principal primitivo.** Classificação por relevância, avaliação de qualidade e分级 de risco são adequados para o uso do Score, combinados com o [Padrão de Pontuação Composta](/pt/patterns/composite-scoring/) para ponderar e combinar múltiplas dimensões.

## Relacionado

- [Choice](/pt/primitives/choice/) — Opções fixas sem ordem
- [Noul](/pt/primitives/noul/) — Probabilidade de sim/não
- [Padrão de Pontuação Composta](/pt/patterns/composite-scoring/) — Síntese ponderada de múltiplas dimensões
- [Confiança](/pt/concepts/confidence/) — O que significa baixa confiança
