---
title: JevCode を知る
description: JevCode は Jev の本拠です。モデルは clavue-jev、今日世界で最も優れた Jev。呼び出しは状態と型付きの質問を送り、プログラムが分岐できる判定を返します。
section: start
order: 10
tags: ['overview', 'clavue-jev']
---

## Jev の本拠

JevCode は Jev が住む場所です。このサイトが提供するモデルは **clavue-jev** です。私たちが作り、私たちが提供し、今日世界で最も優れた Jev という位置に置いています。

jev-1.13.0 は比較ページに出ます。同じ問題に答える対照で、並べて見るためのものです。このサイトが外に提供するモデルではありません。

## 一度の呼び出しとは

clavue-jev はチャットモデルではありません。**状態**をひとつ送り、**型付きの質問**を最大六つ送ります。返ってくるのは、プログラムがそのまま読めるフィールドです：

| 質問 | 戻り値 |
| :--- | :--- |
| `noul` | 0 から 1 の小数。「はい」の強さとして読む。 |
| `confidence` | 0 から 1 の小数。この判定がどれだけ固いかとして読む。 |
| `choice` | あなたが挙げた選択肢のひとつ。 |

チャットモデルは文章を書きます。clavue-jev は値を返します。それが System One の、この呼び出しの仕事です。

## 続けて読む

- [System One](/ja/concepts/system-one/) — 一度の呼び出しの形
- [状態](/ja/concepts/state/) — 送るテキスト
- [確からしさ](/ja/concepts/confidence/) — いつ自動でやり、いつ止めるか
- [一度試す](/ja/try/) — 匿名なら Key は不要
- [API](/ja/api/) — Key 付きの `POST /v1/judge`
