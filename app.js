const request = require('request-promise');

function onlyTable(data){
    return data.split('<table class="tabelaListagemDados"')[1].split('</table>')[0]
}

function onlyTr(data){
    return data.split('<tr');
}

function getTitles(array){
    let res = [];

    for(let i of array){
        if(i && i.includes('<th scope="col">')){
            let a = i.trim().split('<th scope="col">');
            for(let e of a){
                if(e.indexOf('>') !== 0){
                    e = e.split('</th>')[0]

                    e ? res.push(e) : false;
                }
            }
        }
    }

    return res;
}

function lastCheck(data){
    return data.split('Última Verificação:')[1].split('<br/>')[0].trim();
}

function getData(array){
    let res = {};

    for(let i of array){
        if(i && i.includes('<td>')){
            let a = i.split('<td>');
    
            a = a.filter(e => !e.includes('class') && e);

            let state;

            a.forEach((element, index) => {
                if(index === 0){
                    state = element.split('</td>').join('');
                    res[state] = [];
                }else{
                    if(element.includes('img')){
                        if(element.includes('img') && element.includes('/bola_vermelho')) res[state].push('vermelha');
                        if(element.includes('img') && element.includes('/bola_verde')) res[state].push('verde');
                        if(element.includes('img') && element.includes('/bola_amarela')) res[state].push('amarela');
                    }else{
                        res[state].push("sem cor")
                    }
                }
            })
        }
    }

    return res;
}


async function invoke(){
    try{
        let data = await request.get('https://www.nfe.fazenda.gov.br/portal/disponibilidade.aspx?versao=0.00&tipoConteudo=P2c98tUpxrI=', {
            followRedirect: false,
            headers: {
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7,es;q=0.6",
                "Cookie": "AspxAutoDetectCookieSupport=1; ASP.NET_SessionId=ez1qg22qi2o3uuxtpm2jicmg",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36",
            }
        });

        let only = onlyTable(data);
        let tr = onlyTr(only);
        let titles = getTitles(tr);
        let states = getData(tr);
        let lastC = lastCheck(data);

        // return only


        return {
            titles,
            states,
            lastCheck: lastC
        }
    }catch(e){
        console.log('error invoke', e.message)
    }
}

invoke().then(e => console.log(e))