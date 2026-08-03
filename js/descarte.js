ChatGPT Plus





hoje 8:36
meu painel nao esta aparecendo, a aba descarte esta em branco deve ser algum erro, vou te mandar os aquivos, descarte.jv- descarte. css

Pode enviar os dois arquivos:

descarte.js — confirme se é .js, pois você escreveu .jv

descarte.css

Vou verificar principalmente erros de sintaxe, funções ou variáveis não definidas, seletores HTML incorretos e falhas na criação dos gráficos. Se aparecer algum erro em vermelho no Console do navegador (F12 → Console), envie também uma imagem ou copie a mensagem completa.



Texto colado(108).txt
Documento

Encontrei o erro que está deixando a aba Descarte completamente em branco.

Dentro da função renderDescarte(), logo após:

iniciarScrollAutomaticoTop10Descarte();
existe esta linha solta:

</div>
Ela está fora da string HTML e, por isso, gera erro de sintaxe no JavaScript. Quando ocorre esse erro, todo o arquivo descarte.js deixa de ser executado. 


Substitua este trecho:

`;

iniciarScrollAutomaticoTop10Descarte();
</div>


/* ======================================================
   GRÁFICO DE BARRAS
====================================================== */
por:

`;

iniciarScrollAutomaticoTop10Descarte();


/* ======================================================
   GRÁFICO DE BARRAS
====================================================== */
Também encontrei um pequeno erro na configuração da legenda da pizza. Você colocou:

align:"endr",
O correto é:

align:"end",
Esse segundo erro normalmente não deixa a tela inteira em branco, mas deve ser corrigido.

Portanto, faça estas duas alterações:

iniciarScrollAutomaticoTop10Descarte();
Remova totalmente o:

</div>
E altere:

align:"endr",
para:

align:"end",
Depois atualize a versão do arquivo no HTML para evitar cache:

<script src="descarte.js?v=19"></script>
Em seguida, pressione:

Ctrl + F5
A principal causa da página em branco é o </div> solto dentro do código JavaScript.



Texto colado(109).txt
Documento
verificar se esta correto


Texto colado(110).txt
Documento

Revisei o arquivo atualizado. Está muito melhor, mas encontrei um detalhe importante.

✅ Está correto
Ordenação das origens (sort) ✔️ 


Top 10 ordenado ✔️ 


Plugin valorExternoBarraDescarte registrado ✔️ 


reverse:true adicionado ✔️ 


align:"end" corrigido ✔️ 


Não encontrei erro de sintaxe que impeça a execução do arquivo. ✔️ 


❗ Um detalhe sobre reverse:true
Como você já faz:

origens.sort(
    (a,b) =>
        Number(b.valor || 0) -
        Number(a.valor || 0)
);
o array já fica:

1º 980.000
2º 620.000
3º 390.000
...
Quando você adiciona:

