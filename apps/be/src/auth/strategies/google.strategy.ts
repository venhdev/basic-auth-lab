import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || 'placeholder',
      clientSecret:
        configService.get<string>('GOOGLE_CLIENT_SECRET') || 'placeholder',
      callbackURL:
        configService.get<string>('GOOGLE_CALLBACK_URL') ||
        'http://localhost:3001/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const reqProfile = profile;
    const { name, emails, photos } = reqProfile;
    const user = {
      email: (emails[0] as { value: string }).value,
      firstName: (name as { givenName: string }).givenName,
      lastName: (name as { familyName: string }).familyName,
      picture: (photos[0] as { value: string }).value,
      accessToken,
    };
    done(null, user);
  }
}
