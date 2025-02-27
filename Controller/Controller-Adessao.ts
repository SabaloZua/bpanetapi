import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const bcrypt = require('bcrypt');
import crypto from 'crypto'
import { SendeEmailVerfy } from '../Modules/SendEmailVerify';
import { sendCrendetias } from '../Modules/SendCredentiaAD'
import {NumeroAdessao,CodigodeAcesso} from '../Utils/Codigos'

const prisma = new PrismaClient();

export default class ControllerAdessao {
  private async encrypt(pin: string) {
    const salt = await bcrypt.genSalt(12);
    const OTPHash = await bcrypt.hash(pin, salt);
    return OTPHash;
  }

  public SendvalideEmail = async (req: Request, res: Response): Promise<void> => {
    const email = req.body.email;
    const result = await prisma.client_email.findFirst({
      where: { t_email_address: email},
      select: { n_Idcliente: true ,t_verified:true}
    })
    if (result) {

      if(result.t_verified==true){
        res.status(400).json({ message: "Este email ja foi verificado "})
        return;
      }

      try {
        const token = crypto.randomBytes(32).toString('hex');
        const url = `http://localhost:5000/adesao/validatEmail/${email}/${token}`
        await prisma.client_email.update({
          where: {
            t_email_address: email
          },
          data: {
            t_token: token,
          }
        })
        SendeEmailVerfy(email, url)
          .catch(err => console.error("Erro ao enviar código 2FA:", err));
        res.status(201).json({ message: 'Email de Verificação enviado verifique a sua caixa de entrada' })

      } catch (erro) {
        res.status(400).json({ message: erro })
      }
    } else {
      res.status(400).json({ message: "Este email não de encontra associado a nenhuma conta" })
    }

  }

  // Função para encontrar contas associadas a um cliente
  public findAccounts = async (req: Request, res: Response): Promise<void> => {
    try {
      // Obtém os dados do corpo da requisição
      const biclient = req.body.bi;
      const numeroconta= req.body.conta;
      const email = req.body.email;

      // Busca o email do cliente no banco de dados
      const client_email=await prisma.client_email.findFirst({
        where:{
          t_email_address:email,
        },
        select:{
          cliente:{
            select:{
              t_BI:true,
              n_Idcliente:true
            }
          }
        }
      })

      // Verifica se o número do BI está associado ao cliente que por sua vez está associado a uma conta
      if(client_email?.cliente?.n_Idcliente!=biclient){
        res.status(400).json({message:"Este numero do Bi na se encontra associado a  sua conta"})
        return
      }

      // Busca a conta do cliente no banco de dados
      const conta = await prisma.conta.findFirst({
        where: {
          n_Idcliente: client_email?.cliente?.n_Idcliente, AND:{t_numeroconta:numeroconta.toString()}
        }
      })

      // Verifica se a conta existe
      if (!conta) {
        res.status(400).json({ message: "Este numero de conta não se encontra associado a nenhuma conta" })
        return;
      }

      // Retorna uma mensagem de sucesso
      res.status(201).json({ message: "Dados validados com sucesso" })

    }
    catch (err) {
      // Retorna uma mensagem de erro em caso de exceção
      res.status(400).json({ message: "Houve um erro ao fazer a adessao do cliente tente mais tarde" })
    }
  }

  public ValideteEmail = async (req: Request, res: Response): Promise<void> => {
    const Usertolken = req.params.tolken;
    const email = req.params.email;

    const result = await prisma.client_email.findFirst({
      where: {
        t_email_address: email, AND:{t_token:Usertolken}
      },
      select: {
        t_verified: true,
      }

    })

    if (!result || result.t_verified == true) {
      res.redirect('http://localhost:3000/token-expired');
      return;
    }

    const updateClienteEmail = await prisma.client_email.update({
      where: {
        t_email_address: email
      },
      data: {
        t_verified: true,
        t_token:""
      }
    })

    res.redirect('http://localhost:3000/adesao-dados')
  }

  public generatecredentias = async (req: Request, res: Response): Promise<void> => {
    try {

      const numeroAdessao = NumeroAdessao();
      const createAccessCode = CodigodeAcesso();
      const acessCodeHash = await this.encrypt(createAccessCode.toString());
      const email=req.body.email;
      const navegador=req.body.navegador;
      const sistemaoperativo=req.body.sistemaoperativo;

      const client_email = await prisma.client_email.findFirst({
        where: {
          t_email_address: email
        },
        select: {
          n_Idcliente: true,
          t_email_address: true
        }
      })

      const client = await prisma.cliente.update({
        where: { n_Idcliente: client_email?.n_Idcliente || 0 },
        data: {
          n_adesao: numeroAdessao,
          t_password: acessCodeHash
        }
      });
      const dispositivo = await prisma.dispositivo.create({
        data: {
          t_Iddispositivo: "202",
          cliente: { connect: { n_Idcliente: client_email?.n_Idcliente || 0 } },
          t_navegador: navegador,
          t_sistemaoperativo: sistemaoperativo
        }
      });
      sendCrendetias(client_email?.t_email_address, numeroAdessao.toString(), createAccessCode.toString())
        .catch(err => console.error("Erro ao enviar credenciais:", err));

      res.status(200).json({
        message: "As suas credenciais já foram enviadas para o seu email!",
      });
    } catch (error) {
      res.status(400).json({
        message: "erro ao processar a solicitação Tenete novamente mais tarde"

      })
    }

  }
}