import { Request,Response } from "express";
import {sendinfo} from "../Modules/SendInfo"
import VerificaDepositos from "../Modules/Depositos";
import VerificaLevantamentos from "../Modules/Lenvantamentos";


export default class ControllerAjendamentos {



    public async Agendamentos(req: Request, res: Response) {

        try{
            
            await VerificaDepositos();
            await VerificaLevantamentos();
            res.status(200).json({message:"Ajendamentos processados com sucesso!"});


        }catch(erro){
            const errorMessage = erro instanceof Error ? erro.message : String(erro);
            res.status(400).json({message:"Erro ao processar ajendamentos: " + errorMessage});
            await sendinfo(errorMessage);
        }
    }


}