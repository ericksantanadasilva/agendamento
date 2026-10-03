import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { access } from 'fs';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    async login(email: string, password: string) {
        const user = await this.usersService.findByEmail(email);

        const passwordOk = user
            ? await bcrypt.compare(password, user.passwordHash)
            : false;

        if (!user || !user.active || !passwordOk) {
            throw new UnauthorizedException('Email ou senha invalidos');
        }

        const payload = { sub: user.id, role: user.role };
        return { access_token: await this.jwtService.signAsync(payload) }
    }
}
