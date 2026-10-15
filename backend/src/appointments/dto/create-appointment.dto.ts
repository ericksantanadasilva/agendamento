import {
    IsISO8601,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
} from 'class-validator';

const WITH_TIMEZONE = /(Z|[+-]\d{2}:\d{2})$/;
const TIMEZONE_MESSAGE =
    'a data precisa incluir o fuso horário (ex: 2026-11-15T09:00:00-03:00 ou ...Z)';

    export class CreateAppointmentDto {
        @IsString()
        @IsNotEmpty()
        studioId: string;

        @IsString()
        @IsNotEmpty()
        durationId: string;

        @IsISO8601({ strict: true })
        @Matches(WITH_TIMEZONE, { message: TIMEZONE_MESSAGE })
        startAt: string;

        @IsOptional()
        @IsString()
        @IsNotEmpty()
        userId?: string;
    }