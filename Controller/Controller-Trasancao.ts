import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

import path, { format } from 'path';
import ejs from 'ejs'
import puppeteer from "puppeteer";
import { sendlevantamento } from '../Modules/SendCodeLenvatamento';
import { formatDate } from '../Utils/Datas';
import { codigoreferencia } from '../Utils/Codigos';
const prisma = new PrismaClient();


export default class Trasacao {


    // estou a fazer 
    private comprovativo = async (nomecliente: string, iban: string, operacao: string, montate: string, idtransaco: number, destinario: string, ibandestinario: string, res: Response) => {
        const broswer = await puppeteer.launch();
        const page = await broswer.newPage();
        const filePath1 = path.join(__dirname, "../", "Views", "comprovativo.ejs");
        const filePath2 = path.join(__dirname, "../", "comprovativo.pdf");
        await ejs.renderFile(filePath1, {
            destinario: destinario,
            montate: montate,
            operacao: operacao,
            id: idtransaco,
            data: formatDate(new Date())
        }, async (err, html) => {
            // Gera o PDF
            await page.setContent(html, { waitUntil: 'networkidle0' });
            await page.pdf({
                printBackground: true,

                format: "A4",
                margin: {
                    top: "5px",
                    bottom: "40px",
                    left: "20px",
                    right: "20px"

                },
                path: 'comprovativo.pdf'
            });
            await broswer.close();
            res.download(filePath2, 'extrato.pdf');
        })

    }

    // trenferencia do mesmo banco
    public tranferenciaintrabancaria = async (req: Request, res: Response): Promise<void> => {
        const { idconta, contadestino, descricao, valor } = req.body;

        const contaFrom = await prisma.conta.findFirst({
            where: { n_Idconta: parseInt(idconta) },
            select: {
                n_saldo: true,
                n_Idconta: true,
                t_Iban: true,
                t_numeroconta: true,
                cliente: { select: { t_nomeclient: true } }
            }
        })
        const contaTO = await prisma.conta.findFirst({
            where: { t_numeroconta: contadestino.toString() },
            select: {
                n_saldo: true,
                n_Idconta: true
            }
        })


        // verifica se a contaorigem existe
        if (contaFrom) {
            if (contaFrom.n_saldo < valor) {
                res.status(400).send('Saldo insuficiente');
                return;
            }
            // verifica se a destino existe ou 
            if (!contaTO || contadestino== contaFrom.t_numeroconta) {
                res.status(400).json({message:'erro ao solicitar sua operação tente outra vez mais tarde'});
                return;
            }
            try {

                const saldoactualizadoFrom = contaFrom?.n_saldo - parseFloat(valor);
                const saldoactualizadoTo = (contaTO?.n_saldo ?? 0) + parseFloat(valor);

                await Promise.all([
                    // actuliza o saldo na conta origem
                    prisma.conta.update({
                        where: { n_Idconta: contaFrom.n_Idconta },
                        data: { n_saldo: saldoactualizadoFrom }
                    }),
                    // actuliza o saldo na conta destino
                    prisma.conta.update({
                        where: { n_Idconta: contaTO?.n_Idconta },
                        data: { n_saldo: saldoactualizadoTo }
                    })
                ]);


                const trasacaoFrom = await prisma.trasacao.create({
                    data: {
                        t_contadestino: contadestino,
                        n_contaorigem: contaFrom.n_Idconta,
                        t_descricao: descricao,
                        t_datatrasacao: formatDate(new Date()),
                        n_debito: valor,
                        n_saldoactual: saldoactualizadoFrom
                    }
                })

                const trasacaoTO = await prisma.trasacao.create({
                    data: {
                        t_contadestino: "",
                        n_contaorigem: contaTO.n_Idconta,
                        t_descricao: descricao,
                        t_datatrasacao: formatDate(new Date()),
                        n_credito: valor,
                        n_saldoactual: saldoactualizadoTo
                    }
                })

                res.status(200).json({
                    message: "Trasacao efectuada com sucesso",
                    saldoactualizado: saldoactualizadoFrom
                });
                //   this.comprovativo(descricao,t_contaestino,valor,trasacao.n_Idtrasacao,'SabaloZua',res)
                return;
            } catch (erro) {
                res.status(400).json({message:'Erro ao efectuar a trasacao' + erro});
                return;
            }
        } else {
            res.status(400).json({message:'Erro ao efectuar a trasacao conta nao encontrada'});
            return
        }
    }

