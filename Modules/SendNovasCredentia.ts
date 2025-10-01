import dotenv from "dotenv";
dotenv.config();
import { sendEmail } from '../Modules/SendEmail'

   export const SendNovasCredentia =  async (
    email: string | undefined,
    numeroAdessao: string | null,
   ) => {
  try{

    await sendEmail(email!, "Novas Credenciais de Acesso BPA NET", 8, {numeroAdessao: numeroAdessao})
  }catch(err){
    throw new Error(typeof err === 'string' ? err : 'An unknown error occurred')
  }
}

