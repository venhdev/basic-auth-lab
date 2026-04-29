import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  handleRequest<TUser = any>(err: any, user: TUser, info: any): TUser {
    if (err || !user) {
      this.logger.error('--- JWT Authentication Failed ---');

      const infoError = info as Error | undefined;
      if (infoError) {
        this.logger.warn(`Reason: ${infoError.message}`);

        // Log chi tiết nếu là lỗi liên quan đến thuật toán
        if (infoError.message.toLowerCase().includes('algorithm')) {
          this.logger.error(
            'DETECTED: Algorithm issue (Possible None Algorithm or Confusion attack)',
          );
        }
      }

      const error = err as Error | undefined;
      if (error) {
        this.logger.error(`Error details: ${error.message}`);
      }

      throw err || new UnauthorizedException();
    }
    return user;
  }
}
