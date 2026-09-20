---
title: "関数呼び出し"
description: "自然言語の取引リクエストを、関数名と閉集合引数を信頼度対応型のTypeSafe質問にマッピングすることで、通常の型付き関数への呼び出しに変換します。"
section: cases
order: 190
tags: ['cookbook', 'recipe']
source: "docs.typesafe.ai/cookbooks/function_calling"
translatedFrom: en
---
「アイスオートラテ、甘味料なし」と注文したとき、バリスタはあなたの文を書き留めない。カップに4つの選択肢にチェックを入れる。このクックブックは、取引APIに対して同じことをする。文が入力され、関数名とその引数（評価された列挙型、それぞれに信頼度付き）が出力される。

```text
"plot rolling correlation between nvda and spy for the past month"
    rolling_correlation(symbol='NVDA', benchmark='SPY', window='1mo')   confidence 0.91

"compare nvda amd and msft over the past three months"
    compare_returns(symbols=['NVDA', 'AMD', 'MSFT'], window='3mo')      confidence 0.94

"show me apple daily with volume"
    plot_price(symbol='AAPL', resolution='1d', include_volume=True)     confidence 0.75

"what tickers do you have"
    list_symbols()                                                     confidence 1.00
```

これらの呼び出しは、トレーディングアシスタント内の10の通常の関数に送られます。それらの引数は固定されたリストから値を取るので、それらはすでに`Literal`です：

```python
def plot_price(
    symbol: Literal["SPY", "NVDA", "AMD", "AAPL", "MSFT", "TSLA"],
    style: Literal["line", "candles"] = "line",
    resolution: Literal["1m", "5m", "15m", "1h", "1d"] = "15m",
    window: Literal["1d", "1w", "1mo", "3mo"] = "1w",
    include_volume: bool = False,
    moving_average: Literal["9", "20", "50"] | None = None,
    log_scale: bool = False,
): ...
```

固定されたリストから値を取る引数は閉集合です。そのリストから1つの値を選ぶとき、それはちょうどその値たちに対して`Choice`の質問を行い、関数に到達するものはすべて関数が受け入れる値です。関数には手を出しません。あなたが追加するのは、各引数が何を意味するかを平易な言葉で記した仕様です。最終的には、自分の関数を指し示せる`Dispatcher`が手に入ります。

## セットアップ

```bash
pip install ipython polars matplotlib numpy "typesafe-sdk>=0.5.7" cooksafe --extra-index-url https://pypi.typesafe.ai/
```

セット`TYPESAFE_API_KEY`。このファイルの隣には2つのモジュールがあります。`trader.py`には10の関数と、キャッシュから回答を読み取るTypeSafeクライアントが含まれており、再レンダリング時にAPIを呼び出すことなく、以下の数値を再生します。`dispatch.py`には、署名と仕様を読み取って呼び出しを行うコードが含まれています。

```python
import json
from pathlib import Path

from cooksafe import make_playground_link
from dispatch import ROUTE, Dispatcher, closed_sets
from IPython.display import Markdown, display
from trader import TOOLS, client, load

TYPESAFE_MODEL = "jev-1.12"
print(f"{len(TOOLS)} functions over {load().height:,} one-minute bars")
```

```
10 functions over 156,780 one-minute bars
```

## 署名における閉集合を見つける

型ヒントはすでに、どの引数が固定リストから来るか、そして各リストに何が含まれているかを示しています。`closed_sets`はシグネチャを読み取り、それらの引数を3つの形状に分類してソートします：**choice**（`Literal`、つまりリストからの1つの値）、**set**（`list[Literal[...]]`、つまり任意の数の値）、または**flag**（`bool`、つまりオンまたはオフ）。10の関数すべては`trader.py`で定義されています。

```python
for name, fn in TOOLS.items():
    shapes = closed_sets(fn)
    print(
        f"  {name:<20}{len(shapes)}  "
        + ", ".join(f"{a}:{s}" for a, (s, _) in shapes.items())
    )
print(
    f"\n{sum(len(closed_sets(fn)) for fn in TOOLS.values())} fillable arguments in total"
)
```

```
  list_symbols        0  
  market_summary      1  window:choice
  plot_price          7  symbol:choice, style:choice, resolution:choice, window:choice, include_volume:flag, moving_average:choice, log_scale:flag
  intraday_pattern    3  symbol:choice, window:choice, metric:choice
  compare_returns     3  symbols:set, window:choice, normalize:flag
  rolling_correlation 4  symbol:choice, benchmark:choice, window:choice, resolution:choice
  summary_stats       2  symbol:choice, window:choice
  volatility          3  symbol:choice, window:choice, annualized:flag
  top_movers          2  window:choice, direction:choice
  drawdown            3  symbol:choice, window:choice, plot:flag

28 fillable arguments in total
```

