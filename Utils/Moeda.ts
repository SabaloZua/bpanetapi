export const formatarmoeda=(valornaoformatao:number):string =>{
    const valorformatao=valornaoformatao.toLocaleString('pt-AO',{
        style:"currency",
        currency:"AKZ"
    });

    return valorformatao.replace('AKZ',"");
}