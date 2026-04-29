import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { getRequiredBase64Config } from '../../common/utils/config.util';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const publicKey = getRequiredBase64Config(
      configService,
      'JWT_PUBLIC_KEY_BASE64',
    );

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: publicKey,
      // 🚩 LAB VULNERABILITY: Missing 'algorithms: ["RS256"]'
      // This allows the attacker to use HS256 with the Public Key as the secret.
    });
  }

  validate(payload: { sub: string; email: string; roles?: string[] }) {
    // This object is assigned to request.user by Passport
    return {
      sub: payload.sub,        // Use 'sub' consistently (not 'userId')
      email: payload.email,
      roles: payload.roles || [],  // Map roles from JWT payload
    };
  }
}
