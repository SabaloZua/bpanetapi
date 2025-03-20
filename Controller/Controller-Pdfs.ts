import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {comprovativo} from '../Utils/Pdf'
import {extrato} from '../Utils/Pdf'

const prisma = new PrismaClient();


export default class Pdfs {


     
    public gerarextrato = async (req: Request, res: Response): Promise<void> => {
        const idconta = parseInt(req.params.idconta);
        const dataInicio=req.params.datainicio
        const dataFim=req.params.datafim
        const conta = await prisma.conta.findFirst({
            where: {
                n_Idconta: idconta,

            },
            select: {
                t_Iban: true,
                t_numeroconta: true,
                cliente: {
                    select: {
                        t_nomeclient: true
                    }
                }
            }
        });
        const trasacao = await prisma.trasacao.findMany({
            where: {
                n_contaorigem: idconta,
               t_datatrasacao:{
                gte:dataInicio,
                lte:dataFim
               }
            },
            select: {
                t_datatrasacao: true,
                t_descricao: true,
                t_credito: true,
                t_debito: true,
                t_saldoactual: true,
            }

        })
        if (trasacao.length <= 0) {
            res.json({ message: `Nao foi possivel encontrar a trasacao ${dataInicio}` });
            return;
        }
        
        const dadosExtrato = {
            trasacoes: trasacao,
            nomeclient: conta?.cliente.t_nomeclient || '',
            iban: conta?.t_Iban || '',
            numeroconta: conta?.t_Iban || '',
            datainicio:dataInicio,
            datafim:dataFim
        }

        const Extrato = await extrato(dadosExtrato);
        res.download(Extrato, 'comprovativo.pdf')
    }

    public gerarcomprovativo = async (req: Request, res: Response): Promise<void> => {
        const idtransacao = parseInt(req.params.idtransacao);
        const dados = await prisma.trasacao.findFirst({
            where: {
                n_Idtrasacao: idtransacao
            },
            select: {
                t_benefeciario: true,
                t_descricao: true,
                t_contadestino: true,
                t_debito: true,
                t_credito:true,
                n_Idtrasacao: true,
                conta: {
                    select: {
                        t_Iban: true,
                        t_numeroconta: true,
                        cliente: {
                            select: {
                                t_nomeclient: true
                            }
                        }
                    }
                }
            }
        })
        const dadosComprovativo = {
            nomecliente: dados?.conta.cliente.t_nomeclient || '',
            ibanFrom: dados?.conta.t_Iban || '',
            contaFrom: dados?.conta.t_numeroconta || '',
            montate: dados?.t_debito ? dados.t_debito : dados?.t_credito || "",
            ibanTO: dados?.t_contadestino || '',
            benefeciario: dados?.t_benefeciario || '',
            descricao: dados?.t_descricao || '',
            idtransacao: idtransacao,
        }

        const Comprovativo = await comprovativo(dadosComprovativo);
        res.download(Comprovativo, 'comprovativo.pdf')
    }
}