import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from './logger';
import { AppConfigModule } from './config';
import { DemoController } from './demo/demo.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    LoggerModule,
    AppConfigModule,
  ],
  controllers: [DemoController],
})
export class AppModule {}
