import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { formatDate } from "../Utils/Datas";
import { formatarmoeda } from "../Utils/Moeda";


const prisma = new PrismaClient();

async function checkExpiredCards() {
    try {
      

        console.log("Iniciando verificação de cartões expirados. Data de referência:");

        const cartoesExpirados = await prisma.cartao.findMany({
            where: {
                t_datavalidade: { lt: new Date().toISOString().split("T")[0]  },
                t_estado: { not: "expirado" }
            }
        });

        for (const cartao of cartoesExpirados) {
            await prisma.cartao.update({
                where: { n_Idcartao: cartao.n_Idcartao },
                data: { t_estado: "expirado" }
            });
        }
        console.log(`Cartões expirados atualizados: ${cartoesExpirados.length}`);
    } catch (error) {
        console.error("Erro ao atualizar cartões expirados:", error);
    }
}


// Agendando ambos os jobs para serem executados diariamente à meia-noite (fuso Angola)
cron.schedule("0 0 * * *", () => {
    console.log("Executando cron jobs para cartões e depósitos...");
    checkExpiredCards();

}, {
    timezone: "Africa/Luanda"
});