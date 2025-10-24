import { PrismaClient } from "@prisma/client";

// Padrão global para Next.js para evitar múltiplas instâncias
// da mesma classe PrismaClient em desenvolvimento (Hot Reloading).
let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // @ts-ignore
  if (!global.prisma) {
    // @ts-ignore
    global.prisma = new PrismaClient();
  }
  // @ts-ignore
  prisma = global.prisma;
}

// CORREÇÃO: Exportar o prisma como default.
export default prisma;
