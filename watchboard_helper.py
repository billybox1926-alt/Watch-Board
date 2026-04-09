from pathlib import Path
import requests
import re
import json

notes_dir = Path(r"C:\Users\Billy\Downloads\WatchboardNotes")

files = sorted(
    [f for f in notes_dir.iterdir() if f.suffix.lower() in [".html", ".jsx", ".txt"]],
    key=lambda f: f.stat().st_mtime,
    reverse=True
)[:3]

if not files:
    print("No matching files found.")
    raise SystemExit

def ask_ollama(prompt, model="qwen2:1.5b", timeout=180):
    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": model,
            "prompt": prompt,
            "stream": False
        },
        timeout=timeout
    )
    response.raise_for_status()
    data = response.json()
    return data["response"].strip()

def ask_with_fallback(prompt):
    try:
        return ask_ollama(prompt, model="qwen2:1.5b", timeout=180)
    except Exception:
        print("qwen timed out, falling back to tinyllama...")
        return ask_ollama(prompt, model="tinyllama:latest", timeout=120)

def clean_watchboard_text(file_path):
    text = file_path.read_text(encoding="utf-8", errors="ignore")

    start = text.find("Master brief")
    if start == -1:
        start = 0

    snippet = text[start:start + 2500]

    cleaned = re.sub(r"<style.*?</style>", " ", snippet, flags=re.DOTALL | re.IGNORECASE)
    cleaned = re.sub(r"<script.*?</script>", " ", cleaned, flags=re.DOTALL | re.IGNORECASE)
    cleaned = re.sub(r"<[^>]+>", " ", cleaned)
    cleaned = cleaned.replace("&nbsp;", " ")
    cleaned = re.sub(r"\s+", " ", cleaned).strip()

    return cleaned[:1400]

def extract_signals(file_path):
    cleaned = clean_watchboard_text(file_path)

    print(f"\n--- CLEANED TEXT FOR {file_path.name} ---")
    print(f"LENGTH: {len(cleaned)}")
    print(cleaned[:700])

    prompt = f"""
Read this watchboard text.

Return ONLY valid JSON in this exact shape:
{{
  "status": "...",
  "deadline": "...",
  "signals": [
    {{"signal": "...", "why": "...", "score": 1}},
    {{"signal": "...", "why": "...", "score": 1}},
    {{"signal": "...", "why": "...", "score": 1}}
  ],
  "top_signal": "...",
  "top_reason": "..."
}}

Rules:
- Use only facts clearly present in the text.
- Do not invent dates, scores, or locations.
- Give 1 to 3 signals only.
- score must be an integer from 1 to 5.
- Keep fields short.
- Return JSON only.

Text:
{cleaned}
"""
    raw = ask_with_fallback(prompt)
    return raw

all_summaries = []

for f in files:
    print(f"\n=== {f.name} ===")
    try:
        raw = extract_signals(f)
        print("\nRAW MODEL OUTPUT:")
        print(raw)

        match = re.search(r"\{.*\}", raw, flags=re.DOTALL)
        if not match:
            raise ValueError("No JSON found")

        data = json.loads(match.group(0))

        status = data.get("status", "").strip()
        deadline = data.get("deadline", "").strip()
        top_signal = data.get("top_signal", "").strip()
        top_reason = data.get("top_reason", "").strip()

        summary = (
            f"Status: {status}\n"
            f"Deadline: {deadline}\n"
            f"Top signal: {top_signal}\n"
            f"Why it matters: {top_reason}"
        )

        print("\nSUMMARY:")
        print(summary)

        all_summaries.append(f"FILE: {f.name}\n{summary}")

    except Exception as e:
        print("Error:", e)

combined_input = "\n\n".join(all_summaries)

print("\n=== COMBINED VIEW ===")
print(combined_input)

if len(all_summaries) >= 2:
    final_prompt = f"""
You are comparing watchboard summaries.

Use ONLY the summaries below.
Do NOT invent facts.
If something is unclear, say "unclear".

Reply in exactly 3 lines:
Main change: <most important change from previous to newest>
Main constant: <most important thing that stayed the same>
Current key: <single most important current factor>

Newest:
{all_summaries[0]}

Previous:
{all_summaries[1]}
"""

    print("\n=== FINAL COMPARISON ===")
    try:
        result = ask_with_fallback(final_prompt)
        print(result)
    except Exception as e:
        print("Error:", e)