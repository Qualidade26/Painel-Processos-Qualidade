/* =====================================================
   PAINEL SGQ LABOR

   FORNECEDORES.JS

   Aba:
   🏭 FORNECEDORES

   ===================================================== */



function renderFornecedores(){



const fornecedores = dados.fornecedores || [];




const area =

document.getElementById(
"conteudo"
);






area.innerHTML = `



<div class="page-title">

🏭 GESTÃO DE FORNECEDORES

</div>







<section class="cards">





${card(

"🏭",

"Total Fornecedores",

numero(
fornecedores.length
)

)}







${card(

"⭐",

"Avaliados",

numero(
contarAvaliados(fornecedores)
)

)}







${card(

"✅",

"Aprovados",

numero(
contarStatus(
fornecedores,
"Aprovado"
)

)

)}







${card(

"⏳",

"Pendentes",

numero(
contarStatus(
fornecedores,
"Pendente"
)

)

)}






</section>









<div class="grafico-box">


<h2>

Avaliação de Fornecedores

</h2>



<canvas id="graficoFornecedores"></canvas>



</div>









<div class="tabela-box">


<h2>

Controle de Fornecedores

</h2>





<table>


<thead>


<tr>


<th>Fornecedor</th>

<th>Status</th>

<th>Nota</th>

<th>Última Avaliação</th>


</tr>


</thead>





<tbody>



${

fornecedores.map(f=>`


<tr>



<td>

${f.nome || f.fornecedor || ""}

</td>




<td>

${f.status || "-"}

</td>




<td>

${numero(
f.nota || 0
)}

</td>




<td>

${f.data || f.ultimaAvaliacao || "-"}

</td>



</tr>


`).join("")

}



</tbody>



</table>


</div>



`;








// ==========================================
// GRÁFICO
// ==========================================


setTimeout(()=>{



const labels =

fornecedores.map(

f=>

f.nome ||
f.fornecedor

);





const valores =

fornecedores.map(

f=>

Number(
f.nota || 0
)

);





criarGrafico(

"graficoFornecedores",

"bar",

labels,

valores,

"Nota dos Fornecedores"

);



},100);



}









// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================




function contarAvaliados(lista){


return lista.filter(

f=>

f.nota ||
f.status

).length;


}







function contarStatus(lista,status){


return lista.filter(

f=>

String(
f.status
)
.toLowerCase()

===

String(
status
)
.toLowerCase()

).length;


}
