---
title: "SDK と統合"
description: "公式クライアント SDK、HTTP API の選択、および AI コーディング エージェント向けのスキル。"
section: sdk
order: 10
tags: ['sdk', 'api']
source: docs.typesafe.ai/sdk
translatedFrom: zh
---

## 3つの統合方法

| 方法 | 用途 | 特徴 |
| :--- | :--- | :--- |
| [Python SDK](/zh/sdk/python/) | バックエンドサービス、データパイプライン、バッチ処理 | 同期/非同期クライアント、型付き入力、自動リトライ |
| [JavaScript SDK](/zh/sdk/javascript/) | Node.js サービス、フルスタックアプリケーション | TypeScript 型推論、回答の型は質問から自動推論 |
| HTTP API | 他の言語、軽量な統合 | 直接 POST 送信、リトライとレート制限の処理は自前で実装する必要あり |

チームに AI コーディングエージェントが統合コードを記述している場合、まず [TypeSafe エージェントスキル](/zh/sdk/agent-skill/) をインストールすることを推奨します。これにより、エージェントはリクエストとレスポンスの正確な形状を把握でき、推測に基づいたコード記述を避けることができます。

## 共通の規約

すべての SDK は以下の規約を共有しています：

- **エンドポイント**：`POST https://api.typesafe.ai/v1/systemone`
- **認証**：環境変数 `TYPESAFE_API_KEY` から読み取られ、コード内で渡す必要はありません
- **デフォルトモデル**：`jev-latest`（最新の安定版に解決されます）
- **リトライ**：デフォルトで指数バックオフ戦略に従ってリトライし、レスポンス内の `retry-after` ヘッダーを尊重します

## バージョン要件

- Python SDK：パッケージ名 `typesafe-sdk`
- JS SDK：パッケージ名 `@typesafe-ai/sdk`、Node.js 20 以降が必要です

JS SDK は、ESM、CommonJS、TypeScript 宣言ファイルの 3 種類のビルド产物を提供します。

## HTTP API の直接呼び出し

SDK を使用しない場合、SDK に既に組み込まれている以下の 2 つの処理を自前で実装する必要があります：

**レート制限とリトライ。** 1 秒あたり 250,000 トークンまたは 1 分あたり 1,200 リクエストを超えると、`429 Too Many Requests` が返されます。レスポンスに `retry-after` ヘッダーが含まれている場合、それに従ってバックオフする必要があります。

**レスポンスの解析。** 返される値の構造は、質問名をキーとした回答オブジェクトです。各質問タイプには独自のフィールド形状があります。詳細は [API リファレンス](https://docs.typesafe.ai/api) を参照してください。

## 関連リンク

- [Python SDK](/zh/sdk/python/)
- [JavaScript SDK](/zh/sdk/javascript/)
- [エージェントスキル](/zh/sdk/agent-skill/)
- [5 分で始める](/zh/quickstart/) — 完全な動作例
