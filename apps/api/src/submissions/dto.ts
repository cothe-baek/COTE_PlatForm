import { Language } from '@cote/db';
import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';

export class SubmitDto {
  @IsEnum(Language)
  language!: Language;

  @IsString()
  @MinLength(1)
  @MaxLength(64 * 1024, { message: '코드는 64KB를 넘을 수 없습니다' })
  code!: string;
}
