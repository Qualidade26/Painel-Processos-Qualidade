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


/*
   A linha deve começar FORA da rosquinha.
   Nunca dentro do círculo central.
*/

const raioInicioLinha =
    propriedades.outerRadius + 8;


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
        raioInicioLinha,

    inicioY:
        propriedades.y +
        direcaoY *
        raioInicioLinha,

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
   CENTRO TOTALMENTE LIMPO
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
                    "innerRadius",
                    "outerRadius"
                ],
                true
            );


        const ctx =
            chart.ctx;


        const centroX =
            propriedades.x;


        const centroY =
            propriedades.y;


        const raioInterno =
            propriedades.innerRadius;


        const raioExterno =
            propriedades.outerRadius;


        ctx.save();


        /* ==================================================
           MÁSCARA BRANCA

           Avança alguns pixels para dentro da própria rosca.
           Isso cobre completamente qualquer número/rótulo
           que esteja aparecendo atrás do 100%.
        ================================================== */

        const raioMascara =
            Math.min(
                raioInterno + 9,
                raioExterno - 4
            );


        ctx.globalCompositeOperation =
            "source-over";


        ctx.beginPath();


        ctx.arc(
            centroX,
            centroY,
            raioMascara,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            "#ffffff";


        ctx.fill();


        /* ==================================================
           100%
        ================================================== */

        ctx.fillStyle =
            "#0f2557";


        ctx.textAlign =
            "center";


        ctx.textBaseline =
            "middle";


        ctx.font =
            "900 17px 'Segoe UI', Arial, sans-serif";


        ctx.fillText(
            "100%",
            centroX,
            centroY - 4
        );


        /* ==================================================
           TOTAL
        ================================================== */

        ctx.font =
            "800 8px 'Segoe UI', Arial, sans-serif";


        ctx.fillText(
            "Total",
            centroX,
            centroY + 10
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
   SCROLL INFINITO — ESTILO PAINEL DE AEROPORTO
========================================================== */

let animacaoScrollTop10Descarte = null;

function pararScrollAutomaticoTop10Descarte(){

    if(animacaoScrollTop10Descarte){

        cancelAnimationFrame(
            animacaoScrollTop10Descarte
        );

        animacaoScrollTop10Descarte = null;
    }
}


function iniciarScrollAutomaticoTop10Descarte(){

    pararScrollAutomaticoTop10Descarte();


    const areaScroll =
        document.querySelector(
            ".descarte-top10-scroll .table-scroll"
        );


    if(!areaScroll){
        return;
    }


    const tabela =
        areaScroll.querySelector("table");


    const corpoTabela =
        tabela?.querySelector("tbody");


    if(
        !tabela ||
        !corpoTabela
    ){
        return;
    }


    /*
    Remove uma duplicação anterior, caso a aba
    seja renderizada novamente.
    */

    corpoTabela
        .querySelectorAll(
            'tr[data-scroll-copia="true"]'
        )
        .forEach(
            linha => linha.remove()
        );


    const linhasOriginais =
        Array.from(
            corpoTabela.querySelectorAll(
                "tr"
            )
        );


    if(!linhasOriginais.length){
        return;
    }


    /*
    Se não existir conteúdo suficiente para rolar,
    não inicia a animação.
    */

    if(
        areaScroll.scrollHeight <=
        areaScroll.clientHeight
    ){
        return;
    }


    /*
    Duplica as linhas originais.
    A segunda lista cria a continuidade visual.
    */

    linhasOriginais.forEach(
        linhaOriginal => {

            const linhaCopia =
                linhaOriginal.cloneNode(true);

            linhaCopia.setAttribute(
                "data-scroll-copia",
                "true"
            );

            linhaCopia.setAttribute(
                "aria-hidden",
                "true"
            );

            corpoTabela.appendChild(
                linhaCopia
            );
        }
    );


    /*
    A altura da primeira lista é exatamente
    a distância necessária para reiniciar
    sem que o usuário perceba.
    */

    const primeiraLinha =
        linhasOriginais[0];


    const primeiraLinhaCopia =
        corpoTabela.querySelector(
            'tr[data-scroll-copia="true"]'
        );


    if(
        !primeiraLinha ||
        !primeiraLinhaCopia
    ){
        return;
    }


    const inicioOriginal =
        primeiraLinha.offsetTop;


    const inicioCopia =
        primeiraLinhaCopia.offsetTop;


    const alturaListaOriginal =
        inicioCopia -
        inicioOriginal;


    if(alturaListaOriginal <= 0){
        return;
    }


    areaScroll.scrollTop = 0;


    let pausado = false;

    let posicaoAtual = 0;

    let tempoAnterior = null;


    /*
    Velocidade em pixels por segundo.
    Diminua para deixar mais lento.
    Aumente para deixar mais rápido.
    */

    const velocidade = 18;


    areaScroll.onmouseenter = () => {

        pausado = true;
    };


    areaScroll.onmouseleave = () => {

        pausado = false;

        tempoAnterior = null;
    };


    areaScroll.onfocusin = () => {

        pausado = true;
    };


    areaScroll.onfocusout = () => {

        pausado = false;

        tempoAnterior = null;
    };


    function animarScroll(tempoAtual){

        if(!document.body.contains(areaScroll)){

            pararScrollAutomaticoTop10Descarte();

            return;
        }


        if(tempoAnterior === null){

            tempoAnterior = tempoAtual;
        }


        const tempoDecorrido =
            tempoAtual -
            tempoAnterior;


        tempoAnterior = tempoAtual;


        if(!pausado){

            posicaoAtual +=
                velocidade *
                (
                    tempoDecorrido /
                    1000
                );


            /*
            Quando chega ao início da lista duplicada,
            remove exatamente a altura da lista original.

            Visualmente, nada muda porque a cópia
            é idêntica à primeira lista.
            */

            if(
                posicaoAtual >=
                alturaListaOriginal
            ){

                posicaoAtual -=
                    alturaListaOriginal;
            }


            areaScroll.scrollTop =
                posicaoAtual;
        }


        animacaoScrollTop10Descarte =
            requestAnimationFrame(
                animarScroll
            );
    }


    animacaoScrollTop10Descarte =
        requestAnimationFrame(
            animarScroll
        );
}

/* ==========================================================
   ABA INTERNA — DESCARTE
========================================================== */

let abaInternaDescarte = "atual";


/* ==========================================================
   TROCAR ABA INTERNA
========================================================== */

function trocarAbaDescarte(aba){

    if(
        aba !== "atual" &&
        aba !== "descartado"
    ){
        return;
    }

    abaInternaDescarte = aba;

    renderDescarte();
}


/* ==========================================================
   CRIAR GRÁFICO — DESCARTE POR ORIGEM
   MOSTRA % + VALOR EM R$
========================================================== */

function criarGraficoDescarteOrigemResumo(
    origens,
    canvasId = "graficoDescarteOrigem"
){

    const canvas =
        document.getElementById(canvasId);

    if(!canvas){
        return;
    }


    /*
       Destrói gráfico anterior.
    */

    if(
        window.graficoDescarteBarra &&
        typeof window.graficoDescarteBarra.destroy ===
        "function"
    ){

        window.graficoDescarteBarra.destroy();

        window.graficoDescarteBarra = null;
    }


    const lista =
        Array.isArray(origens)
            ? [...origens]
            : [];


    /*
       Ordena maior → menor.
    */

    lista.sort(
        (a,b) =>
            Number(b.valor || 0) -
            Number(a.valor || 0)
    );


    const total =
        lista.reduce(
            (soma,item) =>
                soma +
                Number(item.valor || 0),
            0
        );


    const labels =
        lista.map(
            item =>
                item.nome ||
                item.origem ||
                "Sem origem"
        );


    const valores =
        lista.map(
            item =>
                Number(item.valor || 0)
        );


    const cores =
        lista.map(
            (item,indice) =>
                item.cor ||
                coresDescarte[
                    indice %
                    coresDescarte.length
                ]
        );


    /* ======================================================
       PLUGIN — PERCENTUAL + VALOR
    ====================================================== */

    const rotuloPercentualValorDescarte = {

    id:"rotuloPercentualValorDescarte",

    afterDatasetsDraw(chart){

        const dataset =
            chart.data.datasets[0];

        const meta =
            chart.getDatasetMeta(0);

        if(
            !dataset ||
            !meta ||
            !Array.isArray(meta.data)
        ){
            return;
        }

        const ctx =
            chart.ctx;

        const area =
            chart.chartArea;


        ctx.save();

        ctx.textBaseline =
            "middle";

        ctx.font =
            "900 10px 'Segoe UI', Arial, sans-serif";


        meta.data.forEach(
            (barra, indice) => {

                const valor =
                    Number(
                        dataset.data[indice] || 0
                    );

                if(valor <= 0){
                    return;
                }


                const percentual =
                    calcularPercentualDescarte(
                        valor,
                        total
                    );


                const propriedades =
                    barra.getProps(
                        ["y"],
                        true
                    );


                /*
                   COLUNA DO PERCENTUAL
                */

                ctx.textAlign =
                    "right";

                ctx.fillStyle =
                    "#0f2557";

                ctx.fillText(
                    formatarPercentualDescarte(
                        percentual
                    ),
                    area.right + 62,
                    propriedades.y
                );


                /*
                   COLUNA DO VALOR
                */

                ctx.textAlign =
                    "right";

                ctx.fillStyle =
                    "#071a4b";

                ctx.fillText(
                    moeda(valor),
                    chart.width - 8,
                    propriedades.y
                );

            }
        );


        ctx.restore();
    }
};

    /* ======================================================
       CHART
    ====================================================== */

    window.graficoDescarteBarra =
        new Chart(
            canvas,
            {

                type:"bar",

                plugins:[
                    rotuloPercentualValorDescarte
                ],

                data:{

                    labels,

                    datasets:[{

                        label:
                            "Descarte por origem",

                        data:
                            valores,

                        backgroundColor:
                            cores,

                        borderWidth:
                            0,

                        borderRadius:
                            5,

                        borderSkipped:
                            false,

                        barPercentage:
                            .68,

                        categoryPercentage:
                            .74
                    }]
                },


                options:{

                    indexAxis:"y",

                    responsive:true,

                    maintainAspectRatio:false,

                    animation:{

                        duration:300
                    },


                    layout:{

                        padding:{

                            top:8,

                            right:190,

                            bottom:4,

                            left:4
                        }
                    },


                    plugins:{

                        datalabels:{

                            display:false
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

                                    const valor =
                                        Number(
                                            context.raw || 0
                                        );


                                    const percentual =
                                        calcularPercentualDescarte(
                                            valor,
                                            total
                                        );


                                    return (
                                        formatarPercentualDescarte(
                                            percentual
                                        ) +
                                        " | " +
                                        moeda(valor)
                                    );
                                }
                            }
                        }
                    },


                    scales:{

                        x:{

                            beginAtZero:true,

                            grace:"8%",

                            border:{

                                display:false
                            },

                            grid:{

                                color:
                                    "rgba(15,37,87,.08)",

                                drawBorder:false
                            },

                            ticks:{

                                color:"#64748b",

                                maxTicksLimit:6,

                                font:{

                                    size:10,

                                    weight:"800"
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


                        y:{

                            border:{

                                display:false
                            },

                            grid:{

                                display:false
                            },

                            ticks:{

                                color:"#0f2557",

                                padding:8,

                                autoSkip:false,

                                font:{

                                    size:11,

                                    weight:"900"
                                }
                            }
                        }
                    }
                }
            }
        );


    graficoAtual =
        window.graficoDescarteBarra;
}


/* ==========================================================
   TABELA — GASTO AMBIENTAL
========================================================== */

function montarTabelaGastoAmbiental(){

    return `

        <div class="descarte-ambiental-tabela">

            <table>

                <thead>

                    <tr>

                        <th>
                            Período
                        </th>

                        <th>
                            Valor
                        </th>

                        <th>
                            Observação
                        </th>

                    </tr>

                </thead>


                <tbody>

                    <tr>

                        <td>
                            1º Semestre
                        </td>

                        <td>
                            R$ 10.000,00
                        </td>

                        <td>
                            Maio
                        </td>

                    </tr>


                    <tr>

                        <td>
                            2º Semestre
                        </td>

                        <td>
                            R$ 50.000,00
                        </td>

                        <td>
                            Gasto ambiental
                        </td>

                    </tr>

                </tbody>

            </table>

        </div>
    `;
}


/* ==========================================================
   RENDERIZAR PÁGINA
========================================================== */

function renderDescarte(){

    /* ======================================================
       SENHA
    ====================================================== */

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
       LIMPEZA
    ====================================================== */

    destruirGraficosDescarte();

    pararScrollAutomaticoTop10Descarte();


    /* ======================================================
       DADOS GERAIS
    ====================================================== */

    const d =
        dados.descarte || {};


    /* ======================================================
       VALOR ATUAL

       Mantém compatibilidade com seu JSON atual.
    ====================================================== */

    const blocoAtual =
        d.valorAtual &&
        typeof d.valorAtual === "object"
            ? d.valorAtual
            : {};


    const origensAtual =
        Array.isArray(blocoAtual.origens)
            ? blocoAtual.origens
            : (
                Array.isArray(d.origens)
                    ? d.origens
                    : []
            );


    const totalAtual =
        Number(
            blocoAtual.total ??
            d.total ??
            0
        );


    /* ======================================================
       DESCARTADO NO ANO

       Já preparado para receber depois:
       descartadoAno.origens
       descartadoAno.top10
       descartadoAno.total
    ====================================================== */

    const blocoDescartado =
        d.descartadoAno &&
        typeof d.descartadoAno === "object"
            ? d.descartadoAno
            : {};


    const origensDescartado =
    Array.isArray(
        blocoDescartado.origens
    ) &&
    blocoDescartado.origens.length

        ? blocoDescartado.origens

        : (
            Array.isArray(
                d.origensDescartado
            ) &&
            d.origensDescartado.length

                ? d.origensDescartado

                : (
                    Array.isArray(d.origens)
                        ? d.origens
                        : []
                )
        );

    const topDescartado =
        Array.isArray(
            blocoDescartado.top10
        )
            ? [...blocoDescartado.top10]
            : (
                Array.isArray(
                    d.top10Descartado
                )
                    ? [...d.top10Descartado]
                    : (
                        Array.isArray(d.top10)
                            ? [...d.top10]
                            : []
                    )
            );


    topDescartado.sort(
        (a,b) =>
            Number(b.valor || 0) -
            Number(a.valor || 0)
    );


    const totalDescartado =
        Number(
            blocoDescartado.total ??
            d.totalDescartado ??
            d.ultimoDescarte ??
            0
        );


    /* ======================================================
       HTML PRINCIPAL
    ====================================================== */

    conteudo.innerHTML = `

        <section class="pagina-descarte">

            <div class="page-title">

                🗑 DESCARTE

            </div>


            <!-- =============================================
                 CARDS
            ============================================== -->

            <section
                class="cards descarte-indicadores"
            >

                ${card(
                    "🗑",
                    "Valor Atual",
                    moeda(totalAtual),
                    "Aguardando destinação"
                )}


                ${card(
                    "📋",
                    "Descartado no Ano",
                    moeda(totalDescartado),
                    "Operações concluídas"
                )}

            </section>


            <!-- =============================================
                 ABAS INTERNAS
            ============================================== -->

            <section
                class="descarte-abas"
            >

                <button
                    type="button"
                    class="
                        descarte-aba
                        ${
                            abaInternaDescarte ===
                            "atual"
                                ? "ativa"
                                : ""
                        }
                    "
                    onclick="
                        trocarAbaDescarte('atual')
                    "
                >

                    <span>
                        🗑
                    </span>

                    <span>

                        <strong>
                            Valor Atual
                        </strong>

                        <small>
                            Aguardando destinação
                        </small>

                    </span>

                </button>


                <button
                    type="button"
                    class="
                        descarte-aba
                        ${
                            abaInternaDescarte ===
                            "descartado"
                                ? "ativa"
                                : ""
                        }
                    "
                    onclick="
                        trocarAbaDescarte(
                            'descartado'
                        )
                    "
                >

                    <span>
                        📋
                    </span>

                    <span>

                        <strong>
                            Descartado por Ano
                        </strong>

                        <small>
                            Operações concluídas
                        </small>

                    </span>

                </button>

            </section>


            <!-- =============================================
                 CONTEÚDO DAS ABAS
            ============================================== -->

            <section
                id="conteudoInternoDescarte"
                class="descarte-conteudo-interno"
            >

                ${
                    abaInternaDescarte ===
                    "atual"

                        ?

                        `

                        <!-- ===================================
                             VALOR ATUAL
                        ==================================== -->

                        <div
                            class="
                                panel
                                descarte-panel-origens
                                descarte-panel-atual
                            "
                        >

                            <h3
                                class="
                                    descarte-titulo-painel
                                "
                            >

                                📊 Descarte por Origem

                            </h3>


                            <div
                                class="
                                    descarte-chart-barra
                                    descarte-chart-barra-atual
                                "
                            >

                                <canvas
                                    id="graficoDescarteOrigem"
                                ></canvas>

                            </div>


                            <section
                                class="
                                    descarte-top3-area
                                "
                            >

                                <h3
                                    class="
                                        descarte-titulo-top3
                                    "
                                >

                                    Top 3 Origens de Destino

                                </h3>


                                ${
                                    montarTop3Descarte(
                                        origensAtual
                                    )
                                }

                            </section>

                        </div>

                        `

                        :

                        `

                        <!-- ===================================
                             DESCARTADO NO ANO
                        ==================================== -->

                        <section
                            class="
                                descarte-grid-ano
                            "
                        >


                            <!-- COLUNA ESQUERDA -->

                            <div
                                class="
                                    descarte-coluna-ano
                                "
                            >

                                <div
                                    class="
                                        panel
                                        descarte-panel-origens
                                    "
                                >

                                    <h3
                                        class="
                                            descarte-titulo-painel
                                        "
                                    >

                                        📊 Descarte por Origem

                                    </h3>


                                    <div
                                        class="
                                            descarte-chart-barra
                                        "
                                    >

                                        <canvas
                                            id="
                                                graficoDescarteOrigem
                                            "
                                        ></canvas>

                                    </div>


                                    <section
                                        class="
                                            descarte-top3-area
                                        "
                                    >

                                        <h3
                                            class="
                                                descarte-titulo-top3
                                            "
                                        >

                                            Top 3 Origens de Destino

                                        </h3>


                                        ${
                                            montarTop3Descarte(
                                                origensDescartado
                                            )
                                        }

                                    </section>

                                </div>

                            </div>


                            <!-- COLUNA DIREITA -->

                            <div
                                class="
                                    descarte-coluna-ano
                                    descarte-coluna-ano-direita
                                "
                            >


                                <!-- TOP 10 -->

                                <div
                                    class="
                                        panel
                                        descarte-panel-top10
                                    "
                                >

                                    <h3
                                        class="
                                            descarte-titulo-painel
                                            descarte-top10-titulo
                                        "
                                    >

                                        Top 10 Descartados por Produto

                                    </h3>


                                    <div
                                        class="
                                            descarte-top10-scroll
                                        "
                                    >

                                        ${
                                            tabelaFixa(
                                                [
                                                    "SKU",
                                                    "Descrição",
                                                    "Valor"
                                                ],

                                                montarLinhasTopDescarte(
                                                    topDescartado
                                                ),

                                                true
                                            )
                                        }

                                    </div>

                                </div>


                                <!-- AMBIENTAL -->

                                <div
                                    class="
                                        panel
                                        descarte-panel-ambiental
                                    "
                                >

                                    <h3
                                        class="
                                            descarte-titulo-painel
                                        "
                                    >

                                        🌱 Gasto com Ambiental Semestral

                                    </h3>


                                    ${
                                        montarTabelaGastoAmbiental()
                                    }

                                </div>


                            </div>

                        </section>

                        `
                }

            </section>

        </section>
    `;


    /* ======================================================
       CRIAR GRÁFICO DA ABA ATIVA
    ====================================================== */

    if(
        abaInternaDescarte ===
        "atual"
    ){

        criarGraficoDescarteOrigemResumo(
            origensAtual
        );

        return;
    }


    criarGraficoDescarteOrigemResumo(
        origensDescartado
    );


    /*
       Scroll somente no
       Descartado por Ano.
    */

    setTimeout(
        () => {

            iniciarScrollAutomaticoTop10Descarte();

        },
        80
    );
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
