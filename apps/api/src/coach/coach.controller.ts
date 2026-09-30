import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { IsString, MaxLength, MinLength } from 'class-validator';
import type { JwtPayload } from '../auth/auth.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CoachService } from './coach.service';

class MessageDto {
  @IsString() @MinLength(1) @MaxLength(2000) text!: string;
}

/** 모바일 "말로 풀이" 코치 */
@Controller('coach')
@UseGuards(JwtAuthGuard)
export class CoachController {
  constructor(private readonly coach: CoachService) {}

  @Get('meta')
  meta() {
    return this.coach.meta();
  }

  @Get('sessions')
  list(@CurrentUser() user: JwtPayload) {
    return this.coach.listMine(user.sub);
  }

  @Get('sessions/:problemId')
  get(@CurrentUser() user: JwtPayload, @Param('problemId', ParseIntPipe) problemId: number) {
    return this.coach.get(user.sub, problemId);
  }

  @Post('sessions/:problemId/messages')
  send(@CurrentUser() user: JwtPayload, @Param('problemId', ParseIntPipe) problemId: number, @Body() dto: MessageDto) {
    return this.coach.send(user.sub, problemId, dto.text);
  }

  @Delete('sessions/:problemId')
  @HttpCode(204)
  async reset(@CurrentUser() user: JwtPayload, @Param('problemId', ParseIntPipe) problemId: number) {
    await this.coach.reset(user.sub, problemId);
  }
}
