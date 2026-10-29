import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdateAvailabilityDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1439)
  startMinute?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1440)
  endMinute?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
