---
title: "Confiança"
description: "A confiança é uma estatística derivada da distribuição de probabilidade. Compreenda sua relação com as probabilidades e como ajustar o limiar conforme o risco."
section: concepts
order: 30
tags: ['confidence', 'probabilities', 'threshold']
source: docs.typesafe.ai/confidence
translatedFrom: zh
---

## Relação entre os dois campos

Todas as respostas `Choice` e `Score` possuem um atributo `probabilities`, que representa a **distribuição de probabilidade** sobre as opções (Choice) ou os níveis (Score).

A **forma** dessa distribuição indica o quão certo o modelo está: uma concentração em um único resultado significa que a resposta é determinada, enquanto uma distribuição ampla indica incerteza.

O atributo `confidence` comprime essa forma em um único número entre 0 e 1, permitindo que você defina limiares diretamente, sem precisar realizar cálculos matemáticos.

> **Nota**: As respostas `Noul` **não possuem** `confidence`; elas são, por si só, valores de probabilidade entre 0 e 1.

## Significado da forma da distribuição

- **Baixa confiança em Choice** geralmente significa que nenhuma opção se destaca claramente sobre as outras.
- **Baixa confiança em Score** geralmente indica que os níveis são ambíguos, multidimensionais ou que as informações no `state` são insuficientes para uma decisão.

## "Não sei" é um sinal útil

Se um sistema inteligente — seja humano ou máquina — não puder expressar honestamente a incerteza, esse sistema não será confiável.

A confiança fornece ao modelo um mecanismo interno para dizer "não tenho certeza sobre isso". Isso permite que seu código implemente comportamentos diferentes para diferentes níveis de certeza, o que é fundamental para construir sistemas verdadeiramente robustos.

## Três ramos

Um ponto de partida prático é dividir a confiança em três faixas, cada uma correspondendo a um comportamento diferente do sistema:

- **Alta confiança**: Execução automática. O modelo tem uma判断 clara, sem necessidade de intervenção humana.
- **Confiança média**: Progresso cauteloso. O modelo forneceu uma resposta razoável, mas não está totalmente certo. Dependendo do contexto, pode-se solicitar confirmação do usuário, marcar para revisão ou coletar mais informações primeiro.
- **Baixa confiança**: Não executar. Encaminhar para um humano, solicitar esclarecimentos ou reverter para outros sistemas. O modelo está indicando que lhe faltam informações ou que a questão não é adequada para ele.

**Onde traçar os limites depende do nível de risco.**

## Limiares escalonados conforme o risco

Este é o princípio prático mais importante: **o limiar de confiança não é um único número.**

Dentro de um mesmo sistema, diferentes ações devem ter limiares definidos com base nas "consequências de um erro".

```python
response = client.system_one(
    state=user_message,
    questions={
        "action": Choice(
            instructions="What is the user trying to do?",
            criteria={
                "check_balance": "View account balance",
                "approve_transfer": "Approve the pending withdrawal request",
                "support": "Get help with an issue",
            },
        ),
    },
)

action = response.answers["action"]
confidence = action.confidence

if confidence < 0.5:
    # O modelo realmente não tem certeza. Não adivinhe.
    route_to_human(user_message)

elif action.choice == "check_balance":
    # Baixo risco. Mostrar a tela errada é recuperável.
    show_balance(account_id)

elif action.choice == "approve_transfer":
    if confidence > 0.9:
        # Alto risco + alta confiança. Executar com confirmação.
        confirm_then_execute(account_id)
    else:
        # Alto risco + confiança média. Validar primeiro.
        ask_user_to_confirm(account_id)
```

Este código possui três limiares diferentes, cada um correspondendo a um nível de risco distinto:

| Ação | Risco | Limiar |
| :--- | :--- | :--- |
| Bloqueio abaixo de 0.5 | — | Limite inferior rígido, captura casos em que o modelo admite incerteza |
| `check_balance` | Baixo, leitura e recuperável | Execução automática acima de 0.5 |
| `approve_transfer` | Alto, envolve fundos | Requer > 0.9 e ainda assim confirmação do usuário |

O limiar inferior de `0.5` bloqueia quando o modelo relata "realmente não tenho certeza". Acima disso, o limiar necessário para executar uma ação destrutiva é muito mais alto do que para uma ação apenas de leitura. **Seu código codifica sua tolerância ao risco.**

> **Nota**: Os valores corretos dos limiares dependem do seu domínio e do desempenho real do modelo no seu caso de uso. Comece com limiares conservadores, teste com seus próprios dados e ajuste com base nas observações.

## Métricas definíveis por você

O `confidence` fornecido pela plataforma é uma métrica conveniente adaptada à maioria dos casos de uso, mas você não está preso à sua definição. Dependendo do que você está avaliando, outras métricas podem ser mais adequadas — é por isso que `probabilities` também é retornado: você tem a distribuição completa e pode calcular por conta própria.

Por exemplo, a margem de probabilidade entre duas opções candidatas pode refletir melhor "se deve ou não executar automaticamente" em certos cenários do que o grau de concentração. Ou você pode observar apenas a probabilidade do top-1, ignorando o restante. A escolha é sua.

## Relacionado

- [Choice](/zh/primitives/choice/) / [Score](/zh/primitives/score/) — Os dois primitivos com confidence
- [Noul](/zh/primitives/noul/) — Sem confidence, é por si só uma probabilidade
- [Padrão de roteamento por confiança](/zh/patterns/confidence-routing/) — Usando a confiança como sinal de roteamento de fluxo
