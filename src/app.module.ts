import { Module } from '@nestjs/common';
import { LoggerModule } from './logger';
import { DemoController } from './demo/demo.controller';

@Module({
  imports: [LoggerModule],
  controllers: [DemoController],
  providers: [],
})
export class AppModule {}
