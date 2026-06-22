export class Tokenizer {
  /**
   * Estimates the number of tokens in a given text string.
   * A common heuristic for LLMs is that 1 token ~= 4 characters in English.
   */
  static estimateTokenCount(text: string): number {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
  }
}
