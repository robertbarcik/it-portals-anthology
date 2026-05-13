# Five Service Desks That Forgot They Were Software

An anthology of five wildly distinct low-fidelity prototypes for an IT services portal — same prompt, same cheap LLM backend, five completely different ideas about what a "support interface" could feel like. A pushback against the era where every helpful interface looks like the same chat box.

Live: https://publications.barcik.training/it-portals-anthology/

## The five

| # | Title | Aesthetic |
|---|---|---|
| 01 | **Terminal Zero** | 1983 phosphor terminal, CRT scanlines, command line |
| 02 | **The IT Oracle** | Tarot divination, custom IT major arcana |
| 03 | **Gazette of Glitches** | 1970s underground newspaper, letters to the editor |
| 04 | **Support Reef** | Pastel underwater ecosystem, fish-as-tickets |
| 05 | **Pneumatic Post** | Victorian brass tube system, capsule whoosh |

## Stack

Vanilla HTML/CSS/JS. No framework, no build step. Each prototype is a self-contained folder.

Backend: a cheap Qwen model on [OpenRouter](https://openrouter.ai), called directly from the browser. The first time you interact, the page asks for an OpenRouter API key, stored in `localStorage` (your browser only). You'll need to bring your own — there is no shared demo key.

## Run locally

```bash
python3 -m http.server 8080
# open http://localhost:8080/
```

You'll need an OpenRouter API key with a few cents of credit. The default model is `qwen/qwen-2.5-7b-instruct` — change it in `shared/llm.js`.

## Why this exists

To remember that "AI-powered service desk" is not a synonym for "chat box with a purple gradient." The medium is wide open. These five are sketches, not products.

## License

MIT.
