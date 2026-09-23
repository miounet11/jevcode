---
title: "Appel de fonction"
description: "Transforme les demandes de trading en langage naturel en appels de fonctions typées ordinaires en mappant les noms de fonctions et les arguments à ensemble fermé en questions TypeSafe à conscience de confiance."
section: cases
order: 190
tags: ['cookbook', 'recipe']
source: "docs.typesafe.ai/cookbooks/function_calling"
translatedFrom: en
---
Lorsque vous commandez un « grand latte glacé à l’avoine, sans édulcorant », le barista ne note pas votre phrase. Il coche quatre options sur un gobelet. Ce livre de recettes fait de même pour une API de trading : une phrase entre, et en ressort un nom de fonction ainsi que ses arguments évalués sous forme d’énumérations, chacun accompagné d’un niveau de confiance.

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

Ces appels vont vers dix fonctions ordinaires dans un assistant de trading. Leurs arguments prennent des valeurs dans des listes fixes, donc ils sont déjà des `Literal`s :

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

Un argument dont les valeurs proviennent d’une liste fixe constitue un ensemble clos. Lorsqu’il prend une valeur
sur cette liste, il pose une question `Choice` portant exactement sur ces valeurs, de sorte que
tout ce qui atteint la fonction est une valeur que la fonction accepte. Vous laissez les fonctions tranquilles. Ce
que vous ajoutez, c’est une spécification qui dit en mots simples ce que signifie chaque argument. À la fin, vous avez un
`Dispatcher` que vous pouvez montrer à vos propres fonctions.

## Configuration

```bash
pip install ipython polars matplotlib numpy "typesafe-sdk>=0.5.7" cooksafe --extra-index-url https://pypi.typesafe.ai/
```

Ensemble `TYPESAFE_API_KEY`. Deux modules sont placés à côté de ce fichier. `trader.py` contient les dix
fonctions, ainsi qu'un client TypeSafe qui lit les réponses dans un cache, de sorte que le nouveau rendu rejoue
les nombres ci-dessous sans appeler l'API. `dispatch.py` contient le code qui lit une
signature et une spécification et effectue l'appel.

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

## Trouver les ensembles fermés dans les signatures

Les indications de type disent déjà quels arguments proviennent d'une liste fixe, et ce qui se trouve dans chaque
liste. `closed_sets` lit une signature et trie ces arguments selon trois formes : un
**choice** (un `Literal`, donc une valeur sur la liste), un **set** (un `list[Literal[...]]`,
donc n'importe quel nombre d'entre eux), ou un **flag** (un `bool`, donc activé ou désactivé). Les dix fonctions sont
définies dans `trader.py`.

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

`top_movers` montre ce qui est omis. Parmi ses trois arguments, deux sont des ensembles fermés. Le
troisième, `limit`, est un `int`, donc il ne reçoit jamais de question et conserve sa valeur par défaut de 3. Le
texte libre, les nombres et les dates fonctionnent de la même manière : pas de question, et la valeur par défaut de la fonction reste en vigueur.

## Rédiger la spécification

Le `Literal` vous fournit les chaînes `"1mo"` et `"3mo"`. Il ne précise pas qu'un utilisateur tapant « ce trimestre » fait référence au second. C'est la spécification qui le dit. Elle contient une question par argument, une ligne par option, une description par fonction, et une question supplémentaire qui permet de choisir entre les fonctions. Elle réside dans `spec.json`, et un LLM peut la rédiger pour vous à partir des signatures.

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

Les clés d’option sont les chaînes que la fonction prend, de sorte qu’il n’est pas nécessaire de mapper un libellé à un argument ensuite. `stated` rend un argument optionnel. Il s’agit d’une seconde question oui/non demandant si la commande dit quoi que ce soit à propos de cet argument. Lorsque la réponse est non, l’appel exclut cet argument et la valeur par défaut de la fonction s’applique.

Un argument en ensemble pose sa question une fois par membre, `{}` servant de nom de membre. `"Does the user want {} in the comparison?"` devient une question par ticker.

