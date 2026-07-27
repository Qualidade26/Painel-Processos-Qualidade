/* =====================================================
   PAINEL SGQ LABOR

   RETRABALHO.JS

   Aba:
   🔧 RETRABALHO

   ===================================================== */



let listaRetrabalho = [];





function renderRetrabalho(){



const retrabalho = dados.retrabalho || [];



listaRetrabalho = retrabalho;





const area =
document.getElementById(
"conteudo"
);







area.innerHTML = `



<div class="page-title">

🔧 CONTROLE DE RETRABALHO

</div>








<section class="cards">



${card(

"🔧",

"Total Retrabalho",

numero(
somarRetrabalho(retrabalho)
)

)}






${card(

"⏱️",

"Total Horas",

numero(
somarHorasRetrabalho(retrabalho)
)

)}






${card(

"🏭",

"Fornecedores",

numero(
retrabalho.length
)

)}





${card(

"📦",

"Quantidade Registros",

numero(
retrabalho.length
)

)}





</section>









<div class="grafico-box">


<h2>

RETRABALHO POR FORNECEDOR

</h2>



<input 
id="pesquisaRetrabalho"
type="text"
placeholder="Pesquisar fornecedor..."
onkeyup="filtrarRetrabalho()"
style="
width:100%;
padding:14px;
font-size:18px;
margin-bottom:20px;
border-radius:10px;
border:1px solid #ccc;
">





<canvas id="graficoRetrabalho"></canvas>


</div>









<div class="tabela-box">


<h2>

Detalhamento Retrabalho

</h2>





<table>


<thead>


<tr>


<th>Fornecedor</th>

<th>Quantidade</th>

<th>Horas</th>


</tr>


</thead>




<tbody id="tabelaRetrabalho">


${montarTabelaRetrabalho(retrabalho)}


</tbody>



</table>



</div>



`;




montarGraficoRetrabalho(retrabalho);



}









// =====================================================
// MONTA TABELA
// =====================================================



function montarTabelaRetrabalho(lista){



return lista.map(item=>`


<tr>


<td>

${item.fornecedor || item.nome || ""}

</td>



<td>

${numero(
item.quantidade || item.qtd || 0
)}

</td>



<td>

${numero(
item.horas || 0
)}

</td>



</tr>


`).join("");



}









// =====================================================
// SOMATÓRIOS
// =====================================================



function somarRetrabalho(lista){



return lista.reduce(

(total,item)=>

total +

Number(
item.quantidade ||
item.qtd ||
0
),

0

);



}





function somarHorasRetrabalho(lista){



return lista.reduce(

(total,item)=>

total +

Number(
item.horas ||
0
),

0

);



}









// =====================================================
// FILTRO FORNECEDOR
// =====================================================



function filtrarRetrabalho(){



const texto =

document
.getElementById(
"pesquisaRetrabalho"
)
.value
.toLowerCase();





const filtrado =

listaRetrabalho.filter(item=>{


const nome =

(
item.fornecedor ||
item.nome ||
""
)
.toLowerCase();



return nome.includes(texto);



});





document.getElementById(
"tabelaRetrabalho"
)
.innerHTML =

montarTabelaRetrabalho(
filtrado
);





montarGraficoRetrabalho(
filtrado
);



}









// =====================================================
// GRÁFICO HORIZONTAL
// =====================================================



function montarGraficoRetrabalho(lista){



setTimeout(()=>{



destruirGrafico();




const canvas =

document.getElementById(
"graficoRetrabalho"
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

lista.map(
item=>

item.fornecedor ||
item.nome
),





datasets:[{


label:

"Quantidade Retrabalhada",



data:

lista.map(

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

"Retrabalho por Fornecedor"


}



}



}



}



);



},100);



}
