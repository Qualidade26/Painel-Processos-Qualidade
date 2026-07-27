/* =====================================================
   PAINEL SGQ LABOR
   UTILS.JS
   Funções auxiliares gerais
   ===================================================== */



// =====================================================
// VARIÁVEIS GLOBAIS
// =====================================================

let dados = {};

let graficoAtual = null;



// =====================================================
// CARREGAMENTO DO JSON
// =====================================================


async function carregarDados(){

    try{

        const resposta = await fetch("data.json");

        dados = await resposta.json();

        console.log(
            "JSON carregado com sucesso",
            dados
        );


        abrirAba("inicio");


    }catch(erro){

        console.error(
            "Erro ao carregar JSON:",
            erro
        );

    }

}




// =====================================================
// FORMATAÇÃO DE NÚMEROS
// =====================================================


function numero(valor){

    if(
        valor === undefined ||
        valor === null ||
        valor === ""
    ){

        return "0";

    }


    return Number(valor)
        .toLocaleString("pt-BR");

}




// =====================================================
// FORMATAÇÃO DE MOEDA
// =====================================================


function moeda(valor){

    if(
        valor === undefined ||
        valor === null
    ){

        valor = 0;

    }


    return Number(valor)
        .toLocaleString(
            "pt-BR",
            {
                style:"currency",
                currency:"BRL"
            }
        );

}




// =====================================================
// CRIAÇÃO DOS CARDS KPI
// =====================================================


function card(
    icone,
    titulo,
    valor
){


return `

<div class="card">

    <div style="font-size:40px">
        ${icone}
    </div>


    <h3>
        ${titulo}
    </h3>


    <div class="valor">
        ${valor}
    </div>


</div>

`;

}





// =====================================================
// DESTRUIR GRÁFICO ANTERIOR
// =====================================================


function destruirGrafico(){

    if(graficoAtual){

        graficoAtual.destroy();

        graficoAtual=null;

    }

}




// =====================================================
// CRIAR GRÁFICO PADRÃO
// =====================================================


function criarGrafico(
    id,
    tipo,
    labels,
    valores,
    titulo
){


    destruirGrafico();


    const canvas =
        document.getElementById(id);



    if(!canvas){

        console.warn(
            "Canvas não encontrado:",
            id
        );

        return;

    }



    graficoAtual =
    new Chart(
        canvas,
        {

        type:tipo,


        data:{

            labels:labels,


            datasets:[{

                label:titulo,

                data:valores,

                borderWidth:2

            }]

        },


        options:{


            responsive:true,


            maintainAspectRatio:false,


            plugins:{


                legend:{

                    display:true

                },


                title:{

                    display:true,

                    text:
                    titulo,

                    font:{

                        size:22,

                        weight:"bold"

                    }

                }


            }

        }


    });


}




// =====================================================
// LIMPAR CONTEÚDO
// =====================================================


function limparConteudo(){

    const area =
    document.getElementById(
        "conteudo"
    );


    if(area){

        area.innerHTML="";

    }

}





// =====================================================
// AUTO ATUALIZAÇÃO
// =====================================================


function atualizarPainel(){

    carregarDados();

}



// Atualiza a cada 2 minutos

setInterval(

    atualizarPainel,

    120000

);




// =====================================================
// INICIALIZAÇÃO
// =====================================================


window.onload=function(){

    carregarDados();

};