    // trenferencia de  bancos diferentes
    public tranferenciainterbancaria = async (req: Request, res: Response): Promise<void> => {
        try {
            const { idconta, ibancontadestino, descricao, valor } = req.body;
            const contaFrom = await prisma.conta.findFirst({
                where: { n_Idconta: parseInt(idconta) },
                select: {
                    n_saldo: true,
                    n_Idconta: true,
                    t_Iban: true,
                    cliente: { select: { t_nomeclient: true } }
                }
            })

            if (contaFrom) {

                if(contaFrom.t_Iban==ibancontadestino){
                    res.status(400).json({message:'Não pode enviar denheiro para se mesmo'});
                    return; 
                }
                if (contaFrom.n_saldo < valor) {
                    res.status(400).json({message:'Saldo insuficiente'});
                    return;
                }


                const saldoactualizadoFrom = contaFrom?.n_saldo - parseFloat(valor);

                await prisma.conta.update({
                    where: { n_Idconta: contaFrom.n_Idconta },
                    data: { n_saldo: saldoactualizadoFrom }
                });

                const trasacaoFrom = await prisma.trasacao.create({
                    data: {
                        t_contadestino: ibancontadestino,
                        n_contaorigem: contaFrom.n_Idconta,
                        t_descricao: descricao,
                        t_datatrasacao: formatDate(new Date()),
                        n_debito: valor,
                        n_saldoactual: saldoactualizadoFrom
                    }
                })


                res.status(200).json({
                    message: "Trasacao efectuada com sucesso",
                    saldoactualizado: saldoactualizadoFrom
                });
                return;
            }
            else {
                res.status(400).json({message:"erro ao realizar a trasação conta Origem não encontrada"})
            }

        }
        catch (erro) {
            res.status(400).json({message:"Erro na solicitação tente mais tarde" + erro})
        }


    }
    public levantamento = async (req: Request, res: Response): Promise<void> => {
        const valor: number = parseInt(req.body.valor);
        const emaildestino = req.body.emaildestino;
        const idconta = req.body.idconta
        const pin = req.body.pin;
        try {

            const conta = await prisma.conta.findFirst({
                where: {
                    n_Idconta: parseInt(idconta)
                },
                select: {
                    n_saldo: true,
                    n_Idconta: true
                }
            })

            if ((conta?.n_saldo || 0) < valor) {
                res.json(200).json({message: "Saldo insuficiente" })
                return;
            }
            const saldoactualizado: number = (conta?.n_saldo || 0) - valor;

            const referencia = codigoreferencia().toString();
            await prisma.conta.update({
                where: {
                    n_Idconta: conta?.n_Idconta
                },
                data: {
                    n_saldo: saldoactualizado
                }
            })


            const trasacao = await prisma.trasacao.create({
                data: {
                    t_datatrasacao: formatDate(new Date()),
                    n_debito: valor,
                    t_descricao: 'Levantamento Sem Cartão',
                    n_saldoactual: saldoactualizado,
                    n_contaorigem: conta?.n_Idconta || 0
                }
            })
            const Levantamento = await prisma.levantamentoSemCartao.create({
                data: {
                    n_Idconta: conta?.n_Idconta || 0,
                    n_valor: valor,
                    t_referencia: referencia,
                    t_estado: 'pendente',
                    t_pin: pin.toString()
                }
            })
            sendlevantamento(referencia, emaildestino);
            res.status(200).json(
                {
                    message: "Levantamento efectuado com sucesso",
                    saldoactualizado: saldoactualizado
                }
            )

        } catch (err) {
            res.json(400).json({ status: false, message: "Erro ao efectuar o levantamento" })
        }
    }

    public getTrasacao = async (req: Request, res: Response): Promise<void> => {
        const idconta = parseInt(req.params.idconta);
        const trasacao = await prisma.trasacao.findMany({
            where: {
                n_contaorigem: idconta
            },
            select: {
                t_datatrasacao: true,
                t_descricao: true,
                n_credito: true,
                n_debito: true,
                t_contadestino: true,
                n_saldoactual: true
            }
        })

        if (trasacao.length > 0) {
            res.status(200).json({ trasacoes: trasacao });
            return;
        } else {
            res.status(400).json({ message: 'Nao foi possivel encontrar a trasacao' });
            return;
        }
    }
    public getextrato = async (req: Request, res: Response): Promise<void> => {
        const idconta = parseInt(req.params.idconta);
        const conta = await prisma.conta.findFirst({
            where: {
                n_Idconta: idconta
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
                n_contaorigem: idconta
            },
            select: {
                t_datatrasacao: true,
                t_descricao: true,
                n_credito: true,
                n_debito: true,
                n_saldoactual: true,
            }
        })
        if (trasacao.length <= 0) {
            res.json({ message: "Nao foi possivel encontrar a trasacao" });
            return;
        }

        const broswer = await puppeteer.launch();
        const page = await broswer.newPage();

        // caminho onde esta o formato do pdf a ser gerado
        const filePath1 = path.join(__dirname, "../", "Views", "extrato.ejs");
        // caminho onde esta  do pdf  gerado
        const filePath2 = path.join(__dirname, "../", "extrato.pdf");

        // geração do pdf
        await ejs.renderFile(filePath1, {
            trasacoes: trasacao,
            nomeclient: conta?.cliente.t_nomeclient,
            iban: conta?.t_Iban,
            numeroconta: conta?.t_numeroconta,
        },
            async (err, html) => {
                // Gera o PDF
                await page.setContent(html, { waitUntil: 'networkidle0' });
                await page.pdf({
                    printBackground: true,

                    format: "A4",
                    margin: {
                        top: "5px",
                        bottom: "40px",
                        left: "20px",
                        right: "20px"

                    },
                    path: 'extrato.pdf'
                });
                await broswer.close();
                res.download(filePath2, 'extrato.pdf');
            })

    }

}