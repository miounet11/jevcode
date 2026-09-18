---
title: "エージェントスキル"
description: "TypeSafe スキルを Claude Code や Codex などのコーディングエージェントに組み込み、推測ではなく API の完全なコンテキストを取得できるようにします。"
section: sdk
order: 40
tags: ['agent', 'claude-code', 'codex']
source: docs.typesafe.ai/agent-skill
translatedFrom: zh
---

## このスキルが解決する問題

TypeSafe エージェントスキルは、AI コーディングエージェントに対して、TypeSafe API の完全なコンテキストを提供します。これには、3 種類の[問題タイプ](/zh/primitives/)、アーキテクチャの[パターン](/zh/patterns/)、および組織的な評価のベストプラクティスが含まれます。

**なぜ必要なのか**：スキルがないエージェントは、推測に基づいてリクエストおよびレスポンスフィールドを記述し、一見妥当だが実際には存在しない API 呼び出しを生成します。これは、新しい API へのコーディングエージェントの統合において最も一般的な失敗パターンです。

## インストール

### Claude Code

```bash
claude plugin marketplace add typesafe-ai/skills
claude plugin install typesafe@typesafe-ai
```

### その他のエージェント

```bash
npx skills add typesafe-ai/skills --skill typesafe-ai
```

インストール時にプロンプトに従ってエージェントを選択してください。**デフォルトではプロジェクトローカルにインストール**されます。グローバルインストールするには `-g` フラグを追加します。

### エージェントに自身でインストールさせる

以下のプロンプトをそのままコーディングエージェントに貼り付けてください：

```text
Install the TypeSafe skill. If you're in Claude Code, run `claude plugin marketplace add typesafe-ai/skills`,
then `claude plugin install typesafe@typesafe-ai`. If you're in another agent, run
`npx skills add typesafe-ai/skills --skill typesafe-ai` and select your agent.
Use one installation method. You can read the skill directly at
https://github.com/typesafe-ai/skills/blob/main/skills/typesafe-ai/SKILL.md
(raw: https://raw.githubusercontent.com/typesafe-ai/skills/main/skills/typesafe-ai/SKILL.md).
Then use the TypeSafe skill when working on this project.
```

手動でインストールすることもできます。GitHub 上の `skills/typesafe-ai` ディレクトリ全体（**参照ファイルを含む**）を、エージェントのスキルディレクトリにコピーします。

> **インストール方法は 1 つのみを選択**してください。重複したコピーが作成されるのを避けるためです。

## アップデート

Claude Code プラグインの場合：

```bash
claude plugin marketplace update typesafe-ai
claude plugin update typesafe@typesafe-ai
```

その後、Claude Code を再起動するか、`/reload-plugins` を実行します。自動更新を有効にするには：`/plugin` を開き、**Marketplaces → typesafe-ai → Enable auto-update** を選択します。

skills.sh でインストールした場合は `npx skills update` を使用します。手動でコピーした場合は、GitHub の最新バージョンでスキルディレクトリ全体を置き換えます。

## 効果的なプロンプト

プロンプト内でスキルを明示する（「use the TypeSafe skill」）ことは、どのエージェントでも有効です。Claude Code プラグインを使用している場合は、`/typesafe:typesafe-ai` を直接呼び出すこともできます。

**リファクタリングの機会を探す**：

```text
Using the TypeSafe skill, explore the project and find opportunities for using
intelligent judgement to stand in for complex parsing or other fragile code.
```

**実際の API キーで実験する**：

```text
Using the TypeSafe skill, run some experiments using the TypeSafe API key that I've
exported to `TYPESAFE_API_KEY`. Propose changes based on the most promising results.
```

**適切なクックブックを見つける**：

```text
Using the TypeSafe skill, analyze my code and see if there are any applicable cookbooks
that show how I could refactor my code to be less fragile or complex.
```

## エージェントとの協働原則

公式に示された 4 つの原則は、従う価値があります：

1. **話し合い、その後実行する。** 上記のプロンプトを使用してエージェントと対話し、方向性を明確にします。
2. **実装前に計画を検証する。** 計画が妥当であることを確認してから、コードの記述を依頼します。
3. **定数を 1 か所に集約する。** 問題と閾値は、レビューを容易にするために単一のファイルで定義すべきです。**エージェントのコード記述能力は限られている**ため、一度に完了するのではなく、エージェントと協力して修正を行うことを想定してください。
4. **検証されていない主張を受け入れない。** エージェントに自身の仮説を検証するよう促します。

## よくある質問

### エージェントがスキルを使用しない

Claude Code プラグインでは `/typesafe:typesafe-ai` を直接呼び出し、その他のエージェントでは「use the TypeSafe skill」と明示してください。それでも読み込まれない場合は、インストーラーが正しいエージェントを選択していることを確認し、再起動してください。

### ルーティングの動作が期待と異なる

問題と閾値を確認してください。閾値が高すぎると（見落とし）、低すぎると（誤検知）の原因となります。また、問題をより具体的に記述する必要があるかもしれません。

### 信頼度閾値が至る所で使用されている

単に**最良のオプションを選択**したいだけであれば、信頼度が最も高いものを直接選択すればよく、閾値を設定する必要はありません。具体的な統計アルゴリズムを意図している場合は、`confidence` ではなく `probabilities` が必要となります。

### TypeSafe コードのレビューが難しい

人間がレビューする必要があるのは、**問題の定義**と**閾値定数**です。これらを単一のコードファイル内で定義に集中させ、レビュー時にあちこちを探す必要がないようにします。

### エージェントがリクエストまたはレスポンスフィールドを捏造した

通常、これはスキルの期限切れが原因です。上記の方法で更新後、再試行してください。

## 関連リンク

- [SDK 概要](/zh/sdk/) — Python および JS SDK
- [問題プリミティブ](/zh/primitives/) — エージェントが理解すべき 3 つの問題
- [信頼度](/zh/concepts/confidence/) — 閾値の設定方法
