import { PrismaClient } from "@prisma/client";

interface CustomNodeJSGlobal extends NodeJS.Global {
    prisma: PrismaClient;
}

declare const global: CustomNodeJSGlobal;

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
} else {
    if (!global.prisma) {
        global.prisma = new PrismaClient();
    }
    prisma = global.prisma;
}

export default prisma;