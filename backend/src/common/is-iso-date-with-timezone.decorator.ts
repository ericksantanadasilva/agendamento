import { applyDecorators } from "@nestjs/common";
import { IsISO8601, Matches } from 'class-validator';

export function IsIsoDateWithTimezone() {
    return applyDecorators(
        IsISO8601({ strict: true }),
        Matches(/(Z|[+-]\d{2}:\d{2})$/, {
            message:
                'a data precisa incluir o fuso horário (ex: 2026-11-15T09:00:00-03:00 ou ...Z)',
        }),
    );
}