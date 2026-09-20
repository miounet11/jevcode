---
title: "함수 호출"
description: "자연어 거래 요청을 함수 이름과 폐쇄 집합 인수를 신뢰도 인식 TypeSafe 질문으로 매핑하여 일반 입력형 함수 호출로 변환합니다."
section: cases
order: 190
tags: ['cookbook', 'recipe']
source: "docs.typesafe.ai/cookbooks/function_calling"
translatedFrom: en
---
"라지 아이드 오트 라테, 무가당"을 주문할 때 바리스타는 당신의 문장을 그대로 적지 않습니다. 컵 위에 네 가지 옵션에 체크를 합니다. 이 요리책은 거래 API에 대해 동일한 방식을 적용합니다: 문장이 들어가면, 함수 이름과 그 인자(평가된 열거형으로)가 신뢰도 각도로 함께 출력됩니다.

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

그 호출들은 트레이딩 어시스턴트의 열 가지 일반 함수로 전달된다. 그들의 인수는 고정된 목록에서 값을 가져오므로, 이들은 이미 `Literal`이다:

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

고정된 목록에서 값을 가져오는 인수는 닫힌 집합이다. 해당 목록에서 하나의 값을 선택하면, 정확히 그 값들에 대해 `Choice` 질문이 발생하므로 함수에 도달하는 값은 함수가 허용하는 값이다. 함수는 그대로 둔다. 당신이 추가하는 것은 각 인수가 무엇을 의미하는지를 평이한 언어로 명시하는 스펙이다. 최종적으로 당신은 자신의 함수를 가리킬 수 있는 `Dispatcher`을 갖게 된다.

## 설정

```bash
pip install ipython polars matplotlib numpy "typesafe-sdk>=0.5.7" cooksafe --extra-index-url https://pypi.typesafe.ai/
```

Set `TYPESAFE_API_KEY`. 두 모듈이 이 파일 옆에 있습니다. `trader.py`에는 10개의 함수와 캐시에서 답변을 읽는 TypeSafe 클라이언트가 포함되어 있어, 다시 렌더링하면 API를 호출하지 않고도 아래 숫자를 재생합니다. `dispatch.py`에는 서명과 사양을 읽고 호출을 수행하는 코드가 포함되어 있습니다.

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

## 시그니처에서 닫힌 집합을 찾으세요

타입 힌트는 이미 어떤 인수가 고정된 목록에서 오는지, 그리고 각 목록에 무엇이 있는지 명시하고 있습니다. `closed_sets`은 시그니처를 읽고 해당 인수를 세 가지 형태로 분류합니다: **choice**(목록 중 하나의 값, 즉 `Literal`), **set**(그 중 아무 수나, 즉 `list[Literal[...]]`), 또는 **flag**(켜짐 또는 꺼짐, 즉 `bool`). 모든 열 가지 함수는 `trader.py`에 정의되어 있습니다.

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

`top_movers`은 제외되는 내용을 보여줍니다. 세 가지 인자 중 두 개는 닫힌 집합입니다. 세 번째 인자 `limit`는 `int`이므로 질문을 받지 않으며, 기본값인 3을 유지합니다. 자유 텍스트, 숫자 및 날짜도 동일한 방식으로 동작합니다: 질문이 없으며, 함수의 기본값이 적용됩니다.

## 스펙 작성

`Literal`는 `"1mo"`과 `"3mo"`라는 문자열을 제공합니다. 사용자가 "이번 분기"라고 입력하는 것이 두 번째 것을 의미한다는 말은 하지 않습니다. 그 부분은 명세에서 규정합니다. 이는 각 인수당 하나의 질문, 각 옵션당 한 줄, 각 함수당 하나의 설명, 그리고 함수 간 선택을 담당하는 하나의 추가 질문을 포함합니다. 이는 `spec.json`에 위치하며, LLM은 시그니처를 바탕으로 이를 작성해 줄 수 있습니다.

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

옵션 키는 함수가 받는 문자열이므로, 나중에 레이블을 인수로 다시 매핑할 필요는 없습니다. `stated`는 인수를 선택적으로 만듭니다. 이는 해당 인수에 대해 명령이 전혀 언급하는지 여부를 묻는 두 번째 예/아니요 질문입니다. 답변이 아니오인 경우, 호출은 해당 인수를 생략하고 함수 자체의 기본값이 적용됩니다.

집합 인수는 각 구성원당 한 번씩 질문을 받으며, `{}`는 구성원 이름을 대신합니다. `"Does the user want {} in the comparison?"`는 각 티커당 하나의 질문이 됩니다.

