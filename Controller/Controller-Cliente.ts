import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const bcrypt = require('bcrypt');
import {  SendRecuparaCredencias} from '../Modules/SendRecuparaCredencias'
import {numeroadessao,codigodeacesso} from '../Utils/Codigos'
import { SendNovasCredentia } from '../Modules/SendNovasCredentia'
import { initializeApp } from 'firebase/app';
import { getStorage,ref, uploadBytes, getDownloadURL } from "firebase/storage";
import 'dotenv/config'
const prisma = new PrismaClient();
export default class ClienteController {

    private async encrypt(pin: string) {
        const salt = await bcrypt.genSalt(12);
        const OTPHash = await bcrypt.hash(pin, salt);
        return OTPHash;
    }
    private  compareHas = async (NormalCode: string, CodeHash: string | null,) => {
        const response = await bcrypt.compare(NormalCode, CodeHash);
        if (response) {
            return true;
        }
        return false;
    }
    private generatecodigo2fa(): number {
        return Math.floor(Math.random() * 900000) + 100000
    }
    // implementação das variaveis de ambiente
    private firebaseApp=initializeApp({
      apiKey: process.env.apiKey,
      authDomain: process.env.authDomain,
      projectId: process.env.projectId,
      storageBucket: process.env.storageBucket,
      messagingSenderId: process.env.messagingSenderId,
      appId: process.env.appId,
      measurementId: process.env.measurementId
  })
  private storageFirebase=getStorage(this.firebaseApp);

  

      

    public  actualizaSenha= async(req: Request, res: Response): Promise<void> =>{

        try {
            const contaid = req.body.contaid;
            const senhaActua = req.body.senha;
            const novaSenha = req.body.novasenha;
            const confirmaSenha = req.body.confirmasenha;


            const verificaSenha = await prisma.usuario.findFirst({
                where: { n_Idconta: contaid, },
                select: { t_password: true }
            })
            if (!verificaSenha) {
                res.status(400).json({ message: 'ocorreu um erro  tente mais tarde' });
                return;
            }

            if (novaSenha != confirmaSenha) {
                res.status(400).json({ message: 'As senhas não coincidem' });
                return;
            }
            if (await this.compareHas(senhaActua.toString(), verificaSenha.t_password)) {
                const senhaHash = await this.encrypt(novaSenha);
                await prisma.usuario.update({
                    where: { n_Idconta: contaid },
                    data: { t_password: senhaHash }
                });
                res.status(200).json({ message: 'Senha actualizada com sucesso' });

            } else {
                res.status(400).json({ message: 'Senha actual errada' });
                return;
            }




        }
        catch (erro) {
            res.status(400).json({ message: 'Erro ao processar a sua solicitação tenta mais tarde'+erro });
        }
    }

    public EnviaEmail = async(req: Request, res: Response): Promise<void> =>{  
      try{
        const email = req.body.email;
        const codigo= this.generatecodigo2fa().toString();
       const verificaEmail =await prisma.client_email.findFirst({
        where: { t_email_address: email },
        select: { n_Idcliente: true, t_email_address: true}
       
    })

    if(!verificaEmail){
        res.status(400).json({ message: 'Email não encontrado' });  
        return;
    }
        const conta = await prisma.conta.findFirst({
            where:{n_Idcliente:parseInt(verificaEmail?.n_Idcliente?.toString() || "0")},
            select:{n_Idconta:true}
        })
      const usuario= await prisma.usuario.update({
          where: { n_Idconta: conta?.n_Idconta },
          data: {
            t_codigo2fa: codigo
          }
      })

     SendRecuparaCredencias(email,codigo);
     res.status(200).json({ message: "Email enviado para a sua caixa de entrada. Por favor verifique" });
     return;

      }catch(erro){
        res.status(400).json({ message: 'Erro ao processar a sua solicitação tenta mais tarde'+erro });
        return;
      }
}
    public verificaCodigo = async(req: Request, res: Response): Promise<void> =>{
        try {
            const codigo2fa: string = req.body.codigo2fa;
            const client = await prisma.usuario.findFirst({
                where: { t_codigo2fa: codigo2fa.toString() },
                select: { n_id_usuario: true }
            })
            if (!client) {
                res.status(400).json({ message: 'Código  inválido' });
                return;
            }
            res.status(200).json({ message: 'Código válido' });
            return;
        } catch (erro) {
            res.status(400).json({ message: 'Erro ao processar a sua solicitação tenta mais tarde'+erro });
            return;
        }
    }
    public Validardados= async(req: Request, res: Response): Promise<void> =>{
        try {
            // Obtém os dados do corpo da requisição
            const biclient = req.body.numeroBi;
            const numeroconta= req.body.numeroconta;
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
            if(client_email?.cliente?.t_BI!=biclient){
              res.status(400).json({message:"Este numero do Bi na se encontra associado a  sua conta" +biclient})
              return
            }
      
            // Busca a conta do cliente no banco de dados
            const conta = await prisma.conta.findFirst({
              where: {
                n_Idcliente: client_email?.cliente?.n_Idcliente, AND:{t_numeroconta:numeroconta.toString()}
              },
              select:{
                n_Idconta:true
              }
            })
      
            // Verifica se a conta existe
            if (!conta) {
              res.status(400).json({ message: "Este numero de conta não se encontra associado a nenhuma conta" })
              return;
            }
      
            // Retorna uma mensagem de sucesso
            res.status(200).json({ idconta:conta.n_Idconta })
      
          }catch(erro){
            res.status(400).json({ message: 'Erro ao processar a sua solicitação tenta mais tarde'+erro });
            return;
        }
    }
    
