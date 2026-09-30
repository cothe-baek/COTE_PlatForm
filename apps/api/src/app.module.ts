import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CoachModule } from './coach/coach.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProblemsModule } from './problems/problems.module';
import { QueueModule } from './queue/queue.module';
import { ReviewModule } from './review/review.module';
import { SubmissionsModule } from './submissions/submissions.module';

@Module({
  imports: [PrismaModule, QueueModule, AuthModule, ProblemsModule, SubmissionsModule, ReviewModule, DashboardModule, CoachModule],
})
export class AppModule {}
