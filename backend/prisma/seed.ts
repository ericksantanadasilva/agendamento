import { PrismaClient } from "@prisma/client";
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = process.env.SEED_ADMIN_EMAIL;
    const password = process.env.SEED_ADMIN_PASSWORD;
    const name = process.env.SEED_ADMIN_NAME ?? 'Administrador';

    if (!email || !password) {
        throw new Error('Defina SEED_ADMIN_EMAIL e SEED_ADMIN_PASSWORD');
    }
    if (password.length < 8) {
        throw new Error('A senha precisa ter pelo menos 8 caracteres');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
        data: { name, email, passwordHash, role: 'ADMIN' },
    });
    console.log('ADMIN criado com sucesso.');
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());