`top_movers`は、除外される内容を示します。その3つの引数うち、2つは閉集合です。3つ目の`limit`は`int`であるため、質問が提示されず、デフォルト値の3を維持します。自由テキスト、数値、日付も同様で、質問は提示されず、関数のデフォルト値が適用されます。

## 仕様書を作成する

`Literal`は`"1mo"`と`"3mo"`の文字列を提供します。ユーザーが「今四半期」と入力することが2番目を意味するとは、この`Literal`は述べていません。その定義は仕様書に記されています。`Literal`は、引数ごとに1つの質問、オプションごとに1行、関数ごとに1つの説明、そして関数間を選択するための追加の1つの質問を保持します。これは`spec.json`内に存在し、LLMはシグネチャからこれを作成できます。

```python
SPEC = json.loads(Path("spec.json").read_text())
for argument in ("style", "moving_average"):
    print(
        json.dumps(
            {argument: SPEC["functions"]["plot_price"]["arguments"][argument]}, indent=2
        )
    )
```

```
{
  "style": {
    "question": "Does the user want a plain line or candles?",
    "stated": "Does the user say how the chart should be drawn, such as a line, candles, or OHLC bars?",
    "options": {
      "line": "a simple line through the closing prices",
      "candles": "a candlestick or OHLC chart, showing each bar's open, high, low and close"
    }
  }
}
{
  "moving_average": {
    "question": "How many bars should the moving average cover - nine, twenty, or fifty?",
    "stated": "Does the user ask for a moving average or a smoothed line over the candles?",
    "options": {
      "9": "a nine-bar moving average, a fast one",
      "20": "a twenty-bar moving average",
      "50": "a fifty-bar moving average, a slow one"
    }
  }
}
```

オプションキーは関数が受け取る文字列なので、後でラベルを引数にマッピングする必要はありません。`stated`は引数を省略可能にします。これは、コマンドがその引数について何も言及していないかどうかを問う、2つ目のYes/No質問です。答えがNoの場合、呼び出し側はその引数を省略し、関数側の既定値が適用されます。

A set argument は、メンバーごとに1回質問を受け取り、`{}`はメンバー名に置き換わります。`"Does the user want {} in the comparison?"`は、ティッカーごとに1つの質問になります。

アイデアについて、ユーザーが選ぶかもしれない言葉ではなく、質問をそれぞれ記述してください。一致は意味に基づいて行われるからです。「最近amdはnvidiaを追跡していますか」は、*追跡*や*最近*が`spec.json`のどこにも現れていないにもかかわらず、`rolling_correlation`に到達します。パラメータの名前を質問につけないでください。`"Which resolution?"`は、コマンドが一致対象となるものを何も提供しません。

## 仕様書を質問に変換する

`Dispatcher`は仕様書から質問を一度に構築します。その後、各コマンドは関数の選択とその関数のすべての引数を含む1つのリクエストとなり、ディスパッチャは選択された関数の回答のみを読み取ります。

```python
assistant = Dispatcher(SPEC, TOOLS, client)
print(f"{len(assistant.questions)} questions per command, among them:")
for qid in (
    "__tool__",
    "plot_price.style",
    "plot_price.style?",
    "compare_returns.symbols.NVDA",
):
    question = assistant.questions[qid]
    print(f"  {qid:<30}{question['type']:<8}{str(question['instructions'])[:64]}")
```

```
54 questions per command, among them:
  __tool__                      choice  What is the user asking the trading assistant to do?
  plot_price.style              choice  Does the user want a plain line or candles?
  plot_price.style?             noul    Does the user say how the chart should be drawn, such as a line,
  compare_returns.symbols.NVDA  noul    Does the user want NVDA in the comparison?
```

## 14個のコマンドを実行

リクエストは1行を占め、その`confidence`は、その呼び出しの背後にある最も不確かな判断です。

