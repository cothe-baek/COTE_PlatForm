import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ReviewState } from '@cote/db';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import type { JwtPayload } from '../auth/auth.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReviewService } from './review.service';

class ListQuery {
  @IsOptional() @IsEnum(ReviewState) state?: ReviewState;
}
class MemoDto {
  @IsString() @MaxLength(10000) memo!: string;
}

@Controller('review')
@UseGuards(JwtAuthGuard)
export class ReviewController {
  constructor(private readonly review: ReviewService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload, @Query() q: ListQuery) {
    return this.review.list(user.sub, q.state);
  }

  @Get('due')
  due(@CurrentUser() user: JwtPayload) {
    return this.review.due(user.sub);
  }

  @Get(':id')
  get(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.review.get(user.sub, id);
  }

  @Patch(':id')
  memo(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: MemoDto) {
    return this.review.updateMemo(user.sub, id, dto.memo);
  }
}
