import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateStudioDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;
}