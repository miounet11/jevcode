// 由 scripts/verify-jev-callsites.mjs 生成，请勿手改。
export interface CallSite { file: string; line: number; text: string; ref: string }
export const CALL_SITES: Record<string, CallSite> = {
  "laya-php": {
    "file": "src/Laya.php",
    "line": 197,
    "text": "$raw = $this->send($this->post('/v1/systemone', $json));",
    "ref": "main"
  },
  "cribrix": {
    "file": "cribrix/clients/jev.py",
    "line": 4,
    "text": "``system_one(state, questions)``, which evaluates a *mapping of named",
    "ref": "main"
  },
  "go-jev": {
    "file": "jev.go",
    "line": 19,
    "text": "DefaultURL     = \"https://api.typesafe.ai/v1/systemone\"",
    "ref": "main"
  },
  "gut-check": {
    "file": "custom_components/gutcheck/budget.py",
    "line": 23,
    "text": "from .models import SystemOneRequest, SystemOneResponse",
    "ref": "main"
  },
  "jev-research-pipeline": {
    "file": "src/jev_research_pipeline/pipeline/drift.py",
    "line": 21,
    "text": "SYSTEM_ONE: Final = \"https://api.typesafe.ai/v1/systemone\"",
    "ref": "main"
  },
  "eikos": {
    "file": "eikos/serve.py",
    "line": 343,
    "text": "if self.path not in (\"/v1/systemone\", \"/v1/evaluate\"):",
    "ref": "main"
  },
  "jev-java": {
    "file": "src/main/java/io/github/Olti1947/jev/JevClient.java",
    "line": 137,
    "text": ".uri(URI.create(baseUrl + \"/v1/systemone\"));",
    "ref": "main"
  },
  "zio-typesafe-ai": {
    "file": "src/main/scala/com/jamesward/zio_typesafe_ai/TypeSafeAI.scala",
    "line": 3,
    "text": "import com.jamesward.zio_typesafe_ai.internal.{Codecs, Helpers, Http, LoopImpl, RequestImpl, Wire}",
    "ref": "main"
  },
  "zod-jev": {
    "file": "scripts/check-package.mjs",
    "line": 35,
    "text": "if (url !== \"https://api.typesafe.ai/v1/systemone\") throw new Error(\"unexpected url: \" + url);",
    "ref": "main"
  },
  "jev-book-tags": {
    "file": "plugin/client.py",
    "line": 7,
    "text": "BASE_URL = 'https://api.typesafe.ai/v1'",
    "ref": "main"
  },
  "jev-sdk-java": {
    "file": "src/main/java/com/luigivismara/jev/JevClient.java",
    "line": 156,
    "text": "String body = send(\"/v1/systemone\", request);",
    "ref": "main"
  },
  "kunobi-jev": {
    "file": "src/blocking.rs",
    "line": 27,
    "text": "use crate::request::SystemOneRequest;",
    "ref": "main"
  },
  "typesafe-sdk-rust": {
    "file": "benches/client_overhead.rs",
    "line": 15,
    "text": "use typesafe_sdk::{Client, Question, RetryPolicy};",
    "ref": "main"
  },
  "jev-cli": {
    "file": "src/client.ts",
    "line": 25,
    "text": "const url = new URL(\"/v1/systemone\", cfg.baseUrl).toString();",
    "ref": "main"
  },
  "jev4pg": {
    "file": "sdd/evaluators.py",
    "line": 39,
    "text": "DEFAULT_JEV_ENDPOINT = \"https://api.typesafe.ai/v1/systemone\"",
    "ref": "main"
  },
  "spring-ai-typesafe": {
    "file": "typesafe-java-sdk/src/main/java/org/springaicommunity/typesafe/TypeSafeClient.java",
    "line": 47,
    "text": "import org.springaicommunity.typesafe.question.SystemOneRequest;",
    "ref": "main"
  },
  "advocaat": {
    "file": "src/api.ts",
    "line": 127,
    "text": "export interface SystemOneRequest<Q extends Questions = Questions> {",
    "ref": "main"
  },
  "typesafe-zig": {
    "file": "src/Client.zig",
    "line": 353,
    "text": ".path = \"/v1/systemone\",",
    "ref": "master"
  },
  "agent-reflex": {
    "file": "plugins/hermes/classifier.py",
    "line": 34,
    "text": "\"typesafe\": \"https://api.typesafe.ai/v1\",",
    "ref": "main"
  },
  "pi-typesafe": {
    "file": "src/ask.ts",
    "line": 32,
    "text": "export async function ask<Q extends Questions>(judge: Judge, request: SystemOneRequest<Q>, options: AskOptions = {}): Promise<AskAnswer<Q>> {",
    "ref": "main"
  },
  "0xarx-jevegis": {
    "file": "src/lib/engine.ts",
    "line": 1,
    "text": "import { TypeSafeClient, type Questions } from \"@typesafe-ai/sdk\";",
    "ref": "main"
  },
  "typesafeai-dotnet-sdk": {
    "file": "src/TypeSafe.Sdk/ITypeSafeClient.cs",
    "line": 34,
    "text": "SystemOneRequest request,",
    "ref": "main"
  },
  "openai-scala-client": {
    "file": "typesafe-client/src/main/scala/io/cequence/openaiscala/typesafe/JsonFormats.scala",
    "line": 125,
    "text": "implicit val systemOneRequestFormat: Format[SystemOneRequest] = Format(",
    "ref": "master"
  },
  "3clyp50-a0-typesafe-ai": {
    "file": "extensions/webui/get_tool_message_handler/typesafe.js",
    "line": 2,
    "text": "import { renderResults } from \"/plugins/typesafe_ai/webui/results.js\";",
    "ref": "main"
  },
  "0xtrou-rubikjev": {
    "file": "src/app/api/solve/route.ts",
    "line": 127,
    "text": "const response = await client.systemOne({",
    "ref": "main"
  },
  "abdelstark-bicameral": {
    "file": "packages/s1-runtime/src/backends/typesafe.ts",
    "line": 1,
    "text": "import { TypeSafeClient, type EntryType, type Questions, type TypeSafeClientConfig } from \"@typesafe-ai/sdk\";",
    "ref": "main"
  },
  "6mikao9-jev-agent-design-with-topk-logits-choices": {
    "file": "jev_agent/jev_client.py",
    "line": 57,
    "text": "\"https://api.typesafe.ai/v1/systemone\",",
    "ref": "main"
  },
  "abe75ch-tiltmeter": {
    "file": "tiltmeter.py",
    "line": 270,
    "text": "import httpx2  # installed with pydantic-ai-slim[typesafe] and typesafe-sdk",
    "ref": "main"
  },
  "decision-models-as-guardrails": {
    "file": "infra/gcp/laya_server.py",
    "line": 118,
    "text": "if self.path != \"/v1/systemone\":",
    "ref": "main"
  },
  "0xbakeer-arbiter": {
    "file": "integrations/claude-code/hooks/eval.py",
    "line": 57,
    "text": "request = urllib.request.Request(ARBITER_URL + \"/v1/systemone\", data=body, headers=headers,",
    "ref": "main"
  },
  "adhyaay-karnwal-jev-chat": {
    "file": "src/jevchat/client.py",
    "line": 7,
    "text": "from typesafe_sdk import AsyncTypeSafeClient, RetryPolicy",
    "ref": "main"
  },
  "adarshmishra07-jcm-router": {
    "file": "scripts/eval.ts",
    "line": 12,
    "text": "const JEV_PATH = \"/v1/systemone\";",
    "ref": "main"
  },
  "abhishek085-open-spark-jev": {
    "file": "open_spark_jev/experimental/control_es.py",
    "line": 11,
    "text": "it behind the identical ``/v1/systemone`` wire format -- see ``is_control_es`` / the branch in",
    "ref": "main"
  },
  "0xnatoshi-jev-codex-router": {
    "file": "poc/backtest_savings.py",
    "line": 157,
    "text": "resp = poc.post_json(\"https://api.typesafe.ai/v1/systemone\", key,",
    "ref": "main"
  },
  "alexj11324-open-jev-approvals": {
    "file": "internal/jev/client.go",
    "line": 22,
    "text": "const defaultBaseURL = \"https://api.typesafe.ai/v1/systemone\"",
    "ref": "main"
  },
  "alterhq-typesafe-sdk-swift": {
    "file": "Sources/TypeSafe/Requests.swift",
    "line": 4,
    "text": "public struct SystemOneRequest: Sendable, Hashable {",
    "ref": "main"
  },
  "altryne-jevify": {
    "file": "scripts/jev_client.py",
    "line": 32,
    "text": "PATH = \"/v1/systemone\"",
    "ref": "main"
  },
  "alvarobartt-sys1": {
    "file": "benchmark.py",
    "line": 791,
    "text": "parser.add_argument(\"--endpoint\", default=\"/v1/systemone\")",
    "ref": "main"
  },
  "andrelandgraf-safer-with-jev": {
    "file": "src/index.ts",
    "line": 5,
    "text": "import { TypeSafeClient } from \"@typesafe-ai/sdk\";",
    "ref": "main"
  },
  "allebee-pytest-jev": {
    "file": "bench/llm_judge.py",
    "line": 14,
    "text": "from typesafe_sdk import RetryPolicy",
    "ref": "main"
  },
  "aipersonacademy-jev-resume-disqualifier": {
    "file": "engine/decision_gateway.py",
    "line": 20,
    "text": "TYPESAFE_API_URL = os.getenv(\"TYPESAFE_BASE_URL\", \"https://api.typesafe.ai/v1/systemone\")",
    "ref": "main"
  },
  "agent-labs-dev-fastbrowse": {
    "file": "crates/fastbrowse-agent/src/agent/acting.rs",
    "line": 809,
    "text": "let evaluation = self.jev.evaluate(&page, &questions).await?;",
    "ref": "main"
  },
  "aniruddh-krovvidi-switchboard": {
    "file": "jev.py",
    "line": 3,
    "text": "One endpoint: POST https://api.typesafe.ai/v1/systemone",
    "ref": "main"
  },
  "arimanyus-warrenduffer": {
    "file": "src/context.ts",
    "line": 42,
    "text": "const ev = await model.evaluate({ headlines: marketHeadlines }, riskEventQuestion, \"context\", \"INDEX\");",
    "ref": "main"
  },
  "arcj137442-jev-life": {
    "file": "src/client/api.ts",
    "line": 222,
    "text": "base: \"https://api.typesafe.ai/v1/systemone\",",
    "ref": "main"
  },
  "awlevin-typesafe-computer-use": {
    "file": "typesafe_computer_use/actions.py",
    "line": 9,
    "text": "from typesafe_sdk import TypeSafeClient",
    "ref": "main"
  },
  "awun8191-jev-resume-analyzer": {
    "file": "backend/app/gateways/typesafe.py",
    "line": 11,
    "text": "ENDPOINT = \"https://api.typesafe.ai/v1/systemone\"",
    "ref": "main"
  },
  "ayush0054-metis": {
    "file": "legacy/metis-triage/src/metis_triage/_triage.py",
    "line": 154,
    "text": "\"https://api.typesafe.ai/v1/systemone\",",
    "ref": "main"
  },
  "antoniocoppe-jev-harness": {
    "file": "recipes/agent-comm-harness/message-route.ts",
    "line": 1,
    "text": "import { choice, noul, score } from \"@typesafe-ai/sdk\";",
    "ref": "main"
  },
  "belazy167-typesafe-mod": {
    "file": "hooks/suggest.ts",
    "line": 27,
    "text": "endpoint: 'https://api.typesafe.ai/v1/systemone',",
    "ref": "main"
  },
  "bestagentkits-jev-skillful": {
    "file": "packages/cli/src/core/eval/replay.ts",
    "line": 22,
    "text": "responses: SystemOneResponse[];",
    "ref": "main"
  },
  "beatapi-awesome-jev": {
    "file": "scripts/curate-star50-expansion-2026-09-23.mjs",
    "line": 217,
    "text": "\"en\": \"Posts Noul questions to api.typesafe.ai/v1/systemone and only uses high-confidence answers to relax a stop gate.\",",
    "ref": "main"
  },
  "anishfn-shapeshift": {
    "file": "src/lib/jev/client.ts",
    "line": 2,
    "text": "import { APIUserAbortError, TypeSafeClient } from \"@typesafe-ai/sdk\";",
    "ref": "main"
  },
  "bodepudimuneendra-netizen-laya-jev-graphrag": {
    "file": "graphrag_neo4j_laya/graphrag/models/jev.py",
    "line": 7,
    "text": "POST https://api.typesafe.ai/v1/systemone",
    "ref": "main"
  },
  "billionsbobby-jevrouter": {
    "file": "src/provider.ts",
    "line": 103,
    "text": "this.endpoint = validateEndpoint(options.endpoint ?? \"https://api.typesafe.ai/v1/systemone\");",
    "ref": "main"
  },
  "bhaig-de-jev-design-test": {
    "file": "vite.config.ts",
    "line": 5,
    "text": "import { TypeSafeClient, choice, type ChoiceQuestion } from \"@typesafe-ai/sdk\"",
    "ref": "master"
  },
  "boozedog-pi-codemode": {
    "file": "src/jev/client.ts",
    "line": 5,
    "text": "export const SYSTEM_ONE_URL = \"https://api.typesafe.ai/v1/systemone\";",
    "ref": "master"
  },
  "bohutang-sift": {
    "file": "background.js",
    "line": 4,
    "text": "const API_URL = \"https://api.typesafe.ai/v1/systemone\";",
    "ref": "main"
  },
  "bewinxed-jevgpt": {
    "file": "src/jevgpt/sampler.py",
    "line": 29,
    "text": "API_URL = \"https://api.typesafe.ai/v1/systemone\"",
    "ref": "master"
  },
  "brainstormity-jev-x-sentiment-analysis": {
    "file": "app/services/typesafe_service.py",
    "line": 3,
    "text": "from typesafe_sdk import AsyncTypeSafeClient, Choice, Noul, Score",
    "ref": "main"
  },
  "browser-use-jev-ultrafast": {
    "file": "jev_ultrafast/model.py",
    "line": 119,
    "text": "result = post_json(\"https://api.typesafe.ai/v1/systemone\", os.environ[\"TYPESAFE_API_KEY\"], body)",
    "ref": "main"
  },
  "burnigtm-jev-mcp": {
    "file": "src/errors.ts",
    "line": 1,
    "text": "import { APIConnectionError, APIError, APITimeoutError, APIUserAbortError, TypeSafeError } from \"@typesafe-ai/sdk\";",
    "ref": "main"
  },
  "bunsdev-typesafe-ai-playground": {
    "file": "lib/serverJev.ts",
    "line": 52,
    "text": "const upstream = await fetch(\"https://api.typesafe.ai/v1/systemone\", {",
    "ref": "main"
  },
  "brnyxx-jev-ra": {
    "file": "jev_ra/config.py",
    "line": 11,
    "text": "TYPESAFE_ENDPOINT = \"https://api.typesafe.ai/v1/systemone\"",
    "ref": "main"
  },
  "brandonbryant12-transcript-scorecard": {
    "file": "apps/api/src/classifier.ts",
    "line": 1,
    "text": "import { choice, noul, score, TypeSafeClient, type Question, type Questions } from \"@typesafe-ai/sdk\"",
    "ref": "main"
  },
  "byk-jev-mcp": {
    "file": "src/tools/ask.ts",
    "line": 37,
    "text": "const response = await client.systemOne(args.state, args.questions, args.model);",
    "ref": "main"
  },
  "caiovicentino-eikos-arena": {
    "file": "arena/arena.py",
    "line": 31,
    "text": "TYPESAFE_URL = \"https://api.typesafe.ai/v1/systemone\"",
    "ref": "main"
  },
  "bodila51-grok-bot-jev": {
    "file": "jevopus/jevopus.py",
    "line": 22,
    "text": "import yaml, typesafe_sdk  # noqa: F401",
    "ref": "main"
  },
  "cbruyndoncx-askjev-mcp": {
    "file": "src/index.ts",
    "line": 6,
    "text": "import { APIError, TypeSafeClient } from \"@typesafe-ai/sdk\";",
    "ref": "main"
  },
  "bytelabs-oss-clash-jev": {
    "file": "clash_jev/policy.py",
    "line": 183,
    "text": "from typesafe_sdk import Choice",
    "ref": "main"
  },
  "caiovicentino-eikos": {
    "file": "eikos/serve.py",
    "line": 343,
    "text": "if self.path not in (\"/v1/systemone\", \"/v1/evaluate\"):",
    "ref": "main"
  },
  "captaincore-captaincore": {
    "file": "typesafe/client.go",
    "line": 188,
    "text": "func (c *Client) SystemOne(ctx context.Context, state interface{}, questions Questions) (*Response, error) {",
    "ref": "master"
  },
  "cequence-io-openai-scala-client": {
    "file": "typesafe-client/src/main/scala/io/cequence/openaiscala/typesafe/JsonFormats.scala",
    "line": 125,
    "text": "implicit val systemOneRequestFormat: Format[SystemOneRequest] = Format(",
    "ref": "master"
  },
  "chez-shanpu-typesafeai-go": {
    "file": "option.go",
    "line": 9,
    "text": "type Option func(*SystemOneClient)",
    "ref": "main"
  },
  "chandler-sun-chat2jev": {
    "file": "src/components/answers.tsx",
    "line": 49,
    "text": "export function Answers({ response }: { response: SystemOneResponse }) {",
    "ref": "main"
  },
  "codeitlikemiley-system-one-adapter-rust": {
    "file": "src/client.rs",
    "line": 15,
    "text": "use crate::response::{SystemOneResponse, Usage};",
    "ref": "main"
  },
  "chaitin-decis": {
    "file": "playground/__init__.py",
    "line": 3,
    "text": "`server.py` is the whole program: it serves `web/` and proxies `/v1/systemone`",
    "ref": "master"
  },
  "codeitlikemiley-typesafe-sdk-rust": {
    "file": "benches/client_overhead.rs",
    "line": 15,
    "text": "use typesafe_sdk::{Client, Question, RetryPolicy};",
    "ref": "main"
  },
  "cocktailpeanut-jevthoven": {
    "file": "app/scripts/live-smoke.mjs",
    "line": 15,
    "text": "const r=await fetch('https://api.typesafe.ai/v1/systemone',{",
    "ref": "main"
  },
  "coriew-jevtest": {
    "file": "src/jev.ts",
    "line": 122,
    "text": "const response = await this.request('https://api.typesafe.ai/v1/systemone', {",
    "ref": "main"
  },
  "charlesfeng0314-jev-sees": {
    "file": "jev_sees/__init__.py",
    "line": 3,
    "text": "from typesafe_sdk import Choice, Noul, Score, TypeSafeClient, TypeSafeError",
    "ref": "main"
  },
  "dakdevs-decide-mcp": {
    "file": "src/providers.ts",
    "line": 5,
    "text": "import { createTypeSafeAi } from \"@ai-sdk/typesafe-ai\";",
    "ref": "main"
  },
  "contrastive-lm-clm": {
    "file": "src/clm/__init__.py",
    "line": 6,
    "text": "r = CLMClient().system_one(state, {\"ok\": Noul(instructions=\"Is this fine?\")})",
    "ref": "main"
  },
  "danrwilloughby-snifftest": {
    "file": "src/jev.ts",
    "line": 50,
    "text": "export const ENDPOINT = \"https://api.typesafe.ai/v1/systemone\";",
    "ref": "main"
  },
  "decrux9812-typesafe-skill-router": {
    "file": "__init__.py",
    "line": 30,
    "text": "from .typesafe_router.client import SystemOneClient",
    "ref": "main"
  },
  "davila7-jev-explained": {
    "file": "src/lib/providers.ts",
    "line": 21,
    "text": "url: \"https://api.typesafe.ai/v1/systemone\",",
    "ref": "main"
  },
  "devagrawal09-jev-review": {
    "file": "src/review/codebase-judgments.ts",
    "line": 3,
    "text": "import { choice, noul, score, TypeSafeClient } from \"@typesafe-ai/sdk\";",
    "ref": "main"
  },
  "devmortimer-pi-typesafe": {
    "file": "src/ask.ts",
    "line": 32,
    "text": "export async function ask<Q extends Questions>(judge: Judge, request: SystemOneRequest<Q>, options: AskOptions = {}): Promise<AskAnswer<Q>> {",
    "ref": "main"
  },
  "daseinlabs-open-jev": {
    "file": "demo/doom/client.py",
    "line": 66,
    "text": "res = self._post(\"/v1/systemone\", {",
    "ref": "main"
  },
  "devmortimer-pi-warden": {
    "file": "scripts/slop-cases.mjs",
    "line": 77,
    "text": "const r = await judge.evaluate({ state: { task: c.task, action }, questions: codeQuestions });",
    "ref": "main"
  },
  "dicklesworthstone-skillranker": {
    "file": "src/jev/client/tests.rs",
    "line": 100,
    "text": "\"https://api.typesafe.ai/v1/systemone\"",
    "ref": "main"
  },
  "ellistev-typesafe-minecraft-demo": {
    "file": "src/decisions.cjs",
    "line": 45,
    "text": "const response = await fetchImpl('https://api.typesafe.ai/v1/systemone', {",
    "ref": "main"
  },
  "delexw-claude-code-trace": {
    "file": "src-tauri/src/efficiency/jev.rs",
    "line": 12,
    "text": "const JEV_ENDPOINT: &str = \"https://api.typesafe.ai/v1/systemone\";",
    "ref": "main"
  },
  "eriestra-browser-use-olympics": {
    "file": "almond-fastloop.mjs",
    "line": 102,
    "text": "const r = await fetch(\"https://api.typesafe.ai/v1/systemone\", { method: \"POST\", headers: { Authorization: `Bearer ${KEY}`, \"Content-Type\": \"application/json\" }, body: JSON.stringify(body) });",
    "ref": "main"
  },
  "emrickgarrett-onevonejev": {
    "file": "server/src/jev.ts",
    "line": 7,
    "text": "import { choice, noul, TypeSafeClient, type EntryType } from \"@typesafe-ai/sdk\";",
    "ref": "main"
  },
  "eriskii-erislint": {
    "file": "src/jev.rs",
    "line": 24,
    "text": "const ENDPOINT: &str = \"https://api.typesafe.ai/v1/systemone\";",
    "ref": "main"
  },
  "etweisberg-jev-ui": {
    "file": "apps/demo/scripts/check-key.mjs",
    "line": 5,
    "text": "import { TypeSafeClient } from '@typesafe-ai/sdk';",
    "ref": "main"
  },
  "dimweaker-jev-libero": {
    "file": "src/jev_libero/client.py",
    "line": 14,
    "text": "\"typesafe\": (\"https://api.typesafe.ai/v1/systemone\", \"jev-latest\", \"TYPESAFE\"),",
    "ref": "main"
  },
  "f-jev-leftpad": {
    "file": "src/index.js",
    "line": 1,
    "text": "import { choice, TypeSafeClient } from '@typesafe-ai/sdk';",
    "ref": "main"
  },
  "deepanwadhwa-opendecision": {
    "file": "demos/images/measure_latency.py",
    "line": 79,
    "text": "warmup = client.post('/v1/systemone', json=payload)",
    "ref": "main"
  },
  "f-tiger-jev-decision-gate": {
    "file": "skills/jev-decision-gate/scripts/jev_decision_gate/triage.py",
    "line": 15,
    "text": "ENDPOINT = \"https://api.typesafe.ai/v1/systemone\"",
    "ref": "main"
  },
  "droidrun-mobile-jev": {
    "file": "scripts/mobile-agent/policy.mjs",
    "line": 224,
    "text": "url: 'https://api.typesafe.ai/v1/systemone',",
    "ref": "main"
  },
  "evoke-build-evoke": {
    "file": "crates/evoke-adapters/src/systemone.rs",
    "line": 85,
    "text": "url: \"https://api.typesafe.ai/v1/systemone\",",
    "ref": "main"
  },
  "docxology-daf-jev": {
    "file": "src/daf_jev/__init__.py",
    "line": 23,
    "text": "SystemOneResponse,",
    "ref": "main"
  },
  "eugeneboondock-jevsql": {
    "file": "src/client.mjs",
    "line": 28,
    "text": "async evaluate(state, questions, { signal } = {}) {",
    "ref": "main"
  },
  "ferrycorleone-crush-monitor": {
    "file": "server/analysis.ts",
    "line": 7,
    "text": "import { choice, score, noul, type Questions } from \"@typesafe-ai/sdk\";",
    "ref": "main"
  },
  "filedcom-playjev": {
    "file": "src/core/playjev.ts",
    "line": 305,
    "text": "const response = await this.jev.evaluate(pageState(snapshot, question), {",
    "ref": "main"
  },
  "foadsf-jev-for-engineers": {
    "file": "jev.py",
    "line": 11,
    "text": "POST https://api.typesafe.ai/v1/systemone",
    "ref": "main"
  },
  "feiliuem-tetrajev": {
    "file": "scripts/run_jev_api.py",
    "line": 5,
    "text": "API = 'https://api.typesafe.ai/v1/systemone'",
    "ref": "main"
  },
  "frankda-jev-poly-crypto-demo": {
    "file": "scripts/check-jev.ts",
    "line": 2,
    "text": "import { typeSafeAi } from \"@ai-sdk/typesafe-ai\";",
    "ref": "main"
  },
  "freepik-company-jev-mcp": {
    "file": "internal/judgment/tasks.go",
    "line": 35,
    "text": "raw, answers, err := s.evaluate(ctx, in.Model, state, questions)",
    "ref": "main"
  },
  "feder-cr-jev": {
    "file": "src/main.cpp",
    "line": 166,
    "text": "write_answer(api.systemone(body, tm), output);",
    "ref": "main"
  },
  "genierobot-typesafe-ai-rails": {
    "file": "lib/typesafe/rails/client.rb",
    "line": 55,
    "text": "response = @sdk.system_one(state: state, questions: questions, **call_options)",
    "ref": "main"
  },
  "gamesonrblx-jevbridge": {
    "file": "src/types.ts",
    "line": 111,
    "text": "export const TYPESAFE_ENDPOINT = \"https://api.typesafe.ai/v1/systemone\";",
    "ref": "main"
  },
  "forvela-jev-agent-browser": {
    "file": "src/decision.js",
    "line": 1,
    "text": "import { TypeSafeClient } from '@typesafe-ai/sdk';",
    "ref": "main"
  },
  "getexcited-stepwarden": {
    "file": "lib/jev.ts",
    "line": 30,
    "text": "export const SYSTEMONE_PATH = \"/v1/systemone\";",
    "ref": "main"
  },
  "ghalebdweikat-winnow": {
    "file": "sidecar/src/winnow/hooks.py",
    "line": 282,
    "text": "from typesafe_sdk import Noul",
    "ref": "main"
  },
  "githubnext-localjev": {
    "file": "src/server.ts",
    "line": 19,
    "text": "type SystemOneRequest,",
    "ref": "main"
  },
  "fluidinference-fluiduse": {
    "file": "Sources/FluidUse/PublishedCoreML/PublishedCoreMLTypes.swift",
    "line": 80,
    "text": "public struct SystemOneRequest: Sendable, Equatable {",
    "ref": "main"
  },
  "gopaljigaur-decide": {
    "file": "decide/backends/typesafe.py",
    "line": 20,
    "text": "PATH = \"/v1/systemone\"",
    "ref": "main"
  },
  "godsboy-jev-agent-skill-router": {
    "file": "src/jev_router/transport.py",
    "line": 12,
    "text": "_ENDPOINT = \"https://api.typesafe.ai/v1/systemone\"",
    "ref": "main"
  },
  "ghrezakh74-jevticktrouter": {
    "file": "backend/JevTicketRouter.Infrastructure/Decisions/SelfHosted/SelfHostedOptions.cs",
    "line": 42,
    "text": "public string EvaluationPath { get; set; } = \"/v1/systemone\";",
    "ref": "master"
  },
  "grmkris-robo-harness": {
    "file": "apps/server/src/decision/strategies.ts",
    "line": 273,
    "text": "const outcome = await evaluate({ state, questions, signal });",
    "ref": "main"
  },
  "hellogumbo-should-ai-kill-us-all": {
    "file": "functions/api/verdict.js",
    "line": 10,
    "text": "const TYPESAFE_URL = \"https://api.typesafe.ai/v1/systemone\";",
    "ref": "main"
  },
  "haseeb-heaven-jev-system-one": {
    "file": "src/jev_system_one/jev.py",
    "line": 3,
    "text": "from typesafe_sdk import Choice, Noul, RetryPolicy, Score, TypeSafeClient",
    "ref": "master"
  },
  "gtaras7-typesafe-jev": {
    "file": "cv-screen/src/cli.ts",
    "line": 97,
    "text": "`Request is what the app POSTs to https://api.typesafe.ai/v1/systemone\\n` +",
    "ref": "main"
  },
  "hev-reranker": {
    "file": "hev_rerank/rerank.py",
    "line": 18,
    "text": "from typesafe_sdk import Noul, RetryPolicy, TypeSafeClient",
    "ref": "main"
  },
  "hunkim-solar-mini4-jev": {
    "file": "engine.py",
    "line": 158,
    "text": "def system_one(state: Any, questions: dict[str, Any], *, model: str = DEFAULT_MODEL, api_key: str | None = None):",
    "ref": "main"
  },
  "hellozenstrategist-lab-eutrya": {
    "file": "extensions/eutrya-adaptive-extension/integration/native-v02.mjs",
    "line": 9,
    "text": "assert(typeof runtime?.call==='function' && typeof runtime?.jev?.evaluate==='function','Expected Eutrya runtime.call and typed jev.evaluate(state, questions, signal)');",
    "ref": "main"
  },
  "huntedman-jevlint": {
    "file": "src/jev-client.ts",
    "line": 52,
    "text": "const response = await fetch(\"https://api.typesafe.ai/v1/systemone\", {",
    "ref": "main"
  },
  "iamaamir-system-one": {
    "file": "pi-system-one/src/debug.ts",
    "line": 7,
    "text": "type SystemOneRequest,",
    "ref": "main"
  },
  "iammusham-jev-snake": {
    "file": "snake_game/jev_agent.py",
    "line": 65,
    "text": "from typesafe_sdk import Choice, TypeSafeClient",
    "ref": "main"
  },
  "hyunjunjeon-pi-quiet-ask": {
    "file": "bench/src/jev_bench/providers/jev.py",
    "line": 12,
    "text": "from typesafe_sdk import (",
    "ref": "main"
  },
  "iamtoomas-jevlint": {
    "file": "src/jev-client.ts",
    "line": 52,
    "text": "const response = await fetch(\"https://api.typesafe.ai/v1/systemone\", {",
    "ref": "main"
  },
  "iamvatsalpatel-tiershift": {
    "file": "bench/experiments/gate-experiment.ts",
    "line": 10,
    "text": "import { TypeSafeClient, choice, noul, score } from \"@typesafe-ai/sdk\";",
    "ref": "main"
  },
  "iamjonatha-jev-book-tags": {
    "file": "plugin/client.py",
    "line": 7,
    "text": "BASE_URL = 'https://api.typesafe.ai/v1'",
    "ref": "main"
  },
  "genspark-ai-genoffice": {
    "file": "apps/shell/src/main/file-index/decider.ts",
    "line": 52,
    "text": "direct: { url: 'https://api.typesafe.ai/v1/systemone', model: 'jev-1.13.0' },",
    "ref": "main"
  },
  "iapp-technology-openthai-systemone": {
    "file": "demo/doom_demo.py",
    "line": 25,
    "text": "from openthai_systemone import SystemOneClient, Choice, Noul  # noqa: E402",
    "ref": "main"
  },
  "idovmamane-dejevu": {
    "file": "dejevu/policy.py",
    "line": 209,
    "text": "URL = \"https://api.typesafe.ai/v1/systemone\"",
    "ref": "main"
  },
  "ipenywis-laya-ultrafast": {
    "file": "laya_ultrafast/laya.py",
    "line": 48,
    "text": "_MODEL.system_one(\"Warm up.\", {\"q\": {\"type\": \"choice\", \"instructions\": \"Warm up.\", \"criteria\": [\"a\", \"b\"]}})",
    "ref": "main"
  },
  "jamesward-zio-typesafe-ai": {
    "file": "src/main/scala/com/jamesward/zio_typesafe_ai/TypeSafeAI.scala",
    "line": 3,
    "text": "import com.jamesward.zio_typesafe_ai.internal.{Codecs, Helpers, Http, LoopImpl, RequestImpl, Wire}",
    "ref": "main"
  },
  "janostrowka-typesafe-assist": {
    "file": "custom_components/typesafe_conversation/api.py",
    "line": 161,
    "text": ") -> SystemOneResponse:",
    "ref": "main"
  },
  "jarrodwatts-jev-trader": {
    "file": "src/model.ts",
    "line": 2,
    "text": "import { typeSafeAi } from \"@ai-sdk/typesafe-ai\";",
    "ref": "main"
  },
  "jbt95-jev-toolkit": {
    "file": "src/core/paths.ts",
    "line": 13,
    "text": "return Bun.env.JEV_ENDPOINT ?? \"https://api.typesafe.ai/v1/systemone\";",
    "ref": "main"
  },
  "jedimemo-typesafe-client": {
    "file": "crates/typesafe-client/src/answer.rs",
    "line": 405,
    "text": "pub struct SystemOneResponse {",
    "ref": "main"
  },
  "jerryfane-omp-jev-compaction": {
    "file": "src/asker.ts",
    "line": 21,
    "text": "export const TYPESAFE_URL = 'https://api.typesafe.ai/v1/systemone';",
    "ref": "master"
  },
  "jhd3197-prompture": {
    "file": "prompture/drivers/kev_decision_driver.py",
    "line": 4,
    "text": "serves the same ``/v1/systemone`` endpoint locally::",
    "ref": "main"
  },
  "jmanhype-jev-dspy-lab": {
    "file": "scripts/verify_integration.py",
    "line": 41,
    "text": "def system_one(self, document, questions, *, model=None):",
    "ref": "main"
  },
  "joelhooks-pi-fast-jev-compaction": {
    "file": "src/core/request.ts",
    "line": 8,
    "text": "export const SYSTEM_ONE_URL = \"https://api.typesafe.ai/v1/systemone\";",
    "ref": "main"
  },
  "jomatsu-zod-jev": {
    "file": "scripts/check-package.mjs",
    "line": 35,
    "text": "if (url !== \"https://api.typesafe.ai/v1/systemone\") throw new Error(\"unexpected url: \" + url);",
    "ref": "main"
  },
  "jcpsimmons-jev-macos-loop": {
    "file": "src/providers.mjs",
    "line": 17,
    "text": "endpoint: \"https://api.typesafe.ai/v1/systemone\",",
    "ref": "master"
  },
  "jomatsu-pi-jev-auto-mode": {
    "file": "src/jev/engine.ts",
    "line": 95,
    "text": "const result = await options.transport.systemOne({",
    "ref": "main"
  },
  "jkudish-jev-browser": {
    "file": "src/questions.ts",
    "line": 4,
    "text": "import { choice, noul } from \"@typesafe-ai/sdk\";",
    "ref": "main"
  },
  "kamilpostrozny-pi-jev-code": {
    "file": "src/index.ts",
    "line": 6,
    "text": "import { choice, TypeSafeClient } from \"@typesafe-ai/sdk\";",
    "ref": "main"
  },
  "jujumilk3-jev-calibration-audit": {
    "file": "src/jev_audit/client.py",
    "line": 12,
    "text": "API_URL = \"https://api.typesafe.ai/v1/systemone\"",
    "ref": "main"
  },
  "juancamiloqhz-roverlab": {
    "file": "server/decisions.ts",
    "line": 1,
    "text": "import { APIConnectionError, APIError, choice, TypeSafeClient, type Fetch } from '@typesafe-ai/sdk';",
    "ref": "main"
  },
  "justinhe16-trade-jev": {
    "file": "src/trade_jev/live.py",
    "line": 993,
    "text": "from typesafe_sdk import AsyncTypeSafeClient",
    "ref": "main"
  },
  "kevinbadi-jev-voice": {
    "file": "jev_voice/brain.py",
    "line": 174,
    "text": "self.http.get(\"https://api.typesafe.ai/v1/models\")",
    "ref": "main"
  },
  "klauswg-jev-guard": {
    "file": "src/main/java/com/jevguard/client/JevClient.java",
    "line": 13,
    "text": "JevAnswers evaluate(String state, Map<String, Object> questions);",
    "ref": "master"
  },
  "kesku-jev-freeform": {
    "file": "main.mjs",
    "line": 172,
    "text": "const r = await fetch(\"https://api.typesafe.ai/v1/systemone\", {",
    "ref": "main"
  },
  "knowlet-jevlens": {
    "file": "extension/lib/jev.js",
    "line": 4,
    "text": "const ENDPOINT = \"https://api.typesafe.ai/v1/systemone\";",
    "ref": "master"
  },
  "kunobi-ninja-kunobi-jev": {
    "file": "src/blocking.rs",
    "line": 27,
    "text": "use crate::request::SystemOneRequest;",
    "ref": "main"
  },
  "kshetrajna12-reflex": {
    "file": "scripts/bench_latency.py",
    "line": 6,
    "text": "Every cell is `--requests` POSTs to `/v1/systemone` driven by `--concurrency` clients.",
    "ref": "main"
  },
  "klauswg-jev-suite": {
    "file": "jev-fidelity/src/main/java/com/jevsuite/fidelity/eval/EvalRunner.java",
    "line": 52,
    "text": ": new TypeSafeJevClient(\"https://api.typesafe.ai/v1/systemone\",",
    "ref": "master"
  },
  "lambertsj-beatjev": {
    "file": "src/worker.js",
    "line": 6,
    "text": "import { TypeSafeClient, noul } from \"@typesafe-ai/sdk\";",
    "ref": "main"
  },
  "leonaaardob-fast-dev-compaction": {
    "file": "src/request.ts",
    "line": 3,
    "text": "export const SYSTEM_ONE_URL = 'https://api.typesafe.ai/v1/systemone';",
    "ref": "main"
  },
  "kyu1204-oh-my-harness": {
    "file": "src/catalog/blocks/semantic-rule-guard.ts",
    "line": 68,
    "text": "RESP=$(curl -sS -m 10 -X POST \"\\${OMH_TYPESAFE_ENDPOINT:-https://api.typesafe.ai/v1/systemone}\" \\\\",
    "ref": "main"
  },
  "kouhxp-gutsy": {
    "file": "gutsy-inference/gutsy_inference/server.py",
    "line": 21,
    "text": "DECISION_PATHS = {\"/api/alpha/decisions\", \"/v1/decisions\", \"/v1/systemone\"}",
    "ref": "main"
  },
  "lakeday-org-perch": {
    "file": ".benchmarks/reviewbench/run.mjs",
    "line": 15,
    "text": "? { key: process.env.TYPESAFE_API_KEY, url: 'https://api.typesafe.ai/v1/systemone', model: 'jev-preview', expected: option('expected-model', 'jev-1.14.0'), price: .042 }",
    "ref": "main"
  },
  "lhotwll217-jev-cli": {
    "file": "src/client.ts",
    "line": 25,
    "text": "const url = new URL(\"/v1/systemone\", cfg.baseUrl).toString();",
    "ref": "main"
  },
  "kraayenjon-jev-linkedin-saved-classifier": {
    "file": "src/jev_linkedin_saved/cli.py",
    "line": 38,
    "text": "TYPESAFE_URL = \"https://api.typesafe.ai/v1/systemone\"",
    "ref": "main"
  },
  "logan-markewich-jeff": {
    "file": "bench/eval_accuracy.py",
    "line": 70,
    "text": "from jeff.core import SystemOneRequest, build_groups",
    "ref": "main"
  },
  "libingzheren-jev-mem": {
    "file": "memory/jev_client.py",
    "line": 23,
    "text": "from typesafe_sdk import (",
    "ref": "main"
  },
  "luobosibing2-dsh-jev-plugin": {
    "file": "bench/completion_skill/completion_recovery/runner.py",
    "line": 56,
    "text": "or plan[\"jev\"][\"endpoint\"] != \"https://api.typesafe.ai/v1/systemone\" \\",
    "ref": "main"
  },
  "kavehmz-typesafe-playground": {
    "file": "demo01/server.mjs",
    "line": 67,
    "text": "response = await fetchImpl('https://api.typesafe.ai/v1/systemone', {",
    "ref": "main"
  },
  "kylemclaren-jevpdf": {
    "file": "server/jev-upstream.ts",
    "line": 5,
    "text": "export const UPSTREAM = \"https://api.typesafe.ai/v1/systemone\"",
    "ref": "main"
  },
  "liu-x27-xavierjev": {
    "file": "eval/decision-models/run.ts",
    "line": 177,
    "text": "\"/v1/systemone\",",
    "ref": "main"
  },
  "liuhongrui087-art-jev-routed-agent": {
    "file": "services/router.py",
    "line": 22,
    "text": "JEV_URL = \"https://api.typesafe.ai/v1/systemone\"",
    "ref": "master"
  },
  "mahmoudadelbghany-jev-browser": {
    "file": "src/jev.mjs",
    "line": 1,
    "text": "const ENDPOINT = \"https://api.typesafe.ai/v1/systemone\";",
    "ref": "main"
  },
  "mahynotch-newsscore": {
    "file": "src/newsscore/scoring/jev.py",
    "line": 416,
    "text": "response = await self._get_client().system_one(state=state, questions=self._get_questions())",
    "ref": "main"
  },
  "madisonrickert-jev-permission-gate": {
    "file": "hooks/register.ts",
    "line": 25,
    "text": "type SystemOneRequest,",
    "ref": "main"
  },
  "maayanlevy-mysql-ailike": {
    "file": "src/typesafe.h",
    "line": 16,
    "text": "std::string api_url = \"https://api.typesafe.ai/v1/systemone\";",
    "ref": "main"
  },
  "maker-kk-todo-jev": {
    "file": "app/classifier.py",
    "line": 14,
    "text": "SYSTEM_ONE_ENDPOINT = \"https://api.typesafe.ai/v1/systemone\"",
    "ref": "main"
  },
  "mattn-go-jev": {
    "file": "jev.go",
    "line": 19,
    "text": "DefaultURL     = \"https://api.typesafe.ai/v1/systemone\"",
    "ref": "main"
  },
  "manifoldor-xtags": {
    "file": "extension/service.js",
    "line": 3,
    "text": "const OFFICIAL_URL = \"https://api.typesafe.ai/v1/systemone\";",
    "ref": "main"
  },
  "luigivis-jev-sdk-java": {
    "file": "src/main/java/com/luigivismara/jev/JevClient.java",
    "line": 156,
    "text": "String body = send(\"/v1/systemone\", request);",
    "ref": "main"
  },
  "markjaquith-typesafe-ai-playground": {
    "file": "src/typesafe.rs",
    "line": 57,
    "text": ".unwrap_or_else(|_| \"https://api.typesafe.ai/v1/systemone\".into()),",
    "ref": "main"
  },
  "marcreichel-laya-php": {
    "file": "src/Laya.php",
    "line": 197,
    "text": "$raw = $this->send($this->post('/v1/systemone', $json));",
    "ref": "main"
  },
  "lykycy123-robojev": {
    "file": "src/jev_vla_sim/config.py",
    "line": 27,
    "text": "api_url: str = \"https://api.typesafe.ai/v1/systemone\"",
    "ref": "main"
  },
  "mattneel-typesafe": {
    "file": "lib/typesafe.ex",
    "line": 252,
    "text": "case Client.run(client, :post, \"/v1/systemone\", body, opts) do",
    "ref": "master"
  },
  "mejiasd3v-pi-jev-router": {
    "file": "index.ts",
    "line": 407,
    "text": "const result = await abortable(() => evaluate({ model, state: { messages: input.messages }, questions, abortSignal: signal, maxRetries: 0 }), signal);",
    "ref": "main"
  },
  "mattneel-typesafe-zig": {
    "file": "src/Client.zig",
    "line": 353,
    "text": ".path = \"/v1/systemone\",",
    "ref": "master"
  },
  "mizchi-jev-test-filter": {
    "file": "src/jev.ts",
    "line": 26,
    "text": "export interface SystemOneResponse {",
    "ref": "main"
  },
  "mkotlikov-jev-grug": {
    "file": "app/api/chat/route.ts",
    "line": 30,
    "text": "type SystemOneResponse = {",
    "ref": "main"
  },
  "mmastrac-djev": {
    "file": "structured_server.py",
    "line": 2014,
    "text": "if self.path == \"/v1/systemone\":",
    "ref": "main"
  },
  "mizchi-jev-lint": {
    "file": "src/clef.ts",
    "line": 54,
    "text": "override async ask(state: unknown, questions: Record<string, Question>): Promise<SystemOneResponse> {",
    "ref": "main"
  },
  "mmastrac-djev-spark": {
    "file": "scripts/long-context-probe.py",
    "line": 35,
    "text": "req = urllib.request.Request(STRUCTURED + \"/v1/systemone\", data=json.dumps(body).encode(), headers={\"content-type\": \"application/json\"})",
    "ref": "main"
  },
  "moritzkremb-jev-voice-browser": {
    "file": "src/jev.js",
    "line": 7,
    "text": "import { TypeSafeClient, choice, noul, score, APIUserAbortError } from \"@typesafe-ai/sdk\";",
    "ref": "main"
  },
  "mossyfield-st-jeved": {
    "file": "src/classifier.js",
    "line": 22,
    "text": "endpoint: '/proxy/https://api.typesafe.ai/v1/systemone',",
    "ref": "main"
  },
  "mrnugget-jev-shell-history": {
    "file": "src/cli.ts",
    "line": 5,
    "text": "import { TypeSafeClient } from \"@typesafe-ai/sdk\";",
    "ref": "main"
  },
  "nainish-rai-jev-frontend-qa": {
    "file": "src/jev_frontend_qa/core/model_client.py",
    "line": 3,
    "text": "Calls the real ``https://api.typesafe.ai/v1/systemone`` endpoint. The",
    "ref": "main"
  },
  "morganlinton-albatross": {
    "file": "src/jev.rs",
    "line": 13,
    "text": "const ENDPOINT: &str = \"https://api.typesafe.ai/v1/systemone\";",
    "ref": "main"
  },
  "ndolinschi-harnessjudge": {
    "file": "src/app/api/decide/route.ts",
    "line": 7,
    "text": "const result = await systemOne(body.state ?? body, QUESTIONS, heuristic);",
    "ref": "main"
  },
  "ndolinschi-mcpmatch": {
    "file": "src/app/api/decide/route.ts",
    "line": 13,
    "text": "const result = await systemOne({ ...state, catalog_size: CATALOG.length }, questions, heuristic);",
    "ref": "main"
  },
  "ndolinschi-pulselane": {
    "file": "src/app/api/decide/route.ts",
    "line": 9,
    "text": "const result = await systemOne(state, QUESTIONS, heuristic);",
    "ref": "main"
  },
  "ndolinschi-spendbrake": {
    "file": "src/app/api/decide/route.ts",
    "line": 7,
    "text": "const result = await systemOne(body.state ?? body, QUESTIONS, heuristic);",
    "ref": "main"
  },
  "ndolinschi-swarmrouter": {
    "file": "src/app/api/decide/route.ts",
    "line": 7,
    "text": "const result = await systemOne(body.state ?? body, QUESTIONS, heuristic);",
    "ref": "main"
  },
  "molemo-lab-mojev": {
    "file": "mojev/apitest.py",
    "line": 48,
    "text": "from typesafe_sdk import Choice, TypeSafeClient",
    "ref": "master"
  },
  "ndolinschi-toolgate": {
    "file": "src/app/api/decide/route.ts",
    "line": 9,
    "text": "const result = await systemOne(state, QUESTIONS, heuristic);",
    "ref": "main"
  },
  "michaelswissa-jevry": {
    "file": "desktop/engine.ts",
    "line": 205,
    "text": "export function jevEndpoint(baseUrl = 'https://api.typesafe.ai/v1'): string {",
    "ref": "main"
  },
  "nassim-arifette-jevgrep": {
    "file": "experiments/jev-contract/offline-worker.mjs",
    "line": 4,
    "text": "import { TypeSafeClient, noul, VERSION } from '@typesafe-ai/sdk';",
    "ref": "main"
  },
  "nandhakishorm-laya": {
    "file": "laya-dotnet/tools/bench_python.py",
    "line": 191,
    "text": "_ = agent.system_one(first_case[\"state\"], first_case[\"questions\"])",
    "ref": "main"
  },
  "niazmorshed2007-jev-review": {
    "file": "src/jev/client.ts",
    "line": 4,
    "text": "export const JEV_API_ENDPOINT = \"https://api.typesafe.ai/v1/systemone\";",
    "ref": "main"
  },
  "martinpuli-f1": {
    "file": "scripts/refine-prompts.mjs",
    "line": 55,
    "text": "const response = await send('https://api.typesafe.ai/v1/systemone', {",
    "ref": "main"
  },
  "nickthompson480-typesafe-ai-playground": {
    "file": "server.py",
    "line": 17,
    "text": "DEFAULT_API_URL = \"https://api.typesafe.ai/v1/systemone\"",
    "ref": "main"
  },
  "newfull5-malkuth": {
    "file": "tools/laya_bench.py",
    "line": 27,
    "text": "ans = agent.system_one(record[\"state\"], qs)[\"answers\"]",
    "ref": "main"
  },
  "nican2018-shade-arena-jev-monitor": {
    "file": "llms/typesafe_llm.py",
    "line": 20,
    "text": "JEV_API_URL = \"https://api.typesafe.ai/v1/systemone\"",
    "ref": "main"
  },
  "nicobailon-surf-cli": {
    "file": "native/semantic-cli.cjs",
    "line": 632,
    "text": "return await evaluate(state, questions, { ...providerOptions, signal: controller.signal });",
    "ref": "main"
  },
  "noetion-dsh-jev": {
    "file": "src/client.ts",
    "line": 10,
    "text": "export const DEFAULT_ENDPOINT = 'https://api.typesafe.ai/v1/systemone'",
    "ref": "main"
  },
  "nidhi-singh02-agent-router": {
    "file": "packages/router/src/commands/effort.ts",
    "line": 264,
    "text": "const response = await deps.client.systemOne({",
    "ref": "main"
  },
  "norbertbodziony-guard-jev": {
    "file": "app/api/moderate/route.ts",
    "line": 2,
    "text": "import { TypeSafeClient, noul, score } from \"@typesafe-ai/sdk\";",
    "ref": "main"
  },
  "ntedvs-commentcop": {
    "file": "src/judge.ts",
    "line": 1,
    "text": "import { score, TypeSafeClient, type ScoreResponse } from \"@typesafe-ai/sdk\"",
    "ref": "main"
  },
  "noblespartan6-otto": {
    "file": "core/typesafe.ts",
    "line": 4,
    "text": "const ENDPOINT = \"https://api.typesafe.ai/v1/systemone\";",
    "ref": "main"
  },
  "nshkrdotcom-typesafe-sdk": {
    "file": "codegen/typesafe_sdk/codegen/source/openapi.ex",
    "line": 20,
    "text": "\"SystemOneRequest\" => TypeSafeSDK.Generated.Schemas.SystemOneRequest,",
    "ref": "main"
  },
  "olli0103-openclaw-typesafe-ai": {
    "file": "src/client.ts",
    "line": 4,
    "text": "export const ENDPOINT = 'https://api.typesafe.ai/v1/systemone';",
    "ref": "main"
  },
  "nyarlathoteppppp-pi-heed": {
    "file": "src/judge.ts",
    "line": 53,
    "text": "const TYPESAFE_URL = \"https://api.typesafe.ai/v1/systemone\";",
    "ref": "main"
  },
  "olti1947-jev-java": {
    "file": "src/main/java/io/github/Olti1947/jev/JevClient.java",
    "line": 137,
    "text": ".uri(URI.create(baseUrl + \"/v1/systemone\"));",
    "ref": "main"
  },
  "openlayer-ai-jevals": {
    "file": "src/jevals/backends/_base.py",
    "line": 65,
    "text": "async def evaluate(self, state: Any, questions: dict[str, Question]) -> BackendResponse: ...",
    "ref": "main"
  },
  "nekuda-ai-windtunnel": {
    "file": "experiments/jev/frozen/arms/decision-providers.mjs",
    "line": 60,
    "text": "const response = await fetchCall('https://api.typesafe.ai/v1/systemone', {",
    "ref": "main"
  },
  "omnijev-onejev": {
    "file": "qev/cli.py",
    "line": 143,
    "text": "r = c.system_one(body[\"state\"], body[\"questions\"], model=body.get(\"model\"), media=body.get(\"media\"),",
    "ref": "main"
  },
  "onlyoneaman-jev-eval": {
    "file": "jev_eval/backends.py",
    "line": 16,
    "text": "TYPESAFE_URL = \"https://api.typesafe.ai/v1/systemone\"",
    "ref": "main"
  },
  "panachy-jevvy": {
    "file": "packages/core/src/system-one.ts",
    "line": 12,
    "text": "const SystemOneRequest = Schema.Struct({",
    "ref": "main"
  },
  "para-fr-casse-brique-typesafe": {
    "file": "src/app/api/paddle/route.ts",
    "line": 108,
    "text": "const { answers, usage } = await getClient().systemOne({",
    "ref": "main"
  },
  "philippdubach-pi-jev-router": {
    "file": "src/classifier.ts",
    "line": 13,
    "text": "import { TypeSafeClient } from \"@typesafe-ai/sdk\";",
    "ref": "main"
  },
  "ojusave-beat-jev": {
    "file": "python/app/keeper.py",
    "line": 2,
    "text": "from typesafe_sdk import AsyncTypeSafeClient, Choice, RetryPolicy",
    "ref": "main"
  },
  "premo-cloud-typesafe-sdk-java": {
    "file": "typesafe-sdk/src/main/java/io/github/premocloud/typesafe/TypeSafeClient.java",
    "line": 54,
    "text": "static final String SYSTEM_ONE_PATH = \"/v1/systemone\";",
    "ref": "main"
  },
  "promptengineer48-laya-vs-jev-arena": {
    "file": "server.py",
    "line": 29,
    "text": "UPSTREAM = \"https://api.typesafe.ai/v1/systemone\"",
    "ref": "main"
  },
  "psygreg-agent-reflex": {
    "file": "plugins/hermes/classifier.py",
    "line": 34,
    "text": "\"typesafe\": \"https://api.typesafe.ai/v1\",",
    "ref": "main"
  },
  "phyous-tsai-civ2": {
    "file": "civ2/session.py",
    "line": 486,
    "text": "result = self.client.evaluate(request['state'], request['questions'])",
    "ref": "main"
  },
  "pistachioaihq-jev-synergy-screening": {
    "file": "src/config.py",
    "line": 43,
    "text": "JEV_URL = \"https://api.typesafe.ai/v1/systemone\"",
    "ref": "main"
  },
  "pithings-advocaat": {
    "file": "src/api.ts",
    "line": 127,
    "text": "export interface SystemOneRequest<Q extends Questions = Questions> {",
    "ref": "main"
  },
  "quentindanblon-pi-fast-jev-compaction": {
    "file": "index.ts",
    "line": 206,
    "text": "baseUrl: \"https://api.typesafe.ai/v1/systemone\",",
    "ref": "main"
  },
  "rajivkuriakose-typesafe-jev-examples": {
    "file": "src/jevx/client.py",
    "line": 17,
    "text": "The SDK builds its own `/v1/systemone` path, so it cannot be repointed there",
    "ref": "main"
  },
  "pymodel-jev-judge-mcp": {
    "file": "evals/confinement/broker.py",
    "line": 16,
    "text": "\"methods\": [\"POST\"], \"paths\": [\"/v1/systemone\"],",
    "ref": "main"
  },
  "query-farm-vgi-typesafe": {
    "file": "vgi_typesafe/mock_server.py",
    "line": 39,
    "text": "SYSTEM_ONE_PATH = \"/v1/systemone\"",
    "ref": "main"
  },
  "ranjan2829-askjev": {
    "file": "mcp/src/jev-client.ts",
    "line": 16,
    "text": "export const SYSTEM_ONE_URL = \"https://api.typesafe.ai/v1/systemone\";",
    "ref": "main"
  },
  "realzachi-typesafe-adblock": {
    "file": "src/typesafe.js",
    "line": 5,
    "text": "export const TYPESAFE_ENDPOINT = \"https://api.typesafe.ai/v1/systemone\";",
    "ref": "main"
  },
  "rchovatiya88-cyber-breach-jev": {
    "file": "backend/bot_pilot.py",
    "line": 50,
    "text": "result = jev_service.evaluate(state=state, questions=questions)",
    "ref": "main"
  },
  "reallyartificial-jev-by-example": {
    "file": "src/client.mjs",
    "line": 4,
    "text": "export const ENDPOINT = 'https://api.typesafe.ai/v1/systemone';",
    "ref": "main"
  },
  "reallyartificial-stuntdouble": {
    "file": "sidecars/kev-space.mjs",
    "line": 42,
    "text": "if (req.method !== 'POST' || req.url !== '/v1/systemone') return send(404, { error: 'not found' });",
    "ref": "main"
  },
  "rohanarun-computer-use-cache": {
    "file": "server.py",
    "line": 85,
    "text": "TYPESAFE_BASE_URL = os.environ.get(\"TYPESAFE_BASE_URL\", \"https://api.typesafe.ai/v1\").rstrip(\"/\")",
    "ref": "main"
  },
  "renagao-jev-dataops": {
    "file": "jev_dataops/jev.py",
    "line": 23,
    "text": "\"typesafe\": \"https://api.typesafe.ai/v1/systemone\",",
    "ref": "main"
  },
  "romeromarcelo-jev-retrieval": {
    "file": "src/jev/client.rs",
    "line": 28,
    "text": "const API_URL: &str = \"https://api.typesafe.ai/v1/systemone\";",
    "ref": "main"
  },
  "sac-y-jev-cu": {
    "file": "scripts/jev-decide.mjs",
    "line": 19,
    "text": "export const DEFAULT_ENDPOINT = \"https://api.typesafe.ai/v1/systemone\";",
    "ref": "main"
  },
  "rupeshpoojary9-poorjev": {
    "file": "crossbench/jev_client.py",
    "line": 8,
    "text": "API_URL = \"https://api.typesafe.ai/v1/systemone\"",
    "ref": "main"
  },
  "saibimajdi-typesafeai-dotnet-sdk": {
    "file": "src/TypeSafe.Sdk/ITypeSafeClient.cs",
    "line": 34,
    "text": "SystemOneRequest request,",
    "ref": "main"
  },
  "santos-sanz-jev-audio-beeper": {
    "file": "index.ts",
    "line": 1,
    "text": "import { noul, score, TypeSafeClient } from '@typesafe-ai/sdk';",
    "ref": "main"
  },
  "ronadin2002-jev-cua": {
    "file": "Sources/Core.swift",
    "line": 21,
    "text": "self == .openRouter ? URL(string: \"https://openrouter.ai/api/alpha/decisions\")! : URL(string: \"https://api.typesafe.ai/v1/systemone\")!",
    "ref": "main"
  },
  "safzanpirani-pi-jev-skill-picker": {
    "file": "extensions/jev.ts",
    "line": 12,
    "text": "export const SYSTEM_ONE_ENDPOINT = \"https://api.typesafe.ai/v1/systemone\";",
    "ref": "master"
  },
  "savka777-jev-use": {
    "file": "Sources/JevCore/Decision.swift",
    "line": 177,
    "text": "var request = URLRequest(url: URL(string: \"https://api.typesafe.ai/v1/systemone\")!)",
    "ref": "main"
  },
  "sdras-jev-webmcp-extension": {
    "file": "src/jev.js",
    "line": 4,
    "text": "const API = \"https://api.typesafe.ai/v1\";",
    "ref": "main"
  },
  "schwarzschlyle-immune": {
    "file": "src/immune/sensing/jev.py",
    "line": 15,
    "text": "from typesafe_sdk import AsyncTypeSafeClient, Choice, Noul, Score",
    "ref": "main"
  },
  "shantanugoel-mario-jev": {
    "file": "src/mario_jev/policy.py",
    "line": 3,
    "text": "from typesafe_sdk import Choice, Noul, RetryPolicy, TypeSafeClient",
    "ref": "main"
  },
  "shantanugoel-ask-jev-skill": {
    "file": "scripts/askjev.py",
    "line": 15,
    "text": "ENDPOINT = \"https://api.typesafe.ai/v1/systemone\"",
    "ref": "main"
  },
  "sharziki-semdecide": {
    "file": "src/reflex_guard/cli.py",
    "line": 180,
    "text": "response, latency = active_provider.evaluate({\"proposed_action\": action, \"authorization_context\": context}, QUESTIONS)",
    "ref": "main"
  },
  "rokbenko-quackd": {
    "file": "quackd/agent/decision/systemone.py",
    "line": 100,
    "text": "return await self._client.system_one(dict(state), dict(questions))",
    "ref": "main"
  },
  "shaharia-lab-jev-cli": {
    "file": "crates/jev-cli/src/help/docs.rs",
    "line": 813,
    "text": "client closes stdin. Tools: evaluate (a state and many questions), noul, choice, score (one \\",
    "ref": "main"
  },
  "seeapi-awesome-jev-use-cases": {
    "file": "recipes/model-routing/run.py",
    "line": 14,
    "text": "ENDPOINT = 'https://api.typesafe.ai/v1/systemone'",
    "ref": "main"
  },
  "samdotmak-jev-recall": {
    "file": "web/lib/systems.ts",
    "line": 146,
    "text": "const r = await fetch(\"https://api.typesafe.ai/v1/systemone\", {",
    "ref": "main"
  },
  "shuhansun-jev-oas-sentinel": {
    "file": "src/jev_oas_sentinel/jev.py",
    "line": 19,
    "text": "DEFAULT_ENDPOINT = \"https://api.typesafe.ai/v1/systemone\"",
    "ref": "main"
  },
  "sosopop-jev-stock": {
    "file": "jev_hk_predict.py",
    "line": 29,
    "text": "ENDPOINT = \"https://api.typesafe.ai/v1/systemone\"",
    "ref": "main"
  },
  "shhivv-arc-cua": {
    "file": "src/arc_cua/policies/typesafe.py",
    "line": 26,
    "text": "base_url: str = \"https://api.typesafe.ai/v1/systemone\",",
    "ref": "master"
  },
  "soundblaster-jev4mellea": {
    "file": "src/mellea_jev/providers/categorical.py",
    "line": 45,
    "text": "response = self.provider.system_one(state=task.state, questions={name: question})",
    "ref": "main"
  },
  "spring-ai-community-spring-ai-typesafe": {
    "file": "typesafe-java-sdk/src/main/java/org/springaicommunity/typesafe/TypeSafeClient.java",
    "line": 47,
    "text": "import org.springaicommunity.typesafe.question.SystemOneRequest;",
    "ref": "main"
  },
  "sorrycc-typesafe-snake": {
    "file": "server/index.ts",
    "line": 2,
    "text": "import { TypeSafeClient, choice } from \"@typesafe-ai/sdk\";",
    "ref": "master"
  },
  "socai-io-jev-social": {
    "file": "src/classifier.js",
    "line": 222,
    "text": "? await client.systemOne(request, { signal })",
    "ref": "main"
  },
  "steven-shoemaker-hunch-js": {
    "file": "src/client.ts",
    "line": 1,
    "text": "import { TypeSafeClient } from \"@typesafe-ai/sdk\";",
    "ref": "main"
  },
  "steven-shoemaker-hunch": {
    "file": "src/hunch/client.py",
    "line": 37,
    "text": "client= / async_client= inject objects with a system_one(state=, questions=) method.",
    "ref": "main"
  },
  "sregym-sregym": {
    "file": "clients/jev/client.py",
    "line": 14,
    "text": "ENDPOINT = \"https://api.typesafe.ai/v1/systemone\"",
    "ref": "main"
  },
  "strml-omp-jevens-classifier": {
    "file": "jev.ts",
    "line": 64,
    "text": "export const JEV_ENDPOINT = \"https://api.typesafe.ai/v1/systemone\";",
    "ref": "main"
  },
  "sufianetaouil-every": {
    "file": "every/judge.py",
    "line": 16,
    "text": "API_URL = \"https://api.typesafe.ai/v1/systemone\"",
    "ref": "main"
  },
  "tacticocc-jevbridge": {
    "file": "src/types.ts",
    "line": 111,
    "text": "export const TYPESAFE_ENDPOINT = \"https://api.typesafe.ai/v1/systemone\";",
    "ref": "main"
  },
  "tamaratran-fast-jev-compaction": {
    "file": "src/request.ts",
    "line": 3,
    "text": "export const SYSTEM_ONE_URL = 'https://api.typesafe.ai/v1/systemone';",
    "ref": "main"
  },
  "sumleo-prompt2jev": {
    "file": "skills/prompt2jev/scripts/prompt2jev.py",
    "line": 27,
    "text": "\"typesafe\": {\"url\": \"https://api.typesafe.ai/v1/systemone\", \"env\": \"TYPESAFE_API_KEY\",",
    "ref": "main"
  },
  "tamaratran-jev-pruner": {
    "file": "src/jev.ts",
    "line": 1,
    "text": "export const SYSTEM_ONE_URL = 'https://api.typesafe.ai/v1/systemone';",
    "ref": "main"
  },
  "supercorp-ai-supercov": {
    "file": "crates/supercov-cli/src/quality/tests.rs",
    "line": 2768,
    "text": "assert_eq!(endpoint(None), \"https://api.typesafe.ai/v1/systemone\");",
    "ref": "main"
  },
  "thruwire-foreman": {
    "file": "src/foreman/decision_models/jev.py",
    "line": 47,
    "text": "from typesafe_sdk import AsyncTypeSafeClient, RetryPolicy",
    "ref": "main"
  },
  "tauricresearch-tradingagents": {
    "file": "tradingagents/agents/post_screen.py",
    "line": 68,
    "text": "def system_one(state, questions: dict) -> dict[str, dict]:",
    "ref": "main"
  },
  "tky-27-jevslop": {
    "file": "functions/api/evaluate.ts",
    "line": 1,
    "text": "import { TypeSafeClient } from '@typesafe-ai/sdk';",
    "ref": "main"
  },
  "tokentrim-jev-routing-experiment": {
    "file": "jev_router/jev.py",
    "line": 17,
    "text": "DEFAULT_BASE_URL = \"https://api.typesafe.ai/v1\"",
    "ref": "main"
  },
  "sriganesh-jevibe-check": {
    "file": "extension/background.js",
    "line": 133,
    "text": "const response = await fetch('https://api.typesafe.ai/v1/systemone', {method:'POST', headers:{Authorization:`Bearer ${s.apiKey}`, 'Content-Type':'application/json'}, body:JSON.stringify(buildRequest(msg.text, s.classifiers, viewedPost, s.catalog)), signal});",
    "ref": "main"
  },
  "tylergibbs1-sift": {
    "file": "scripts/smoke.ts",
    "line": 74,
    "text": "toResultScores(await client.evaluate(state, QUESTIONS)),",
    "ref": "main"
  },
  "tyler-dot-earth-patdown": {
    "file": "scripts/probe-jev-input-size.mjs",
    "line": 25,
    "text": "const endpoint = 'https://api.typesafe.ai/v1/systemone'",
    "ref": "main"
  },
  "tylerjharden-ailerix": {
    "file": "src/components/playground-client.tsx",
    "line": 45,
    "text": "decisions: SystemOneResponse;",
    "ref": "main"
  },
  "ussyverse-hermes-jev-router": {
    "file": "jev.py",
    "line": 77,
    "text": "\"/v1/systemone\",",
    "ref": "main"
  },
  "typakon4-jev-layer": {
    "file": "src/providers/demo.mjs",
    "line": 36,
    "text": "async evaluate({ state, questions }) {",
    "ref": "main"
  },
  "typesafeai-typesafe-playground": {
    "file": "lib/serverJev.ts",
    "line": 52,
    "text": "const upstream = await fetch(\"https://api.typesafe.ai/v1/systemone\", {",
    "ref": "main"
  },
  "valentynkit-jev-commit": {
    "file": "jev_commit/jev.py",
    "line": 18,
    "text": "PATH = \"/v1/systemone\"",
    "ref": "main"
  },
  "valentynkit-jev-plays-pokemon-red": {
    "file": "src/jpp/policy.py",
    "line": 20,
    "text": "PATH = \"/v1/systemone\"",
    "ref": "main"
  },
  "szczyglis-dev-py-gpt": {
    "file": "src/pygpt_net/plugin/jev/worker.py",
    "line": 106,
    "text": "if base.endswith(\"/v1/systemone\"):",
    "ref": "master"
  },
  "w3cj-jev-chat": {
    "file": "apps/server/src/jev/client.ts",
    "line": 1,
    "text": "import { TypeSafeClient, type EntryType, type Questions } from \"@typesafe-ai/sdk\";",
    "ref": "main"
  },
  "wesecureyou-jev-test": {
    "file": "src/services/jevClient.ts",
    "line": 9,
    "text": "const JEV_URL = \"https://api.typesafe.ai/v1/systemone\";",
    "ref": "main"
  },
  "whyashthakker-awesome-jev-use-cases": {
    "file": "shared/providers.js",
    "line": 16,
    "text": "const response = await (deps.fetch || fetch)('https://api.typesafe.ai/v1/systemone', {",
    "ref": "main"
  },
  "wobsoriano-is-jeven": {
    "file": "index.js",
    "line": 19,
    "text": "const response = await fetch(\"https://api.typesafe.ai/v1/systemone\", {",
    "ref": "main"
  },
  "wizhill05-typesafe-image-diffusion": {
    "file": "fix_synthesizer.py",
    "line": 3,
    "text": "from typesafe_sdk import Choice, TypeSafeClient",
    "ref": "main"
  },
  "wobsoriano-oxlint-plugin-jev": {
    "file": "src/index.ts",
    "line": 10,
    "text": "import { ENV } from '@typesafe-ai/sdk';",
    "ref": "main"
  },
  "wustep-jev-playground": {
    "file": "server/jevHandler.ts",
    "line": 20,
    "text": "import { callSystemOne, DEFAULT_MODEL, SystemOneError, type SystemOneRequest } from '../src/planner/jev/systemOne.js'",
    "ref": "main"
  },
  "willkelly-jev-evaluation": {
    "file": "jeveval/config.py",
    "line": 18,
    "text": "API_URL = os.environ.get(\"TYPESAFE_API_URL\", \"https://api.typesafe.ai/v1/systemone\")",
    "ref": "main"
  },
  "wfzyx-von": {
    "file": "js/src/client.ts",
    "line": 10,
    "text": "SystemOneResponse,",
    "ref": "master"
  },
  "valentynkit-awesome-jev-typesafe": {
    "file": "scripts/jev-client.mjs",
    "line": 5,
    "text": "const res = await fetchImpl(\"https://api.typesafe.ai/v1/systemone\", {",
    "ref": "main"
  },
  "xienda-dsh-jev-verify": {
    "file": "bench/batch-e2e.mjs",
    "line": 28,
    "text": "const base = String(callOptions.baseURL ?? \"https://api.typesafe.ai/v1\").replace(/\\/+$/, \"\");",
    "ref": "main"
  },
  "yairshy-decido": {
    "file": "src/decido/providers/typesafe.py",
    "line": 111,
    "text": "response = await self._client.system_one(",
    "ref": "main"
  },
  "xinyao27-jevonian": {
    "file": "internal/brain/types.go",
    "line": 45,
    "text": "BaseURL:   \"https://api.typesafe.ai/v1/systemone\",",
    "ref": "main"
  },
  "yikangy873-gif-jev-desktop": {
    "file": "plugins/jev-desktop/scripts/bridge-client.mjs",
    "line": 14,
    "text": "const validUrl=url.protocol==='http:' && url.hostname==='127.0.0.1' && /^\\d+$/.test(url.port) && url.pathname==='/v1/systemone' && !url.username && !url.password && !url.search && !url.hash;",
    "ref": "main"
  },
  "zhengxuyu-litjev": {
    "file": "scripts/dump_prompt.py",
    "line": 10,
    "text": "from litjev.schema import SystemOneRequest",
    "ref": "main"
  },
  "zerogold-call-coach-ai": {
    "file": "lib/coach.mjs",
    "line": 13,
    "text": "const ENDPOINT = env.TYPESAFE_ENDPOINT || \"https://api.typesafe.ai/v1/systemone\";",
    "ref": "main"
  },
  "zsavage8-padflow-jev-evals": {
    "file": "scripts/run_baseline.py",
    "line": 7,
    "text": "python scripts/run_baseline.py --model jev --base-url https://api.typesafe.ai/v1 --api-key-env TYPESAFE_API_KEY",
    "ref": "main"
  },
  "yinsongxu-llm2jev": {
    "file": "demos/web/server.py",
    "line": 19,
    "text": "\"/api/systemone\": (\"POST\", \"/v1/systemone\"),",
    "ref": "main"
  },
  "wondertwins-jev-benchmark": {
    "file": "jevchess/experiments.py",
    "line": 22,
    "text": "from typesafe_sdk import Choice, Noul, Score",
    "ref": "main"
  },
  "uezo-aiavatarkit": {
    "file": "aiavatar/sts/vad/turn_end_gates/jev.py",
    "line": 172,
    "text": "\"https://api.typesafe.ai/v1/systemone\",",
    "ref": "main"
  }
};