아이디어에 대해 질문을 작성하세요. 사용자가 선택할 수 있는 단어 자체가 아니라, 의미에 기반한 매칭이 이루어지기 때문입니다. "is amd tracking nvidia lately"는 `rolling_correlation`에 도달하지만, *tracking*이나 *lately*는 `spec.json` 어디에도 나타나지 않습니다. 질문의 이름을 파라미터로 지정하지 마세요. `"Which resolution?"`는 명령어에 매칭할 대상이 없습니다.

## 명세를 질문으로 바꾸기

`Dispatcher`는 명세에서 질문을 한 번에 생성합니다. 각 명령어는 함수 선택과 모든 함수의 인수를 담은 하나의 요청이며, 디스패처는 선택된 함수의 답변만 읽습니다.

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

## 14개 명령 실행

요청 한 줄에 하나의 요청이 할당되며, 그 `confidence`는 해당 호출 뒤에 있는 가장 불확실한 판단입니다.

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

요청한 대로 긴 명령어 두 개가 모두 출력되었다. "plot rolling correlation between nvda and spy for the past month"은 한 문장에서 네 개의 인수를 채웠다. 이 중 `symbol`와 `benchmark`는 동일한 여섯 개의 티커에서 추출되며, 각 티커는 질문이 역할을 명시하고 있기 때문에 올바른 인수에 할당되었다. *첫 번째로 언급된 측정 대상*과 *두 번째로 언급된 기준치*가 그것이다. "compare nvda amd and msft over the past three months"은 세 개의 티커를 세트에 포함시켰고 나머지 세 개는 제외했다.

그 중 세 개를 실행하는 중:

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

그리고 텍스트로 응답하는 것들:

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

## 신뢰도를 읽으세요

`confidence`는 모든 판단의 곱이 아니라, 호출에서 가장 불확실한 판단을 보고합니다. 이는 하나의 잘못된 인자만으로도 결과가 망가질 수 있기 때문입니다. 곱은 다른 질문(“모든 부분이 정확한가”)에 답하며, 함수가 더 많은 인자를 받으면 한 판단이 흔들리든 흔들리지 않든 상관없이 그 값은 떨어집니다.

그 숫자가 어디에서 유래했는지, 인자별로 살펴보자:

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

`window`와 `resolution`는 둘 다 여기서 생략됩니다. '최근'이라는 표현이 얼마나 과거를 가리키는지, 또는 어떤 막대 차트에서인지 명시하지 않기 때문입니다. 따라서 `rolling_correlation`는 한 달과 시간 단위 막대 차트라는 기본값으로 실행됩니다. 이것이 `stated` 질문의 존재 이유입니다. 이것이 없다면, 선택지는 특정 기간을 명시해야 했을 것이며, 자신 있게 그 기간을 지정했을 것입니다.

## 플레이그라운드에서 열기

아래 링크에는 선택된 함수에 대한 하나의 명령과 질문이 담겨 있습니다: 열 가지 함수 설명 중 선택과 `rolling_correlation`의 네 가지 인자입니다. 그곳의 명령을 편집하면 인자도 함께 변경됩니다.

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

