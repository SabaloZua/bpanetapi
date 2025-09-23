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


	function formato(number: string): string {
    const cleaned = (`${number}`).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{1})$/);

    if (match) {
        return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
    }

    return number;
	}


  export const sendlevantamento=async (referencia:string,email:string)=> {
   try{
 await  transporter.sendMail({  
  from: process.env.EMAIL,
  to: email,
  subject: 'Levantamento sem cartão BPA ',
  text: ``,
  html: `<div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; border-radius: 10px; text-align: center;">
  <h1 style="color: #1674E3;">Levantamento sem cartão</h1>
  <p style="margin-bottom: 20px;">Abaixo estão os dados do levantamento</p>
  <p style="margin-bottom: 20px;">Referência do levantamento</p>
  <p style="color: black; font-size: 28px; letter-spacing: 10px; font-weight: 600;">${formato(referencia)}</p>
  
</div>`,
      
 })
}catch(erro){
 throw erro;
}

}
