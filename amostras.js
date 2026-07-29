/* ==========================================================
   ABA AMOSTRA
   Arquivo completo: amostras.js
   ========================================================== */

let graficoAmostrasMensalAtual = null;
let graficoBarrasAmostrasAtual = null;
let miniGraficosAmostra = [];


/* ==========================================================
   CONVERSÃO SEGURA DE NÚMEROS

   Aceita:
   10
   "10"
   "10,50"
   "1.250,75"
   ========================================================== */

function numeroAmostraSeguro(valor){

    if(
        valor === null ||
        valor === undefined ||
        valor === ""
    ){
        return 0;
    }

    if(typeof valor === "number"){

        return Number.isFinite(valor)
            ? valor
            : 0;
    }

    let texto = String(valor)
        .trim()
        .replace(/\s/g, "");

    /*
       Formato brasileiro:
       1.250,75
    */

    if(
        texto.includes(".") &&
        texto.includes(",")
    ){
        texto = texto
            .replace(/\./g, "")
            .replace(",", ".");
    }
    else if(texto.includes(",")){

        texto = texto.replace(",", ".");
    }

    const resultado = Number(texto);

    return Number.isFinite(resultado)
        ? resultado
        : 0;
}


/* ==========================================================
   FORMATAÇÃO DE HORAS
   ========================================================== */

function formatarHorasAmostra(valor){

    return numeroAmostraSeguro(valor)
        .toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
}


/* ==========================================================
   IDENTIFICAÇÃO DO SKU
   ========================================================== */

function obterSkuAmostra(item){

    return (
        item?.sku ||
        item?.SKU ||
        item?.codigo ||
        item?.código ||
        item?.nome ||
        "-"
    );
}


/* ==========================================================
   QUANTIDADE DO SKU
   ========================================================== */

function obterQuantidadeAmostra(item){

    return numeroAmostraSeguro(
        item?.quantidade ??
        item?.qtd ??
        item?.valor ??
        item?.total ??
        0
    );
}


/* ==========================================================
   DESTRUIÇÃO SEGURA DOS GRÁFICOS
   ========================================================== */

function destruirGraficosAmostra(){

    if(graficoAmostrasMensalAtual){

        graficoAmostrasMensalAtual.destroy();
        graficoAmostrasMensalAtual = null;
    }

    if(graficoBarrasAmostrasAtual){

        graficoBarrasAmostrasAtual.destroy();
        graficoBarrasAmostrasAtual = null;
    }

    if(Array.isArray(miniGraficosAmostra)){

        miniGraficosAmostra.forEach(grafico => {

            if(grafico){
                grafico.destroy();
            }
        });
    }

    miniGraficosAmostra = [];
}


/* ==========================================================
   CRIAÇÃO DOS MINI GRÁFICOS

   Não apresenta:
   - números sobre as barras;
   - eixos;
   - legendas;
   - tooltip.
   ========================================================== */

function criarMiniGraficoAmostra(
    idCanvas,
    tipo,
    valores,
    cor,
    destacarMaior = false
){

    const canvas =
        document.getElementById(idCanvas);

    if(!canvas){
        return;
    }

    const dadosValidos =
        Array.isArray(valores)
            ? valores.map(numeroAmostraSeguro)
            : [];

    const maiorValor =
        dadosValidos.length > 0
            ? Math.max(...dadosValidos)
            : 0;

    const coresBarras =
        dadosValidos.map(valor => {

            if(
                destacarMaior &&
                valor === maiorValor &&
                valor > 0
            ){
                return "#22c55e";
            }

            return cor;
        });

    const dataset = {

        data: dadosValidos,

        backgroundColor:
            tipo === "bar"
                ? coresBarras
                : "transparent",

        borderColor: cor,

        borderWidth:
            tipo === "line"
                ? 2
                : 0,

        pointRadius: 0,
        pointHoverRadius: 0,

        borderRadius: 2,

        maxBarThickness: 10,

        tension: 0.25,

        fill: false,

        /*
           Impede que o ChartDataLabels global
           escreva números sobre as barras.
        */

        datalabels: {
            display: false
        }
    };

    const grafico = new Chart(
        canvas,
        {
            type: tipo,

            data: {

                labels: dadosValidos.map(
                    (_, indice) => indice + 1
                ),

                datasets: [dataset]
            },

            options: {

                responsive: true,
                maintainAspectRatio: false,

                events: [],

                animation: {
                    duration: 400
                },

                layout: {
                    padding: 0
                },

                plugins: {

                    legend: {
                        display: false
                    },

                    tooltip: {
                        enabled: false
                    },

                    datalabels: {
                        display: false
                    }
                },

                scales: {

                    x: {
                        display: false
                    },

                    y: {
                        display: false,
                        beginAtZero: true
                    }
                }
            }
        }
    );

    miniGraficosAmostra.push(grafico);
}


