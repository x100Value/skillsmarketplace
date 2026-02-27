export async function runBlackBoxTask(prompt: string): Promise<string> {
  const trimmed = prompt.trim();
  const short = trimmed.slice(0, 300);
  return `LLM result (stub): ${short}`;
}
