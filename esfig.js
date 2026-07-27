/* =====================================================
   PAINEL SGQ LABOR

   ESFIG.JS

   Aba:
   ⚙️ AFERIÇÃO ESFIG

   ===================================================== */



function renderEsfig(){


const esfig = dados.esfig || {


    totalHoras:0,

    totalGruInmetro:0,

    ultimaAfericao:"",

    proximaAfericao:"",

    produtos:[]


};




const area =
document.getElementById(
"conteudo"
);




area.innerHTML = `



<div class="page-title">

⚙️ AFERIÇÃO ESFIG

</div>







<section class="cards">



${card(

"⏱️",

"Total Horas",

numero(
esfig.totalHoras
)

)}




${card(

"💰",

"Custo GRU INMETRO",

moeda(
esfig.totalGruInmetro
)

)}




${card(

"📅",

"Última Aferição",

esfig.ultimaAfericao

)}




${card(

"🔎",

"Próxima Aferição",

esfig.proximaAfericao

)}



</section>








<div class="grafico-box">


<h2>

FLUXO OPERACIONAL ESFIGMOMANÔMETRO

</h2>



<div class="cards">


${card(

"⏳",

"Aguardando",

numero(
calcularAguardando(esfig.produtos)
)

)}



${card(

"🔧",

"Desmontado",

numero(
calcularDesmontado(esfig.produtos)
)

)}



${card(

"✅",

"Aferidos",

numero(
calcularAferidos(esfig.produtos)
)

)}



</div>






<div class="progress">


<div 
class="progress-bar"
style="
width:${calcularPercentual(esfig.produtos)}%
">

${calcularPercentual(esfig.produtos)}%

</div>


</div>



</div>










<div class="grafico-box">


<canvas id="graficoEsfig"></canvas>


</div>










<div class="tabela-box">


<h2>

Controle por SKU

</h2>



<table>


<thead>


<tr>

<th>SKU</th>

<th>Produto</th>

<th>Aferidos</th>

<th>Total Anual</th>

<th>Status</th>


</tr>


</thead>



<tbody>


${

esfig.produtos.map(p=>`


<tr>


<td>

${p.sku || ""}

</td>


<td>

${p.nome || ""}

</td>


<td>

${numero(p.aferidos)}

</td>


<td>

${numero(p.totalAnualSku)}

</td>


<td>

${p.status || "Concluído"}

</td>


</tr>


`).join("")


}



</tbody>


</table>


</div>



`;







// ================================
// GRÁFICO
// ================================


setTimeout(()=>{


const labels =
esfig.produtos.map(
p=>p.sku
);



const valores =
esfig.produtos.map(
p=>p.aferidos
);




criarGrafico(

"graficoEsfig",

"bar",

labels,

valores,

"Quantidade Aferida por SKU"

);



},100);




}







// =====================================================
// CÁLCULOS DO FLUXO OPERACIONAL
// =====================================================



function calcularAguardando(produtos){


return produtos.reduce(

(total,p)=>

total +
Number(
p.aguardando || 0
),

0

);


}






function calcularDesmontado(produtos){


return produtos.reduce(

(total,p)=>

total +
Number(
p.desmontado || 0
),

0

);


}






function calcularAferidos(produtos){


return produtos.reduce(

(total,p)=>

total +
Number(
p.aferidos || 0
),

0

);


}







function calcularPercentual(produtos){


let total =

calcularAguardando(produtos)

+

calcularDesmontado(produtos)

+

calcularAferidos(produtos);




if(total===0){

return 0;

}




return Math.round(

(
calcularAferidos(produtos)
/
total
)

*100

);


}