```python
COMMANDS = [
    "show nvda 1h",
    "plot rolling correlation between nvda and spy for the past month",
    "when during the day does nvda trade the most",
    "what moved today",
    "what tickers do you have",
    "how did the market do this week",
    "candles for tesla with a 20 period moving average",
    "compare nvda amd and msft over the past three months",
    "how volatile is tsla",
    "biggest losers today",
    "worst drawdown for nvda this quarter, and chart it please",
    "spy stats for the last month",
    "show me apple daily with volume",
    "is amd tracking nvidia lately",
]

CALLS = {command: assistant(command) for command in COMMANDS}
for command, call in CALLS.items():
    print(f'  "{command}"')
    print(
        f"      {str(call):<66}confidence {call.confidence:.2f}"
        f"   tool {call.tool.probability:.2f}"
    )
```

```
  "show nvda 1h"
      plot_price(symbol='NVDA', resolution='1h')                        confidence 0.78   tool 1.00
  "plot rolling correlation between nvda and spy for the past month"
      rolling_correlation(symbol='NVDA', benchmark='SPY', window='1mo') confidence 0.91   tool 1.00
  "when during the day does nvda trade the most"
      intraday_pattern(symbol='NVDA')                                   confidence 0.53   tool 1.00
  "what moved today"
      top_movers(window='1d', direction='gainers')                      confidence 0.90   tool 0.90
  "what tickers do you have"
      list_symbols()                                                    confidence 1.00   tool 1.00
  "how did the market do this week"
      market_summary(window='1w')                                       confidence 0.96   tool 0.99
  "candles for tesla with a 20 period moving average"
      plot_price(symbol='TSLA', style='candles', moving_average='20')   confidence 0.69   tool 0.97
  "compare nvda amd and msft over the past three months"
      compare_returns(symbols=['NVDA', 'AMD', 'MSFT'], window='3mo')    confidence 0.94   tool 1.00
  "how volatile is tsla"
      volatility(symbol='TSLA')                                         confidence 0.96   tool 1.00
  "biggest losers today"
      top_movers(window='1d', direction='losers')                       confidence 0.98   tool 0.98
  "worst drawdown for nvda this quarter, and chart it please"
      drawdown(symbol='NVDA', window='3mo', plot=True)                  confidence 0.84   tool 0.84
  "spy stats for the last month"
      summary_stats(symbol='SPY', window='1mo')                         confidence 0.88   tool 0.88
  "show me apple daily with volume"
      plot_price(symbol='AAPL', resolution='1d', include_volume=True)   confidence 0.75   tool 0.85
  "is amd tracking nvidia lately"
      rolling_correlation(symbol='AMD', benchmark='NVDA')               confidence 0.82   tool 0.82
```

両方の長いコマンドは、指示どおり出力された。「過去1ヶ月のnvdaとspyのローリング相関をプロットする」という一文から4つの引数が埋められた。そのうち`symbol`と`benchmark`は、同じ6つのティッカーから抽出され、それぞれのティッカーが正しい引数に割り当てられた。これは、質問文が役割を明確に示しているためだ。*最初に名指しされた測定対象*と、*2番目に名指しされた物差し*という対比である。「過去3ヶ月でnvda、amd、msftを比較する」では、3つのティッカーがセットに含まれ、他の3つは除外された。

それらのうち3つを実行する：

```python
for command in (
    "plot rolling correlation between nvda and spy for the past month",
    "compare nvda amd and msft over the past three months",
    "when during the day does nvda trade the most",
):
    print(f'"{command}"  ->  {CALLS[command]}')
    display(CALLS[command].run())
```

```
"plot rolling correlation between nvda and spy for the past month"  ->  rolling_correlation(symbol='NVDA', benchmark='SPY', window='1mo')
"compare nvda amd and msft over the past three months"  ->  compare_returns(symbols=['NVDA', 'AMD', 'MSFT'], window='3mo')
"when during the day does nvda trade the most"  ->  intraday_pattern(symbol='NVDA')
```

<img src="/img/cases/function-calling-function_calling.executed.1.png" alt="output" width="1335" height="463" data-path="cookbooks/function_calling/function_calling.executed.1.png" />

<img src="/img/cases/function-calling-function_calling.executed.2.png" alt="output" width="1333" height="463" data-path="cookbooks/function_calling/function_calling.executed.2.png" />

<img src="/img/cases/function-calling-function_calling.executed.3.png" alt="output" width="1331" height="468" data-path="cookbooks/function_calling/function_calling.executed.3.png" />

そして、テキストで回答するものたち：

```python
for command in ("how did the market do this week", "biggest losers today"):
    print(f'"{command}"  ->  {CALLS[command]}')
    print(CALLS[command].run(), "\n")
```

