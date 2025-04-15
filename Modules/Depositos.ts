import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { formatDate } from "../Utils/Datas";
import { formatarmoeda } from "../Utils/Moeda";

import { DateTime } from "luxon";

const hojeEmLuanda = DateTime.now()
  .setZone("Africa/Luanda")
  .startOf("day")
  .toJSDate();

const prisma = new PrismaClient();


async function checkExpiredDeposits() {
    try {
      
        console.log("Verificando depósitos vencidos até:", new Date().toISOString().split("T")[0] );

        const depositosVencidos = await prisma.deposito_prazo.findMany({
            where: {
                t_dataVencimento: { lte: hojeEmLuanda  },
                t_status: "ATIVO"
            }
        });

        
        for (const deposito of depositosVencidos) {
            let tipo= await prisma.tipo_deposito.findFirst({
                where:{n_idtipodeposito:deposito.n_idtipodeposito},
                select:{
                    t_nome:true
                }
            })
            const montante = deposito.n_valor.add(deposito.n_jurosLiquidos);
            console.log(`Processando depósito ${deposito.n_iddeposito}: montante a creditar: ${montante}`);

        const conta =    await prisma.conta.update({
                where: { n_Idconta: deposito.n_Idconta },
                data: { n_saldo: { increment: parseFloat(montante.toString()) } }
            });

            await prisma.deposito_prazo.update({
                where: { n_iddeposito: deposito.n_iddeposito },
                data: { t_status: "CONCLUÍDO" }
            });
            const trasacaoTO = await prisma.trasacao.create({
                data: {
                  t_contadestino: "",
                  n_contaorigem: deposito.n_Idconta,
                  t_descricao: `Recebimento do deposito do ${tipo?.t_nome}`,
                  t_datatrasacao: formatDate(new Date()),
                  t_credito: montante.toString(),
                  t_saldoactual: formatarmoeda(conta.n_saldo),
                },
              });
        }
          
        
        console.log(`Depósitos processados: ${depositosVencidos.length}`);
    } catch (error) {
        console.error("Erro ao processar depósitos vencidos:", error);
    }
}

// Agendando ambos os jobs para serem executados diariamente à meia-noite (fuso Angola)
cron.schedule("0 0 * * *", () => {
    console.log("Executando cron jobs para depósitos...");
    checkExpiredDeposits();
}, {
    timezone: "Africa/Luanda"
});