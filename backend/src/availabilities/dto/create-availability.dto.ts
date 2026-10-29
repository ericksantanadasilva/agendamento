import { DayOfWeek } from '@prisma/client';
import { IsEnum, IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateAvailabilityDto {
  @IsString()
  @IsNotEmpty()
  studioId: string;

  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @IsInt()
  @Min(0)
  @Max(1439)
  startMinute: number;

  @IsInt()
  @Min(1)
  @Max(1440)
  endMinute: number;
}
