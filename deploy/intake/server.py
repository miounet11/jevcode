#!/usr/bin/env python3
"""JevCode 内容投递端点（intake）。

职责边界：本服务只做「收下并落盘」，不做任何解析、渲染或执行。
  - 不解析投递内容（不碰 HTML/Markdown），不做模板渲染
  - 不访问网络（无出站请求）
  - 只写 JSON 文件到 inbox 目录，文件名由 时间戳 + 内容哈希 决定

LLM 整理与发布是独立的下游步骤（.pipeline/ingest.py），不在请求内同步完成，
否则请求会因子分钟级的模型推理而超时。

端点：
  POST /api/intake   投递（Bearer 鉴权），body 为单个对象或对象数组
  GET  /api/health   存活探测（无需鉴权）

鉴权 token 从环境变量 JEVCODE_INTAKE_TOKEN 读取，绝不写入仓库。
"""
import hashlib
import hmac
import json
import os
import re
import sys
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

TOKEN = os.environ.get("JEVCODE_INTAKE_TOKEN", "")
INBOX = Path(os.environ.get("JEVCODE_INTAKE_INBOX", "/var/lib/jevcode-intake/inbox"))
BIND = os.environ.get("JEVCODE_INTAKE_BIND", "127.0.0.1")
PORT = int(os.environ.get("JEVCODE_INTAKE_PORT", "8787"))

# 单次请求体积上限；nginx 侧另有 client_max_body_size，两层都设防
MAX_BODY = 512 * 1024
# 单次投递的条目数上限，避免一次灌入过多
MAX_ITEMS = 200

# 允许的来源类型。未知 kind 一律拒绝，避免下游处理时出现意料之外的形态。
KINDS = {"x", "github", "web", "manual", "paper"}

# 各字段长度上限，防止超大输入撑爆下游 LLM 上下文
LIMITS = {"raw": 200_000, "title": 500, "author": 200, "notes": 2_000, "url": 2_000}


def log(msg: str) -> None:
    print(f"[intake] {msg}", flush=True)


def valid_url(u: str) -> bool:
    return bool(re.match(r"^https?://[^\s]+$", u or "", re.I))


def validate(item: object) -> tuple[dict | None, str]:
    """校验并归一化单条投递。返回 (item, error)。"""
    if not isinstance(item, dict):
        return None, "item must be a JSON object"

    src = item.get("source")
    if not isinstance(src, dict):
        return None, "source must be an object"

    kind = str(src.get("kind") or "").strip().lower()
    if kind not in KINDS:
        return None, f"source.kind must be one of {sorted(KINDS)}"

    url = str(src.get("url") or "").strip()
    if not valid_url(url):
        return None, "source.url must be a valid http(s) URL"

    raw = item.get("raw")
    if not isinstance(raw, str) or not raw.strip():
        return None, "raw must be a non-empty string"

    # 长度上限
    fields = {"raw": raw, "url": url,
              "title": str(src.get("title") or ""),
              "author": str(src.get("author") or ""),
              "notes": str(item.get("notes") or "")}
    for key, val in fields.items():
        if len(val) > LIMITS[key]:
            return None, f"{key} exceeds {LIMITS[key]} chars"

    tags = item.get("tags") or []
    if not isinstance(tags, list):
        return None, "tags must be an array"
    tags = [str(t).strip()[:64] for t in tags[:32] if str(t).strip()]

    out = {
        "source": {
            "kind": kind,
            "url": url,
            "author": fields["author"][:LIMITS["author"]],
            "title": fields["title"][:LIMITS["title"]],
        },
        "lang": str(item.get("lang") or "").strip().lower()[:12] or None,
        "raw": raw,
        "notes": fields["notes"][:LIMITS["notes"]],
        "tags": tags,
        # 采集器可自带幂等键；缺省时用 source.url 的哈希
        "idempotencyKey": str(item.get("idempotencyKey") or "").strip()[:200] or None,
        "receivedAt": int(time.time()),
    }
    return out, ""


