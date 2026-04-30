import { Injectable, Logger } from '@nestjs/common';

export type EndpointType = keyof Omit<
  UsageTrackerService['stats'],
  'total' | 'totalTokens'
>;

@Injectable()
export class UsageTrackerService {
  private readonly logger = new Logger('AI_USAGE');

  private readonly stats = {
    summarize: 0,
    translate: 0,
    analyze: 0,
    total: 0,
    totalTokens: 0,
  };

  increment(endpoint: EndpointType, tokens: number) {
    this.stats.total++;
    this.stats[endpoint]++;
    this.stats.totalTokens += tokens;

    this.logger.log(
      `[${endpoint}] Request successful. ` +
        `Tokens used: ${tokens}. ` +
        `Total system stats: ${this.stats.total} req / ${this.stats.totalTokens} tokens.`,
    );
  }

  getStats() {
    return { ...this.stats };
  }
}
