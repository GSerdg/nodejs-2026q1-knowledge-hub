import { SummaryLength } from '../dto/summarize-article.dto';

export const ArticlePrompts = {
  summarize: (content: string, summaryLength = SummaryLength.MEDIUM) => {
    const instructions = {
      [SummaryLength.SHORT]:
        'Provide a concise 1-2 sentence summary highlighting only the core message.',
      [SummaryLength.MEDIUM]:
        'Provide a balanced summary (3-5 sentences) covering the main points and conclusion.',
      [SummaryLength.DETAILED]:
        'Provide a detailed summary including key arguments, supporting facts, and the final takeaway.',
    };

    return `
      Task: Summarize the article provided below.
      Instruction: ${instructions[summaryLength]}
      
      Article Content:
      """
      ${content}
      """
      
      Response requirements:
      - Return ONLY the summary text.
      - Use the same language as the original text.
      - Do not include any introductory phrases like "Here is the summary".
    `.trim();
  },
};
