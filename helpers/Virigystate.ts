import { Request, Response, NextFunction } from "express";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export  const verifystate= async (req: Request, res: Response, next: NextFunction) => {
    try{
    const idconta=req.body.idconta;
    const estado= await prisma.conta.findFirst({
        where:{
            n_Idconta:idconta
        },
        select:{
            t_estado:true
        }
    })

    if(estado?.t_estado==='Bloqueada'){ 
            res.status(400).json({status:false,message:"A sua conta está bloqueada, dirija-se a um balcão de atendimento com o seu BI para desbloqueio"});
            return;
    }
    next();
} catch (erro) {
    res.status(400).json({message:erro})
}
}