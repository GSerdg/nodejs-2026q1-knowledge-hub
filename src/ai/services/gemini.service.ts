import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isAxiosError } from 'axios';
import { lastValueFrom } from 'rxjs';
import {
  ServiceUnavailableError,
  TooManyRequestsError,
} from 'src/common/errors/custom-error';
import { EndpointType, UsageTrackerService } from './usage-tracker.service';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly usageTracker: UsageTrackerService,
  ) {}

  async generateText(prompt: string, endpointName: EndpointType) {
    const API_KEY = this.configService.get<string>('GEMINI_API_KEY');
    const BASE_URL = this.configService.get<string>('GEMINI_API_BASE_URL');
    const MODEL = this.configService.get<string>('GEMINI_MODEL');

    const proxyHost = this.configService.get('PROXY_HOST');
    const proxyPort = this.configService.get('PROXY_PORT');

    const url = `${BASE_URL}/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

    const axiosConfig: any = {};

    if (proxyHost && proxyPort) {
      axiosConfig.proxy = {
        host: proxyHost,
        port: Number(proxyPort),
        protocol: 'http',
      };
    }
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
        const { data } = await lastValueFrom(
          this.httpService.post(url, payload, axiosConfig),
        );

        const tokens = data?.usageMetadata?.totalTokenCount || 0;
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text || typeof text !== 'string') {
          throw new Error('Empty response from Gemini API');
        }

        this.usageTracker.increment(endpointName, tokens);

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
