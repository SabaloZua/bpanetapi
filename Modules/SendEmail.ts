import 'dotenv/config'
import axios from 'axios';
const apiKey = process.env.PROVEDOR_API_KEY || '';
const urlemail = process.env.APIEMAIL || '';

export const sendEmail =async (email:string,assunto:string,templateId:number,params:{})=>{
try{

      const emaildata={
        
            sender:{
              name:'Banco de Poupança Angolano',
              email:"bancobpa42@gmail.com"
            },

            to:[
              {
              email:email
              }
            ],
              subject: assunto,
              templateId: templateId,
              params: params
            
          };
          
    const response = await axios.post(urlemail, emaildata, {
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': apiKey
                    }
                });
    console.log('Email enviado com sucesso:', response.data);
}catch(err){
  throw new Error(typeof err === 'string' ? err : 'An unknown error occurred'+err);
}

}
