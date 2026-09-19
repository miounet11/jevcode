---
title: "Conheça o Jev"
description: "Jev é o modelo principal da TypeSafe e o primeiro modelo do System One. Ele transforma estados não estruturados e perguntas tipadas em decisões tipadas que o software pode utilizar diretamente."
section: start
order: 10
tags: ['overview', 'system-one']
source: docs.typesafe.ai/introduction
translatedFrom: zh
---

## Entendimento em uma frase

Jev não é um modelo de chat. Você fornece **estado** (state) e **perguntas tipadas** (typed questions), e ele retorna **decisões tipadas** (typed decisions) — uma opção, uma pontuação ou uma probabilidade booleana, cada uma com **confiança** (confidence).

Essa posição define a diferença fundamental entre ele e os modelos conversacionais:

| Dimensão | Modelos conversacionais | Jev |
| :--- | :--- | :--- |
| Saída | Texto livre | Resultado estruturado com schema fixo |
| Uso | Geração, diálogo, cadeias de raciocínio | Classificação, roteamento, pontuação, validação, barreiras de segurança |
| Integração | Análise da saída do modelo | Consumo direto do valor de retorno, sem necessidade de análise via regex |
| Confiança | Geralmente ausente | Presente em cada resposta |
| Latência | Na ordem de segundos, cresce com o tamanho da saída | Baixa e estável |

## Por que é necessária uma "camada de decisão"

Ao integrar LLMs em sistemas de negócios, a dor mais comum é: o modelo gera um texto em linguagem natural, e você precisa escrever um analisador, lidar com casos extremos e adivinhar se a resposta está correta. O Jev abstrai essa camada — a própria pergunta declara o tipo de saída, e o modelo deve responder conforme o schema.

```json
{
  "department": {
    "type": "choice",
    "instructions": "Qual equipe deve lidar com isso",
    "criteria": {
      "billing": "Questões de pagamento ou assinatura",
      "technical": "Erros ou problemas de integração",
      "sales": "Questões de preços ou de conta"
    }
  }
}
```

O valor de retorno é uma das opções `billing` / `technical` / `sales`, além de uma medida de confiança. Sem análise, sem formatos de fallback.

## Três primitivas de pergunta

Todas as decisões se resumem a três tipos de perguntas. Esta é a abstração central do Jev; entendê-las é entender todo o sistema:

- **[Choice](/pt/primitives/choice/)** — Escolha uma opção de um conjunto de candidatos mutuamente exclusivos. Usado para reconhecimento de intenção, roteamento de tickets e seleção de ações.
- **[Score](/pt/primitives/score/)** — Pontuação baseada em uma escala ou critérios de avaliação. Usado para ordenação por relevância, avaliação de qualidade e classificação de riscos.
- **[Noul](/pt/primitives/noul/)** — Responde a uma pergunta do tipo sim/não, retornando a probabilidade de a resposta ser "sim". Usado para validação de conteúdo, verificação de asserções e barreiras de segurança.

Uma única solicitação pode combinar esses três tipos de perguntas. O modelo lê o estado uma única vez e avalia todas as perguntas em paralelo.

## A posição do System One

O System One é uma categoria de modelos construídos especificamente para "tomar decisões rápidas e estruturadas que o software possa usar diretamente". O Jev é o primeiro modelo dessa categoria. Ele não substitui os modelos de raciocínio do tipo System Two, mas complementa-os com uma divisão de trabalho:

- **System One**: Julgamentos de alta frequência, baixa latência e estruturados. São uma evolução do if/else nas linhas de produção de negócios.
- **System Two**: Tarefas complexas que exigem raciocínio em múltiplos passos e pensamento em cadeia longa.

Na prática, é comum usar o System One em grande escala nas linhas de produção para um roteamento rápido, atualizando para modelos mais potentes apenas quando realmente necessário um raciocínio profundo, reduzindo assim custos e latência.

## Próximos passos

- [Introdução em 5 minutos](/pt/quickstart/) — Obtenha sua chave de API e execute sua primeira chamada
- [Conceitos principais](/pt/concepts/system-one/) — Entenda o System One e os modelos de estado
- [Padrões de arquitetura](/pt/patterns/) — Veja como organizar essas chamadas em ambientes de produção
