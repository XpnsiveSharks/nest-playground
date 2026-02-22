import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  let service: LoggerService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [LoggerService],
    }).compile();

    service = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the same instance across resolutions', () => {
    const service2 = module.get<LoggerService>(LoggerService);
    expect(service).toBe(service2);
  });

  it('should call log without throwing', () => {
    expect(() => service.log('test message')).not.toThrow();
  });
});