/* ==========================================================
   FUNÇÃO PRINCIPAL
   ========================================================== */

function renderAmostra(){

    destruirGraficosAmostra();

    const a = dados.amostras || {
        mensal: [],
        top10: [],
        totalHoras: 0
    };

    const mensalCompleto =
        Array.isArray(a.mensal)
            ? a.mensal
            : [];

    const top10 =
        Array.isArray(a.top10)
            ? a.top10
            : [];


    /* ======================================================
       VALORES MENSAIS COMPLETOS
       ====================================================== */

    const valoresAmostrasCompletos =
        mensalCompleto.map(item =>
            numeroAmostraSeguro(item.valor)
        );

    const valoresHorasCompletos =
        mensalCompleto.map(item =>
            numeroAmostraSeguro(item.horas)
        );


    /* ======================================================
       ÚLTIMO MÊS COM DADOS

       Remove apenas os meses zerados que estão depois
       do último mês que possui alguma informação.

       Exemplo:
       Janeiro até julho têm dados.
       Agosto até dezembro estão zerados.
       O gráfico mostrará somente janeiro até julho.
       ====================================================== */

    let ultimoIndiceComDados = -1;

    mensalCompleto.forEach((item, indice) => {

        const quantidade =
            numeroAmostraSeguro(item.valor);

        const horas =
            numeroAmostraSeguro(item.horas);

        if(quantidade > 0 || horas > 0){

            ultimoIndiceComDados = indice;
        }
    });

    const mensalGrafico =
        ultimoIndiceComDados >= 0
            ? mensalCompleto.slice(
                0,
                ultimoIndiceComDados + 1
            )
            : mensalCompleto.slice(0, 1);

    const valoresAmostrasGrafico =
        mensalGrafico.map(item =>
            numeroAmostraSeguro(item.valor)
        );

    const valoresHorasGrafico =
        mensalGrafico.map(item =>
            numeroAmostraSeguro(item.horas)
        );


    /* ======================================================
       TOTAL DE AMOSTRAS
       ====================================================== */

    const totalAno =
        valoresAmostrasCompletos.reduce(
            (soma, valor) => soma + valor,
            0
        );


    /* ======================================================
       TOTAL DE HORAS
       ====================================================== */

    const totalHorasInformado =
        numeroAmostraSeguro(a.totalHoras);

    const totalHorasCalculado =
        valoresHorasCompletos.reduce(
            (soma, valor) => soma + valor,
            0
        );

    const totalHoras =
        totalHorasInformado > 0
            ? totalHorasInformado
            : totalHorasCalculado;


    /* ======================================================
       MÉDIA MENSAL

       Calcula a média somente entre os meses que já
       possuem amostras.
       ====================================================== */

    const mesesComAmostras =
        valoresAmostrasCompletos.filter(
            valor => valor > 0
        );

    const mediaMensal =
        mesesComAmostras.length > 0
            ? totalAno / mesesComAmostras.length
            : 0;


    /* ======================================================
       MELHOR MÊS
       ====================================================== */

    let melhorMes = {
        mes: "-",
        valor: 0
    };

    mensalCompleto.forEach((item, indice) => {

        const valor =
            valoresAmostrasCompletos[indice] || 0;

        if(valor > melhorMes.valor){

            melhorMes = {
                mes: item.mes || "-",
                valor: valor
            };
        }
    });


    /* ======================================================
       RANKING DOS SKUs
       ====================================================== */

    const rankingSku =
        top10
            .map(item => ({

                sku: obterSkuAmostra(item),

                descricao:
                    item?.descricao ||
                    item?.descrição ||
                    "",

                quantidade:
                    obterQuantidadeAmostra(item)
            }))
            .filter(item =>
                item.quantidade > 0
            )
            .sort(
                (a, b) =>
                    b.quantidade - a.quantidade
            )
            .slice(0, 10);

    const skuMaisSolicitado =
        rankingSku[0] || {
            sku: "-",
            quantidade: 0
        };


    /* ======================================================
       TEMPO MÉDIO POR AMOSTRA
       ====================================================== */

    const tempoMedioHoras =
        totalAno > 0
            ? totalHoras / totalAno
            : 0;

    const tempoMedioMinutos =
        tempoMedioHoras * 60;


    /* ======================================================
       HTML DA PÁGINA
       ====================================================== */

    conteudo.innerHTML = `

        <div class="page-title">
            📦 AMOSTRA
        </div>

        <section class="cards amostra-cards-topo">

            ${card(
                "📦",
                "Amostras Solicitadas no Ano",
                numero(totalAno),
                "Total acumulado"
            )}

            ${card(
                "⏱",
                "Total de Horas",
                formatarHorasAmostra(totalHoras),
                "Horas destinadas"
            )}

        </section>

        <section class="grid-2 amostra-graficos-principais">

            <div class="panel amostra-panel-principal">

                <h3>
                    📈 Evolução Mensal de Amostras
                </h3>

                <div class="amostra-chart-principal">

                    <canvas
                        id="graficoAmostrasMensal">
                    </canvas>

                </div>

            </div>

            <div class="panel amostra-panel-principal">

                <h3>
                    Amostras Mais Solicitadas
                </h3>

                <div class="amostra-chart-horizontal">

                    <canvas
                        id="graficoBarrasAmostras">
                    </canvas>

                </div>

            </div>

        </section>

        <section class="amostra-indicadores">

            <div class="panel amostra-indicador-card">

                <div class="amostra-indicador-conteudo">

                    <div class="amostra-indicador-icone">
                        ▦
                    </div>

                    <div>

                        <span class="amostra-indicador-titulo">
                            Média de Amostras/Mês
                        </span>

                        <strong class="amostra-indicador-valor">

                            ${mediaMensal.toLocaleString(
                                "pt-BR",
                                {
                                    minimumFractionDigits: 1,
                                    maximumFractionDigits: 1
                                }
                            )}

                        </strong>

                        <span class="amostra-indicador-subtitulo">
                            Amostras por mês
                        </span>

                    </div>

                </div>

                <div class="amostra-mini-chart">

                    <canvas
                        id="miniMediaAmostras">
                    </canvas>

                </div>

            </div>

            <div class="panel amostra-indicador-card">

                <div class="amostra-indicador-conteudo">

                    <div class="amostra-indicador-icone">
                        🏆
                    </div>

                    <div>

                        <span class="amostra-indicador-titulo">
                            Melhor Mês
                        </span>

                        <strong class="amostra-indicador-valor">

                            ${numero(melhorMes.valor)}

                        </strong>

                        <span class="amostra-indicador-subtitulo">
                            ${melhorMes.mes}
                        </span>

                    </div>

                </div>

                <div class="amostra-mini-chart">

                    <canvas
                        id="miniMelhorMes">
                    </canvas>

                </div>

            </div>

            <div class="panel amostra-indicador-card">

                <div class="amostra-indicador-conteudo">

                    <div class="amostra-indicador-icone">
                        ☆
                    </div>

                    <div>

                        <span class="amostra-indicador-titulo">
                            SKU Mais Solicitado
                        </span>

                        <strong
                            class="
                                amostra-indicador-valor
                                amostra-sku
                            "
                        >

                            ${skuMaisSolicitado.sku}

                        </strong>

                        <span class="amostra-indicador-subtitulo">

                            ${numero(
                                skuMaisSolicitado.quantidade
                            )} amostras

                        </span>

                    </div>

                </div>

                <div class="amostra-mini-chart">

                    <canvas
                        id="miniSku">
                    </canvas>

                </div>

            </div>

            <div class="panel amostra-indicador-card">

                <div class="amostra-indicador-conteudo">

                    <div class="amostra-indicador-icone">
                        ◷
                    </div>

                    <div>

                        <span class="amostra-indicador-titulo">
                            Tempo Médio por Amostra
                        </span>

                        <strong class="amostra-indicador-valor">

                            ${tempoMedioHoras.toLocaleString(
                                "pt-BR",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }
                            )} h

                        </strong>

                        <span class="amostra-indicador-subtitulo">

                            ${tempoMedioMinutos.toLocaleString(
                                "pt-BR",
                                {
                                    minimumFractionDigits: 1,
                                    maximumFractionDigits: 1
                                }
                            )} min por amostra

                        </span>

                    </div>

                </div>

                <div class="amostra-mini-chart">

                    <canvas
                        id="miniTempoAmostra">
                    </canvas>

                </div>

            </div>

        </section>
    `;


    /* ======================================================
       ESCALAS AUTOMÁTICAS DO GRÁFICO MENSAL
       ====================================================== */

    const maiorAmostra =
        Math.max(
            1,
            ...valoresAmostrasGrafico
        );

    const maiorHora =
        Math.max(
            1,
            ...valoresHorasGrafico
        );

    const limiteAmostras =
        Math.ceil(maiorAmostra * 1.35);

    const limiteHoras =
        maiorHora * 1.40;


    /* ======================================================
       RÓTULOS DO GRÁFICO MENSAL

       - não mostra zero;
       - amostra acima da barra;
       - horas mudam de posição quando houver risco
         de sobreposição.
       ====================================================== */

    const pluginRotulosMensais = {

        id: "pluginRotulosMensaisAmostra",

        afterDatasetsDraw(chart){

            const ctx = chart.ctx;

            const metaBarras =
                chart.getDatasetMeta(0);

            const metaLinha =
                chart.getDatasetMeta(1);

            ctx.save();


            /* NÚMEROS DAS AMOSTRAS */

            valoresAmostrasGrafico.forEach(
                (valor, indice) => {

                    if(valor <= 0){
                        return;
                    }

                    const barra =
                        metaBarras.data[indice];

                    if(!barra){
                        return;
                    }

                    ctx.font =
                        "bold 11px Arial";

                    ctx.textAlign =
                        "center";

                    ctx.textBaseline =
                        "bottom";

                    ctx.fillStyle =
                        "#102052";

                    ctx.fillText(
                        numero(valor),
                        barra.x,
                        barra.y - 7
                    );
                }
            );


            /* NÚMEROS DAS HORAS */

            valoresHorasGrafico.forEach(
                (valor, indice) => {

                    if(valor <= 0){
                        return;
                    }

                    const ponto =
                        metaLinha.data[indice];

                    const barra =
                        metaBarras.data[indice];

                    if(!ponto){
                        return;
                    }

                    const distanciaVertical =
                        barra
                            ? Math.abs(
                                ponto.y - barra.y
                            )
                            : 100;

                    /*
                       Quando a linha estiver perto do topo
                       da barra, o valor das horas será
                       colocado abaixo do ponto.
                    */

                    const colocarAbaixo =
                        distanciaVertical < 28 ||
                        ponto.y <
                            chart.chartArea.top + 22;

                    const texto =
                        valor.toLocaleString(
                            "pt-BR",
                            {
                                minimumFractionDigits: 1,
                                maximumFractionDigits: 2
                            }
                        );

                    ctx.font =
                        "bold 10px Arial";

                    ctx.textAlign =
                        "center";

                    ctx.fillStyle =
                        "#c026d3";

                    if(colocarAbaixo){

                        ctx.textBaseline =
                            "top";

                        ctx.fillText(
                            texto,
                            ponto.x,
                            ponto.y + 10
                        );
                    }
                    else{

                        ctx.textBaseline =
                            "bottom";

                        ctx.fillText(
                            texto,
                            ponto.x,
                            ponto.y - 9
                        );
                    }
                }
            );

            ctx.restore();
        }
    };


    /* ======================================================
       GRÁFICO DE EVOLUÇÃO MENSAL
       ====================================================== */

    graficoAmostrasMensalAtual =
        new Chart(
            document.getElementById(
                "graficoAmostrasMensal"
            ),
            {
                type: "bar",

                data: {

                    labels:
                        mensalGrafico.map(
                            item => item.mes
                        ),

                    datasets: [

                        {
                            type: "bar",

                            label: "Amostras",

                            data:
                                valoresAmostrasGrafico,

                            backgroundColor:
                                "#1d4ed8",

                            borderColor:
                                "#1d4ed8",

                            borderWidth: 1,

                            borderRadius: 4,

                            maxBarThickness: 32,

                            categoryPercentage: 0.68,

                            barPercentage: 0.72,

                            yAxisID: "y",

                            order: 2,

                            datalabels: {
                                display: false
                            }
                        },

                        {
                            type: "line",

                            label: "Horas",

                            data:
                                valoresHorasGrafico,

                            borderColor:
                                "#c026d3",

                            backgroundColor:
                                "#c026d3",

                            pointBackgroundColor:
                                "#ffffff",

                            pointBorderColor:
                                "#c026d3",

                            pointBorderWidth: 2,

                            pointRadius: 5,

                            pointHoverRadius: 7,

                            borderWidth: 2,

                            borderDash: [7, 5],

                            tension: 0.20,

                            fill: false,

                            spanGaps: false,

                            yAxisID: "y1",

                            order: 1,

                            datalabels: {
                                display: false
                            }
                        }
                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    interaction: {
                        mode: "index",
                        intersect: false
                    },

                    layout: {
                        padding: {
                            top: 26,
                            right: 8,
                            bottom: 3,
                            left: 3
                        }
                    },

                    plugins: {

                        legend: {

                            display: true,

                            position: "top",

                            align: "center",

                            labels: {

                                usePointStyle: true,

                                boxWidth: 12,

                                padding: 14,

                                color: "#1b2b5c",

                                font: {
                                    size: 10,
                                    weight: "bold"
                                }
                            }
                        },

                        datalabels: {
                            display: false
                        },

                        tooltip: {

                            callbacks: {

                                label(context){

                                    const valor =
                                        numeroAmostraSeguro(
                                            context.raw
                                        );

                                    if(
                                        context.dataset
                                            .yAxisID === "y1"
                                    ){

                                        return (
                                            " Horas: " +
                                            valor.toLocaleString(
                                                "pt-BR",
                                                {
                                                    minimumFractionDigits: 1,
                                                    maximumFractionDigits: 2
                                                }
                                            ) +
                                            " h"
                                        );
                                    }

                                    return (
                                        " Amostras: " +
                                        numero(valor)
                                    );
                                }
                            }
                        }
                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            suggestedMax:
                                limiteAmostras,

                            position: "left",

                            title: {

                                display: true,

                                text:
                                    "Quantidade de amostras",

                                color: "#0f1f4d",

                                font: {
                                    weight: "bold"
                                }
                            },

                            grid: {
                                color:
                                    "rgba(15,31,77,.08)"
                            },

                            ticks: {

                                precision: 0,

                                color: "#5c6c96",

                                callback(valor){

                                    /*
                                       Não apresenta o zero
                                       escrito no eixo.
                                    */

                                    return Number(valor) === 0
                                        ? ""
                                        : numero(valor);
                                }
                            }
                        },

                        y1: {

                            beginAtZero: true,

                            suggestedMax:
                                limiteHoras,

                            position: "right",

                            title: {

                                display: true,

                                text: "Horas",

                                color: "#c026d3",

                                font: {
                                    weight: "bold"
                                }
                            },

                            grid: {
                                drawOnChartArea: false
                            },

                            ticks: {

                                color: "#c026d3",

                                callback(valor){

                                    return Number(valor) === 0
                                        ? ""
                                        : Number(valor)
                                            .toLocaleString(
                                                "pt-BR",
                                                {
                                                    maximumFractionDigits: 1
                                                }
                                            );
                                }
                            }
                        },

                        x: {

                            offset: true,

                            grid: {
                                display: false
                            },

                            ticks: {

                                color: "#5c6c96",

                                autoSkip: false,

                                maxRotation: 0,

                                minRotation: 0,

                                font: {
                                    size: 10,
                                    weight: "bold"
                                }
                            }
                        }
                    }
                },

                plugins: [
                    pluginRotulosMensais
                ]
            }
        );


    /* ======================================================
       GRÁFICO HORIZONTAL DOS SKUs

       Não possui:
       - linha de Pareto;
       - percentual acumulado;
       - segundo eixo.
       ====================================================== */

    const maiorQuantidadeSku =
        Math.max(
            1,
            ...rankingSku.map(
                item => item.quantidade
            )
        );

    const limiteSku =
        Math.ceil(
            maiorQuantidadeSku * 1.20
        );

    const pluginRotulosSku = {

        id: "pluginRotulosSkuAmostra",

        afterDatasetsDraw(chart){

            const ctx = chart.ctx;

            const meta =
                chart.getDatasetMeta(0);

            ctx.save();

            meta.data.forEach(
                (barra, indice) => {

                    const item =
                        rankingSku[indice];

                    if(
                        !item ||
                        item.quantidade <= 0
                    ){
                        return;
                    }

                    ctx.font =
                        "bold 10px Arial";

                    ctx.textAlign =
                        "left";

                    ctx.textBaseline =
                        "middle";

                    ctx.fillStyle =
                        "#172653";

                    ctx.fillText(
                        numero(item.quantidade),
                        barra.x + 6,
                        barra.y
                    );
                }
            );

            ctx.restore();
        }
    };

    graficoBarrasAmostrasAtual =
        new Chart(
            document.getElementById(
                "graficoBarrasAmostras"
            ),
            {
                type: "bar",

                data: {

                    labels:
                        rankingSku.map(
                            item => item.sku
                        ),

                    datasets: [

                        {
                            label: "Quantidade",

                            data:
                                rankingSku.map(
                                    item =>
                                        item.quantidade
                                ),

                            backgroundColor:
                                "#1d4ed8",

                            borderColor:
                                "#1d4ed8",

                            borderWidth: 1,

                            borderRadius: 3,

                            maxBarThickness: 18,

                            categoryPercentage: 0.72,

                            barPercentage: 0.82,

                            datalabels: {
                                display: false
                            }
                        }
                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    indexAxis: "y",

                    interaction: {
                        mode: "nearest",
                        intersect: false
                    },

                    layout: {
                        padding: {
                            top: 3,
                            right: 35,
                            bottom: 0,
                            left: 3
                        }
                    },

                    plugins: {

                        legend: {

                            display: true,

                            position: "top",

                            align: "center",

                            labels: {

                                usePointStyle: true,

                                boxWidth: 12,

                                padding: 12,

                                color: "#172653",

                                font: {
                                    size: 10,
                                    weight: "bold"
                                }
                            }
                        },

                        datalabels: {
                            display: false
                        },

                        tooltip: {

                            callbacks: {

                                title(context){

                                    const indice =
                                        context[0]
                                            .dataIndex;

                                    const item =
                                        rankingSku[indice];

                                    if(!item){
                                        return "";
                                    }

                                    return item.descricao
                                        ? (
                                            item.sku +
                                            " - " +
                                            item.descricao
                                        )
                                        : item.sku;
                                },

                                label(context){

                                    return (
                                        " Quantidade: " +
                                        numero(context.raw)
                                    );
                                }
                            }
                        }
                    },

                    scales: {

                        y: {

                            grid: {
                                display: false
                            },

                            border: {
                                display: false
                            },

                            ticks: {

                                autoSkip: false,

                                color: "#172653",

                                padding: 5,

                                font: {
                                    size: 10,
                                    weight: "bold"
                                }
                            },

                            title: {

                                display: true,

                                text: "SKU",

                                color: "#172653",

                                font: {
                                    size: 10,
                                    weight: "bold"
                                }
                            }
                        },

                        x: {

                            beginAtZero: true,

                            suggestedMax:
                                limiteSku,

                            grid: {
                                color:
                                    "rgba(15,31,77,.08)"
                            },

                            border: {
                                display: false
                            },

                            ticks: {

                                precision: 0,

                                color: "#5c6c96",

                                callback(valor){

                                    return Number(valor) === 0
                                        ? ""
                                        : numero(valor);
                                }
                            },

                            title: {

                                display: true,

                                text:
                                    "Quantidade de amostras",

                                color: "#172653",

                                font: {
                                    size: 10,
                                    weight: "bold"
                                }
                            }
                        }
                    }
                },

                plugins: [
                    pluginRotulosSku
                ]
            }
        );


    /* ======================================================
       MINI GRÁFICOS INFERIORES

       Somente barras e linha.
       Sem números sobre os gráficos.
       ====================================================== */

    criarMiniGraficoAmostra(
        "miniMediaAmostras",
        "bar",
        valoresAmostrasGrafico,
        "#3b82f6"
    );

    criarMiniGraficoAmostra(
        "miniMelhorMes",
        "bar",
        valoresAmostrasGrafico,
        "#3b82f6",
        true
    );

    criarMiniGraficoAmostra(
        "miniSku",
        "bar",
        rankingSku.map(
            item => item.quantidade
        ),
        "#3b82f6"
    );

    criarMiniGraficoAmostra(
        "miniTempoAmostra",
        "line",
        valoresHorasGrafico,
        "#2563eb"
    );
}
