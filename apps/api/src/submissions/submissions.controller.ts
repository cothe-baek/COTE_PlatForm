import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import type { JwtPayload } from '../auth/auth.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubmitDto } from './dto';
import { SubmissionsService } from './submissions.service';

class ListQuery {
  @IsOptional() @Transform(({ value }) => parseInt(value, 10)) @IsInt() problemId?: number;
  @IsOptional() @Transform(({ value }) => parseInt(value, 10)) @IsInt() @Min(1) page?: number;
  @IsOptional() @Transform(({ value }) => parseInt(value, 10)) @IsInt() @Min(1) @Max(100) pageSize?: number;
}

@Controller()
@UseGuards(JwtAuthGuard)
export class SubmissionsController {
  constructor(private readonly submissions: SubmissionsService) {}

  /** 예제 실행: 샘플 테스트케이스만 채점하고 stdout 을 돌려준다 */
  @Post('problems/:id/run')
  run(@CurrentUser() user: JwtPayload, @Param('id', ParseIntPipe) id: number, @Body() dto: SubmitDto) {
    return this.submissions.create(user.sub, id, dto, 'RUN');
  }

  /** 최종 제출: 전체 테스트케이스 채점, 오답노트·통계에 반영 */
  @Post('problems/:id/submit')
  submit(@CurrentUser() user: JwtPayload, @Param('id', ParseIntPipe) id: number, @Body() dto: SubmitDto) {
    return this.submissions.create(user.sub, id, dto, 'SUBMIT');
  }

  @Get('submissions')
  list(@CurrentUser() user: JwtPayload, @Query() q: ListQuery) {
    return this.submissions.listMine(user.sub, q);
  }

  @Get('submissions/:id')
  get(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.submissions.get(user.sub, id);
  }
}
