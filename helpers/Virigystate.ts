import { Request, Response, NextFunction } from "express";

export  const verifystate=(req: Request, res: Response, next: NextFunction) => {
    const estado=req.body.estado;
    if(estado==='pendente'){
        
            res.status(400).json({status:false,message:"Estado da Conta Pendente Está a tentar usar esta conta é um dispositivo desconhecido"});
            return;
        
    }
    next();
}