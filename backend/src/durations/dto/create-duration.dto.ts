import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateDurationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(1)
  minutes: number;
}
