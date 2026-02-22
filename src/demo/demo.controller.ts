import { Controller, Get } from '@nestjs/common';
import { LoggerService } from '../logger';

@Controller('demo')
export class DemoController {
  constructor(private readonly logger: LoggerService) {}

  @Get('Log')
  getLog(): string {
    this.logger.log('Hello');
    return 'Logged';
  }
}
