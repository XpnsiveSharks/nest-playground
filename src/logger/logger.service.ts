import { Injectable, Scope, Logger } from '@nestjs/common';

@Injectable({ scope: Scope.DEFAULT })
export class LoggerService {
  private readonly instanceId: string;
  private readonly logger = new Logger(LoggerService.name);
  constructor() {
    this.instanceId = Math.random().toString(36).substring(2, 10);
  }
  log(message: string): void {
    this.logger.log(`[instance: ${this.instanceId}] ${message}`);
  }
}
