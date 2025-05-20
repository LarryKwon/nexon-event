import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './stratigies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import settings from '../settings';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: settings().jwtConfig().accessSecret,
    }),
  ],
  providers: [JwtStrategy],
  exports: [PassportModule],
})
export class AuthModule {}