Formulez chaque question sur l’idée plutôt que sur les mots qu’un utilisateur pourrait choisir, car la correspondance porte sur le sens : « is amd tracking nvidia lately » atteint `rolling_correlation` même si ni *tracking* ni *lately* n’apparaissent nulle part dans `spec.json`. Évitez de nommer une question d’après son paramètre - `"Which resolution?"` ne donne à la commande rien contre quoi faire la correspondance.

## Transformer la spécification en questions

`Dispatcher` construit les questions à partir de la spécification une seule fois. Chaque commande est ensuite une requête unique
transportant le choix de la fonction et les arguments de chaque fonction, et le répartiteur lit
uniquement les réponses de la fonction choisie.

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

## Exécuter quatorze commandes

Une requête occupe une seule ligne, et son `confidence` est le jugement le moins certain derrière cet appel.

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

Les deux commandes longues sont sorties comme demandé. « plot rolling correlation between nvda and spy for the past month » a rempli quatre arguments à partir d’une seule phrase. Deux d’entre eux, `symbol` et `benchmark`, sont tirés des mêmes six tickers, et chaque ticker a atterri dans le bon argument car les questions précisent les rôles : *celui qui est mesuré, nommé en premier* contre *le second nommé, l’étalon*. « compare nvda amd and msft over the past three months » a placé trois tickers dans l’ensemble et a laissé les trois autres de côté.

En faire fonctionner trois :

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

Et ceux qui répondent par écrit :

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

## Lire la confiance

`confidence` signale le jugement le moins certain dans l’appel, plutôt que le produit
de tous, car un seul argument erroné suffit à fausser le résultat. Un produit répond à une
question différente (« chaque partie est-elle correcte »), et il diminue à mesure qu’une
fonction prend plus
d’arguments, que le jugement d’un seul soit incertain ou non.

D’où vient ce nombre, argument par argument :

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

`window` et `resolution` sont tous deux omis ici, car « lately » n’indique pas jusqu’à quelle date en arrière ni sur quelles barres, de sorte que `rolling_correlation` s’exécute avec ses valeurs par défaut d’un mois et de barres horaires. C’est précisément à cela que sert la question `stated`. Sans elle, le choix aurait dû nommer une fenêtre, et il l’aurait fait avec assurance.

## Ouvrez-le dans le playground

Le lien ci-dessous contient une commande et les questions pour la fonction qu’elle a sélectionnée : le choix parmi les dix descriptions de fonctions, ainsi que les quatre arguments de `rolling_correlation`. Modifiez la commande à cet endroit et les arguments changeront en conséquence.

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

