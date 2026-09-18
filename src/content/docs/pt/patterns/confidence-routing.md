---
title: "Roteamento por confiança"
description: "Trate a confiança como um segundo eixo de decisão. A resposta indica \"o que é\", enquanto a confiança informa \"se deve executar\"."
section: patterns
order: 30
tags: ['confidence', 'routing', 'safety']
source: docs.typesafe.ai/patterns/confidence-routing
translatedFrom: zh
---

## Qual problema este padrão resolve

A resposta e a confiança são **duas dimensões de informação independentes**. Tomar decisões de fluxo apenas com base na resposta equivale a descartar metade da informação que o modelo fornece.

A abordagem de roteamento por confiança consiste em: primeiro obter a resposta e, em seguida, usar a confiança para determinar se essa resposta é suficientemente confiável para ser executada. Isso é fundamental para construir sistemas que sejam tanto confiáveis quanto seguros.

## Exemplo: Instruções de banco por voz

Imagine que você está construindo uma interface bancária por voz, permitindo que os usuários operem suas contas por comandos de voz. É claro que você deseja que a confiança do reconhecimento de intenção seja o mais alta possível, mas **diferentes ações têm riscos diferentes, exigindo diferentes limiares de confiança**.

### Passo 1: Determinar a intenção do usuário

Uma chamada a `Choice` retorna a intenção, com candidatos como `check_balance` (consultar saldo) e `approve_transfer` (aprovar transferência), entre outros.

### Passo 2: Roteamento com base na confiança

```python
action = response.answers["intent"]

# Para qualquer ação, se a confiança for inferior a 0.6, encaminhar para um agente humano
if action.confidence < 0.6:
    route_to_support_agent(account_id)

elif action.choice == "check_balance":
    # Baixo risco. Confiança de 0.6 é suficiente.
    show_balance(account_id)

elif action.choice == "approve_transfer":
    if action.confidence > 0.85:
        # Alto risco, mas também alta confiança. Executar.
        ...
    else:
        # Alto risco, confiança moderada. Confirmar primeiro.
        ask_user_to_confirm(account_id)
```

## Por que os limiares devem ser escalonados

Observe os três limiares neste código:

| Limiar | Função |
| :--- | :--- |
| Interceptação total para `< 0.6` | Quando o modelo relata incerteza, **nenhuma** ação é executada |
| Limiar para `check_balance` de 0.6 | Operações apenas de leitura; erros podem ser revertidos |
| Limiar para `approve_transfer` de 0.85 | Envolve fundos; erros são irreversíveis |

Esta é a expressão prática do conceito de **"limiares que escalam conforme o risco"**. **Se todo o sistema usar apenas um limiar uniforme, você ou estará perturbando excessivamente os usuários em ações de baixo risco, ou não sendo suficientemente cauteloso em ações de alto risco.**

## Pontos de design

**Defina primeiro um limite inferior rígido, depois os limiares específicos para cada ação.** O limite inferior rígido (por exemplo, 0.6 no exemplo) intercepta quando o modelo relata "realmente incerto", funcionando como uma rede de segurança. Os limiares de ação são então classificados por risco acima desse limite.

**Torne os limiares uma configuração explícita, em vez de números mágicos dispersos.** Defina os limiares para cada ação em um único local, facilitando a auditoria e o ajuste. Quando a equipe de negócios perguntar "por que esta transferência requer confirmação manual", você poderá apontar para um número específico.

**Não use a confiança para substituir a validação de negócios.** A confiança é uma autoavaliação do modelo e não substitui as regras de negócios. Regras determinísticas, como limites de valor máximo e verificações de permissão, ainda devem ser implementadas no código.

**Calibre os limiares com dados reais.** A documentação oficial alerta explicitamente: os limiares corretos dependem do seu domínio e do desempenho do modelo no seu caso de uso. Comece com limiares conservadores, teste com seus próprios dados e ajuste com base nas observações.

## Quando não usar

Se uma decisão **não tiver consequências em caso de erro** (por exemplo, rotular logs), adicionar um limiar de confiança apenas aumentará a complexidade e o custo operacional. O valor do roteamento por confiança é proporcional ao grau de irreversibilidade da decisão.

## Relacionado

- [Confiança](/pt/concepts/confidence/) — relação entre confiança e probabilidades
- [Roteamento de intenção](/pt/patterns/intent-routing/) — geralmente usado em conjunto com o roteamento por confiança
- [Pontuação composta](/pt/patterns/composite-scoring/) — tratamento de confiança em cenários de classificação
