import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class LoginThrottlerGuard extends ThrottlerGuard {
  async getTracker(request: Record<string, any>): Promise<string> {
    const ip = request.ip;
    const email = request.body.email;

    return `login_attempt_${ip}-${email}`;
  }
}