[Ouvrez la commande et ses questions dans le playground TypeSafe →](https://console.typesafe.ai/playground#share/N4IgJg9gxgrgtgUwHYBcAqCAeKQC4AEIADgDYQr4BOEJJAlkgOb5QSWUIkCGKdES+AEYIUAdwTJ8SAG5gu+LkjD4AzkQCe+AGZt8KABYJ8RLiopx+BkABpCRanCIoVGbHkLAAOiAD6PlBA0ft4EXiAo6kQIIfjeUPoQdFDRNrEgDGaUMFC8-Cox3gDq+jz4dCp6hvgwKgiUCioA1gzMBkYolFxgLQ0q5SiKFAH4kAD83rZxlHQodXRcMWH0Zj4q6nCCNPnu3mhVNXX4ooMVw41IEKJH+kn6quubJBW6CVdw2Xc3Zmya5fhkXQQYFsFyGEFUEgUSE0JkovFg3Hq8S4cPwuiQ8GElAmaTgKMaIlW8DxlHUBRAeyMB3qx1QzyQRnoDOMhzWGxoqlePVelSMogSJCMmxRygs0iBtlEMzuF1ULUF93ZJDlTEFyggMBQOO8pHIPnsSRSBF2+1qNJOenBZAgjQUFH4RjZjwA5BUDck0eL6rxEA0FCwSnDtelUJ05Op9TxZpQkOTKdUzQ1GhUefIIkQklxlR0uj1w-hGBAEBUdPUHYrHvgALTXUolIhRJAVUptNGN2ylOB0MDh2wMYatqBkWrB1iOFEIHwcFAwGPbY0U02HWnOPSicG6CwcCtbNECVsqLi+5Go4a1Pk3eIjbtCETR4PUWgtHysdicHh8WM7RdUxMr07gue+A8kOEC1CQmhiIBDy7iU4q3pIYo9AEjAiIYlAdkowGXJUdamAGiioWAwYqMSKIRmYPDzmk8bUkcFpplwggKhAWhSJidQlro5ZOhyNY3Iw+gqLYZCiMJChelwqH4GKCC2AEAzKtOs5fpMIDSDQH70BEcZLvUpjJthVwadwvCCrY8QQA26i2Lo0xNJoPEwcqJQVMIyDBgERA+LJlDUSav7LgxVCKASyjLPabH8rcO5PFQYFGLoWicNmVQWGYwZgJ0oiQKIX4LrRiYGSmOFaCie6Os52gpdoDj+lEXCNH2q7rn5FBgAgQ4MCkAC+PVqY+TKMC+bAcKZn4AHS8SQizeOmRppJZhrBhkHTZLkTbksUMXfFAtp-K2dEGT0TEahQNatuWwg9IgpizhKUhHkC2h0G14ypFMMxzAs7hhAAygACgAmuSgNA-JVR-QAZAD+AAKwAAwI2UShYPgACiaAAGIQ0YJIEhQ+HyPyNApGpAByABqAAiACC5Lk9I3bzLZWizAIojTCg7P4FTdPBrTACy1PkkL1O2LTYDSIoyTKILSTUPg1MIEzyTbGptO0wDAAyosNuZaJs5InMzDzms68Ggt-VjaDkvLUDUCorEoKzPMm9zkhWzbwZoH92v09+GAqNwrvG1zPO+-73h9QNNBDSNb7jfwE3CEg8T47N4SRAtcQJMtH0hpk62fv5IDbVeu37RUMy3j0Y6ws9UlcKt1a8hCrBYeWSBPcCbfqCKZhJI071qQ7X3TD9oTeGDoPA7j+DQ7DiPIwwHWYBj2Pz-jIh+sTApk2kfMBwujPM1wocc+HkhHwLwui8LEtSzLz324ryuq8WAta7r360-rcmGzdlfAQ5sf5qS9rbb8r8wLOwvkcYB+AIE+z9sfGixYQ6ALDqbSQkcA4xzSINZ8r4xofmTqndO+J3pTyzlEckFwYAzQLqtLIOQS7kmpkWU4elHq+nkLUDuyhpqWhYBAcc24m6rXev1AhcciGjXfBtCaUolCXEzvNckS1kgrSbGtVheRyQAAlSrlUEFwPaZQuGBX0k0E6mxNStwCL2NuJgzBHAkE1ZxphzCWH0LZb0VQXFDH0BwPGPiVAj0Wlzb6mcACMxFvyOK4DZNuplixDDDD0WoKg+j8D3BBYMMTRDklbIEtxCBGgFIsMUgJXiZI+ODAAZiqQkmpriDAhLqagISHZ8AAEcYAonvCAfB3hCFMATiQxRyjcpUPwGEdR356GMLUsw4u+jvwcOLG3Oih5NA8jKvUUx5jhjWg8aRK8+FEnJIMH8cQ5SIZ-AsF0vxlQ-j9MGXUKRscnzjOIQoyaHAnYkE1J+NR2cNF5y0UwnRLCNql2KKUUx9Q+gAC9HQJAYcoVsyk5y3hkggO6HB1QCBrOWLsGJZi2C0HQeC5LNTFipXQI2iEGD0vEuWDFGE0RlmZOGCJn1ozzFiXAckDoqx0tmFQEQKl1ZpDhiK781LxTitZZKnFm0C4xPleSalzKkAqopUYdVsrvAxP0OSTlEEpUzjnAU+JC45B0Ctca6O0jRmyN+fIpOSAJqApoCC-gsz5ngsWRqZZaRVl6I1QuTZliEysiSbWCgSK5Rou5SjaM0tszgluqRbcxq9xSJ6qkEAXAMyU04p+dw6kYklvAp1WYYBBYQA6k8dwABtEAAArFWVYYkTRiQAJhAAAXR6kAA)