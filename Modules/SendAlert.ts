import 'dotenv/config'
import { sendEmail } from '../Modules/SendEmail'




  export const sendalert=async (email: string, navegador: string , dispositivo:string,urlSim:string)=> {
    try{
          await sendEmail(email, "Alerta De Segurança BPA NET", 3, {navegador: navegador, dispositivo: dispositivo, urlSim:urlSim})
          }
catch(erro){
  throw erro;
}

}