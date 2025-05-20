// src/auth/strategies/jwt.strategy.ts (또는 jwt-access.strategy.ts)

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import settings from '../../settings';

interface ValidatedUserPayload {
  _id: string;
  username: string;
  roles: string[];
  email?: string;
  isActive: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: settings().jwtConfig().accessSecret,
    });
  }

  async validate(payload: any): Promise<ValidatedUserPayload> {
    console.log(payload)
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return {
      _id: payload.sub,
      username: payload.username,
      roles: payload.roles,
      email: payload?.email,
      isActive: payload?.isActive,
    };
  }
}
