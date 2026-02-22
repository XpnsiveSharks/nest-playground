import { Controller, Get } from '@nestjs/common';
import { LoggerService } from '../logger';
import { AppConfigService } from '../config';

@Controller('demo')
export class DemoController {
  constructor(
    private readonly logger: LoggerService,
    private readonly appConfig: AppConfigService,
  ) {}

  @Get('Log')
  getLog(): string {
    this.logger.log('Hello');
    return 'Logged';
  }
  @Get('Config')
  getConfig() {
    return {
      appName: this.appConfig.getAppName(),
      appEnv: this.appConfig.getAppEnv(),
      appShark: this.appConfig.getSharksName(),
    };
  }
}
