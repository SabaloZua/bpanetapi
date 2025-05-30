import 'dotenv/config'
import nodemailer from 'nodemailer'

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: "gmail",
    port:465,
    secure:true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSEKEYEMAIL,
    },
  })




  export const sendalert=async (email: string, navegador: string , dispositivo:string,urlSim:string)=> {
    try{
 await  transporter.sendMail({  
  from: process.env.EMAIL,
  to: email,
  subject: 'Alerta De Segurança',
  text: ``,
  html: `  <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; border-radius: 10px; text-align: center;">
    <h1 style="color: #1674E3;">Alerta Dipositivo Desconhecio!</h1>
    <p style="margin-bottom: 20px;">Um dispositivo ${dispositivo}  em  um navegador ${navegador} tentou de iniciar sessão na sua conta</p>
      <p style="margin-bottom: 20px;">Confirme a sua identidade abaixo</p>
      
    <a href=${urlSim} style="display: inline-block; margin-right: 5px; padding: 10px 20px; background-color: #1674E3; color: #ffffff; text-decoration: none; border-radius: 5px; margin-top: 20px;">Sim, sou Eu</a>
      <p style="margin-top: 20px;">Se você não tentou realizar está operação, recomendamos que altere o seu código de acesso</p>
  </div>`,
      
 })

}
catch(erro){
  throw erro;
}

}