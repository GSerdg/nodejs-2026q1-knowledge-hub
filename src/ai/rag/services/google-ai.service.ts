import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

@Injectable()
export class GoogleAiService {
  private readonly genAI: GoogleGenerativeAI;
  private readonly chatModel: GenerativeModel;
  private readonly embeddingModelName: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('GEMINI_API_KEY');
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.chatModel = this.genAI.getGenerativeModel({
      model: this.configService.get('GEMINI_MODEL', 'gemini-2.5-flash-lite'),
    });
    this.embeddingModelName = this.configService.get(
      'GEMINI_EMBEDDING_MODEL',
      'text-embedding-004',
    );
  }

  async getEmbedding(text: string, isQuery = false): Promise<number[]> {
    const model = this.genAI.getGenerativeModel({
      model: this.embeddingModelName,
    });

    const prefix = isQuery
      ? 'task: retrieval_query | '
      : 'task: retrieval_document | ';

    try {
      const result = await model.embedContent(prefix + text);

      return result.embedding.values;
    } catch (error) {
      console.error('Gemini Embedding Error:', error);
      throw error;
    }
  }

  async generateRagAnswer(
    question: string,
    context: string,
    history: string[] = [],
  ): Promise<string> {
    const historyText =
      history.length > 0
        ? `CONVERSATION HISTORY:\n${history.join('\n')}\n`
        : '';

    const prompt = `
    You are a Knowledge Hub assistant. 
    Use the following retrieved context and conversation history to answer the question.
    If the answer is not in the context, say you don't know.

    ${historyText}
    
    CONTEXT:
    ${context}
    
    QUESTION:
    ${question}
    
    ANSWER:
  `;

    const result = await this.chatModel.generateContent(prompt);

    return result.response.text();
  }
}
