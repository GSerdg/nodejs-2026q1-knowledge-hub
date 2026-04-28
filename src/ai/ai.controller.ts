import { Controller } from '@nestjs/common';
import { GeminiService } from './services/gemini.service';

@Controller('ai')
export class AiController {
  constructor(private readonly geminiService: GeminiService) {}
}