```
"how did the market do this week"  ->  market_summary(window='1w')
the board over 1w
  NVDA     254.12    9.62%    389,465,563
  AMD      184.20    1.51%    182,740,497
  AAPL     258.71    0.97%    223,818,998
  SPY      664.86    0.40%    138,617,365
  MSFT     451.35    0.26%    113,427,173
  TSLA     320.22   -0.97%    266,317,023 

"biggest losers today"  ->  top_movers(window='1d', direction='losers')
top 3 losers over 1d
  AMD      -0.57%  ->  184.20
  MSFT      0.67%  ->  451.35
  AAPL      1.40%  ->  258.71 
```

## 信頼性を確認する

`confidence`は、それらの積ではなく、呼び出しにおける最も不確かな判断を示します。なぜなら、引数の一つが間違っただけで結果が台無しになる可能性があるからです。積は異なる質問（「すべての部分が正しいか」）に答え、関数がより多くの引数を取るにつれて、いかなる一つの判断が揺らいでも、その値は低下します。

その数字がどこから来たのか、引数ごとに説明します：

```python
call = CALLS["is amd tracking nvidia lately"]
print(f'"is amd tracking nvidia lately"  ->  {call}   confidence {call.confidence:.2f}')
for name, argument in call.arguments.items():
    top = sorted(argument.distribution.items(), key=lambda kv: -kv[1])[:3]
    shown = "omitted, default stands" if argument.omitted else repr(argument.value)
    print(
        f"  {name:<12}{shown:<26}p {argument.probability:.2f}   "
        + "  ".join(f"{k} {v:.2f}" for k, v in top)
    )
print(f"  weakest argument: {call.weakest().name}")
```

```
"is amd tracking nvidia lately"  ->  rolling_correlation(symbol='AMD', benchmark='NVDA')   confidence 0.82
  symbol      'AMD'                     p 0.87   AMD 0.87  NVDA 0.13  AAPL 0.00
  benchmark   'NVDA'                    p 0.78   NVDA 0.92  AMD 0.08  AAPL 0.00
  window      omitted, default stands   p 0.96   
  resolution  omitted, default stands   p 0.99   
  weakest argument: benchmark
```

`window`と`resolution`はここでは省略されている。なぜなら「最近」という表現は、どの程度過去までを指すのか、あるいはどの時間足（バー）を対象とするのかを明確に示していないからである。そのため、`rolling_correlation`は1ヶ月と時間足1時間という既定値で実行される。これが`stated`の質問が存在する理由である。これがなければ、選択には何らかのウィンドウを指定する必要があり、自信を持ってそのウィンドウを指定することになっただろう。

## プレイグラウンドで開く

以下のリンクには、選択された関数に対する1つのコマンドと質問が含まれています。10の関数説明の中から選んだ選択と、`rolling_correlation`の4つの引数です。そこにあるコマンドを編集すると、引数もそれに応じて変更されます。

```python
COMMAND = "plot rolling correlation between nvda and spy for the past month"
picked = CALLS[COMMAND]
playground_link = make_playground_link(
    COMMAND,
    {ROUTE: assistant.questions[ROUTE]}
    | {q: v for q, v in assistant.questions.items() if q.startswith(f"{picked.name}.")},
    models=[TYPESAFE_MODEL],
)
display(
    Markdown(
        f"🔗 [Open the command and its questions in the TypeSafe playground]({playground_link})"
    )
)
```

