import 'dotenv/config'
import nodemailer from 'nodemailer'

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: "gmail",
    port:465,
    secure:true,
    pool:true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSEKEYEMAIL,
    },
  })




  export const sendalert=async (email: string, navegador: string , dispositivo:string)=> {
   
 await  transporter.sendMail({  
  from: process.env.EMAIL,
  to: email,
  subject: 'Alerta De Segurança',
  text: ``,
  html: `<div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; border-radius: 10px; text-align: center;">
            <h1 style="color: #1674E3;">Alerta Dipositivo Desconhecio</h1>
            <p style="margin-bottom: 20px;">Um dispositivo ${dispositivo}  em  um navegador ${navegador} acabou de inciar sessão em sua conta</p>
            
        </div>`,
      
 })
}
