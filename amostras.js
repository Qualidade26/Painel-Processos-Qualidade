/* =====================================================
   PAINEL SGQ LABOR

   AMOSTRAS.JS

   Aba:
   📋 AMOSTRAS

   ===================================================== */



function renderAmostras(){



const amostras = dados.amostras || {


    mensal:[],

    top10:[],

    total:0,

    totalSku:0


};






const area =

document.getElementById(
"conteudo"
);








area.innerHTML = `



<div class="page-title">

📋 CONTROLE DE AMOSTRAS

</div>







<section class="cards">





${card(

"📋",

"Total Amostras",

numero(
amostras.total ||
calcularTotalAmostras(amostras.mensal)
)

)}





${card(

"🏷️",

"Total SKU",

numero(
amostras.totalSku ||
amostras.top10.length
)

)}







${card(

"📊",

"Média Mensal",

numero(
calcularMediaMensal(amostras.mensal)
)

)}






${card(

"📅",

"Último Mês",

ultimoMesAmostra(amostras.mensal)

)}







</section>









<div class="grafico-box">


<h2>

Solicitações de Amostra por Mês

</h2>



<canvas id="graficoAmostras"></canvas>



</div>









<div class="grafico-box">


<h2>

Top 10 amostra mais solicitada

</h2>



<canvas id="graficoTopAmostras"></canvas>



</div>









<div class="tabela-box">


<h2>

Detalhamento por SKU

</h2>





<table>


<thead>


<tr>

<th>SKU</th>

<th>Produto</th>

<th>Quantidade</th>

</tr>


</thead>



<tbody>



${

amostras.top10.map(item=>`


<tr>


<td>

${item.sku || ""}

</td>



<td>

${item.nome || item.produto || ""}

</td>



<td>

${numero(
item.quantidade ||
item.qtd ||
0
)}

</td>



</tr>



`).join("")

}



</tbody>


</table>



</div>



`;







// ==========================================
// GRÁFICO MENSAL
// ==========================================


setTimeout(()=>{



criarGrafico(

"graficoAmostras",

"line",

amostras.mensal.map(
m=>m.mes
),

amostras.mensal.map(
m=>

Number(
m.quantidade ||
m.total ||
0
)

),

"Quantidade de Amostras por Mês"

);




// ==========================================
// TOP 10
// ==========================================



destruirGrafico();



const canvas =

document.getElementById(
"graficoTopAmostras"
);




if(!canvas){

return;

}




graficoAtual =

new Chart(

canvas,

{


type:"bar",


data:{



labels:

amostras.top10.map(

item=>

item.sku ||
item.nome

),



datasets:[{


label:

"Solicitações",



data:

amostras.top10.map(

item=>

Number(
item.quantidade ||
item.qtd ||
0
)

),



borderWidth:1



}]



},



options:{



indexAxis:"y",



responsive:true,



maintainAspectRatio:false,



plugins:{



legend:{


display:false


},



title:{


display:true,


text:

"Top 10 amostra mais solicitada"


}



}



}



}



);



},100);



}









// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================



function calcularTotalAmostras(lista){



return lista.reduce(

(total,item)=>

total +

Number(
item.quantidade ||
item.total ||
0
),

0

);



}






function calcularMediaMensal(lista){



if(!lista.length){

return 0;

}



return Math.round(

calcularTotalAmostras(lista)
/
lista.length

);



}







function ultimoMesAmostra(lista){



if(!lista.length){

return "-";

}



return lista
.filter(
m=>
Number(
m.quantidade ||
m.total ||
0
)>0
)
.slice(-1)
.map(
m=>m.mes
)
[0] || "-";

}