[TypeSafe プレイグラウンドでコマンドとその質問を開く →](https://console.typesafe.ai/playground#share/N4IgJg9gxgrgtgUwHYBcAqCAeKQC4AEIADgDYQr4BOEJJAlkgOb5QSWUIkCGKdES+AEYIUAdwTJ8SAG5gu+LkjD4AzkQCe+AGZt8KABYJ8RLiopx+BkABpCRanCIoVGbHkLAAOiAD6PlBA0ft4EXiAo6kQIIfjeUPoQdFDRNrEgDGaUMFC8-Cox3gDq+jz4dCp6hvgwKgiUCioA1gzMBkYolFxgLQ0q5SiKFAH4kAD83rZxlHQodXRcMWH0Zj4q6nCCNPnu3mhVNXX4ooMVw41IEKJH+kn6quubJBW6CVdw2Xc3Zmya5fhkXQQYFsFyGEFUEgUSE0JkovFg3Hq8S4cPwuiQ8GElAmaTgKMaIlW8DxlHUBRAeyMB3qx1QzyQRnoDOMhzWGxoqlePVelSMogSJCMmxRygs0iBtlEMzuF1ULUF93ZJDlTEFyggMBQOO8pHIPnsSRSBF2+1qNJOenBZAgjQUFH4RjZjwA5BUDck0eL6rxEA0FCwSnDtelUJ05Op9TxZpQkOTKdUzQ1GhUefIIkQklxlR0uj1w-hGBAEBUdPUHYrHvgALTXUolIhRJAVUptNGN2ylOB0MDh2wMYatqBkWrB1iOFEIHwcFAwGPbY0U02HWnOPSicG6CwcCtbNECVsqLi+5Go4a1Pk3eIjbtCETR4PUWgtHysdicHh8WM7RdUxMr07gue+A8kOEC1CQmhiIBDy7iU4q3pIYo9AEjAiIYlAdkowGXJUdamAGiioWAwYqMSKIRmYPDzmk8bUkcFpplwggKhAWhSJidQlro5ZOhyNY3Iw+gqLYZCiMJChelwqH4GKCC2AEAzKtOs5fpMIDSDQH70BEcZLvUpjJthVwadwvCCrY8QQA26i2Lo0xNJoPEwcqJQVMIyDBgERA+LJlDUSav7LgxVCKASyjLPabH8rcO5PFQYFGLoWicNmVQWGYwZgJ0oiQKIX4LrRiYGSmOFaCie6Os52gpdoDj+lEXCNH2q7rn5FBgAgQ4MCkAC+PVqY+TKMC+bAcKZn4AHS8SQizeOmRppJZhrBhkHTZLkTbksUMXfFAtp-K2dEGT0TEahQNatuWwg9IgpizhKUhHkC2h0G14ypFMMxzAs7hhAAygACgAmuSgNA-JVR-QAZAD+AAKwAAwI2UShYPgACiaAAGIQ0YJIEhQ+HyPyNApGpAByABqAAiACC5Lk9I3bzLZWizAIojTCg7P4FTdPBrTACy1PkkL1O2LTYDSIoyTKILSTUPg1MIEzyTbGptO0wDAAyosNuZaJs5InMzDzms68Ggt-VjaDkvLUDUCorEoKzPMm9zkhWzbwZoH92v09+GAqNwrvG1zPO+-73h9QNNBDSNb7jfwE3CEg8T47N4SRAtcQJMtH0hpk62fv5IDbVeu37RUMy3j0Y6ws9UlcKt1a8hCrBYeWSBPcCbfqCKZhJI071qQ7X3TD9oTeGDoPA7j+DQ7DiPIwwHWYBj2Pz-jIh+sTApk2kfMBwujPM1wocc+HkhHwLwui8LEtSzLz324ryuq8WAta7r360-rcmGzdlfAQ5sf5qS9rbb8r8wLOwvkcYB+AIE+z9sfGixYQ6ALDqbSQkcA4xzSINZ8r4xofmTqndO+J3pTyzlEckFwYAzQLqtLIOQS7kmpkWU4elHq+nkLUDuyhpqWhYBAcc24m6rXev1AhcciGjXfBtCaUolCXEzvNckS1kgrSbGtVheRyQAAlSrlUEFwPaZQuGBX0k0E6mxNStwCL2NuJgzBHAkE1ZxphzCWH0LZb0VQXFDH0BwPGPiVAj0Wlzb6mcACMxFvyOK4DZNuplixDDDD0WoKg+j8D3BBYMMTRDklbIEtxCBGgFIsMUgJXiZI+ODAAZiqQkmpriDAhLqagISHZ8AAEcYAonvCAfB3hCFMATiQxRyjcpUPwGEdR356GMLUsw4u+jvwcOLG3Oih5NA8jKvUUx5jhjWg8aRK8+FEnJIMH8cQ5SIZ-AsF0vxlQ-j9MGXUKRscnzjOIQoyaHAnYkE1J+NR2cNF5y0UwnRLCNql2KKUUx9Q+gAC9HQJAYcoVsyk5y3hkggO6HB1QCBrOWLsGJZi2C0HQeC5LNTFipXQI2iEGD0vEuWDFGE0RlmZOGCJn1ozzFiXAckDoqx0tmFQEQKl1ZpDhiK781LxTitZZKnFm0C4xPleSalzKkAqopUYdVsrvAxP0OSTlEEpUzjnAU+JC45B0Ctca6O0jRmyN+fIpOSAJqApoCC-gsz5ngsWRqZZaRVl6I1QuTZliEysiSbWCgSK5Rou5SjaM0tszgluqRbcxq9xSJ6qkEAXAMyU04p+dw6kYklvAp1WYYBBYQA6k8dwABtEAAArFWVYYkTRiQAJhAAAXR6kAA)