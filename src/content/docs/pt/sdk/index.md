---
title: "SDK e Integração"
description: "SDKs de cliente oficiais, a escolha da API HTTP e as skills para agentes de codificação de IA."
section: sdk
order: 10
tags: ['sdk', 'api']
source: docs.typesafe.ai/sdk
translatedFrom: zh
---

## Três formas de integração

| Método | Aplicável a | Características |
| :--- | :--- | :--- |
| [Python SDK](/zh/sdk/python/) | Serviços backend, pipelines de dados, processamento em lote | Clientes síncronos/assíncronos, entrada tipada, retry automático |
| [JavaScript SDK](/zh/sdk/javascript/) | Serviços Node.js, aplicações full-stack | Inferência de tipos TypeScript, tipo da resposta inferido automaticamente a partir da pergunta |
| HTTP API | Outras linguagens, integração leve | POST direto, requer tratamento manual de retry e limitação de taxa |

Se sua equipe utiliza agentes de codificação com IA para escrever o código de integração, recomendamos instalar primeiro a [TypeSafe agent skill](/zh/sdk/agent-skill/), para que o agente conheça a forma exata das requisições e respostas, evitando que ele escreva código baseado em suposições.

## Convenções comuns

Todos os SDKs compartilham o mesmo conjunto de convenções:

- **Endpoint**: `POST https://api.typesafe.ai/v1/systemone`
- **Autenticação**: Lida automaticamente lendo a variável de ambiente `TYPESAFE_API_KEY`; não é necessário passá-la no código.
- **Modelo padrão**: `jev-latest` (resolve para a versão estável mais recente)
- **Retry**: Por padrão, realiza retry seguindo uma estratégia de backoff e respeita o cabeçalho `retry-after` na resposta.

## Requisitos de versão

- Python SDK: nome do pacote `typesafe-sdk`
- JS SDK: nome do pacote `@typesafe-ai/sdk`, requer Node.js 20 ou versão mais recente

O JS SDK fornece três tipos de artefatos: ESM, CommonJS e arquivos de declaração TypeScript.

## Chamada direta via HTTP API

Se você não utilizar o SDK, precisará lidar manualmente com duas funcionalidades já embutidas no SDK:

**Retry por limitação de taxa (rate limiting).** Exceder 250.000 tokens/segundo ou 1.200 requisições/minuto resultará em `429 Too Many Requests`. A resposta pode conter o cabeçalho `retry-after`, e você deve implementar o backoff conforme indicado.

**Parse da resposta.** A estrutura de retorno é um objeto de resposta indexado pelo nome da pergunta, onde cada tipo de pergunta possui sua própria forma de campos. Consulte a [Referência da API](https://docs.typesafe.ai/api) para mais detalhes.

## Relacionados

- [Python SDK](/zh/sdk/python/)
- [JavaScript SDK](/zh/sdk/javascript/)
- [Agent skill](/zh/sdk/agent-skill/)
- [Introdução em 5 minutos](/zh/quickstart/) — exemplo completo e executável
