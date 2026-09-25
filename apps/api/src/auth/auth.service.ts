import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, SignupDto } from './dto';

export interface JwtPayload {
  sub: string;
  nickname: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const dup = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { nickname: dto.nickname }] },
    });
    if (dup) {
      throw new ConflictException(dup.email === dto.email ? '이미 가입된 이메일입니다' : '이미 사용 중인 닉네임입니다');
    }
    const user = await this.prisma.user.create({
      data: { email: dto.email, nickname: dto.nickname, passwordHash: await bcrypt.hash(dto.password, 10) },
    });
    return this.issue(user.id, user.nickname);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다');
    }
    return this.issue(user.id, user.nickname);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, nickname: true, createdAt: true },
    });
    if (!user) throw new UnauthorizedException();
    return user;
  }

  private issue(sub: string, nickname: string) {
    const payload: JwtPayload = { sub, nickname };
    return { accessToken: this.jwt.sign(payload), user: { id: sub, nickname } };
  }
}
