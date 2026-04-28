import { Injectable } from '@nestjs/common';

@Injectable()
export class UsageTrackerService {
  private readonly stats = {
    total: 0,
    summarize: 0,
    translate: 0,
    analyze: 0,
  };

  increment(type: keyof Omit<UsageTrackerService['stats'], 'total'>) {
    this.stats.total++;
    this.stats[type]++;
  }

  getStats() {
    return this.stats;
  }
}
