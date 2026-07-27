/* =====================================================
   PAINEL SGQ LABOR
   SCRIPT.JS
   Controle geral do painel
   ===================================================== */



// =====================================================
// CONTROLE DAS ABAS
// =====================================================


function abrirAba(aba){


    const conteudo =
    document.getElementById(
        "conteudo"
    );



    if(!conteudo){

        return;

    }



    limparConteudo();



    switch(aba){



        // =============================================
        // INÍCIO
        // =============================================


        case "inicio":

            renderInicio();

        break;



        // =============================================
        // INSPEÇÃO IMPORTAÇÃO
        // =============================================


        case "importacao":

            if(
                typeof renderImportacao === "function"
            ){

                renderImportacao();

            }

        break;



        // =============================================
        // ESFIG
        // =============================================


        case "esfig":

            if(
                typeof renderEsfig === "function"
            ){

                renderEsfig();

            }

        break;




        // =============================================
        // DESCARTE
        // =============================================


        case "descarte":

            if(
                typeof renderDescarte === "function"
            ){

                renderDescarte();

            }

        break;




        // =============================================
        // RETRABALHO
        // =============================================


        case "retrabalho":

            if(
                typeof renderRetrabalho === "function"
            ){

                renderRetrabalho();

            }

        break;




        // =============================================
        // AMOSTRAS
        // =============================================


        case "amostras":

            if(
                typeof renderAmostras === "function"
            ){

                renderAmostras();

            }

        break;




        // =============================================
        // FORNECEDORES
        // =============================================


        case "fornecedores":

            if(
                typeof renderFornecedores === "function"
            ){

                renderFornecedores();

            }

        break;



        default:

            renderInicio();

        break;


    }


}




// =====================================================
// PÁGINA INICIAL
// =====================================================


function renderInicio(){


const area =
document.getElementById(
    "conteudo"
);



area.innerHTML = `


<div class="page-title">

📊 PAINEL DE GESTÃO DA QUALIDADE

</div>



<section class="cards">


${card(
"📦",
"Inspeção Importação",
numero(
dados.importacao?.processosAno
)
)}



${card(
"⚙️",
"Aferição ESFIG",
numero(
dados.esfig?.totalHoras
)
)}




${card(
"🗑️",
"Total Descarte",
moeda(
dados.descarte?.total
)
)}




${card(
"🔧",
"Retrabalho",
numero(
dados.retrabalho?.length
)
)}




${card(
"📋",
"Amostras",
numero(
dados.amostras?.total
)
)}



</section>




<div class="grafico-box">


<h2>

Indicadores SGQ

</h2>



<p>

Selecione uma opção no menu lateral
para visualizar os detalhes.

</p>



</div>


`;



}





// =====================================================
// MENU ATIVO
// =====================================================


function marcarMenu(botao){


const botoes =
document.querySelectorAll(
".menu button"
);



botoes.forEach(
    item =>
    item.classList.remove(
        "ativo"
    )
);



if(botao){

    botao.classList.add(
        "ativo"
    );

}


}





// =====================================================
// BOTÃO RECOLHER MENU
// =====================================================


function alternarMenu(){


const menu =
document.querySelector(
".menu"
);



if(menu){

    menu.classList.toggle(
        "menu-fechado"
    );

}


}





// =====================================================
// INICIALIZAÇÃO
// =====================================================


document.addEventListener(
"DOMContentLoaded",
()=>{


    console.log(
        "Painel SGQ iniciado"
    );


});
