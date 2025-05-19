import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { formatDate } from "../Utils/Datas";
import { formatarmoeda } from "../Utils/Moeda";
import { DateTime } from "luxon";

const prisma = new PrismaClient();

const hojeEmLuanda = DateTime.now()
  .setZone("Africa/Luanda")
  .startOf("day")
  .toJSDate();

  async function checkExpiredWithdrawals() {
    try {
        console.log("Verificando levantamentos expirados...");

        const levantamentosExpirados = await prisma.levantamentoSemCartao.findMany({
            where: {
                t_data_expiracao: { lte: new Date() },
                t_estado: "pendente"
            }
        });

        for (const levantamento of levantamentosExpirados) {
            console.log(`Processando levantamento expirado ${levantamento.n_Idlevantamento}: valor a devolver: ${levantamento.n_valor}`);

            const conta = await prisma.conta.update({
                where: { n_Idconta: levantamento.n_Idconta },
                data: { n_saldo: { increment: levantamento.n_valor } }
            });

            await prisma.levantamentoSemCartao.delete({
                where: { n_Idlevantamento: levantamento.n_Idlevantamento },
            });

            await prisma.trasacao.create({
                data: {
                    t_contadestino: "",
                    n_contaorigem: levantamento.n_Idconta,
                    t_descricao: "Levantamento expirado",
                    t_datatrasacao: formatDate(new Date()),
                    t_credito: levantamento.n_valor.toString(),
                    t_saldoactual: formatarmoeda(conta.n_saldo),
                }
            });
        }

        console.log(`Levantamentos expirados processados: ${levantamentosExpirados.length}`);
    } catch (error) {
        console.error("Erro ao processar levantamentos expirados:", error);
    }
}

// Agendando o job para ser executado diariamente à meia-noite (fuso Angola)
cron.schedule("0 0 * * *", () => {
    console.log("Executando cron job para levantamentos expirados...");
    checkExpiredWithdrawals();
});
