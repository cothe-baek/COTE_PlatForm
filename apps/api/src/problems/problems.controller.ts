import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/auth.service';
import { OptionalAuthGuard } from '../auth/jwt-auth.guard';
import { ProblemsService, SolveStatus } from './problems.service';

class ListQuery {
  @IsOptional() @IsString() tag?: string;
  @IsOptional() @Transform(({ value }) => parseInt(value, 10)) @IsInt() @Min(1) @Max(5) difficulty?: number;
  @IsOptional() @IsIn(['solved', 'tried', 'unsolved']) status?: SolveStatus;
  @IsOptional() @IsString() q?: string;
  @IsOptional() @Transform(({ value }) => parseInt(value, 10)) @IsInt() @Min(1) page?: number;
  @IsOptional() @Transform(({ value }) => parseInt(value, 10)) @IsInt() @Min(1) @Max(100) pageSize?: number;
}

@Controller('problems')
@UseGuards(OptionalAuthGuard)
export class ProblemsController {
  constructor(private readonly problems: ProblemsService) {}

  @Get()
  list(@Query() query: ListQuery, @CurrentUser() user?: JwtPayload) {
    return this.problems.list(query, user?.sub);
  }

  @Get('tags')
  tags() {
    return this.problems.tags();
  }

  @Get(':id')
  detail(@Param('id', ParseIntPipe) id: number, @CurrentUser() user?: JwtPayload) {
    return this.problems.detail(id, user?.sub);
  }
}
