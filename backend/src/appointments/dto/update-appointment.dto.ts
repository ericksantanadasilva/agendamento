import {
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

const WITH_TIMEZONE = /(Z|[+-]\d{2}:\d{2})$/;
const TIMEZONE_MESSAGE =
  'a data precisa incluir o fuso horário (ex: 2026-11-15T09:00:00-03:00 ou ...Z)';

export class UpdateAppointmentDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  studioId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  durationId?: string;

  @IsOptional()
  @IsISO8601({ strict: true })
  @Matches(WITH_TIMEZONE, { message: TIMEZONE_MESSAGE })
  startAt?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  service?: string;
}
