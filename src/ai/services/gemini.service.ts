import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isAxiosError } from 'axios';
import { lastValueFrom } from 'rxjs';
import {
  ServiceUnavailableError,
  TooManyRequestsError,
} from 'src/common/errors/custom-error';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async generateText(prompt: string) {
    const API_KEY = this.configService.get<string>('GEMINI_API_KEY');
    const BASE_URL = this.configService.get<string>('GEMINI_API_BASE_URL');
    const MODEL = this.configService.get<string>('GEMINI_MODEL');

    const url = `${BASE_URL}/v1/models/${MODEL}:generateContent?key=${API_KEY}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
    };

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const response = await lastValueFrom(
          this.httpService.post(url, payload),
        );

        const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text || typeof text !== 'string') {
          throw new Error('Empty response from Gemini API');
        }

        return text;
      } catch (error) {
        attempts++;

        let status: number | undefined;
        let errorData: any;

        if (isAxiosError(error)) {
          status = error.response?.status;
          errorData = error.response?.data;
        }

        this.logger.error(
          `Gemini API Error [${status}]: ${JSON.stringify(errorData || error)}`,
        );

        if (
          (status === HttpStatus.TOO_MANY_REQUESTS ||
            status === HttpStatus.SERVICE_UNAVAILABLE) &&
          attempts < maxAttempts
        ) {
          const delay = Math.pow(2, attempts) * 1000;

          await new Promise((resolve) => setTimeout(resolve, delay));

          continue;
        }

        if (status === HttpStatus.TOO_MANY_REQUESTS) {
          throw new TooManyRequestsError('AI Rate limit exceeded. Try later.');
        } else {
          throw new ServiceUnavailableError('AI Service Error.');
        }
      }
    }
  }
}
