// Tiny OpenRouter client.
//   await LLM.chat({ system, user, history, onToken, signal })
// Returns the full assistant string when done.
// Streams via SSE if onToken is provided; otherwise does a single request.

(function () {
  const DEFAULT_MODEL = 'qwen/qwen-2.5-7b-instruct';
  const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

  async function chat(opts) {
    const {
      system,
      user,
      history = [],
      model = DEFAULT_MODEL,
      temperature = 0.85,
      max_tokens = 600,
      onToken,
      signal,
    } = opts;

    const key = await window.ApiKey.getApiKey();

    const messages = [];
    if (system) messages.push({ role: 'system', content: system });
    for (const m of history) messages.push(m);
    if (user) messages.push({ role: 'user', content: user });

    const headers = {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': location.origin,
      'X-Title': 'IT Portals Anthology',
    };

    if (!onToken) {
      const r = await fetch(ENDPOINT, {
        method: 'POST',
        headers,
        signal,
        body: JSON.stringify({ model, messages, temperature, max_tokens }),
      });
      if (!r.ok) throw new Error(`OpenRouter ${r.status}: ${await r.text()}`);
      const data = await r.json();
      return data.choices?.[0]?.message?.content ?? '';
    }

    // Streaming path.
    const r = await fetch(ENDPOINT, {
      method: 'POST',
      headers,
      signal,
      body: JSON.stringify({ model, messages, temperature, max_tokens, stream: true }),
    });
    if (!r.ok || !r.body) throw new Error(`OpenRouter ${r.status}: ${await r.text()}`);

    const reader = r.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    let full = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });

      let nl;
      while ((nl = buf.indexOf('\n')) !== -1) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line.startsWith('data:')) continue;
        const data = line.slice(5).trim();
        if (data === '[DONE]') return full;
        try {
          const j = JSON.parse(data);
          const delta = j.choices?.[0]?.delta?.content ?? '';
          if (delta) {
            full += delta;
            onToken(delta, full);
          }
        } catch (_) { /* keep going */ }
      }
    }
    return full;
  }

  window.LLM = { chat, DEFAULT_MODEL };
})();
