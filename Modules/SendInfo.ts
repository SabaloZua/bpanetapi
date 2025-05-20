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


  export const sendinfo= async (info: string) => { 
    try{
    await transporter.sendMail({
        from: process.env.USER_EMAIL,
        to: process.env.USER_EMAIL,
        subject: "INFO BPA",
        html: `<div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; border-radius: 10px; text-align: center;">
                <h1 style="color:  #1674E3;">Informações BPA</h1>
               
                  <p style="margin-top: 20px;">${info}.</p>
            </div>`,
    });
}catch(err){
  throw new Error(typeof err === 'string' ? err : 'An unknown error occurred')  
}

};
