# Related Practices / Discussions

Use this category for public discussion evidence — X threads, Reddit posts, Hacker News threads, interviews, blog commentary — that describes real Jev usage or emerging patterns but has no standalone repo or case page yet.

## Submission format

```md
- [Name or thread title](URL) - Source/platform: one-sentence description of the Jev-related practice or discussion.
```

## Entries

- [Introducing System One Models and Jev (Hacker News)](https://news.ycombinator.com/item?id=49717558) - Hacker News: 1,800-point launch thread whose ~480 comments debate whether typed decisions replace LLM calls for classification, routing, and verification.
- [Launch thread by Diogo Almeida](https://x.com/CompleteSkeptic/status/2099925682726002904) - X: the 63k-like announcement from TypeSafe's founder arguing RLCD-trained decision models are a shorter path to economic value than chat models.
- [Model router built with Jev](https://x.com/ephraimduncan/status/2100454070536351824) - X: 948-like demo where Jev decides which model should serve a request before it is forwarded.
- [MLP on Qwen 4B mimicking Jev](https://x.com/justALEXWORTEGA/status/2100341039986798930) - X: builder reports that a small MLP trained on top of Qwen 4B already reproduces Jev-like decision behaviour.
- [Running a local Typesafe Jev](https://x.com/wmoto_ai/status/2100454049359577516) - X (Japanese): attempt at running a Jev-style decision model locally, with speed noted as still improvable.
- [Jev as an AI agent safety monitor](https://x.com/isNickMa/status/2100566407524344225) - X: test report using Jev to check each agent action first, reportedly catching most attacks with almost no false blocks and much lower latency.
- [Rethinking security engineering with Jev](https://x.com/Kostastsale/status/2100362415187833048) - X: argues that purely engineering decisions in security work belong to Jev rather than a chat model.
- [Ask Jev anything, it will judge](https://x.com/waynesutton/status/2100487878992388279) - X: public Convex-backed demo inviting one million judged questions instead of generated answers.
- [First Jev use case in a Mac app](https://x.com/malekoo/status/2100439840575684910) - X: a shipped Mac app routes setup and troubleshooting questions to Jev when no language model is loaded.
- [Jev 中文解读](https://x.com/dotey/status/2100109937237987823) - X (Chinese): explains the System One category to Chinese readers as a calibrated, typed decision layer for code.
- [TypeSafe AI releases Jev (r/singularity)](https://reddit.com/r/singularity/comments/1whop6b/typesafe_ai_releases_ai_model_called_jev_rather/) - Reddit: launch thread framing Jev as a low-hallucination, low-cost decision model for software rather than chat.
- [Testing Jev for Pi extensions (r/PiCodingAgent)](https://reddit.com/r/PiCodingAgent/comments/1whsav6/anyone_else_testing_out_typesafe_ais_new_system/) - Reddit: builders describe using Jev as an agent tool-use safety layer and planning a prompt-complexity model router.
- [Jev "playing" Minecraft (r/accelerate)](https://reddit.com/r/accelerate/comments/1whk9oy/new_typesafe_ai_jev_model_playing_minecraft_wip/) - Reddit: work-in-progress demo of Jev driving Minecraft, including fleeing zombies at night, as a test of fast structured decisions.
