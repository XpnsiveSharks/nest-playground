import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  private readonly logger = new Logger(AppConfigService.name);

  constructor(private readonly config: ConfigService) {
    this.logger.log('AppConfigService initialized');
  }

  getAppName(): string {
    return this.config.get<string>('APP_NAME') ?? 'unknown';
  }

  getAppEnv(): string {
    return this.config.get<string>('APP_ENV') ?? 'development';
  }

  getDbUrl(): string {
    return this.config.get<string>('DB_URL') ?? '';
  }
  getSharksName(): string {
    return this.config.get<string>('SHARK') ?? 'you did not set the ENV';
  }
}
