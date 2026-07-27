/* =====================================================
   PAINEL SGQ LABOR

   DESCARTE.JS

   Aba:
   🗑️ DESCARTE

   ===================================================== */



function renderDescarte(){



const descarte = dados.descarte || {


    total:0,

    ultimoDescarte:0,

    origens:[],

    top10:[]


};





const area =
document.getElementById(
"conteudo"
);






area.innerHTML = `



<div class="page-title">

🗑️ CONTROLE DE DESCARTE

</div>







<section class="cards">



${card(

"💰",

"Total Descarte",

moeda(
descarte.total
)

)}





${card(

"📅",

"Último Descarte",

moeda(
descarte.ultimoDescarte
)

)}






${card(

"📂",

"Origens",

numero(
descarte.origens.length
)

)}






${card(

"📦",

"SKUs Analisados",

numero(
descarte.top10.length
)

)}



</section>








<div class="grafico-box">


<h2>

TOP 10 SKU - MAIOR DESCARTE

</h2>



<canvas id="graficoDescarte"></canvas>


</div>









<div class="tabela-box">


<h2>

Detalhamento por SKU

</h2>




<table>


<thead>


<tr>

<th>SKU</th>

<th>Valor Descarte</th>

</tr>


</thead>




<tbody>



${

descarte.top10.map(item=>`


<tr>


<td>

${item.sku || item.nome || ""}

</td>



<td>

${moeda(item.valor)}

</td>



</tr>


`).join("")

}



</tbody>



</table>



</div>









<div class="tabela-box">


<h2>

Origem dos Descartes

</h2>





<table>


<thead>


<tr>

<th>Origem</th>

<th>Valor</th>

</tr>


</thead>



<tbody>



${

descarte.origens.map(o=>`


<tr>


<td>

${o.nome}

</td>


<td>

${moeda(o.valor)}

</td>


</tr>


`).join("")

}



</tbody>



</table>


</div>



`;








// ===========================================
// GRÁFICO HORIZONTAL
// ===========================================


setTimeout(()=>{



destruirGrafico();



const canvas =
document.getElementById(
"graficoDescarte"
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

descarte.top10.map(
item=>
item.sku || item.nome
),



datasets:[{


label:

"Valor Descarte (R$)",



data:

descarte.top10.map(
item=>
item.valor
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

"Top 10 SKU com Maior Descarte"



}



},



scales:{



x:{



ticks:{



callback:function(valor){


return valor.toLocaleString(
"pt-BR",
{

style:"currency",

currency:"BRL"

}

);


}



}



}



}



}



}


);



},100);



}
