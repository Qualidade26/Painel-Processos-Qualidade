
/* ==========================================================
   PÁGINA — INSPEÇÃO DE IMPORTAÇÃO
========================================================== */


/* ==========================================================
   INSTÂNCIAS DOS GRÁFICOS
========================================================== */
let graficoMensalImportacao = null;
let graficoSkuImportacao = null;
let abaInternaImportacao = "resumo";


/* ==========================================================
   CONVERSÃO DOS VALORES DOS GRÁFICOS
========================================================== */

function valorGraficoImportacao(valor) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return null;
    }

    let valorNormalizado =
        String(valor).trim();


    /*
    ----------------------------------------------------------
    Formatos aceitos:

    10,5       → 10.5
    10.5       → 10.5
    1.250,50   → 1250.50
    1,250.50   → 1250.50
    ----------------------------------------------------------
    */

    if (
        valorNormalizado.includes(".") &&
        valorNormalizado.includes(",")
    ) {

        const ultimoPonto =
            valorNormalizado.lastIndexOf(".");

        const ultimaVirgula =
            valorNormalizado.lastIndexOf(",");


        if (ultimaVirgula > ultimoPonto) {

            valorNormalizado =
                valorNormalizado
                    .replace(/\./g, "")
                    .replace(",", ".");

        } else {

            valorNormalizado =
                valorNormalizado.replace(/,/g, "");
        }

    } else if (
        valorNormalizado.includes(",")
    ) {

        valorNormalizado =
            valorNormalizado.replace(",", ".");
    }


    const numeroConvertido =
        Number(valorNormalizado);


    if (
        !Number.isFinite(numeroConvertido) ||
        numeroConvertido === 0
    ) {
        return null;
    }


    return numeroConvertido;
}


/* ==========================================================
   VERIFICA SE O VALOR É VÁLIDO
========================================================== */

function possuiValorImportacao(valor) {

    return (
        valor !== null &&
        valor !== undefined &&
        valor !== "" &&
        Number.isFinite(Number(valor)) &&
        Number(valor) !== 0
    );
}


/* ==========================================================
   ESCAPA TEXTOS PARA EVITAR HTML INDESEJADO
========================================================== */

