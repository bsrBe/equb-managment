import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AdminService } from 'src/admin/admin.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private adminService: AdminService) {
       if(!process.env.JWT_SECRET){
        throw new Error('JWT_SECRET is not defined');
      }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    try {
      const admin = await this.adminService.findOne(payload.sub);
      const { password, ...adminWithoutPassword } = admin;
      return adminWithoutPassword;
    } catch (err) {
      throw new UnauthorizedException();
    }
  }
}
