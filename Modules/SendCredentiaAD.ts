import dotenv from "dotenv";
dotenv.config();
import { sendEmail } from '../Modules/SendEmail'

   export const sendcrendetias =  async (
    email: string | undefined,
    numeroAdessao: string | null,
    accessCode: string | null
   ) => {
  try{
    await sendEmail(email!, "Credenciais de Acesso BPA NET", 7, {numeroAdessao: numeroAdessao, accessCode: accessCode})
  
  }catch(err){
    throw new Error(typeof err === 'string' ? err : 'An unknown error occurred')
  }
}

