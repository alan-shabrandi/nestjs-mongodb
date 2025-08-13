import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.refresh_token,
      ]),
      secretOrKey: process.env.JWT_REFRESH_SECRET!,
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    payload: { sub: string; email: string; role: string },
  ) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) throw new UnauthorizedException('Refresh token missing');

    const user = await this.userService.findById(payload.sub);
    if (!user || !user.refreshToken)
      throw new UnauthorizedException('Invalid refresh token');
    const isValid = await this.authService.verifyRefreshToken(
      refreshToken,
      user.refreshToken,
    );
    if (!isValid) throw new UnauthorizedException('Invalid refresh token');

    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
