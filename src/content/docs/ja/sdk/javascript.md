---
title: "JavaScript / TypeScript SDK"
description: "@typesafe-ai/sdk をインストールし、自動型推論付きのクライアントを使用して System One API を呼び出します。"
section: sdk
order: 30
tags: ['javascript', 'typescript', 'sdk']
source: docs.typesafe.ai/sdk/javascript
translatedFrom: zh
---

## インストール

Node.js 20 以降が必要です：

```bash
npm install @typesafe-ai/sdk
```

環境変数を設定し、クライアントを作成します：

```bash
export TYPESAFE_API_KEY="sk-..."
```

## 基本的な使い方

```ts
import { choice, TypeSafeClient } from "@typesafe-ai/sdk";

const client = new TypeSafeClient();
const response = await client.systemOne({
  state: { document: "二重請求されました。至急修正してください。" },
  questions: {
    category: choice("このチケットの内容は何ですか？", {
      billing: null,
      technical: null,
      other: null,
    }),
  },
});

console.log(response.answers.category.choice);
```

## 型の推論

これが TS SDK で最も価値のある機能です：**回答の型は、あなたが渡した質問から自動的に推論されます**。

```ts
questions: {
  category: choice("このチケットの内容は何ですか？", {
    billing: null,
    technical: null,
    other: null,
  }),
}
```

`criteria` のキーが `billing` / `technical` / `other` であるため、`response.answers.category.choice` の型はこれら3つのリテラル型のユニオン型になります。`"bililng"` と誤って記述すると、実行時に `undefined` が返されるのではなく、コンパイル時にエラーとなります。

同様に、`score(...)` で構築された質問の場合、回答には `score`、`legend`、`probabilities`、`confidence` が含まれます。`noul(...)` で構築された場合、`noul` のみが含まれます。

つまり、**回答の型定義を手動で作成する必要はなく、API のレスポンスを `any` として扱う必要もありません**。

## レスポンス構造

```ts
response.answers.category.choice;        // 選択されたオプション
response.answers.category.probabilities; // 各オプションの確率
response.answers.category.confidence;    // 信頼度
```

すべての質問タイプは、`response.answers` 内で質問名でインデックス付けされ、具体的なフィールドは質問のタイプによって異なります。

## パッケージ構造

SDK は ESM、CommonJS、TypeScript 宣言ファイルの3つのビルド产物を提供しているため、さまざまなビルド環境でそのまま使用できます。

すべてのオプションとデフォルト値の詳細については、SDK の [client](https://github.com/typesafe-ai/typesafe-sdk-js/blob/v0.6.0/src/client.ts) および [types](https://github.com/typesafe-ai/typesafe-sdk-js/blob/v0.6.0/src/types.ts) を参照してください。

## 関連リンク

- [5分で始める](/ja/quickstart/)
- [質問プリミティブ](/ja/primitives/) — 3種類の質問の構築方法
- [ファンアウト並列処理](/ja/patterns/fan-out/) — 一度に複数の質問を行う
