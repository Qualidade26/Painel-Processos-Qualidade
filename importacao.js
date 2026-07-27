/* =====================================================
   PAINEL SGQ LABOR
   IMPORTACAO.JS

   Aba:
   📦 Inspeção de Importação

   ===================================================== */



function renderImportacao(){


const imp = dados.importacao || {

    processosAno:0,

    totalSku:0,

    totalLotes:0,

    laudosEmitidos:0,

    totalHoras:0,

    mensal:[],

    fluxo:[]

};



const area =
document.getElementById(
    "conteudo"
);



area.innerHTML = `



<div class="page-title">

📦 INSPEÇÃO DE IMPORTAÇÃO

</div>





<section class="cards">



${card(
"📄",
"Processos no Ano",
numero(
imp.processosAno
)
)}



${card(
"🏷️",
"Total SKU",
numero(
imp.totalSku
)
)}




${card(
"📦",
"Total Lotes",
numero(
imp.totalLotes
)
)}




${card(
"📑",
"Laudos Emitidos",
numero(
imp.laudosEmitidos
)
)}




${card(
"⏱️",
"Total Horas",
numero(
imp.totalHoras
)
)}



</section>






<div class="grafico-box">


<canvas id="graficoImportacao"></canvas>


</div>







<div class="tabela-box">


<h2>

Fluxo de Inspeção

</h2>



<table>


<thead>

<tr>

<th>Mês</th>

<th>PO</th>

<th>Total Lote</th>

<th>Laudos</th>

<th>Horas</th>

</tr>


</thead>



<tbody>


${

imp.mensal.map(m=>`


<tr>

<td>
${m.mes || ""}
</td>


<td>
${numero(m.po)}
</td>


<td>
${numero(m.totalLote)}
</td>


<td>
${numero(m.laudosEmitidos)}
</td>


<td>
${numero(m.horas)}
</td>


</tr>


`).join("")


}



</tbody>


</table>


</div>


`;





// ================================
// GRÁFICO MENSAL
// ================================


setTimeout(()=>{


const meses =
imp.mensal.map(
m=>m.mes
);



const horas =
imp.mensal.map(
m=>m.horas
);



criarGrafico(

"graficoImportacao",

"bar",

meses,

horas,

"Total de Horas - Inspeção Importação"

);



},100);



}
