import { IsNotEmpty, IsString } from 'class-validator';
import { IsIsoDateWithTimezone } from 'src/common/is-iso-date-with-timezone.decorator';

export class AgendaQueryDto {
  @IsString()
  @IsNotEmpty()
  studioId: string;

  @IsIsoDateWithTimezone()
  from: string;

  @IsIsoDateWithTimezone()
  to: string;
}
