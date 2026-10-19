---
title: "Compatibilidade da API Kev: um relatório de conformidade de terceiros"
description: "Kev-0.8B (MLX, M1 Pro) passa todos os 32 requisitos MUST de um conjunto de conformidade da API Jev de terceiros — 255 opções, 10 níveis de pontuação, baterias de questões mistas, parsing do typesafe-sdk — com as duas notas de nível SHOULD que o autor registrou."
section: cases
order: 225
tags: ['compatibility', 'conformance', 'kev', 'api']
translatedFrom: en
---
## Compatibilidade que você pode testar, não compatibilidade que você afirma

“Compatível com a Jev API” é fácil de dizer e difícil de verificar. Então, um membro da comunidade escreveu isso como uma especificação testável: [jevcompat](https://github.com/mandu5/jevcompat)
— 48 requisitos para o contrato `POST /v1/systemone`, cada um citando a documentação da TypeSafe, o arquivo OpenAPI ou o código-fonte do SDK. Em seguida, a suíte foi executada contra os oito servidores de código aberto mais estrelados que implementam a API.

**Kev-0.8B (`2874258`, MLX, M1 Pro) é um dos dois servidores que passam em todos os MUST: 32/32**, incluindo:

- opções de escolha aceitas até o limite de 255 opções
- níveis de pontuação aceitos até o limite de 10 níveis
- resolução de alias `model: "jev-latest"`
- baterias mistas — perguntas noul, choice e score em uma única solicitação, respostas vinculadas
 pelos seus ids
- transida de texto não-ASCII através dos nomes das opções
- a análise oficial `typesafe-sdk` de cada tipo de resposta sem modificações

Relatório completo com todas as trocas registradas:
[results/kev/report.md](https://github.com/mandu5/jevcompat/blob/main/results/kev/report.md)
— servir comando e pesos em [RUN.md](https://github.com/mandu5/jevcompat/blob/main/results/kev/RUN.md),
reprodutível em sua própria máquina.

## O que a conformidade não cobre

A suíte também rastreia requisitos de nível SHOULD (Kev passa 10 de 12; as duas
falhas são respostas de erro de autenticação, não testadas porque a execução relatada foi executada com autenticação
desativada, e uma verificação adicional não foi exercitada porque o servidor nunca produziu o
erro que ela cobre). As duas notas de nível SHOULD que o autor arquivou de volta são a parte
mais interessante, porque ambos são lugares onde uma resposta byte-identica pode
ainda ser uma resposta pior:

**Normalização da confiança do escore.** Kev calcula a confiança do escore como
`1 − E|level − mode| / (L − 1)`; os exemplos documentados do TypeSafe calculam
`1 − E|level − mode| / D`, onde `D` é a dispersão da distribuição. Mesma evidência,
diferente denominador — medido em uma pergunta de 3 níveis, Kev retornou confiança
0.7535 enquanto a fórmula de referência dá 0.260. Um cliente comparando números
de confiança entre backends verá distribuições diferentes para qualidade de julgamento
idêntica. Se você rotear com base em limiares absolutos (o
[confidence-routing](/en/patterns/confidence-routing/)
padrão), calibre por
backend — ou roteie com base na distribuição bruta, que ambos os backends expõem.

**A degradação de contexto longo é uma propriedade do modelo, não uma violação da especificação.** O conjunto de testes passa; a precisão além do contexto de treinamento de 384 tokens do Kev não se mantém na especificação. Nas seleções TypeSafe do conjunto, o Kev-9B obteve 0,92 dentro do contexto de treinamento, mas 0,75–0,79 em documentos mais longos (Kev-4B: 0,88 / 0,88 / 0,81) — consulte a [receita de contexto longo](https://github.com/jaredpalmer/kev/issues/48) para a análise completa e as correções propostas pelo autor. A orientação de [design de estado](/en/concepts/state/) aplica-se a qualquer backend: mantenha o estado do tamanho da decisão, não do tamanho da página.

## O ponto mais amplo

O especificação de 48 requisitos é agnóstica ao backend. Se você está avaliando Kev contra outros servidores de API Jev auto-hospedados, execute o mesmo conjunto de testes e compare os números em vez dos READMEs. As duas implementações conformes também divergem de maneiras mensuráveis fora da especificação — forma da distribuição de confiança, retenção de contexto longo — o que é exatamente o tipo de coisa que um relatório de conformidade torna visível e uma grade de recursos oculta.

## Começando

- [Kev on GitHub](https://github.com/jaredpalmer/kev) — a família de modelos 0.8B–9B
- [spec de compatibilidade de jev](https://github.com/mandu5/jevcompat/blob/main/SPEC.md) — os 48 requisitos
- [referência da API HTTP](/en/sdk/http-api/) — o contrato oficial que está sendo testado
- [roteamento com controle de confiança](/en/patterns/confidence-routing/) — rotear com base nas distribuições, calibrar por backend
- [testes de consistência interna](/en/cases/consistency-choice-cookbook/) — testar sob estresse qualquer backend da mesma forma