[TypeSafe 플레이그라운드에서 명령어와 질문 열기 →](https://console.typesafe.ai/playground#share/N4IgJg9gxgrgtgUwHYBcAqCAeKQC4AEIADgDYQr4BOEJJAlkgOb5QSWUIkCGKdES+AEYIUAdwTJ8SAG5gu+LkjD4AzkQCe+AGZt8KABYJ8RLiopx+BkABpCRanCIoVGbHkLAAOiAD6PlBA0ft4EXiAo6kQIIfjeUPoQdFDRNrEgDGaUMFC8-Cox3gDq+jz4dCp6hvgwKgiUCioA1gzMBkYolFxgLQ0q5SiKFAH4kAD83rZxlHQodXRcMWH0Zj4q6nCCNPnu3mhVNXX4ooMVw41IEKJH+kn6quubJBW6CVdw2Xc3Zmya5fhkXQQYFsFyGEFUEgUSE0JkovFg3Hq8S4cPwuiQ8GElAmaTgKMaIlW8DxlHUBRAeyMB3qx1QzyQRnoDOMhzWGxoqlePVelSMogSJCMmxRygs0iBtlEMzuF1ULUF93ZJDlTEFyggMBQOO8pHIPnsSRSBF2+1qNJOenBZAgjQUFH4RjZjwA5BUDck0eL6rxEA0FCwSnDtelUJ05Op9TxZpQkOTKdUzQ1GhUefIIkQklxlR0uj1w-hGBAEBUdPUHYrHvgALTXUolIhRJAVUptNGN2ylOB0MDh2wMYatqBkWrB1iOFEIHwcFAwGPbY0U02HWnOPSicG6CwcCtbNECVsqLi+5Go4a1Pk3eIjbtCETR4PUWgtHysdicHh8WM7RdUxMr07gue+A8kOEC1CQmhiIBDy7iU4q3pIYo9AEjAiIYlAdkowGXJUdamAGiioWAwYqMSKIRmYPDzmk8bUkcFpplwggKhAWhSJidQlro5ZOhyNY3Iw+gqLYZCiMJChelwqH4GKCC2AEAzKtOs5fpMIDSDQH70BEcZLvUpjJthVwadwvCCrY8QQA26i2Lo0xNJoPEwcqJQVMIyDBgERA+LJlDUSav7LgxVCKASyjLPabH8rcO5PFQYFGLoWicNmVQWGYwZgJ0oiQKIX4LrRiYGSmOFaCie6Os52gpdoDj+lEXCNH2q7rn5FBgAgQ4MCkAC+PVqY+TKMC+bAcKZn4AHS8SQizeOmRppJZhrBhkHTZLkTbksUMXfFAtp-K2dEGT0TEahQNatuWwg9IgpizhKUhHkC2h0G14ypFMMxzAs7hhAAygACgAmuSgNA-JVR-QAZAD+AAKwAAwI2UShYPgACiaAAGIQ0YJIEhQ+HyPyNApGpAByABqAAiACC5Lk9I3bzLZWizAIojTCg7P4FTdPBrTACy1PkkL1O2LTYDSIoyTKILSTUPg1MIEzyTbGptO0wDAAyosNuZaJs5InMzDzms68Ggt-VjaDkvLUDUCorEoKzPMm9zkhWzbwZoH92v09+GAqNwrvG1zPO+-73h9QNNBDSNb7jfwE3CEg8T47N4SRAtcQJMtH0hpk62fv5IDbVeu37RUMy3j0Y6ws9UlcKt1a8hCrBYeWSBPcCbfqCKZhJI071qQ7X3TD9oTeGDoPA7j+DQ7DiPIwwHWYBj2Pz-jIh+sTApk2kfMBwujPM1wocc+HkhHwLwui8LEtSzLz324ryuq8WAta7r360-rcmGzdlfAQ5sf5qS9rbb8r8wLOwvkcYB+AIE+z9sfGixYQ6ALDqbSQkcA4xzSINZ8r4xofmTqndO+J3pTyzlEckFwYAzQLqtLIOQS7kmpkWU4elHq+nkLUDuyhpqWhYBAcc24m6rXev1AhcciGjXfBtCaUolCXEzvNckS1kgrSbGtVheRyQAAlSrlUEFwPaZQuGBX0k0E6mxNStwCL2NuJgzBHAkE1ZxphzCWH0LZb0VQXFDH0BwPGPiVAj0Wlzb6mcACMxFvyOK4DZNuplixDDDD0WoKg+j8D3BBYMMTRDklbIEtxCBGgFIsMUgJXiZI+ODAAZiqQkmpriDAhLqagISHZ8AAEcYAonvCAfB3hCFMATiQxRyjcpUPwGEdR356GMLUsw4u+jvwcOLG3Oih5NA8jKvUUx5jhjWg8aRK8+FEnJIMH8cQ5SIZ-AsF0vxlQ-j9MGXUKRscnzjOIQoyaHAnYkE1J+NR2cNF5y0UwnRLCNql2KKUUx9Q+gAC9HQJAYcoVsyk5y3hkggO6HB1QCBrOWLsGJZi2C0HQeC5LNTFipXQI2iEGD0vEuWDFGE0RlmZOGCJn1ozzFiXAckDoqx0tmFQEQKl1ZpDhiK781LxTitZZKnFm0C4xPleSalzKkAqopUYdVsrvAxP0OSTlEEpUzjnAU+JC45B0Ctca6O0jRmyN+fIpOSAJqApoCC-gsz5ngsWRqZZaRVl6I1QuTZliEysiSbWCgSK5Rou5SjaM0tszgluqRbcxq9xSJ6qkEAXAMyU04p+dw6kYklvAp1WYYBBYQA6k8dwABtEAAArFWVYYkTRiQAJhAAAXR6kAA)