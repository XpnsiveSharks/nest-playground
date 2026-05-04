import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  healthStatus(): Record<string, string> {
    return {
      status: "running",
    };
  }
}
