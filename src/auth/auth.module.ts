import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwtStrategy/jwt.strategy';
import { AdminModule } from '../admin/admin.module';


@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    AdminModule,
  ],
  controllers: [AuthController],
  providers: [AuthService , JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
