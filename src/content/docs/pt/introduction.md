---
title: Conhecer o JevCode
description: O JevCode é a casa do Jev. O modelo é o clavue-jev, o melhor Jev do mundo hoje. Uma chamada envia um estado e perguntas tipadas e devolve um julgamento em que o software pode ramificar.
section: start
order: 10
tags: ['overview', 'clavue-jev']
---

## A casa do Jev

O JevCode é onde o Jev mora. O modelo que este site serve é o **clavue-jev**. Nós o construímos, nós o servimos e o colocamos como o melhor Jev do mundo hoje.

O jev-1.13.0 aparece na página de comparação. É o outro lado da mesma pergunta, para ver lado a lado. Não é o modelo que este site oferece.

## O que é uma chamada

O clavue-jev não é um modelo de chat. Você envia **um estado** e até **seis perguntas tipadas**. Voltam campos que um programa lê direto:

| Pergunta | Retorno |
| :--- | :--- |
| `noul` | Um número de 0 a 1. Leia como a força do "sim". |
| `confidence` | Um número de 0 a 1. Leia como: quão firme é este julgamento. |
| `choice` | Uma das opções que você deu. |

Um modelo de chat escreve prosa. O clavue-jev devolve um valor. Esse é o trabalho do System One, o trabalho desta chamada.

## Continuar lendo

- [System One](/pt/concepts/system-one/) — a forma de uma chamada
- [Estado](/pt/concepts/state/) — o texto que você envia
- [Confiança](/pt/concepts/confidence/) — quando agir sozinho, quando parar
- [Testar uma vez](/pt/try/) — anônimo, sem chave
- [API](/pt/api/) — `POST /v1/judge` com uma chave