function escaparTextoImportacao(valor) {

    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ==========================================================
   FORMATAÇÃO DAS HORAS
========================================================== */

function formatarHorasImportacao(valor) {

    const horas =
        valorGraficoImportacao(valor);


    if (horas === null) {
        return "0";
    }


    return horas.toLocaleString(
        "pt-BR",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    );
}

/* ==========================================================
   PLUGIN LOCAL — RÓTULOS CENTRALIZADOS NAS BARRAS MENSAIS
========================================================== */

const rotulosBarrasMensaisImportacao = {

    id: "rotulosBarrasMensaisImportacao",

    afterDatasetsDraw(chart) {

        const { ctx, chartArea } = chart;

        if (!chartArea) {
            return;
        }

        ctx.save();

        chart.data.datasets.forEach(
            (dataset, datasetIndex) => {

                /*
                --------------------------------------------------
                Exibe valores somente nas barras.
                A linha de horas não recebe rótulo aqui.
                --------------------------------------------------
                */

                if (dataset.type !== "bar") {
                    return;
                }

                const meta =
                    chart.getDatasetMeta(datasetIndex);

                if (
                    !meta ||
                    meta.hidden
                ) {
                    return;
                }

                meta.data.forEach(
                    (elemento, indice) => {

                        const valor =
                            dataset.data[indice];

                        if (
                            !possuiValorImportacao(valor) ||
                            !elemento ||
                            !Number.isFinite(elemento.x) ||
                            !Number.isFinite(elemento.y)
                        ) {
                            return;
                        }

                        const texto =
                            Number(valor)
                                .toLocaleString("pt-BR");

                        /*
                        --------------------------------------------------
                        elemento.x já é o centro exato da barra.
                        elemento.y é o topo da barra.
                        --------------------------------------------------
                        */

                        const posicaoX =
                            elemento.x;

                        const posicaoY =
                            Math.max(
                                elemento.y - 5,
                                chartArea.top + 10
                            );

                        ctx.font =
                            "700 10px 'Segoe UI', Arial, sans-serif";

                        ctx.fillStyle =
                            "#10245c";

                        ctx.textAlign =
                            "center";

                        ctx.textBaseline =
                            "bottom";

                        ctx.fillText(
                            texto,
                            posicaoX,
                            posicaoY
                        );
                    }
                );
            }
        );

        ctx.restore();
    }
};
/* ==========================================================
   PLUGIN LOCAL — VALORES DO GRÁFICO HORIZONTAL
========================================================== */

const rotulosGraficoSkuImportacao = {

    id: "rotulosGraficoSkuImportacao",

    afterDatasetsDraw(chart) {

        const { ctx, chartArea } = chart;

        const dataset =
            chart.data.datasets[0];

        const meta =
            chart.getDatasetMeta(0);


        if (
            !dataset ||
            !meta ||
            meta.hidden ||
            !chartArea
        ) {
            return;
        }


        ctx.save();

        ctx.font =
            "800 11px Arial";

        ctx.fillStyle =
            "#10245c";

        ctx.textAlign =
            "left";

        ctx.textBaseline =
            "middle";


        meta.data.forEach(
            (elemento, indice) => {

                const valor =
                    dataset.data[indice];


                if (
                    !possuiValorImportacao(valor) ||
                    !elemento ||
                    !Number.isFinite(elemento.x) ||
                    !Number.isFinite(elemento.y)
                ) {
                    return;
                }


                const texto =
                    Number(valor)
                        .toLocaleString("pt-BR");


                const larguraTexto =
                    ctx.measureText(texto).width;


                let posicaoX =
                    elemento.x + 8;


                if (
                    posicaoX + larguraTexto >
                    chartArea.right
                ) {

                    posicaoX =
                        chartArea.right -
                        larguraTexto -
                        4;
                }


                ctx.fillText(
                    texto,
                    posicaoX,
                    elemento.y
                );
            }
        );


        ctx.restore();
    }
};


/* ==========================================================
   DESTRUIÇÃO DOS GRÁFICOS
========================================================== */

function destruirGraficosImportacao(){

    if(graficoMensalImportacao){
        graficoMensalImportacao.destroy();
        graficoMensalImportacao = null;
    }

    if(graficoSkuImportacao){
        graficoSkuImportacao.destroy();
        graficoSkuImportacao = null;
    }

    const canvasMensal =
        document.getElementById("graficoImportacao");

    const canvasSku =
        document.getElementById("graficoSkuImportacao");

    if(canvasMensal){

        const instanciaMensal =
            Chart.getChart(canvasMensal);

        if(instanciaMensal){
            instanciaMensal.destroy();
        }
    }

    if(canvasSku){

        const instanciaSku =
            Chart.getChart(canvasSku);

        if(instanciaSku){
            instanciaSku.destroy();
        }
    }
}

/* ==========================================================
   RENDERIZAÇÃO DA PÁGINA
========================================================== */

function renderImportacao() {

    destruirGraficosImportacao();

    const imp = obterDadosImportacao();

    conteudo.innerHTML = `
        <div class="pagina-importacao">
            <div class="page-title">
                📦 INSPEÇÃO DE IMPORTAÇÃO
            </div>

            <section class="cards importacao-cards">
                ${card("📋", "Processos por Ano", numero(imp.processosAno), "Quantidade de processos")}
                ${card("🏷️", "Total de SKU", numero(imp.totalSku), "SKUs inspecionados")}
                ${card("📦", "Total de Lotes", numero(imp.totalLotes), "Lotes controlados")}
                ${card("📄", "Laudos Emitidos", numero(imp.laudosEmitidos), "Registros emitidos")}
                ${card("⏱️", "Total de Horas", formatarHorasImportacao(imp.totalHoras), "Horas da atividade")}
            </section>

            <nav class="importacao-abas" aria-label="Abas da Importação">
                <button
                    type="button"
                    id="botaoAbaResumoImportacao"
                    class="importacao-aba"
                    onclick="abrirAbaInternaImportacao('resumo')"
                >
                    <span class="importacao-aba-icone">📊</span>
                    Indicador de Importação
                </button>

                <button
                    type="button"
                    id="botaoAbaFluxoImportacao"
                    class="importacao-aba"
                    onclick="abrirAbaInternaImportacao('fluxo')"
                >
                    <span class="importacao-aba-icone">📋</span>
                    Fluxo de Inspeção Semanal
                </button>
            </nav>

            <div id="conteudoInternoImportacao"></div>
        </div>
    `;

    abrirAbaInternaImportacao(
        abaInternaImportacao
    );
}


function obterDadosImportacao() {

    return dados.importacao || {
        processosAno: 0,
        totalSku: 0,
        totalLotes: 0,
        laudosEmitidos: 0,
        totalHoras: 0,
        mensal: [],
        graficoSku: [],
        paretoSku: [],
        fluxo: []
    };
}


function abrirAbaInternaImportacao(aba) {

    abaInternaImportacao =
        aba === "fluxo"
            ? "fluxo"
            : "resumo";

    destruirGraficosImportacao();

    const botaoResumo =
        document.getElementById(
            "botaoAbaResumoImportacao"
        );

    const botaoFluxo =
        document.getElementById(
            "botaoAbaFluxoImportacao"
        );

    if (botaoResumo) {
        botaoResumo.classList.toggle(
            "ativa",
            abaInternaImportacao === "resumo"
        );
    }

    if (botaoFluxo) {
        botaoFluxo.classList.toggle(
            "ativa",
            abaInternaImportacao === "fluxo"
        );
    }

    if (abaInternaImportacao === "fluxo") {
        renderFluxoSemanalImportacao();
        return;
    }

    renderResumoImportacao();
}


/* ==========================================================
   RESUMO — IMPORTAÇÃO
========================================================== */

function renderResumoImportacao() {

    const imp = obterDadosImportacao();

    const area =
        document.getElementById(
            "conteudoInternoImportacao"
        );

    if (!area) {
        return;
    }


    area.innerHTML = `

        <!-- ================================================
             EVOLUÇÃO MENSAL
        ================================================= -->

        <section
            id="painelEvolucaoImportacao"
            class="
                panel
                importacao-panel-mensal
                importacao-evolucao-expandida
            "
        >

            <h3 class="importacao-panel-titulo">
                📊 Evolução Mensal da Inspeção de Importação
            </h3>

            <div class="chart-box chart-box-importacao">

                <canvas id="graficoImportacao"></canvas>

            </div>

        </section>


        <!-- ================================================
             BOTÃO / LEGENDA DO RANKING
        ================================================= -->

        <button
            type="button"
            id="botaoAbrirRankingImportacao"
            class="importacao-ranking-toggle"
            onclick="abrirRankingImportacao()"
        >

            <span>
                📊 Ranking por SKU
            </span>

            <span class="importacao-ranking-seta">
                ▼
            </span>

        </button>


        <!-- ================================================
             RANKING POR SKU
        ================================================= -->

        <section
            id="painelRankingImportacao"
            class="
                panel
                importacao-panel-sku
                importacao-ranking-completo
                importacao-ranking-oculto
            "
        >

            <button
                type="button"
                class="importacao-ranking-fechar"
                onclick="fecharRankingImportacao()"
                aria-label="Fechar Ranking por SKU"
                title="Fechar ranking"
            >
                ✕
            </button>


            <h3 class="importacao-panel-titulo">
                📊 Ranking por SKU
            </h3>


            <div class="chart-box chart-box-sku-importacao">

                <canvas id="graficoSkuImportacao"></canvas>

            </div>

        </section>


        <div class="importacao-aviso-zero">

            <span class="importacao-aviso-icone">
                ⓘ
            </span>

            Os valores zerados não são exibidos nos gráficos.
            Apenas valores maiores que zero são apresentados.

        </div>
    `;


    /*
       ------------------------------------------------------
       Na abertura da página criamos somente o gráfico mensal.

       O Ranking será criado somente quando o usuário abrir.
       ------------------------------------------------------
    */

    criarGraficoMensalImportacao(imp);
}
/* ==========================================================
   ABRIR RANKING POR SKU
========================================================== */

function abrirRankingImportacao() {

    const pagina =
        document.querySelector(
            ".pagina-importacao"
        );

    const painelEvolucao =
        document.getElementById(
            "painelEvolucaoImportacao"
        );

    const painelRanking =
        document.getElementById(
            "painelRankingImportacao"
        );

    const botaoAbrir =
        document.getElementById(
            "botaoAbrirRankingImportacao"
        );


    if (
        !painelEvolucao ||
        !painelRanking
    ) {
        return;
    }


    /* Diminui evolução */

    painelEvolucao.classList.remove(
        "importacao-evolucao-expandida"
    );

    painelEvolucao.classList.add(
        "importacao-evolucao-reduzida"
    );


    /* Mostra ranking */

    painelRanking.classList.remove(
        "importacao-ranking-oculto"
    );

    painelRanking.classList.add(
        "importacao-ranking-visivel"
    );


    /* Esconde a barra */

    if (botaoAbrir) {
        botaoAbrir.style.display = "none";
    }


    if (pagina) {
        pagina.classList.add(
            "ranking-importacao-aberto"
        );
    }


    /*
       Cria o ranking somente agora.
    */

    if (!graficoSkuImportacao) {

        criarGraficoSkuImportacao(
            obterDadosImportacao()
        );
    }


    /*
       Aguarda a animação do CSS antes
       de recalcular o Chart.js.
    */

    setTimeout(() => {

        if (graficoMensalImportacao) {
            graficoMensalImportacao.resize();
        }

        if (graficoSkuImportacao) {
            graficoSkuImportacao.resize();
        }

    }, 320);
}


/* ==========================================================
   FECHAR RANKING POR SKU
========================================================== */

function fecharRankingImportacao() {

    const pagina =
        document.querySelector(
            ".pagina-importacao"
        );

    const painelEvolucao =
        document.getElementById(
            "painelEvolucaoImportacao"
        );

    const painelRanking =
        document.getElementById(
            "painelRankingImportacao"
        );

    const botaoAbrir =
        document.getElementById(
            "botaoAbrirRankingImportacao"
        );


    if (
        !painelEvolucao ||
        !painelRanking
    ) {
        return;
    }


    /* Esconde ranking */

    painelRanking.classList.remove(
        "importacao-ranking-visivel"
    );

    painelRanking.classList.add(
        "importacao-ranking-oculto"
    );


    /* Evolução volta a ficar grande */

    painelEvolucao.classList.remove(
        "importacao-evolucao-reduzida"
    );

    painelEvolucao.classList.add(
        "importacao-evolucao-expandida"
    );


    /* Barra do ranking volta */

    if (botaoAbrir) {
        botaoAbrir.style.display = "";
    }


    if (pagina) {
        pagina.classList.remove(
            "ranking-importacao-aberto"
        );
    }


    /*
       Podemos destruir o Ranking enquanto
       estiver fechado.

       Isso evita manter um Chart.js oculto.
    */

    if (graficoSkuImportacao) {

        graficoSkuImportacao.destroy();

        graficoSkuImportacao = null;
    }


    setTimeout(() => {

        if (graficoMensalImportacao) {
            graficoMensalImportacao.resize();
        }

    }, 320);
}
function renderFluxoSemanalImportacao() {

    const imp = obterDadosImportacao();
    const area =
        document.getElementById(
            "conteudoInternoImportacao"
        );

    if (!area) {
        return;
    }

    area.innerHTML = `
        <section class="panel importacao-panel-fluxo importacao-fluxo-semanal">
            <div class="importacao-fluxo-cabecalho">
                <h3 class="importacao-panel-titulo">
                    📋 Fluxo de Inspeção Semanal
                </h3>
            </div>

            <div class="importacao-tabela-wrap">
                ${montarTabelaFluxoImportacao(
                    imp.fluxo || []
                )}
            </div>
        </section>
    `;
}
/* ==========================================================
   GRÁFICO — EVOLUÇÃO MENSAL
========================================================== */

function criarGraficoMensalImportacao(imp) {

    const mensal =
        Array.isArray(imp.mensal)
            ? imp.mensal
            : [];


    const canvas =
        document.getElementById(
            "graficoImportacao"
        );


    if (!canvas) {

        console.error(
            "Canvas graficoImportacao não encontrado."
        );

        return;
    }


    if (typeof Chart === "undefined") {

        console.error(
            "Chart.js não foi carregado."
        );

        return;
    }


    /* ======================================================
       PREPARAÇÃO DOS DADOS
    ====================================================== */

    const meses =
        mensal.map(item =>
            item.mes || ""
        );


    const processos =
        mensal.map(item =>
            valorGraficoImportacao(
                item.processos
            )
        );


    const sku =
        mensal.map(item =>
            valorGraficoImportacao(
                item.sku
            )
        );


    const lotes =
        mensal.map(item =>
            valorGraficoImportacao(
                item.lotes
            )
        );


    const laudos =
        mensal.map(item =>
            valorGraficoImportacao(
                item.laudos
            )
        );


    const horas =
        mensal.map(item =>
            valorGraficoImportacao(
                item.horas
            )
        );


    /* ======================================================
       REMOVE INSTÂNCIAS ANTERIORES
    ====================================================== */

    if (graficoMensalImportacao) {

        graficoMensalImportacao.destroy();
        graficoMensalImportacao = null;
    }


    const graficoExistente =
        Chart.getChart(canvas);


    if (graficoExistente) {
        graficoExistente.destroy();
    }


    /* ======================================================
       CRIAÇÃO DO GRÁFICO
    ====================================================== */

    graficoMensalImportacao =
        new Chart(
            canvas,
            {

                plugins: [
                    rotulosBarrasMensaisImportacao
                ],


                data: {

                    labels: meses,


                    datasets: [

                        /* ==================================
                           PROCESSOS
                        ================================== */

                        {
                            type: "bar",

                            label: "Processos",

                            data: processos,

                            backgroundColor:
                                "#1d4ed8",

                            borderColor:
                                "#1d4ed8",

                            borderWidth: 1,

                            borderRadius: 4,

                            borderSkipped: false,

                            categoryPercentage: 0.72,

                            barPercentage: 0.84,

                            maxBarThickness: 25,

                            yAxisID: "y",

                            order: 2,

                            skipNull: true
                        },


                        /* ==================================
                           SKU
                        ================================== */

                        {
                            type: "bar",

                            label: "SKU",

                            data: sku,

                            backgroundColor:
                                "rgba(236, 72, 153, 0.62)",

                            borderColor:
                                "#ec4899",

                            borderWidth: 1.5,

                            borderRadius: 4,

                            borderSkipped: false,

                            categoryPercentage: 0.72,

                            barPercentage: 0.84,

                            maxBarThickness: 25,

                            yAxisID: "y",

                            order: 2,

                            skipNull: true
                        },


                        /* ==================================
                           LOTES
                        ================================== */

                        {
                            type: "bar",

                            label: "Lotes",

                            data: lotes,

                            backgroundColor:
                                "rgba(34, 197, 94, 0.54)",

                            borderColor:
                                "#22c55e",

                            borderWidth: 1.5,

                            borderRadius: 4,

                            borderSkipped: false,

                            categoryPercentage: 0.72,

                            barPercentage: 0.84,

                            maxBarThickness: 25,

                            yAxisID: "y",

                            order: 2,

                            skipNull: true
                        },


                        /* ==================================
                           LAUDOS
                        ================================== */

                        {
                            type: "bar",

                            label: "Laudos",

                            data: laudos,

                            backgroundColor:
                                "rgba(139, 92, 246, 0.52)",

                            borderColor:
                                "#7c3aed",

                            borderWidth: 1.5,

                            borderRadius: 4,

                            borderSkipped: false,

                            categoryPercentage: 0.72,

                            barPercentage: 0.84,

                            maxBarThickness: 25,

                            yAxisID: "y",

                            order: 2,

                            skipNull: true
                        },


                        /* ==================================
                           HORAS
                        ================================== */

                        {
                            type: "line",

                            label: "Horas",

                            data: horas,

                            borderColor:
                                "#f97316",

                            backgroundColor:
                                "#f97316",

                            pointBackgroundColor:
                                "#f97316",

                            pointBorderColor:
                                "#ffffff",

                            pointBorderWidth: 2,

                            pointRadius(context) {

                                return possuiValorImportacao(
                                    context.raw
                                )
                                    ? 4
                                    : 0;
                            },

                            pointHoverRadius(context) {

                                return possuiValorImportacao(
                                    context.raw
                                )
                                    ? 6
                                    : 0;
                            },

                            pointHitRadius(context) {

                                return possuiValorImportacao(
                                    context.raw
                                )
                                    ? 10
                                    : 0;
                            },

                            borderWidth: 2.5,

                            tension: 0.35,

                            cubicInterpolationMode:
                                "monotone",

                            spanGaps: false,

                            yAxisID: "y1",

                            order: 1
                        }
                    ]
                },


                options: {

                    responsive: true,

                    maintainAspectRatio: false,


                    /* ======================================
                       ESPAÇAMENTO INTERNO
                    ====================================== */


  layout: {

    padding: {

        top: 0,

        right: 12,

        bottom: 0,

        left: 12
    }
},
                    /* ======================================
                       INTERAÇÃO
                    ====================================== */

                    interaction: {

                        mode: "index",

                        intersect: false
                    },


                    /* ======================================
                       PLUGINS
                    ====================================== */

                    plugins: {


                        /*
                        Desliga o plugin global de valores.
                        */

                        valorFlutuante: false,


                        /*
                        Evita duplicação com ChartDataLabels.
                        */

                        datalabels: {

                            display: false
                        },


                        /* ==================================
                           LEGENDA
                        ================================== */

                    legend: {

    display: true,

    position: "top",

    align: "center",

    fullSize: false,

    labels: {

        boxWidth: 18,

        boxHeight: 8,

        padding: 8,

        usePointStyle: true,

        pointStyle: "circle",

        color: "#374151",

        font: {

            size: 11,

            weight: "600"
        }
    }
},


                        /* ==================================
                           TOOLTIP
                        ================================== */

                        tooltip: {

                            enabled: true,

                            mode: "index",

                            intersect: false,

                            filter(context) {

                                return possuiValorImportacao(
                                    context.raw
                                );
                            },

                            callbacks: {

                                label(context) {

                                    const valor =
                                        context.raw;


                                    if (
                                        !possuiValorImportacao(
                                            valor
                                        )
                                    ) {
                                        return "";
                                    }


                                    const nome =
                                        context.dataset.label ||
                                        "";


                                    if (nome === "Horas") {

                                        return (
                                            `${nome}: ` +
                                            `${formatarHorasImportacao(valor)} h`
                                        );
                                    }


                                    return (
                                        `${nome}: ` +
                                        `${Number(valor)
                                            .toLocaleString("pt-BR")}`
                                    );
                                }
                            }
                        }
                    },


                    /* ======================================
                       ESCALAS
                    ====================================== */

                    scales: {


                        /* ==================================
                           EIXO HORIZONTAL
                        ================================== */

                        x: {

                            stacked: false,

                            offset: true,

                            grid: {

                                display: false,

                                drawBorder: false
                            },

                            border: {

                                color:
                                    "rgba(148, 163, 184, 0.38)"
                            },

                            ticks: {

                                autoSkip: false,

                                maxRotation: 0,

                                minRotation: 0,

                                color: "#4b5563",

                                padding: 8,

                                font: {

                                    size: 10,

                                    weight: "500"
                                }
                            }
                        },


                        /* ==================================
                           EIXO DE QUANTIDADES
                        ================================== */

                     y:{

    beginAtZero:true,

    suggestedMax:200,

    grace:"10%",

    position: "left",

    grace: 0,
                            title: {

                                display: true,

                                text: "Quantidade",

                                color: "#4b5563",

                                font: {

                                    size: 11,

                                    weight: "600"
                                }
                            },

                            grid: {

                                color:
                                    "rgba(148, 163, 184, 0.22)",

                                drawBorder: false
                            },

                            border: {

                                display: false
                            },

                            ticks: {

                                precision: 0,

                                color: "#4b5563",

                                padding: 6,

                                font: {

                                    size: 10
                                },

                                callback(valor) {

                                    return Number(valor)
                                        .toLocaleString(
                                            "pt-BR"
                                        );
                                }
                            }
                        },


                        /* ==================================
                           EIXO DE HORAS
                        ================================== */

                       y1:{

    beginAtZero:true,

    suggestedMax:180,

    grace:"10%",

                            position: "right",

                            title: {

                                display: true,

                                text: "Horas",

                                color: "#4b5563",

                                font: {

                                    size: 11,

                                    weight: "600"
                                }
                            },

                            grid: {

                                drawOnChartArea: false,

                                drawBorder: false
                            },

                            border: {

                                display: false
                            },

                            ticks: {

                                stepSize: 20,

                                color: "#4b5563",

                                padding: 6,

                                font: {

                                    size: 10
                                },

                                callback(valor) {

                                    return Number(valor)
                                        .toLocaleString(
                                            "pt-BR",
                                            {
                                                maximumFractionDigits: 1
                                            }
                                        );
                                }
                            }
                        }
                    },


                    /* ======================================
                       ANIMAÇÃO
                    ====================================== */

                    animation: {

                        duration: 500
                    }
                }
            }
        );
}
/* ==========================================================
   GRÁFICO — QUANTIDADE em unidade Recebida POR SKU
   BARRAS HORIZONTAIS — MAIOR PARA MENOR
========================================================== */

function criarGraficoSkuImportacao(imp) {

    const dadosSkuOriginais =
        Array.isArray(imp.graficoSku)
            ? imp.graficoSku
            : Array.isArray(imp.paretoSku)
                ? imp.paretoSku
                : [];


    /* ======================================================
       NORMALIZAÇÃO DOS DADOS
    ====================================================== */

    const dadosSku =
        dadosSkuOriginais

            .map(item => {

                const quantidade =
                    valorGraficoImportacao(
                        item.quantidade
                    );

                return {

                    sku:
                        escaparTextoImportacao(
                            item.sku ||
                            "Sem identificação"
                        ),

                    descricao:
                        escaparTextoImportacao(
                            item.descricao ||
                            "Sem descrição"
                        ),

                    quantidade:
                        quantidade === null
                            ? 0
                            : quantidade
                };
            })

            /*
            --------------------------------------------------
            Remove valores zerados.
            --------------------------------------------------
            */

            .filter(item =>
                item.quantidade > 0
            )

            /*
            --------------------------------------------------
            Ordena do maior para o menor.
            --------------------------------------------------
            */

            .sort(
                (a, b) =>
                    b.quantidade -
                    a.quantidade
            )

            /*
            --------------------------------------------------
            Exibe no máximo 10 SKUs.
            --------------------------------------------------
            */

            .slice(0, 10);


    const canvas =
        document.getElementById(
            "graficoSkuImportacao"
        );


    if (!canvas) {

        console.error(
            "Canvas graficoSkuImportacao não encontrado."
        );

        return;
    }


    if (typeof Chart === "undefined") {

        console.error(
            "Chart.js não foi carregado."
        );

        return;
    }


    /* ======================================================
       REMOVE INSTÂNCIAS ANTERIORES
    ====================================================== */

    if (graficoSkuImportacao) {

        graficoSkuImportacao.destroy();
        graficoSkuImportacao = null;
    }


    const graficoExistente =
        Chart.getChart(canvas);


    if (graficoExistente) {
        graficoExistente.destroy();
    }


    /* ======================================================
       DADOS FINAIS
    ====================================================== */

    const labels =
        dadosSku.map(item =>
            item.sku
        );


    const quantidades =
        dadosSku.map(item =>
            item.quantidade
        );


    /* ======================================================
       CRIAÇÃO DO GRÁFICO HORIZONTAL
    ====================================================== */

    graficoSkuImportacao =
        new Chart(
            canvas,
            {

                type: "bar",


                plugins: [
                    rotulosGraficoSkuImportacao
                ],


                data: {

                    labels: labels,


                    datasets: [

                        {
                            label:
                                "Quantidade em unidade Recebida",

                            data:
                                quantidades,

                            backgroundColor:
                                "rgba(29, 78, 216, 0.82)",

                            borderColor:
                                "#1d4ed8",

                            borderWidth:1,

                            borderRadius:5,

                            borderSkipped:false,

                            barThickness:18,

                            maxBarThickness:22,

                            minBarLength:3,

                            _ocultarZero:true
                        }
                    ]
                },


                options: {

                    responsive:true,

                    maintainAspectRatio:false,

                    /*
                    --------------------------------------------------
                    Transforma as barras em horizontais.
                    --------------------------------------------------
                    */

                    indexAxis:"y",


                    /* ======================================
                       ESPAÇAMENTO INTERNO
                    ====================================== */

                    layout: {

                        padding: {

                            top:4,

                            right:85,

                            bottom:0,

                            left:0
                        }
                    },


                    /* ======================================
                       INTERAÇÃO
                    ====================================== */

                    interaction: {

                        mode:"nearest",

                        axis:"y",

                        intersect:false
                    },


                    /* ======================================
                       PLUGINS
                    ====================================== */

                    plugins: {

                        valorFlutuante:false,


                        datalabels: {

                            display:false
                        },


                        legend: {

                            display:false
                        },


                        tooltip: {

                            enabled:true,

                            displayColors:false,

                            callbacks: {


                                title(contextos) {

                                    if (
                                        !contextos ||
                                        !contextos.length
                                    ) {
                                        return "";
                                    }

                                    const indice =
                                        contextos[0].dataIndex;

                                    const item =
                                        dadosSku[indice];


                                    return item
                                        ? `SKU ${item.sku}`
                                        : "";
                                },


                                afterTitle(contextos) {

                                    if (
                                        !contextos ||
                                        !contextos.length
                                    ) {
                                        return "";
                                    }

                                    const indice =
                                        contextos[0].dataIndex;

                                    const item =
                                        dadosSku[indice];


                                    return item
                                        ? item.descricao
                                        : "";
                                },


                                label(context) {

                                    const valor =
                                        context.raw;


                                    if (
                                        !possuiValorImportacao(
                                            valor
                                        )
                                    ) {
                                        return "";
                                    }


                                    return (
                                        "Quantidade em Unidade Recebida: " +
                                        Number(valor)
                                            .toLocaleString(
                                                "pt-BR"
                                            ) +
                                        " unidades"
                                    );
                                }
                            }
                        }
                    },


                    /* ======================================
                       ESCALAS
                    ====================================== */

                    scales: {


                        /* ==================================
                           EIXO DAS QUANTIDADES
                        ================================== */

                        x: {

                            beginAtZero:true,

                            grace:"18%",

                            title: {

                                display:true,

                                text:
                                    "Quantidade em Unidade Recebida",

                                color:"#4b5563",

                                font: {

                                    size:11,

                                    weight:"600"
                                }
                            },

                            grid: {

                                color:
                                    "rgba(148, 163, 184, 0.22)",

                                drawBorder:false
                            },

                            border: {

                                display:false
                            },

                            ticks: {

                                precision:0,

                                color:"#4b5563",

                                padding:6,

                                font: {

                                    size:10
                                },

                                callback(valor) {

                                    const numero =
                                        Number(valor);


                                    if (
                                        numero >=
                                        1000000000
                                    ) {

                                        return (
                                            Number(
                                                numero /
                                                1000000000
                                            )
                                            .toLocaleString(
                                                "pt-BR",
                                                {
                                                    maximumFractionDigits:1
                                                }
                                            ) +
                                            " bi"
                                        );
                                    }


                                    if (
                                        numero >=
                                        1000000
                                    ) {

                                        return (
                                            Number(
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


                                    if (
                                        numero >=
                                        1000
                                    ) {

                                        return (
                                            Number(
                                                numero /
                                                1000
                                            )
                                            .toLocaleString(
                                                "pt-BR",
                                                {
                                                    maximumFractionDigits:1
                                                }
                                            ) +
                                            " mil"
                                        );
                                    }


                                    return numero
                                        .toLocaleString(
                                            "pt-BR"
                                        );
                                }
                            }
                        },


                        /* ==================================
                           EIXO DOS SKUs
                        ================================== */

        y: {

    offset: true,

    grid: {
        display: false,
        drawBorder: false
    },

    border: {
        display: false
    },



                            ticks: {

                                color:"#334155",

                                padding:8,

                                font: {

                                    size:10,

                                    weight:"700"
                                },

                                callback(valor) {

                                    return (
                                        "SKU " +
                                        this.getLabelForValue(
                                            valor
                                        )
                                    );
                                }
                            }
                        }
                    },


                    /* ======================================
                       ANIMAÇÃO
                    ====================================== */

                    animation: {

                        duration:500
                    }
                }
            }
        );
}

/* ==========================================================
   TABELA — STATUS DA IMPORTAÇÃO
========================================================== */

function badgeStatusImportacao(status) {

    const texto =
        String(status || "")
            .trim()
            .toUpperCase();


    switch (texto) {

        case "APROVADO":

            return `
                <span class="status-badge status-aprovado">
                    🟢 APROVADO
                </span>
            `;


        case "REPROVADO":

            return `
                <span class="status-badge status-reprovado">
                    🔴 REPROVADO
                </span>
            `;


        case "PENDENTE":

            return `
                <span class="status-badge status-pendente">
                    ⚪ PENDENTE
                </span>
            `;


        case "ATENÇÃO":

        case "ATENCAO":

            return `
                <span class="status-badge status-atencao">
                    🟡 ATENÇÃO
                </span>
            `;

case "AGUARDANDO CHEGADA":

    return `
        <span class="status-badge status-aguardando">
            🔵 AGUARDANDO
        </span>
    `;
        default:

            return `
                <span class="status-badge">
                    ${escaparTextoImportacao(status)}
                </span>
            `;
    }
}


/* ==========================================================
   TABELA — FLUXO DA INSPEÇÃO DE IMPORTAÇÃO
========================================================== */

function montarTabelaFluxoImportacao(lista) {

    const fluxo =
        Array.isArray(lista)
            ? lista
            : [];


    if (!fluxo.length) {

        return `

            <div class="tabela-vazia">
                Nenhum processo de importação encontrado.
            </div>

        `;
    }


    const linhas =
        fluxo.map(item => `

            <tr>

                <td>
                    ${escaparTextoImportacao(
                        item.po
                    )}
                </td>

                <td>
                    ${escaparTextoImportacao(
                        item.sku
                    )}
                </td>

                <td class="descricao">
                    ${escaparTextoImportacao(
                        item.descricao
                    )}
                </td>

                <td>
                    ${escaparTextoImportacao(
                        item.lote
                    )}
                </td>

                <td>
                    ${badgeStatusImportacao(
                        item.status
                    )}
                </td>

               <td>
    ${
        !item.observacao ||
        item.observacao === "0" ||
        item.observacao === 0

            ? "-"

            : escaparTextoImportacao(
                item.observacao
            )
    }
</td>
            </tr>

        `).join("");


    return `

        <div class="importacao-tabela-scroll">

            <table class="importacao-tabela">

                <thead>

                    <tr>

                        <th style="width:14%">
                            PO
                        </th>

                        <th style="width:12%">
                            SKU
                        </th>

                        <th style="width:30%">
                            DESCRIÇÃO
                        </th>

                        <th style="width:14%">
                            LOTE
                        </th>

                        <th style="width:12%">
                            STATUS
                        </th>

                        <th style="width:18%">
                            OBSERVAÇÃO
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${linhas}

                </tbody>

            </table>

        </div>

    `;
}


/* ==========================================================
   AJUSTE DOS GRÁFICOS AO REDIMENSIONAR A TELA
========================================================== */

function redimensionarGraficosImportacao() {

    if (graficoMensalImportacao) {
        graficoMensalImportacao.resize();
    }


    if (graficoSkuImportacao) {
        graficoSkuImportacao.resize();
    }
}


window.addEventListener(
    "resize",
    redimensionarGraficosImportacao
);


/* ==========================================================
   EXPORTA PARA O ESCOPO GLOBAL
========================================================== */

window.renderImportacao =
    renderImportacao;


window.abrirAbaInternaImportacao =
    abrirAbaInternaImportacao;


window.destruirGraficosImportacao =
    destruirGraficosImportacao;


window.abrirRankingImportacao =
    abrirRankingImportacao;


window.fecharRankingImportacao =
    fecharRankingImportacao;