def key_of(item: dict) -> str:
    """幂等键：优先用采集器提供的，否则按规范化后的来源 URL 计算。"""
    base = item.get("idempotencyKey")
    if not base:
        base = "url:" + item["source"]["url"].rstrip("/").lower()
    return hashlib.sha256(base.encode()).hexdigest()[:32]


class Handler(BaseHTTPRequestHandler):
    server_version = "jevcode-intake/1"

    def _send(self, code: int, payload: dict) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _authed(self) -> bool:
        if not TOKEN:
            log("REJECT: token not configured on server")
            return False
        hdr = self.headers.get("Authorization", "")
        if not hdr.startswith("Bearer "):
            return False
        # 常量时间比较，避免时序侧信道
        return hmac.compare_digest(hdr[7:].strip(), TOKEN)

    def do_GET(self) -> None:  # noqa: N802 (BaseHTTPRequestHandler 接口)
        if self.path.split("?")[0] == "/api/health":
            self._send(200, {"ok": True, "inbox": str(INBOX)})
        else:
            self._send(404, {"ok": False, "error": "not found"})

    def do_POST(self) -> None:  # noqa: N802
        if self.path.split("?")[0] != "/api/intake":
            self._send(404, {"ok": False, "error": "not found"})
            return
        if not self._authed():
            self._send(401, {"ok": False, "error": "unauthorized"})
            return

        try:
            length = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            self._send(400, {"ok": False, "error": "bad content-length"})
            return
        if length <= 0:
            self._send(400, {"ok": False, "error": "empty body"})
            return
        if length > MAX_BODY:
            self._send(413, {"ok": False, "error": f"body exceeds {MAX_BODY} bytes"})
            return

        try:
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as e:
            self._send(400, {"ok": False, "error": f"invalid JSON: {e}"})
            return

        items = payload if isinstance(payload, list) else [payload]
        if not items:
            self._send(400, {"ok": False, "error": "no items"})
            return
        if len(items) > MAX_ITEMS:
            self._send(413, {"ok": False, "error": f"more than {MAX_ITEMS} items"})
            return

        INBOX.mkdir(parents=True, exist_ok=True)
        accepted, duplicates, errors = [], 0, []

        for idx, raw_item in enumerate(items):
            item, err = validate(raw_item)
            if err:
                errors.append({"index": idx, "error": err})
                continue

            k = key_of(item)
            dest = INBOX / f"{k}.json"
            if dest.exists():
                duplicates += 1
                accepted.append({"key": k, "duplicate": True})
                continue

            item["key"] = k
            # 先写临时文件再原子改名，避免下游读到写了一半的 JSON
            tmp = dest.with_suffix(".json.part")
            tmp.write_text(json.dumps(item, ensure_ascii=False, indent=2), encoding="utf-8")
            tmp.replace(dest)
            accepted.append({"key": k, "duplicate": False})

        log(f"accepted={len(accepted)} duplicates={duplicates} errors={len(errors)}")
        code = 202 if accepted else 400
        self._send(code, {
            "ok": bool(accepted),
            "accepted": len(accepted),
            "duplicates": duplicates,
            "errors": errors,
            "keys": accepted,
        })

    def log_message(self, fmt: str, *args) -> None:
        # 走 stdout 交给 journald，便于 journalctl -u jevcode-intake 查看
        log(f"{self.address_string()} {fmt % args}")


def main() -> int:
    if not TOKEN:
        log("FATAL: JEVCODE_INTAKE_TOKEN is not set; refusing to start")
        return 1
    INBOX.mkdir(parents=True, exist_ok=True)
    srv = ThreadingHTTPServer((BIND, PORT), Handler)
    log(f"listening on {BIND}:{PORT}, inbox={INBOX}")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass
    return 0


if __name__ == "__main__":
    sys.exit(main())
