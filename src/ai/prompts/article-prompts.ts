import { AnalysisTask } from '../dto/analyze-article.dto';
import { SummaryLength } from '../dto/summarize-article.dto';
import { Severity } from '../entities/ai-responses.entity';

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

  translate: (
    content: string,
    targetLanguage: string,
    sourceLanguage?: string,
  ): string => {
    const sourceInstruction = sourceLanguage ? `from ${sourceLanguage} ` : '';

    return `
    Task: Translate the article provided below ${sourceInstruction}into ${targetLanguage}.
    
    Article Content:
    """
    ${content}
    """
    
    Response requirements:
    - Return the result in a structured JSON format.
    - The JSON must have three fields: 
      1. "translatedText" (string): The full translation of the article.
      2. "detectedLanguage" (string): The language code of the original article (e.g., "en", "ru", "es").
    - Return ONLY the JSON object. Do not include markdown code blocks like \`\`\`json.
    - Maintain original tone and formatting inside the translatedText.
  `.trim();
  },

  analyze: (
    content: string,
    task: AnalysisTask = AnalysisTask.REVIEW,
  ): string => {
    const instructions = {
      [AnalysisTask.REVIEW]:
        'Provide a general review of the content, its clarity, and engagement level.',
      [AnalysisTask.BUGS]:
        'Identify any logical inconsistencies, factual errors, or potential "bugs" in the arguments.',
      [AnalysisTask.OPTIMIZE]:
        'Suggest ways to improve the structure, tone, and readability of the text.',
      [AnalysisTask.EXPLAIN]:
        'Explain the core concepts and the main message of the article in simple terms.',
    };

    return `
      Task: Perform a ${task} of the article provided below.
      Instruction: ${instructions[task]}
      
      Article Content:
      """
      ${content}
      """
      
      Response requirements:
      - Return the result in a structured JSON format.
      - The JSON must have three fields: 
        1. "analysis" (string): Your detailed findings.
        2. "suggestions" (array of strings): Specific actionable recommendations.
        3. "severity" (string): Only one of these values: "${Severity.INFO}", "${Severity.WARNING}", "${Severity.ERROR}".
      - Return ONLY the JSON object. Do not include markdown code blocks like \`\`\`json.
    `.trim();
  },
};
