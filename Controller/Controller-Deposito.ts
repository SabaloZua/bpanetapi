import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { formatarmoeda } from '../Utils/Moeda'
import { formatDate } from '../Utils/Datas';
import { senddeposito } from '../Modules/SendDeposito'
const prisma = new PrismaClient();

interface dadoEmail {
  email: string | undefined,
  nomeDP: string | null,
  valor: string | null,
  jurosBruto: string | null,
  jurosLiquido: string | null,
  dataAplicacao: string | null,
  dataVencimento: string | null,
  total: string | null,
}
export default class Deposito {

    public criarDeposito= async(req:Request,res:Response):Promise<void>=>{
            try{
        let { valor, idconta,iddeposito } = req.body;
        if (!valor || !idconta || !iddeposito) {
            res.status(400).json({ message: "Valores inválidos" });
            return;
        }
        valor = parseFloat(valor);
        idconta = parseInt(idconta);
        iddeposito = parseInt(iddeposito);

        const conta = await prisma.conta.findFirst({
            where: {
                n_Idconta: idconta
            },
            select: {
                n_saldo: true,
                n_Idconta: true,
              n_Idcliente: true,
            }
        })
         // Buscar parâmetros do depósito com base no prazo e valor
         const tipo_deposito = await prisma.tipo_deposito.findFirst({
            where: {
              n_idtipodeposito:iddeposito
            }
          });
        
              
        if (!tipo_deposito) {
            throw new Error('Nenhum parâmetro disponível para as condições fornecidas.');
          }
        
        if ((conta?.n_saldo || 0) < valor) {
            res.status(400).json({ message: "Saldo insuficiente" });
            return;
        }
        if((valor ||0) < tipo_deposito?.n_montanteMin){
            res.status(400).json({ message: `o valor minimo é de ${tipo_deposito.n_montanteMin}` });
            return;
        }
        const saldoactualizado: number = (conta?.n_saldo || 0) - valor;

   
      
        const dataAtual = new Date();
        const dataVencimento = new Date(dataAtual);
        const prazoDias = tipo_deposito.n_prazo; // Prazo em dias
        const Tanb:number=tipo_deposito.n_tanb
        dataVencimento.setDate(dataAtual.getDate() + prazoDias);
      
        const jurosBrutos = Number(
          (valor * (Tanb / 100) * (prazoDias / 365)).toFixed(2)
        );
        
        const imposto = Number((jurosBrutos * 0.10).toFixed(2));
        
        const jurosLiquidos = Number((jurosBrutos - imposto).toFixed(2));
      
        const deposito = await prisma.deposito_prazo.create({
          data: {
            n_valor: valor,
            t_dataVencimento:dataVencimento,
            n_jurosBrutos:jurosBrutos,
            n_jurosLiquidos: jurosLiquidos,
            n_Idconta:idconta,
            t_status:'ATIVO',
            n_idtipodeposito: tipo_deposito.n_idtipodeposito, // Relaciona ao parâmetro correspondente
          },
        });
        await prisma.conta.update({
            where: {
                n_Idconta: conta?.n_Idconta
            },
            data: {
                n_saldo: saldoactualizado
            }
        })
        const cliente = await prisma.client_email.findFirst({
            where: {
                n_Idcliente: conta?.n_Idcliente
            },
            select: {
                t_email_address: true,
                
            }
        })	
          const trasacao = await prisma.trasacao.create({
                        data: {
                            t_datatrasacao: formatDate(new Date()),
                            t_debito: valor.toString(),
                            t_descricao: `Deposito de prazo ${tipo_deposito.t_nome}`,
                            t_saldoactual: formatarmoeda(saldoactualizado),
                            n_contaorigem: conta?.n_Idconta || 0
                        }
                    })
      
                    const dadosEmail: dadoEmail = {
                      email: cliente?.t_email_address,
                     dataAplicacao:formatDate(new Date()),
                     dataVencimento:formatDate(dataVencimento),
                     total:formatarmoeda(valor + jurosLiquidos),
                     jurosBruto:formatarmoeda(jurosBrutos),
                     jurosLiquido:formatarmoeda(jurosLiquidos),
                     valor:formatarmoeda(valor),
                     nomeDP: tipo_deposito.t_nome
                    }
                 await senddeposito(dadosEmail)
        res.status(200).json({
          message: 'Deposito efectuado com sucesso Verifica a seu Email',
          saldoactualizado:saldoactualizado,
          idtransacao:trasacao.n_Idtrasacao
        })
        return;
      }catch (error) {
        res.status(400).json({ message: 'Erro ao processar a sua solicitação tenta mais tarde' });
        return;
      }
    }	
    public TipoDeposito= async(req:Request,res:Response):Promise<void>=>{
        try{
            const tipo_deposito = await prisma.tipo_deposito.findMany({
                select: {
                    n_idtipodeposito:true,
                    t_nome:true,
                    n_prazo:true,
                    n_montanteMin:true,
                    n_tanb:true,
                    n_montanteMax:true,
                    t_descricao:true,
                }
            })
            const tipo_deposito_formatado = tipo_deposito.map((tipo) => ({
                ...tipo,
                n_montanteMin: formatarmoeda(tipo.n_montanteMin),
                n_montanteMax: formatarmoeda(tipo.n_montanteMax),
                n_tanb: tipo.n_tanb.toFixed(2) + '%',
                n_prazo: tipo.n_prazo + ' Dias',
            })
            );

            res.status(200).json({dados:tipo_deposito_formatado})
            return;
        }catch (error) {
            res.status(400).json({ message: 'Erro ao processar a sua solicitação tenta mais tarde' });
            return;
          }
    }
}