y:{
    reverse:true,
o Chart.js inverte novamente a ordem visual. Dependendo da versão do Chart.js, isso pode fazer o menor valor aparecer no topo.

Faça um teste simples:
Remova:

reverse:true,
Atualize a página.

Se a barra de maior valor continuar aparecendo no topo, deixe sem reverse.

Se a barra de maior valor aparecer embaixo, aí sim mantenha reverse:true.

Minha recomendação
Como você já ordena os dados, eu deixaria inicialmente assim:

y:{

    border:{
        display:false
    },

    grid:{
        display:false,
        drawBorder:false
    },

    ticks:{
e verificaria o resultado visual. 


Se ainda estiver aparecendo fora de ordem
O problema provavelmente não está no JavaScript, mas nos próprios dados (dados.descarte.origens). Nesse caso, envie também o trecho do JSON correspondente a:

"descarte": {
    "origens": [
        ...
    ]
}
Assim consigo verificar se a ordem incorreta vem da origem dos dados ou apenas da renderização do gráfico.


image(77).png
deu erro 

O erro principal está no gráfico de pizza. No arquivo atualizado foi removido o trecho que cria a variável:

valoresVisuaisOrigens
Por isso, o gráfico de barras aparece, mas quando o JavaScript chega na pizza ocorre:

ReferenceError: valoresVisuaisOrigens is not defined
e a pizza fica totalmente em branco. 


Correção
Localize este trecho:

const valoresOrigens =
    origens.map(
        item =>
            Number(item.valor || 0)
    );


destruirGraficosDescarte();
Substitua por:

const valoresOrigens =
    origens.map(
        item =>
            Number(item.valor || 0)
    );


/*
Cria um tamanho visual mínimo para que as menores
fatias continuem aparecendo no gráfico de pizza.
Os percentuais reais continuam sendo calculados
pelos valores originais.
*/

const totalOrigensDescarte =
    valoresOrigens.reduce(
        (soma, valor) =>
            soma + Number(valor || 0),
        0
    );


const tamanhoMinimoVisualDescarte =
    totalOrigensDescarte > 0
        ? totalOrigensDescarte * 0.006
        : 1;


const valoresVisuaisOrigens =
    valoresOrigens.map(
        valor => {

            const valorNumerico =
                Number(valor || 0);

            return Math.max(
                valorNumerico,
                tamanhoMinimoVisualDescarte
            );
        }
    );


destruirGraficosDescarte();
Isso fará a pizza voltar a aparecer.

Valores duplicados nas barras
Na imagem, os valores estão sendo desenhados mais de uma vez. Provavelmente existe outro plugin global no seu chart-theme.js desenhando os valores, além deste:

plugins:[
    valorExternoBarraDescarte
],
Para testar, altere temporariamente para:

plugins:[],
Se os valores continuarem aparecendo uma única vez, significa que o tema global já está desenhando os números e você deve deixar:

plugins:[],
Se todos os valores desaparecerem, volte para:

plugins:[
    valorExternoBarraDescarte
],
A ordem do maior para o menor está correta na imagem: Vencido aparece primeiro, seguido de Destinado pela Empresa. Portanto, mantenha:

reverse:true,
Depois, altere a versão no HTML:

<script src="descarte.js?v=20"></script>
e atualize com Ctrl + F5.



Texto colado(111).txt
Documento

Revisei o arquivo inteiro. Agora ele está sem erros de sintaxe, mas encontrei o motivo de a pizza continuar em branco.

O problema não é o descarte.js
O código da pizza está correto. 


O problema provavelmente está ocorrendo na criação do gráfico, e o navegador está gerando um erro no Console.

Preciso da mensagem exata do erro.
Pressione F12.

Clique na aba Console.

Atualize a página (Ctrl + F5).

Copie a mensagem em vermelho que aparecer.

Uma coisa que eu percebi
No arquivo que você enviou, a configuração da pizza está correta:

const canvasPizza =
    document.getElementById("graficoDescartePizza");
Depois:

new Chart(
    canvasPizza,
    {
        type:"doughnut",
e também:

data: valoresVisuaisOrigens,
A variável existe e está sendo criada corretamente. 


Então o erro não é mais esse.

O mais provável
Como eu conheço a estrutura do seu painel SGQ, há três possibilidades restantes:

O plugin rotulosExternosPizzaDescarte está lançando uma exceção durante o afterDatasetsDraw.

O chart-theme.js está registrando algum plugin global que entra em conflito com esse gráfico.

O JSON de dados.descarte.origens possui algum valor null, undefined ou string, causando falha no plugin personalizado.

Para identificar rapidamente
Faça este teste:

Troque:

plugins:[
    rotulosExternosPizzaDescarte,
    centroPizzaDescarte
],
por:

plugins:[],
Se a pizza aparecer, sabemos que o problema está em um dos plugins personalizados.

O que preciso para resolver definitivamente
Envie apenas uma destas opções:

📷 Uma captura da aba Console (F12) mostrando o erro em vermelho.

Ou o arquivo chart-theme.js.

Com a mensagem do Console eu consigo dizer exatamente a linha que está quebrando. Sem ela, só é possível apontar as hipóteses mais prováveis, e pelo código que você enviou não há mais um erro evidente de sintaxe.


/* ==========================================================
PÁGINA — DESCARTE
========================================================== */

/* ==========================================================
CORES
========================================================== */

const coresDescarte = [
"#1d4eff",
"#0f3cc9",
"#6676f4",
"#eb37cf",
"#16a05d",
"#2db3e8",
"#8b5cf6",
"#f59e0b",
"#ef4444",
"#14b8a6"
];

/* ==========================================================
FUNÇÕES AUXILIARES
========================================================== */

function calcularPercentualDescarte(valor, total){

const valorNumerico =
    Number(valor || 0);

const totalNumerico =
    Number(total || 0);

if(totalNumerico <= 0){
    return 0;
}

return (
    valorNumerico /
    totalNumerico
) * 100;
}

function formatarPercentualDescarte(valor){

return Number(valor || 0)
    .toLocaleString(
        "pt-BR",
        {
            minimumFractionDigits:1,
            maximumFractionDigits:1
        }
    ) + "%";
}

function escaparHtmlDescarte(valor){

return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ==========================================================
TOP 3 ORIGENS
========================================================== */

function montarTop3Descarte(origens){

const lista =
    Array.isArray(origens)
        ? [...origens]
        : [];


const total =
    lista.reduce(
        (soma, item) =>
            soma +
            Number(item.valor || 0),
        0
    );


const top3 =
    lista
        .sort(
            (a,b) =>
                Number(b.valor || 0) -
                Number(a.valor || 0)
        )
        .slice(0,3);


if(!top3.length){

    return `

        <div class="descarte-top3-vazio">

            Nenhuma origem registrada.

        </div>
    `;
}


return `

    <div class="descarte-top3-grid">

        ${top3.map((item, indice) => {

            const nome =
                item.nome ||
                item.origem ||
                "Sem origem";


            const valor =
                Number(item.valor || 0);


            const percentual =
                calcularPercentualDescarte(
                    valor,
                    total
                );


            const cor =
                [
                    "#f51cae",
                    "#1264ef",
                    "#6559e9"
                ][indice];


            return `

                <article class="descarte-top3-card">

                    <div class="descarte-top3-cabecalho">

                        <span
                            class="descarte-top3-posicao"
                            style="background:${cor};"
                        >
                            ${indice + 1}
                        </span>


                        <span class="descarte-top3-nome">

                            ${escaparHtmlDescarte(nome)}

                        </span>


                        <span class="descarte-top3-seta">

                            ◆

                        </span>

                    </div>


                    <strong class="descarte-top3-valor">

                        ${moeda(valor)}

                    </strong>


                    <span class="descarte-top3-percentual">

                        ${formatarPercentualDescarte(
                            percentual
                        )}

                    </span>

                </article>
            `;

        }).join("")}

    </div>
`;
}

/* ==========================================================
RÓTULOS EXTERNOS DA PIZZA
========================================================== */
const rotulosExternosPizzaDescarte = {

id:"rotulosExternosPizzaDescarte",

afterDatasetsDraw(chart){

    const dataset =
        chart.data.datasets[0];

    if(!dataset){
        return;
    }

    const valoresReais =
        Array.isArray(dataset.valoresReais)
            ? dataset.valoresReais.map(
                valor => Number(valor || 0)
            )
            : dataset.data.map(
                valor => Number(valor || 0)
            );

    const totalReal =
        valoresReais.reduce(
            (soma, valor) =>
                soma + valor,
            0
        );

    if(totalReal <= 0){
        return;
    }

    const meta =
        chart.getDatasetMeta(0);

    if(
        !meta ||
        !Array.isArray(meta.data)
    ){
        return;
    }

    const ctx =
        chart.ctx;

    const area =
        chart.chartArea;

    const cores =
        Array.isArray(dataset.backgroundColor)
            ? dataset.backgroundColor
            : [];

    const espacamentoMinimo =
        15;

    const margemSuperior =
        area.top + 8;

    const margemInferior =
        area.bottom - 8;

    const rotulosDireita = [];

    const rotulosEsquerda = [];

    meta.data.forEach(
        (arco, indice) => {

            if(
                !chart.getDataVisibility(indice)
            ){
                return;
            }

            const valorReal =
                valoresReais[indice];

            const percentual =
                calcularPercentualDescarte(
                    valorReal,
                    totalReal
                );

            const propriedades =
                arco.getProps(
                    [
                        "x",
                        "y",
                        "startAngle",
                        "endAngle",
                        "outerRadius"
                    ],
                    true
                );

            const angulo =
                (
                    propriedades.startAngle +
                    propriedades.endAngle
                ) / 2;

            const direcaoX =
                Math.cos(angulo);

            const direcaoY =
                Math.sin(angulo);

            const item = {

                indice,

                percentual,

                cor:
                    cores[
                        indice %
                        cores.length
                    ] || "#64748b",

                centroX:
                    propriedades.x,

                centroY:
                    propriedades.y,

                raio:
                    propriedades.outerRadius,

                direcaoX,

                direcaoY,

                inicioX:
                    propriedades.x +
                    direcaoX *
                    (
                        propriedades.outerRadius +
                        2
                    ),

                inicioY:
                    propriedades.y +
                    direcaoY *
                    (
                        propriedades.outerRadius +
                        2
                    ),

                yDesejado:
                    propriedades.y +
                    direcaoY *
                    (
                        propriedades.outerRadius +
                        18
                    )
            };

            /*
            Os dois menores percentuais do topo ficam
            separados: um à esquerda e outro à direita.
            */

            if(indice === 0){

item.forcarTopo = true;
item.yDesejado =
    propriedades.y -
    propriedades.outerRadius -
    24;

rotulosEsquerda.push(item);   // era Direita

return;
}

if(indice === 1){

item.forcarTopo = true;
item.yDesejado =
    propriedades.y -
    propriedades.outerRadius -
    24;

rotulosDireita.push(item);    // era Esquerda

return;
}

            if(direcaoX >= 0){

                rotulosDireita.push(item);

            } else {

                rotulosEsquerda.push(item);
            }
        }
    );

    function organizarRotulos(lista){

        lista.sort(
            (a,b) =>
                a.yDesejado -
                b.yDesejado
        );

        lista.forEach(
            (item, indice) => {

                if(indice === 0){

                    item.yFinal =
                        Math.max(
                            item.yDesejado,
                            margemSuperior
                        );

                    return;
                }

                item.yFinal =
                    Math.max(
                        item.yDesejado,
                        lista[indice - 1].yFinal +
                        espacamentoMinimo
                    );
            }
        );

        if(!lista.length){
            return;
        }

        const ultimo =
            lista[lista.length - 1];

        if(
            ultimo.yFinal >
            margemInferior
        ){

            const excesso =
                ultimo.yFinal -
                margemInferior;

            lista.forEach(
                item => {

                    item.yFinal -= excesso;
                }
            );
        }

        for(
            let indice =
                lista.length - 2;

            indice >= 0;

            indice--
        ){

            const atual =
                lista[indice];

            const proximo =
                lista[indice + 1];

            if(
                atual.yFinal >
                proximo.yFinal -
                espacamentoMinimo
            ){

                atual.yFinal =
                    proximo.yFinal -
                    espacamentoMinimo;
            }
        }

        if(
            lista[0] &&
            lista[0].yFinal <
            margemSuperior
        ){

            const ajuste =
                margemSuperior -
                lista[0].yFinal;

            lista.forEach(
                item => {

                    item.yFinal += ajuste;
                }
            );
        }
    }

    organizarRotulos(
        rotulosDireita
    );

    organizarRotulos(
        rotulosEsquerda
    );

    ctx.save();

    ctx.font =
        "800 10px 'Segoe UI', Arial, sans-serif";

    ctx.textBaseline =
        "middle";

    function desenharRotulos(
        lista,
        ladoDireito
    ){

        lista.forEach(
            item => {

                let finalX;

                let joelhoX;

                if(item.forcarTopo){

                    finalX =
                        item.centroX +
                        (
                            ladoDireito
                                ? item.raio + 42
                                : -item.raio - 42
                        );

                    joelhoX =
                        item.centroX +
                        (
                            ladoDireito
                                ? 18
                                : -18
                        );

                } else {

                    finalX =
                        item.centroX +
                        (
                            ladoDireito
                                ? item.raio + 26
                                : -item.raio - 26
                        );

                    joelhoX =
                        item.centroX +
                        (
                            ladoDireito
                                ? item.raio + 10
                                : -item.raio - 10
                        );
                }

                ctx.strokeStyle =
                    item.cor;

                ctx.fillStyle =
                    item.cor;

                ctx.lineWidth =
                    1.2;

                ctx.beginPath();

                ctx.moveTo(
                    item.inicioX,
                    item.inicioY
                );

                ctx.lineTo(
                    joelhoX,
                    item.yFinal
                );

                ctx.lineTo(
                    finalX,
                    item.yFinal
                );

                ctx.stroke();

                /*
                Ponto colorido antes do percentual.
                */

                ctx.beginPath();

                ctx.arc(
                    finalX,
                    item.yFinal,
                    2.7,
                    0,
                    Math.PI * 2
                );

                ctx.fill();

                ctx.fillStyle =
                    "#0f2557";

                ctx.textAlign =
                    ladoDireito
                        ? "left"
                        : "right";

                ctx.fillText(
                    formatarPercentualDescarte(
                        item.percentual
                    ),
                    finalX +
                    (
                        ladoDireito
                            ? 6
                            : -6
                    ),
                    item.yFinal
                );
            }
        );
    }

    desenharRotulos(
        rotulosDireita,
        true
    );

    desenharRotulos(
        rotulosEsquerda,
        false
    );

    ctx.restore();
}
};

/* ==========================================================
TEXTO CENTRAL DA ROSCA
========================================================== */

const centroPizzaDescarte = {

id:"centroPizzaDescarte",


afterDraw(chart){

    const meta =
        chart.getDatasetMeta(0);


    if(
        !meta ||
        !meta.data ||
        !meta.data.length
    ){
        return;
    }


    const arco =
        meta.data[0];


    const propriedades =
        arco.getProps(
            [
                "x",
                "y",
                "innerRadius"
            ],
            true
        );


    const ctx =
        chart.ctx;


    ctx.save();


    /*
    Fundo sólido no centro.
    Remove qualquer vestígio de rótulo global.
    */

    ctx.beginPath();


    ctx.arc(
        propriedades.x,
        propriedades.y,
        Math.max(
            propriedades.innerRadius - 3,
            1
        ),
        0,
        Math.PI * 2
    );


    ctx.fillStyle =
        "#ffffff";


    ctx.fill();


    ctx.textAlign =
        "center";


    ctx.textBaseline =
        "middle";


    ctx.fillStyle =
        "#0f2557";


    ctx.font =
        "900 27px 'Segoe UI', Arial, sans-serif";


    ctx.fillText(
        "100%",
        propriedades.x,
        propriedades.y - 8
    );


    ctx.font =
        "800 11px 'Segoe UI', Arial, sans-serif";


    ctx.fillText(
        "Total",
        propriedades.x,
        propriedades.y + 17
    );


    ctx.restore();
}
};

/* ==========================================================
VALORES EXTERNOS DO GRÁFICO DE BARRAS
========================================================== */

const valorExternoBarraDescarte = {

id:"valorExternoBarraDescarte",

afterDatasetsDraw(chart){

    const dataset =
        chart.data.datasets[0];

    const meta =
        chart.getDatasetMeta(0);

    if(
        !dataset ||
        !Array.isArray(dataset.data) ||
        !meta ||
        !Array.isArray(meta.data)
    ){
        return;
    }

    const ctx =
        chart.ctx;

    const areaGrafico =
        chart.chartArea;

    ctx.save();

    ctx.font =
"900 12px 'Segoe UI', Arial, sans-serif";

    ctx.fillStyle =
        "#0f2557";

    ctx.textAlign =
        "left";

    ctx.textBaseline =
        "middle";

    meta.data.forEach(
        (barra, indice) => {

            const valor =
                Number(
                    dataset.data[indice] || 0
                );

            if(valor <= 0){
                return;
            }

            const propriedades =
                barra.getProps(
                    [
                        "x",
                        "y"
                    ],
                    true
                );

            const texto =
                moeda(valor);

            const larguraTexto =
                ctx.measureText(texto).width;

            const margem =
                7;

            let posicaoX =
                propriedades.x + margem;

            const limiteDireito =
                areaGrafico.right + 103;

            if(
                posicaoX +
                larguraTexto >
                limiteDireito
            ){
                posicaoX =
                    limiteDireito -
                    larguraTexto;
            }

            ctx.fillText(
                texto,
                posicaoX,
                propriedades.y
            );
        }
    );

    ctx.restore();
}
};

/* ==========================================================
DESTRUIR GRÁFICOS
========================================================== */

function destruirGraficosDescarte(){

if(
    window.graficoDescarteBarra &&
    typeof window.graficoDescarteBarra.destroy ===
    "function"
){

    window.graficoDescarteBarra.destroy();

    window.graficoDescarteBarra =
        null;
}


if(
    window.graficoDescartePizza &&
    typeof window.graficoDescartePizza.destroy ===
    "function"
){

    window.graficoDescartePizza.destroy();

    window.graficoDescartePizza =
        null;
}
}
/* ==========================================================
SCROLL AUTOMÁTICO — TOP 10 DESCARTE
========================================================== */

let intervaloScrollTop10Descarte = null;

function iniciarScrollAutomaticoTop10Descarte(){

const areaScroll =
    document.querySelector(
        ".descarte-top10-scroll .table-scroll"
    );

if(!areaScroll){
    return;
}

if(intervaloScrollTop10Descarte){
    clearInterval(intervaloScrollTop10Descarte);
}

intervaloScrollTop10Descarte = null;

if(
    areaScroll.scrollHeight <=
    areaScroll.clientHeight
){
    return;
}

let direcao = 1;
let pausado = false;

areaScroll.onmouseenter = () => pausado = true;
areaScroll.onmouseleave = () => pausado = false;

intervaloScrollTop10Descarte = setInterval(() => {

    if(pausado) return;

    if(
        areaScroll.scrollTop +
        areaScroll.clientHeight >=
        areaScroll.scrollHeight - 2
    ){
        direcao = -1;
    }

    if(areaScroll.scrollTop <= 0){
        direcao = 1;
    }

    areaScroll.scrollTop += direcao;

},35);
}

/* ==========================================================
RENDERIZAR PÁGINA
========================================================== */

function renderDescarte(){

if(!senhaDescarteLiberada){

    conteudo.innerHTML = `

        <div class="senha-box">

            <h2>
                🔒 Área Restrita - Descarte
            </h2>

            <p>
                Digite a senha para acessar as informações.
            </p>

            <input
                type="password"
                id="senhaDescarte"
                placeholder="Digite a senha"
                autocomplete="current-password"
                onkeydown="
                    if(event.key === 'Enter'){
                        validarSenhaDescarte();
                    }
                "
            >

            <button
                type="button"
                class="btn"
                onclick="validarSenhaDescarte()"
            >
                Acessar
            </button>

            <p
                id="erroSenha"
                style="
                    color:#ef4444;
                    font-weight:900;
                "
            ></p>

        </div>
    `;

    return;
}


/* ======================================================
   DADOS
====================================================== */

const d =
    dados.descarte || {

        total:0,

        ultimoDescarte:0,

        origens:[],

        top10:[]
    };


const origens =
    Array.isArray(d.origens)
        ? d.origens
        : [];


const top =
    Array.isArray(d.top10)
        ? [...d.top10]
        : [];


top.sort(
    (a,b) =>
        Number(b.valor || 0) -
        Number(a.valor || 0)
);


const nomesOrigens =
    origens.map(
        item =>
            item.nome ||
            item.origem ||
            "Sem origem"
    );


const valoresOrigens =
    origens.map(
        item =>
            Number(item.valor || 0)
    );


destruirGraficosDescarte();
/*
Cria um tamanho visual mínimo para que todas as cores
apareçam na rosquinha, sem alterar o percentual verdadeiro.
*/

const totalOrigensDescarte =
valoresOrigens.reduce(
(soma, valor) =>
soma + Number(valor || 0),
0
);

const tamanhoMinimoVisualDescarte =
totalOrigensDescarte > 0
? totalOrigensDescarte * 0.006
: 1;

const valoresVisuaisOrigens =
valoresOrigens.map(
valor => {

        const numero =
            Number(valor || 0);

        return Math.max(
            numero,
            tamanhoMinimoVisualDescarte
        );
    }
);
/* ======================================================
   HTML
====================================================== */

conteudo.innerHTML = `

    <div class="page-title">

        🗑 DESCARTE

    </div>


    <section class="cards descarte-indicadores">

        ${card(
            "🗑",
            "Valor Atual",
            moeda(d.total),
            "Financeiro impactado"
        )}


        ${card(
            "📋",
            "Último Descarte",
            moeda(d.ultimoDescarte),
            "Última operação registrada"
        )}

    </section>


    <section class="descarte-grid">


        <div class="panel descarte-panel-origens">


            <h3 class="descarte-titulo-painel">

                📊 Descarte por Origem

            </h3>


            <div class="descarte-chart-barra">

                <canvas
                    id="graficoDescarteOrigem"
                ></canvas>

            </div>


            <section class="descarte-top3-area">

                <h3 class="descarte-titulo-top3">

                    Top 3 Origens de Destino

                </h3>


                ${montarTop3Descarte(origens)}

            </section>

        </div>


        <div class="descarte-coluna-direita">


            <div class="panel descarte-panel-pizza">


                <h3 class="descarte-titulo-painel">

                    Descarte por Origem (%)

                </h3>


                <div class="descarte-chart-pizza">

                    <canvas
                        id="graficoDescartePizza"
                    ></canvas>

                </div>

            </div>
<div class="panel descarte-panel-top10">

<h3 class="descarte-titulo-painel descarte-top10-titulo">

    Top 10 Descarte

</h3>

<div class="descarte-top10-scroll">

    ${
        tabelaFixa(
            [
                "SKU",
                "Descrição",
                "Valor"
            ],
            montarLinhasTopDescarte(top),
            true
        )
    }

</div>
</div>

</div>

</section> `;

iniciarScrollAutomaticoTop10Descarte();

</div>

/* ======================================================
GRÁFICO DE BARRAS
====================================================== */

const canvasBarra =
document.getElementById(
"graficoDescarteOrigem"
);

if(canvasBarra){

if(
    window.graficoDescarteBarra &&
    typeof window.graficoDescarteBarra.destroy ===
    "function"
){
    window.graficoDescarteBarra.destroy();

    window.graficoDescarteBarra =
        null;
}
window.graficoDescarteBarra =
new Chart(
canvasBarra,
{
type:"bar",

        plugins:[],

        data:{

            labels:
                nomesOrigens,

            datasets:[{

                label:
                    "Valor descartado",

                data:
                    valoresOrigens,

                backgroundColor:
                    nomesOrigens.map(
                        (_, indice) =>
                            coresDescarte[
                                indice %
                                coresDescarte.length
                            ]
                    ),

                borderWidth:0,

                borderRadius:4,

                borderSkipped:false,

                barPercentage:.70,

                categoryPercentage:.76
            }]
        },


            options:{

                indexAxis:"y",

                responsive:true,

                maintainAspectRatio:false,

                animation:{

                    duration:350
                },

                layout:{

                    padding:{

                        top:8,

                        right:110,

                        bottom:5,

                        left:5
                    }
                },

                plugins:{

                    /*
                    Impede que o ChartDataLabels global
                    desenhe valores sobre as barras.
                    */

                    datalabels:{

                        display:false,

                        formatter(){

                            return "";
                        }
                    },

                    legend:{

                        display:false
                    },

                    tooltip:{

                        displayColors:false,

                        callbacks:{

                            title(context){

                                return (
                                    context[0]?.label ||
                                    "Sem origem"
                                );
                            },

                            label(context){

                                return (
                                    "Valor: " +
                                    moeda(
                                        Number(
                                            context.raw || 0
                                        )
                                    )
                                );
                            }
                        }
                    }
                },

                scales:{

                    /*
                    Eixo horizontal — valores financeiros
                    */

                    x:{

                        beginAtZero:true,

                        grace:"5%",

                        border:{

                            display:false
                        },

                        grid:{

                            color:
                                "rgba(15,37,87,.08)",

                            drawBorder:false
                        },

                        title:{

                            display:false
                        },

                        ticks:{

                            color:"#64748b",

                            padding:6,

                            maxTicksLimit:6,

                            font:{

                                size:11,

                                weight:"900"
                            },

                            callback(valor){

                                const numero =
                                    Number(valor || 0);

                                if(
                                    Math.abs(numero) >=
                                    1000000
                                ){
                                    return (
                                        "R$ " +
                                        (
                                            numero /
                                            1000000
                                        )
                                            .toLocaleString(
                                                "pt-BR",
                                                {
                                                    maximumFractionDigits:1
                                                }
                                            ) +
                                        " mi"
                                    );
                                }

                                if(
                                    Math.abs(numero) >=
                                    1000
                                ){
                                    return (
                                        "R$ " +
                                        (
                                            numero /
                                            1000
                                        )
                                            .toLocaleString(
                                                "pt-BR",
                                                {
                                                    maximumFractionDigits:0
                                                }
                                            ) +
                                        " mil"
                                    );
                                }

                                return (
                                    "R$ " +
                                    numero.toLocaleString(
                                        "pt-BR"
                                    )
                                );
                            }
                        }
                    },

                    /*
                    Eixo vertical — origens
                    */

                    y:{

                        border:{

                            display:false
                        },

                        grid:{

                            display:false,

                            drawBorder:false
                        },

                        ticks:{

                            color:"#0f2557",

                            padding:8,

                            autoSkip:false,

                            font:{

                                size:12,

                                weight:"900"
                            },

                            callback(
                                valor,
                                indice
                            ){

                                const label =
                                    this.getLabelForValue(
                                        valor
                                    );

                                const texto =
                                    String(
                                        label || "-"
                                    );

                                const limite =
                                    24;

                                if(
                                    texto.length <=
                                    limite
                                ){
                                    return texto;
                                }

                                return (
                                    texto.slice(
                                        0,
                                        limite
                                    ) +
                                    "…"
                                );
                            }
                        }
                    }
                }
            }
        }
    );
}

/* ======================================================
GRÁFICO DE PIZZA
====================================================== */

const canvasPizza =
document.getElementById(
"graficoDescartePizza"
);

if(canvasPizza){

if(
    window.graficoDescartePizza &&
    typeof window.graficoDescartePizza.destroy ===
    "function"
){
    window.graficoDescartePizza.destroy();

    window.graficoDescartePizza =
        null;
}

window.graficoDescartePizza =
    new Chart(
        canvasPizza,
        {
            type:"doughnut",

            plugins:[
                rotulosExternosPizzaDescarte,
                centroPizzaDescarte
            ],

            data:{

                labels:
                    nomesOrigens,

                datasets:[{

                    label:
                        "Percentual",

                    /*
                    Estes valores controlam apenas
                    o tamanho visual das fatias.
                    */

                    data:
                        valoresVisuaisOrigens,

                    /*
                    Estes são os valores financeiros reais.
                    São usados na legenda, tooltip
                    e cálculo dos percentuais.
                    */

                    valoresReais:
                        valoresOrigens,

                    backgroundColor:
                        nomesOrigens.map(
                            (_, indice) =>
                                coresDescarte[
                                    indice %
                                    coresDescarte.length
                                ]
                        ),

                    borderColor:
                        "#ffffff",

                    borderWidth:
                        2,

                    hoverOffset:
                        4,

                    spacing:
                        0
                }]
            },

            options:{

                responsive:
                    true,

                maintainAspectRatio:
                    false,

                animation:{

                    duration:
                        350
                },

                cutout:
                    "48%",

                radius:
                    "90%",

                layout:{

padding:{

    top:15,

    right:20,

    bottom:15,

    left:20
}
},

                plugins:{

                    datalabels:{

                        display:
                            false,

                        formatter(){

                            return "";
                        }
                    },

                    legend:{

                        display:
                            true,

                        position:
                            "right",

                        align:
                            "endr",

                        labels:{

                            usePointStyle:
                                true,

                            pointStyle:
                                "circle",

                            boxWidth:
                                8,

                            boxHeight:
                                8,

                            padding:
                                8,

                            color:
                                "#0f2557",

                            font:{

                                size:
                                    9,

                                weight:
                                    "700"
                            },

                            generateLabels(chart){

                                const dataset =
                                    chart.data
                                        .datasets[0];

                                const valores =
                                    Array.isArray(
                                        dataset.valoresReais
                                    )
                                        ? dataset.valoresReais
                                        : dataset.data;

                                const total =
                                    valores.reduce(
                                        (
                                            soma,
                                            valor
                                        ) =>
                                            soma +
                                            Number(
                                                valor || 0
                                            ),
                                        0
                                    );

                                return chart.data.labels.map(
                                    (
                                        label,
                                        indice
                                    ) => {

                                        const valor =
                                            Number(
                                                valores[
                                                    indice
                                                ] || 0
                                            );

                                        const percentual =
                                            calcularPercentualDescarte(
                                                valor,
                                                total
                                            );

                                        const cores =
                                            Array.isArray(
                                                dataset.backgroundColor
                                            )
                                                ? dataset.backgroundColor
                                                : [];

                                        const cor =
                                            cores[
                                                indice %
                                                cores.length
                                            ] ||
                                            "#64748b";

                                        return {

                                            text:
                                                label +
                                                " — " +
                                                formatarPercentualDescarte(
                                                    percentual
                                                ),

                                            fillStyle:
                                                cor,

                                            strokeStyle:
                                                cor,

                                            lineWidth:
                                                0,

                                            pointStyle:
                                                "circle",

                                            hidden:
                                                !chart
                                                    .getDataVisibility(
                                                        indice
                                                    ),

                                            index:
                                                indice
                                        };
                                    }
                                );
                            }
                        },

                        onClick(
                            evento,
                            item,
                            legenda
                        ){

                            const chart =
                                legenda.chart;

                            chart.toggleDataVisibility(
                                item.index
                            );

                            chart.update();
                        }
                    },

                    tooltip:{

                        displayColors:
                            true,

                        callbacks:{

                            label(context){

                                const dataset =
                                    context.dataset;

                                const valores =
                                    Array.isArray(
                                        dataset.valoresReais
                                    )
                                        ? dataset.valoresReais
                                        : dataset.data;

                                const valor =
                                    Number(
                                        valores[
                                            context.dataIndex
                                        ] || 0
                                    );

                                const total =
                                    valores.reduce(
                                        (
                                            soma,
                                            item
                                        ) =>
                                            soma +
                                            Number(
                                                item || 0
                                            ),
                                        0
                                    );

                                const percentual =
                                    calcularPercentualDescarte(
                                        valor,
                                        total
                                    );

                                return (
                                    context.label +
                                    ": " +
                                    moeda(valor) +
                                    " — " +
                                    formatarPercentualDescarte(
                                        percentual
                                    )
                                );
                            }
                        }
                    }
                }
            }
        }
    );
}

graficoAtual =
    window.graficoDescarteBarra;
}

/* ==========================================================
VALIDAR SENHA
========================================================== */

function validarSenhaDescarte(){

const campoSenha =
    document.getElementById(
        "senhaDescarte"
    );


const erroSenha =
    document.getElementById(
        "erroSenha"
    );


if(!campoSenha){
    return;
}


const senha =
    campoSenha.value.trim();


if(senha === "SGQ2026"){

    senhaDescarteLiberada =
        true;

    renderDescarte();

    return;
}


if(erroSenha){

    erroSenha.innerText =
        "Senha incorreta.";
}


campoSenha.focus();

campoSenha.select();
}


Fechar
