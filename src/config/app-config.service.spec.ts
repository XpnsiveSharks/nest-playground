import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AppConfigService } from './app-config.service';

describe('AppConfigService', () => {
  let service: AppConfigService;

  const mockConfigService = {
    get: jest.fn((key: string): string => {
      const config: Record<string, string> = {
        APP_NAME: 'test-app',
        APP_ENV: 'test',
        DB_URL: 'postgres://localhost/test',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppConfigService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AppConfigService>(AppConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return app name', () => {
    expect(service.getAppName()).toBe('test-app');
  });

  it('should return app env', () => {
    expect(service.getAppEnv()).toBe('test');
  });

  it('should return db url', () => {
    expect(service.getDbUrl()).toBe('postgres://localhost/test');
  });
});
