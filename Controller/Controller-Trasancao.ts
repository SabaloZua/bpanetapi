import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import pdf from 'html-pdf';
import path, { format } from 'path';
import ejs from 'ejs'
import puppeteer from "puppeteer";
import { SendLevantamento } from '../Modules/SendCodeLenvatamento';
import {formatDate} from '../Utils/Datas';
import { CodigoReferencia } from '../Utils/Codigos';
const prisma = new PrismaClient();


export default class Trasacao {


        // estou a fazer 
        private comprovativo=(operacao:string, iban:string,montate:string,id:number,destinario?:string)=>{

        }

    public tranferencia = async (req: Request, res: Response): Promise<void> => {
        const { n_idcliente, n_contaestino, descricao, valor } = req.body;
        const conta = await prisma.conta.findFirst({
            where: {
               n_Idcliente:parseInt(n_idcliente)
            },
            select: {
                n_saldo: true,
                n_Idconta: true,
            }
        })
        if (conta) {
            if (conta.n_saldo < valor) {
                res.status(400).send('Saldo insuficiente');
                return;
            }
            try {
                const saldoactualizao = conta?.n_saldo - parseFloat(valor);
                await prisma.conta.update({
                    where: { n_Idconta: conta.n_Idconta },
                    data: { n_saldo: saldoactualizao }
                });
                await prisma.trasacao.create({
                    data: {
                        n_contadestino: n_contaestino,
                        n_contaorigem: conta.n_Idconta,
                        t_descricao: descricao,
                        t_datatrasacao: formatDate(new Date()),
                        n_valor: parseFloat(valor),
                        n_saldoactual: saldoactualizao
                    }
                })

                res.status(200).send('Trasacao efectuada com sucesso');
                return;
            } catch (erro) {
                res.status(400).send('Erro ao efectuar a trasacao'+erro);
                return;
            }
        }else{
            res.status(400).send('Erro ao efectuar a trasacao conta nao encontrada');
            return
        }
    }
    public levantamento =async(req:Request,res:Response):Promise<void>=>{
        const valor:number =parseInt(req.body.valor);
        const emaildestino=req.body.emaildestino;
        const idcliente=req.body.idcliente
        const pin=req.body.pin;
        try{
         
           const conta= await prisma.conta.findFirst({
                where:{
                    n_Idcliente:idcliente 
                }, 
                      select:{
                    n_saldo:true,
                    n_Idconta:true
                }
           })

            if((conta?.n_saldo || 0) < valor){
                res.json(200).json({status:false,message:"Saldo insuficiente"})
                return;
            }
            const saldoactualizao:number=(conta?.n_saldo||0)  - valor;
            const referencia=CodigoReferencia().toString();
            await prisma.conta.update({
                where:{
                    n_Idconta:conta?.n_Idconta
                },
                data:{
                    n_saldo:saldoactualizao
                }
            }) 


            const trasacao =await prisma.trasacao.create({
                data:{
                t_datatrasacao:formatDate(new Date()),
                 n_valor:valor,
                 t_descricao:'Levantamento Sem Cartão',
                 n_saldoactual:saldoactualizao,
                 n_contaorigem:conta?.n_Idconta || 0
                }
            })
            const Levantamento =await prisma.levantamentoSemCartao.create({
                data:{
                    n_Idconta:conta?.n_Idconta || 0,
                    n_valor:valor,
                    t_referencia:referencia,
                    t_estado:'pendente',
                    t_pin:pin.toString()
                }
            })
            SendLevantamento(referencia,emaildestino);
            res.status(200).json(
                {
                status:true,
                 message:"Levantamento efectuado com sucesso",
                saldoactualizao:saldoactualizao
                }
            )

        }catch(err){
                res.json(400).json({status:false,message:"Erro ao efectuar o levantamento"})
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
                n_valor: true,
                n_contadestino: true,
                n_saldoactual: true
            }
        })

        if (trasacao.length > 0) {
            res.status(200).json({ data: trasacao });
            return;
        } else {
            res.status(400).json({ message: 'Nao foi possivel encontrar a trasacao' });
            return;
        }
    }
    public getextrato =async (req: Request, res: Response): Promise<void> => {
       const idconta = parseInt(req.params.idconta);
       const conta = await prisma.conta.findFirst({
        where:{
            n_Idconta:idconta
        },
        select:{
            t_Iban:true,
            t_numeroconta:true,
            cliente:{
                select:{
                   t_nomeclient:true
                }
            }
        }
       });
     const  trasacao=  await prisma.trasacao.findMany({
            where: {
                n_contaorigem: idconta
            },
            select: {
                t_datatrasacao: true,
                t_descricao: true,
                n_valor: true,
                n_saldoactual: true,
            }
       }) 
       if(trasacao.length <=0){
        res.json({message:"Nao foi possivel encontrar a trasacao"});
        return;
       }
        
        const broswer = await puppeteer.launch();
        const page = await broswer.newPage();

       // await page.goto('http://localhost:5000/trasacao/extrato', { waitUntil: 'networkidle0' });
       const filePath1 = path.join(__dirname, "../", "Views", "extrato.ejs");
       const filePath2 = path.join(__dirname, "../", "extrato.pdf");
      await ejs.renderFile(filePath1,{
        trasacoes:trasacao,
         nomeclient:conta?.cliente.t_nomeclient,
        iban:conta?.t_Iban,
        numeroconta:conta?.t_numeroconta,
    }, 
    async (err, html) => {
        // Gera o PDF
        await page.setContent(html, { waitUntil: 'networkidle0' });
         await page.pdf({ 
            printBackground: true,

            format: "A4",
            margin:{
                top:"5px",
                bottom:"40px",
                left:"20px",
                right:"20px"
                
            },           
            path: 'extrato.pdf'
        });
       await broswer.close();
       res.download(filePath2, 'extrato.pdf');
    })
       
    }
    
}