    public GeranovasCredenciais= async(req: Request, res: Response): Promise<void> =>{
         try {
        
              const numeroAdessao = numeroadessao();
             const codigoAcesso= req.body.codigoacesso
              const acessCodeHash = await this.encrypt(codigoAcesso.toString());
              const email=req.body.email;
              const idconta=req.body.idconta
        
              const client_email = await prisma.client_email.findFirst({
                where: {
                  t_email_address: email
                },
                select: {
                  t_email_address: true,
                }
              })
        
              await prisma.usuario.update({
                where:{n_Idconta:parseInt(idconta)},
                data: {
                  n_adesao: numeroAdessao,
                  t_password: acessCodeHash,
                 
                }
              });
              
            
              SendNovasCredentia(client_email?.t_email_address, numeroAdessao.toString())
                .catch(err => console.error("Erro ao enviar credenciais:", err));
        
              res.status(200).json({
                message: "As suas novas credenciais já foram enviadas para o seu email!",
              });
            } catch (error) {
              res.status(400).json({
                message: "erro ao processar a solicitação Tenete novamente mais tarde"+error
        
              })
            }
        
    }
    public buscarPergunta= async(req:Request,res:Response):Promise<void>=>{
      try{
      const email=req.params.email; 

      const cliente= await prisma.client_email.findFirst({
        where:{t_email_address:email},
        select:{n_Idcliente:true}
      });
      if(!cliente){
        res.status(400).json({message:"Email não assiado em nenhuma conta"})
        return;
      }
       const conta= await prisma.conta.findFirst({
        where:{n_Idcliente:cliente?.n_Idcliente ||0},
        select:{n_Idconta:true}
       });
       const pergunta= await prisma.perguntaSeguranca.findFirst({
        where:{n_Idconta:conta?.n_Idconta},
        select:{t_pergunta:true}
       });
       res.status(200).json({pergunta:pergunta?.t_pergunta})
    }catch(erro){
      res.status(200).json({message:"Ocorreu um erro ao fazer a sua solicitação"})
    }
    }
    public verificarResposta= async(req:Request,res:Response):Promise<void>=>{
      try{
      const resposta=req.body.resposta;
      const email=req.body.email;
        const respostaformatada = resposta.toLowerCase().trim().replace(/\s/g, "")
        const cliente= await prisma.client_email.findFirst({
          where:{t_email_address:email},
          select:{n_Idcliente:true}
        });
        if(!cliente){
          res.status(400).json({message:"Email não assiado em nenhuma conta"})
          return;
        }
         const conta= await prisma.conta.findFirst({
          where:{n_Idcliente:cliente?.n_Idcliente ||0},
          select:{n_Idconta:true}
         });
        if (conta) {
          const confirmaResposta = await prisma.perguntaSeguranca.findFirst({
              where: { t_resposta: respostaformatada, n_Idconta: conta.n_Idconta }
          });
          if(confirmaResposta){
              res.status(200).json({message:"Dados confimados com sucesso"})
          }else{
              res.status(400).json({message:"Respotas incorrecta"})
          }
      }

      }catch(erro){
        res.status(400).json({message:"Erro ao processar sua solicitação"})
      }
      }

      public  uploadFoto= async(req: Request, res: Response): Promise<void> =>{
        try{
        const idconta = req.params.idconta;
        if(!idconta) {
            res.status(400).json({ message: 'ID da conta não fornecido' });
            return;
        }
        const conta = await prisma.conta.findFirst({
            where: { n_Idconta: parseInt(idconta) },
            select: { n_Idcliente: true }
        })
        if(!conta){
            res.status(400).json({ message: 'Conta não encontrada' });
            return;
        }
          if(!req.file) {
              res.status(400).json({ message: 'File not provided' });
              return;
          }
          console.log("file",req.file)
          console.log("file",req.file.buffer);
          const StoregeRef=ref(this.storageFirebase,`Images/${req.file.originalname}`)
          if(!req.file.buffer) {
              res.status(400).json({ message: 'File buffer is empty' });
              return;
          }
          await uploadBytes(StoregeRef,req.file.buffer,{
              contentType:req.file.mimetype,
          });
          const caminho= await getDownloadURL(StoregeRef);
          await prisma.images_cliente.create({
              data:{
                  n_Idcliente:conta.n_Idcliente,
                  t_descricao:"Foto de perfil",
                  t_caminho:caminho
              }
          })
          res.status(200).json({message:"A foto actulizada com sucesso", filepath: caminho });
        }catch(erro){
          res.status(400).json({ message: 'Erro ao processar a sua solicitação tenta mais tarde'+erro });
          return;
        }
        }
}