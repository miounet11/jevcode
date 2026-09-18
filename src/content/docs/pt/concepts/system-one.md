---
title: "Modelo System One"
description: "O System One é uma categoria de modelos construídos para «tomada de decisões rápidas e estruturadas». O Jev é o primeiro, e sua saída pode ser consumida diretamente pelo software."
section: concepts
order: 10
tags: ['system-one', 'architecture']
source: docs.typesafe.ai/concepts/system-one
translatedFrom: zh
---

## Definição

Os modelos System One são uma classe de modelos de IA construídos especificamente para **tomar decisões rápidas e estruturadas que o software pode utilizar diretamente**. O Jev é o modelo principal da TypeSafe e o primeiro modelo System One.

O problema central que eles resolvem é: os modelos de linguagem tradicionais produzem texto livre, enquanto o software precisa de valores de tipos definidos. O System One internaliza esse processo de conversão dentro do modelo: a declaração do problema especifica o tipo de saída, e o modelo retorna conforme as restrições impostas.

## Divisão de trabalho com o System Two

Esta nomenclatura é emprestada da teoria dos dois sistemas da ciência cognitiva, e o significado é direto:

| | System One | System Two |
| :--- | :--- | :--- |
| Características | Rápido, intuitivo, focado | Lento, cauteloso, em múltiplas etapas |
| Tarefas típicas | Julgamento, classificação, pontuação, validação | Raciocínio complexo, planejamento em cadeia longa |
| Latência | Baixa e previsível | Mais alta, aumenta com o comprimento do raciocínio |
| Saída | Tipada e restrita | Texto livre |
| Custo | Baixo | Alto |

Eles não são substitutos um do outro. A prática típica em sistemas de produção é delegar ao System One a maioria dos julgamentos de alta frequência, atualizando apenas para o System Two ou envolvendo um humano quando realmente for necessário um raciocínio profundo.

## Um exemplo completo: Solicitação de reembolso

O fluxo apresentado na documentação oficial ilustra bem como essas duas camadas trabalham em conjunto:

1. **Construir o estado** — Empacotar a mensagem do atendimento ao cliente, os registros de transação relevantes e a política de reembolso em um único `state`.
2. **Perguntas paralelas** — Fazer três perguntas independentes simultaneamente: o usuário está solicitando um reembolso? As evidências indicam uma cobrança duplicada? A política permite o reembolso?
3. **Composição no código** — Combinar as três respostas com verificações determinísticas de negócios e, em seguida, rotear para a execução ou para revisão humana.

Observe a **independência** das perguntas na etapa 2: as três perguntas não interferem umas nas outras e podem ser enviadas de uma só vez. Isso é o que permite empacotá-las em uma única solicitação.

## Por que a saída tipada é tão crucial

Como os modelos System One retornam **saídas tipadas e restritas em vez de texto livre**, seu código pode verificar e combinar essas respostas diretamente, construindo fluxos de trabalho previsíveis.

Compare a complexidade do código em duas abordagens de integração:

```python
# Abordagem tradicional: requer análise, validação e tratamento de exceções de formato
raw = llm.complete("Is this ticket about billing? Answer yes or no.")
is_billing = raw.strip().lower().startswith("y")  # Frágil, muitos casos limite

# System One: o valor já é tipado
response = client.system_one(
    state=ticket,
    questions={"billing": Noul(instructions="Is this ticket about billing?")},
)
is_billing = response.nouls["billing"].noul  # float, 0..1
```

O valor de retorno da segunda abordagem é um tipo determinado dentro do domínio definido: `Choice` será sempre uma das opções fornecidas, `Score` estará sempre dentro da faixa de intervalos fornecida, e `Noul` será sempre um número de ponto flutuante entre 0 e 1.

## Confiança: permitindo que o modelo diga "Não tenho certeza"

As respostas dos modelos System One incluem [confidence](/pt/concepts/confidence/), permitindo que você decida quando executar diretamente e quando atualizar para um humano ou para um modelo de raciocínio. Isso é fundamental para construir sistemas confiáveis — **se um sistema não consegue expressar honestamente sua incerteza, ele não pode ser confiável**.

## Como chamar

Chame através do [SDK](/pt/sdk/) ou da API HTTP:

```http
POST https://api.typesafe.ai/v1/systemone
```

O campo `model` na solicitação seleciona o modelo específico. O alias padrão é `jev-latest`.

## Leitura adicional

- [State](/pt/concepts/state/) — Como organizar o contexto passado ao modelo
- [Primitivos de pergunta](/pt/primitives/) — Três tipos de perguntas tipadas
- [Padrões de arquitetura](/pt/patterns/) — Como organizar essas chamadas em ambientes de produção
- [Como construir sistemas System One](https://docs.typesafe.ai/concepts/how-to-build-with-system-one) — Guia oficial de fluxo de trabalho completo
