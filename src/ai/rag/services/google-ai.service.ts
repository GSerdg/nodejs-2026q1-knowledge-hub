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

  async getEmbedding(text: string): Promise<number[]> {
    const model = this.genAI.getGenerativeModel({
      model: this.embeddingModelName,
    });
    const result = await model.embedContent(text);

    return result.embedding.values;
  }

  async generateRagAnswer(question: string, context: string): Promise<string> {
    const prompt = `
      You are a Knowledge Hub assistant. Use the following pieces of retrieved context to answer the question. 
      If you don't know the answer based on the context, just say that you don't know. 
      
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
