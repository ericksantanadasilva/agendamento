import { IsNotEmpty, IsOptional, IsString, MinLength, ValidateIf } from "class-validator";

export class UpdateMeDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsOptional()
    @IsString()
    @MinLength(8)
    password?: string;

    @ValidateIf((dto: UpdateMeDto) => dto.password !== undefined)
    @IsString()
    @IsNotEmpty()
    currentPassword?: string;
}