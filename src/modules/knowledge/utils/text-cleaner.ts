export class TextCleaner {
  static clean(text: string): string {
    if (!text) return '';

    return text
      // 1. Remove invalid unicode characters (e.g. replacement characters)
      .replace(/\uFFFD/g, '')
      // 2. Remove control characters except newlines and tabs
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // 3. Convert tabs to spaces
      .replace(/\t+/g, ' ')
      // 4. Remove duplicate spaces
      .replace(/ +/g, ' ')
      // 5. Remove trailing/leading spaces on each line
      .replace(/^ +| +$/gm, '')
      // 6. Reduce multiple blank lines to a maximum of two
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
}
