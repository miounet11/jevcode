---
title: "Mapa de capacidades e casos de uso do ecossistema"
description: "Mapa de capacidades do Jev organizado por cenários, com exemplos reais de projetos em produção. Veja em quais cenários os outros utilizaram quais tipos de primitivas."
section: cases
order: 10
tags: ['use-cases', 'ecosystem', 'production']
source: docs.typesafe.ai/concepts/use-case-map + awesome-jev
translatedFrom: zh
---

## Como usar este mapa

Primeiro, identifique o cenário mais próximo do seu negócio. Observe quais primitivas os outros estão usando nesse cenário e quais problemas eles resolvem, em seguida, aplique isso aos seus próprios documentos e ações.

Cada cenário abaixo apresenta: **Qual problema resolver** → **Quais primitivas usar** → **Projeto real**.

> Para ver o **índice completo de projetos da comunidade organizados por categoria** (com contagem de estrelas e etiquetas de linguagem), consulte [Ecossistema da Comunidade](/pt/ecosystem/).

## Classificação e Roteamento

**Problema**: Após a chegada de uma requisição, é necessário determinar sua categoria e encaminhá-la para diferentes cadeias de processamento.

**Primitivas**: Choice (Classificação), com a confiança sendo usada para controle de acesso (gating).

**Projetos reais**:

- [Notra](https://github.com/usenotra/notra) — Análise de marketing: Plataforma GEO em produção, que migrou o classificador de visibilidade de marca do LLM para a decisão booleana do Jev usando a chave `NOTRA_JEV_CLASSIFIERS`, com limiar de 0,5.
- [jev-router](https://github.com/gargpratyush/jev-router) — Ferramenta de desenvolvimento: Permite que o Jev escolha entre modelos candidatos, roteando assim as tarefas do Claude Code para o modelo mais barato e capaz.
- [jev-router (prismhq)](https://github.com/prismhq/jev-router) — Infraestrutura LLM: Roteador open-source baseado em LiteLLM, que usa a decisão do Jev para selecionar qual modelo atende cada requisição.
- [pi-jev-router](https://github.com/mejiasd3v/pi-jev-router) — Agente de codificação: Adiciona ao agente de codificação Pi a capacidade de rotear modelos automaticamente por requisição, tomando decisões no Jev Vercel AI Gateway.
- [jcm-router](https://github.com/adarshmishra07/jcm-router) — Agente de codificação: Agente local que usa a decisão do Jev para escolher o modelo Claude e a intensidade de raciocínio para cada mensagem, mantendo o cache de chat principal livre de contaminação.

> **Observação**: O roteamento de modelos é a direção de aplicação mais densa neste cenário. O padrão comum é "substituir uma chamada de modelo cara ou um julgamento humano por uma única decisão Choice barata".

## Pontuação e Classificação

**Problema**: É necessário classificar um conjunto de itens por relevância, qualidade ou critérios multidimensionais.

**Primitivas**: Score, combinado com [pontuação composta](/pt/patterns/composite-scoring/) para integrar múltiplas dimensões.

**Projetos reais**:

- [jev-bfs](https://github.com/komikat/jev-bfs) — Ferramenta de busca: Encontra o caminho de links entre duas entradas da Wikipédia em inglês fazendo o Jev classificar os links de saída de cada página, enquanto o Python controla o processo de busca.
- [Jev Search](https://github.com/superagents-lab/jev-search) — Busca na web: Usa o Noul do Jev para atribuir pontuações de relevância aos títulos e resumos dos resultados do Search1API.

## Validação e Guardas

**Problema**: O trabalho, as chamadas de ferramentas, as entradas e as saídas geradas pela IA ou por agentes precisam ser verificados antes de serem avançados.

**Primitivas**: Noul (Decisão Sim/Não), convertendo limiares em booleanos.

**Projetos reais**:

- [jev-review](https://github.com/devagrawal09/jev-review) — Engenharia de software: Fluxo de trabalho de revisão de código em etapas e quadro local, onde o Jev atua como guardião em cada etapa, permitindo que as alterações avancem apenas após a aprovação.
- [pi-jev](https://github.com/y0usaf/pi-jev) — Segurança de agentes: Adiciona um portão de chamada de ferramentas mensurável ao agente de codificação Pi, verificando chamadas de risco no Jev antes da execução.
- [OpenWork](https://github.com/different-ai/openwork) — Fluxo de trabalho de engenharia: Integra o Jev ao seu kit de teste de avaliação como juiz de validação, garantindo que o trabalho produzido pelos agentes seja validado por um julgamento tipado, e não por um modelo de linguagem.
- [jev-guard](https://github.com/leepokai/jev-guard) — Segurança de agentes: Proteção contra injeção de prompts e ações perigosas para agentes Claude Code, Codex, Pi e ACP, onde o Jev decide o que interceptar.

## Decisões de Agentes

**Problema**: Para cada passo de um agente, é necessária uma camada de julgamento rápida, tipada e explicável sobre o que fazer.

**Primitivas**: Choice (Seleção de ação), com Score/Noul como apoio.

**Projetos reais**:

- [Jev Ultrafast](https://github.com/browser-use/jev-ultrafast) — Automação de navegador: Agente ultra-rápido do browser-use, onde o Jev decide a ação de cada passo e qual elemento clicar, invocando o modelo de linguagem apenas quando necessário para entrada de texto.
- [pi-typesafe-jev](https://github.com/legacybridge-tech/pi-typesafe-jev) — Agente de codificação: Expõe os julgamentos do System One como cinco ferramentas Pi, permitindo que o modelo faça julgamentos semânticos de escopo reduzido, enquanto o código e o usuário mantêm o controle sobre limiares, pesos e ações.
- [jev-judgment](https://github.com/HyunjunJeon/jev-judgment) — Agente de codificação: Envia os julgamentos de agentes de codificação fechados para o Jev, mantendo o julgamento tipado, barato e comparável entre diferentes execuções.
- [limpet](https://github.com/noplan-inc/limpet) — Agente de codificação: Hook de parada, que impede que o agente termine prematuramente ao usar o julgamento do Jev para avaliar as condições de conclusão em linguagem natural.
- [robo-harness](https://github.com/grmkris/robo-harness) — Robótica: Mesa de trabalho do braço robótico SO-101, onde o Jev decide qual passo articular delimitado o executor deve selecionar entre ações candidatas tipadas, sujeito a restrições de orçamento.

## Moderação de Conteúdo e Conformidade

**Problema**: Determinar se o conteúdo viola regras, contém informações sensíveis ou está em conformidade com políticas.

**Primitivas**: Noul.

Há poucos projetos reais registrados nesta categoria (esta área ainda está em estágio inicial), mas a forma típica é consistente com o cenário de guardas: escrever questões como "contém informações de identificação pessoal" ou "viola políticas" como Noul, convertendo-as em booleanos com base no limiar para entrar em um fluxo determinístico.

## Anotação de Dados e Avaliação

**Problema**: Rotular conjuntos de dados ou avaliar a qualidade das saídas de modelos.

**Primitivas**: Todas as três categorias.

**Projetos reais**:

- Consulte os projetos de avaliação em "Pontuação e Classificação" e "Validação e Guardas" (como o uso do kit de teste de avaliação do OpenWork).

## Jogos e Simulações

**Problema**: Em ambientes em tempo real, é necessária uma decisão rápida a cada frame ou ponto de decisão.

**Primitivas**: Choice (Seleção de ação).

**Projetos reais**:

- [Jev Ultrafast](https://github.com/browser-use/jev-ultrafast) — Consulte acima.
- [jev-drone](https://github.com/RomanSlack/jev-drone) — Simulação de robótica: Drone autônomo com apenas câmeras no MuJoCo, que integra o modelo de julgamento do Jev no loop de controle, com frequência de 2,5 Hz.
- [tsai-sc](https://github.com/phyous/tsai-sc) — Jogos: Controla a versão compartilhada original de StarCraft via teclado e mouse, registrando as probabilidades de ação do Jev a cada decisão.

> **Observação**: Esses cenários são os mais sensíveis à latência. O loop de controle de 2,5 Hz do `jev-drone` demonstra que a latência do Jev já permite a entrada em cadeias de controle em tempo real.

## Pesquisa de Modelos Fundamentais

**Problema**: Reproduzir ou pesquisar formas de modelos como o System One, que "produzem decisões tipadas em uma única propagação direta".

**Projetos reais**:

- [decider](https://github.com/Mapika/decider) — Modelo aberto: Reproduz a forma do System One usando ajuste fino do Qwen3.5-2B, produzindo decisões tipadas com probabilidades calibradas em uma única propagação direta.
- [openjev](https://github.com/zhihz/openjev) — Pesquisa aberta: Pré-visualização local independente que responde a problemas de probabilidade bilíngues com base no contexto, pergunta e respostas candidatas, inspirado pelo TypeSafe Jev.
- [Parallel Constrained Decoding (Qwen2.5-1B-RLCD)](https://huggingface.co/spaces/drinkmoonshine/parallel-constrained-decoding) — Pesquisa aberta: Demonstração do Qwen2.5-1B treinado com RLCD, explorando o uso de decodificação paralela restrita de código aberto como alternativa ao Jev.

## Infraestrutura e SDK

**Problema**: Integrar o Jev às pilhas tecnológicas existentes.

**Projetos reais**:

- Consulte a [categoria Infra / SDKs / Integrations do awesome-jev](https://github.com/yibie/awesome-jev/blob/main/categories/infra-sdks-integrations.md), que reúne ligações para várias linguagens, integrações de agentes e adaptações de gateways.

## As quatro direções do mapa oficial de capacidades

A TypeSafe oficial resume os casos de uso em quatro grandes direções, que valem a pena consultar ao conceber cenários:

**Software Automatizado por IA** — Intercale IA com software confiável para que ele possa executar milhões de vezes em segundo plano sem necessidade de supervisão humana. **O código controla o fluxo, e o TypeSafe lida com decisões semânticas e compreensão de linguagem.**

**Aplicações em Tempo Real** — A inteligência de ponta atinge velocidade em tempo real (150ms), o que significa que as decisões da IA podem ser mais rápidas que a percepção humana, sendo suficientes para serem programadas em jogos ou incorporadas à UI.

**AI Map Reduce em Big Data** — A redução de custos em 100 vezes permite processar conjuntos de dados massivos: recuperar informações relevantes em grandes corpora, classificar trajetórias massivas de agentes e extrair características para previsão.

**Validação Universal de IA** — Valide prompts de entrada, resultados de extração, trajetórias de raciocínio e chamadas de ferramentas de qualquer outra IA. Detecte padrões de erro como jailbreaks, erros de citação e alucinações, por uma fração do custo de uma chamada real de LLM.

## Relacionado

- [Padrões de Arquitetura](/pt/patterns/) — Os padrões genéricos por trás desses casos
- [Primitivas de Problema](/pt/primitives/) — Como escolher as primitivas
- [Lista completa do awesome-jev](https://github.com/yibie/awesome-jev) — Lista contínua de projetos da comunidade
