import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CancelAppointmentDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  reason?: string;
}
