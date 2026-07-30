ChatGPT Plus





Texto colado(34).txt
Documento

ainda esta assim


Texto colado(36).txt
Documento


Texto colado(37).txt
Documento


Texto colado(38).txt
Documento


Texto colado(39).txt
Documento


Texto colado(40).txt
Documento


Texto colado(41).txt
Documento


Texto colado(42).txt
Documento


agora ele me aparece assim mas quando eu saio e vou para outra aba e voltto rlr fica normal


Texto colado(43).txt
Documento


Texto colado(44).txt
Documento


Texto colado(45).txt
Documento

esta vendo os numeros dos graficos, esta um por cima do outro conseguimos melhorar para que um numero nao sobreponha o outo 

Imagem gerada: Dashboard mensal de inspeção de importação


Editar


Imagem gerada: Evolução Mensal da Inspeção de Importação


Editar


Imagem gerada: Painel de Análise de Inspeção de Importação


Editar


Imagem gerada: Painel de indicadores de inspeção de importação


Editar


Imagem gerada: Painel de inspeção de importação mensal


Editar


hoje 13:10
Imagem editada
vamos fazer esse modeo de grafico e fluxo de impeçaõ 

Imagem gerada: Painel de Inspeção de Importação


Editar



Imagem gerada: Painel de Inspeção de Importação


Editar



Texto colado(48).txt
Documento

image(44).png
essa parte das cores e retanglos sku,laudo esta muito em cima da barra deicar mair acima centralizado

Imagem gerada: Painel de Inspeção de Importação


Editar


Imagem gerada: Painel de Inspeção de Importação


Editar


Imagem gerada: Painel Analítico de Inspeção em Azul e Branco


Editar


Imagem gerada: Dashboard de inspeção de importação


Editar


Imagem gerada: Guia para Ajustar o Eixo da Quantidade


Editar


image(45).png
quero que essa parte fique mais acima o 180 esta quade cobrindo 

Imagem gerada: Evolução Mensal da Inspeção de Importação


Editar


O problema não é a legenda. O problema é que não existe espaço suficiente entre a legenda e o topo do gráfico, então os números das barras (180) acabam entrando na área da legenda.

Você pode resolver isso de 3 formas.

Opção 1 (a melhor)
Dentro do gráfico, procure:

layout: {

    padding: {

        top: 22,

        right: 8,

        bottom: 0,

        left: 0

    }
},
Troque para:

layout: {

    padding: {

        top: 55,

        right: 8,

        bottom: 0,

        left: 0

    }
},
ou até

top: 65
Isso empurra todo o gráfico para baixo.

Opção 2 (mover a legenda mais para cima)
Procure:

plugins: {

    legend: {

        position: "top",

        labels: {
Altere para:

plugins: {

    legend: {

        position: "top",

        align: "center",

        fullSize: true,

        labels: {

            padding: 30,
O padding aumenta a distância da legenda em relação ao gráfico.

Pode usar:

padding: 25
ou

padding: 35
Opção 3 (diminuir a altura dos números)
No plugin:

rotulosBarrasMensaisImportacao
você verá algo parecido com:

const deslocamento =
    datasetIndex % 2 === 0
        ? 7
        : 18;
Troque para:

const deslocamento =
    datasetIndex % 2 === 0
        ? 15
        : 30;
ou

const deslocamento =
    datasetIndex % 2 === 0
        ? 18
        : 35;
Assim os números ficam mais afastados das barras.

O que eu faria no seu painel
Usaria as três alterações juntas:

layout: {

    padding: {

        top: 55,
        right: 8,
        bottom: 0,
        left: 0

    }
}
legend: {

    position: "top",

    labels: {

        padding: 25
    }
}
const deslocamento =
    datasetIndex % 2 === 0
        ? 18
        : 35;
Com essas três mudanças, os valores 180 ficarão abaixo da legenda, sem sobreposição, mantendo um aspecto profissional.



Texto colado(49).txt
Documento

Analisando o código que você enviou, o problema não é mais o layout.padding nem a legenda. O conflito acontece porque o plugin que desenha os números coloca o texto muito próximo do topo das barras, e a linha de Horas passa exatamente por essa região. 


Faça estes três ajustes:

1. Aumente a escala do eixo Y
No eixo y, troque:

grace: "20%",
por:

grace: "35%",
Ou fixe um limite:

beginAtZero: true,
max: 240,
2. Afaste mais os números das barras
Na função rotulosBarrasMensaisImportacao, você tem:

const deslocamento =
    datasetIndex % 2 === 0
        ? 15
        : 30;
Altere para:

const deslocamento =
    datasetIndex === 0 ? 12 :
    datasetIndex === 1 ? 24 :
    datasetIndex === 2 ? 36 :
    48;
Assim, cada série terá uma altura diferente:

Processos → 12 px

SKU → 24 px

Lotes → 36 px

Laudos → 48 px

Isso evita que os números fiquem todos na mesma linha.

3. Desça a linha de Horas
Na configuração do dataset Horas, altere:

tension: 0.35,
e adicione:

clip: 10,
Depois, no eixo y1, aumente um pouco a folga:

y1: {

    beginAtZero: true,

    grace: "20%",
Um detalhe importante
Percebi que Abril tem quatro barras exatamente com o valor 180 (SKU, Lotes e Laudos, além da linha passando próximo). Mesmo com esses ajustes, os três rótulos "180" continuarão muito próximos porque representam valores iguais. 


Uma solução que deixa o painel mais limpo é desenhar os rótulos com deslocamentos diferentes para cada série, por exemplo:

Processos → acima da barra.

SKU → um pouco à esquerda.

Lotes → centralizado.

Laudos → um pouco à direita.

Esse tipo de posicionamento elimina praticamente toda a sobreposição sem alterar os dados do gráfico.



Texto colado(50).txt
Documento

Analisei o código que você enviou e encontrei o motivo. 


O problema não está mais na legenda nem no padding. O conflito acontece porque você tem três barras com o mesmo valor (180) em abril (SKU, Lotes e Laudos). Como todas têm a mesma altura, os três rótulos são desenhados praticamente na mesma linha.

A melhor solução
Em vez de usar:

const deslocamento =
    datasetIndex === 0 ? 12 :
    datasetIndex === 1 ? 24 :
    datasetIndex === 2 ? 36 :
    48;
substitua por este bloco:

let deslocamento = 15;

switch (dataset.label) {

    case "Processos":
        deslocamento = 10;
        break;

    case "SKU":
        deslocamento = 22;
        break;

    case "Lotes":
        deslocamento = 34;
        break;

    case "Laudos":
        deslocamento = 46;
        break;
}
Depois altere também a posição horizontal
Troque:

ctx.fillText(
    Number(valor).toLocaleString("pt-BR"),
    elemento.x,
    elemento.y - deslocamento
);
por:

let ajusteX = 0;

switch (dataset.label) {

    case "SKU":
        ajusteX = -8;
        break;

    case "Laudos":
        ajusteX = 8;
        break;

    default:
        ajusteX = 0;
}

ctx.fillText(
    Number(valor).toLocaleString("pt-BR"),
    elemento.x + ajusteX,
    elemento.y - deslocamento
);
Resultado
Em abril ficará aproximadamente assim:

           180

      180       180

         █ █ █
em vez de:

180180180
█████████
Mais um ajuste que recomendo
No eixo y, altere:

grace: "20%",
para:

grace: "30%",
Isso cria mais espaço acima das barras.

Minha sugestão
Eu deixaria de desenhar os valores diretamente pelo plugin ctx.fillText() e passaria a usar o plugin ChartDataLabels, que permite definir anchor, align, offset e até posicionar cada série individualmente. O resultado fica muito mais limpo e profissional, especialmente quando várias barras têm a mesma altura, como no seu painel de Importação.


/* ==========================================================
PÁGINA — INSPEÇÃO DE IMPORTAÇÃO
========================================================== */

/* ==========================================================
INSTÂNCIAS DOS GRÁFICOS
========================================================== */

let graficoMensalImportacao = null;
let graficoSkuImportacao = null;

/* ==========================================================
CONVERSÃO CORRETA DOS VALORES DO GRÁFICO
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
Trata os formatos:

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

        /*
        Formato brasileiro:
        1.250,50
        */

        valorNormalizado =
            valorNormalizado
                .replace(/\./g, "")
                .replace(",", ".");

    } else {

        /*
        Formato internacional:
        1,250.50
        */

        valorNormalizado =
            valorNormalizado
                .replace(/,/g, "");
    }

} else if (
    valorNormalizado.includes(",")
) {

    /*
    Formato decimal brasileiro:
    10,5
    */

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
FORMATAÇÃO CORRETA DAS HORAS
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
PLUGIN LOCAL — NÚMEROS APENAS NAS BARRAS MENSAIS
========================================================== /
/
O plugin global valorFlutuante será desligado no gráfico
mensal da Importação.

Este plugin desenha somente os números das barras.

A linha de Horas continuará sem números, conforme solicitado.
========================================================== */

const rotulosBarrasMensaisImportacao = {

id: "rotulosBarrasMensaisImportacao",

afterDatasetsDraw(chart) {

    const { ctx } = chart;

    ctx.save();

    chart.data.datasets.forEach(
        (dataset, datasetIndex) => {

            if (dataset.type !== "bar") {
                return;
            }

            const meta =
                chart.getDatasetMeta(datasetIndex);

            if (meta.hidden) {
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

                    /*
                    --------------------------------------------------
                    Alterna levemente a altura dos números.

                    Isso reduz a sobreposição quando duas barras
                    possuem valores iguais ou muito próximos.
                    --------------------------------------------------
                    */

                    const deslocamento =
                        datasetIndex % 2 === 0
                            ? 15
                            : 30;

                    ctx.font =
                        "800 9px Arial";

                    ctx.fillStyle =
                        "#10245c";

                    ctx.textAlign =
                        "center";

                    ctx.textBaseline =
                        "bottom";

                    ctx.fillText(
                        Number(valor)
                            .toLocaleString("pt-BR"),
                        elemento.x,
                        elemento.y - deslocamento
                    );
                });
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

    const { ctx } = chart;

    const dataset =
        chart.data.datasets[0];

    const meta =
        chart.getDatasetMeta(0);

    if (
        !dataset ||
        !meta ||
        meta.hidden
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

            ctx.fillText(
                Number(valor)
                    .toLocaleString("pt-BR"),
                elemento.x + 8,
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

function destruirGraficosImportacao() {

if (graficoMensalImportacao) {

    graficoMensalImportacao.destroy();
    graficoMensalImportacao = null;
}

if (graficoSkuImportacao) {

    graficoSkuImportacao.destroy();
    graficoSkuImportacao = null;
}


/*
----------------------------------------------------------
Segurança adicional do Chart.js
----------------------------------------------------------
*/

const canvasMensal =
    document.getElementById(
        "graficoImportacao"
    );

if (
    canvasMensal &&
    typeof Chart !== "undefined"
) {

    const graficoExistente =
        Chart.getChart(canvasMensal);

    if (graficoExistente) {
        graficoExistente.destroy();
    }
}


const canvasSku =
    document.getElementById(
        "graficoSkuImportacao"
    );

if (
    canvasSku &&
    typeof Chart !== "undefined"
) {

    const graficoExistente =
        Chart.getChart(canvasSku);

    if (graficoExistente) {
        graficoExistente.destroy();
    }
}
}

/* ==========================================================
RENDERIZAÇÃO DA PÁGINA
========================================================== */

function renderImportacao() {

destruirGraficosImportacao();


const imp =
    dados.importacao || {

        processosAno: 0,
        totalSku: 0,
        totalLotes: 0,
        laudosEmitidos: 0,
        totalHoras: 0,

        mensal: [],
        paretoSku: [],
        fluxo: []
    };


conteudo.innerHTML = `

    <div class="page-title">
        📦 INSPEÇÃO DE IMPORTAÇÃO
    </div>


    <section class="cards importacao-cards">

        ${card(
            "📋",
            "Processos por Ano",
            numero(imp.processosAno),
            "Quantidade de processos"
        )}

        ${card(
            "🏷️",
            "Total de SKU",
            numero(imp.totalSku),
            "SKUs inspecionados"
        )}

        ${card(
            "📦",
            "Total de Lotes",
            numero(imp.totalLotes),
            "Lotes controlados"
        )}

        ${card(
            "📄",
            "Laudos Emitidos",
            numero(imp.laudosEmitidos),
            "Registros emitidos"
        )}

        ${card(
            "⏱️",
            "Total de Horas",
            formatarHorasImportacao(
                imp.totalHoras
            ),
            "Horas da atividade"
        )}

    </section>


    <section class="panel importacao-panel-mensal">

        <h3 class="importacao-panel-titulo">
            📊 Evolução Mensal da Inspeção de Importação
        </h3>

        <div class="chart-box chart-box-importacao">

            <canvas
                id="graficoImportacao"
            ></canvas>

        </div>

    </section>


    <section class="importacao-bottom-grid">


        <div class="panel importacao-panel-sku">

            <h3 class="importacao-panel-titulo">
                📊 Quantidade por SKU (Maior para Menor)
            </h3>

            <div class="chart-box chart-box-sku-importacao">

                <canvas
                    id="graficoSkuImportacao"
                ></canvas>

            </div>

        </div>


        <div class="panel importacao-panel-fluxo">

            <div class="importacao-fluxo-cabecalho">

                <h3 class="importacao-panel-titulo">
                    📋 Fluxo da Inspeção de Importação
                </h3>

            </div>


            <div class="importacao-tabela-wrap">

                ${montarTabelaFluxoImportacao(
                    imp.fluxo || []
                )}

            </div>


            <div class="importacao-table-footer">

                <button
                    type="button"
                    class="btn-ver-todos importacao-btn-ver-todos"
                    onclick="verTodosImportacao()"
                >
                    ☷ VER TODOS
                </button>

            </div>

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
----------------------------------------------------------
Cria os gráficos somente depois que os canvases existem
----------------------------------------------------------
*/

criarGraficoMensalImportacao(imp);
criarGraficoSkuImportacao(imp);
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


/*
----------------------------------------------------------
Preparação dos meses
----------------------------------------------------------
*/

const meses =
    mensal.map(item =>
        item.mes || ""
    );


/*
----------------------------------------------------------
Preparação dos valores
----------------------------------------------------------
*/

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


/*
----------------------------------------------------------
Remove instâncias anteriores
----------------------------------------------------------
*/

if (graficoMensalImportacao) {

    graficoMensalImportacao.destroy();
    graficoMensalImportacao = null;
}


const graficoExistente =
    Chart.getChart(canvas);


if (graficoExistente) {

    graficoExistente.destroy();
}


/*
----------------------------------------------------------
Criação do gráfico
----------------------------------------------------------
*/

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

                    /*
                    ------------------------------------------
                    PROCESSOS
                    ------------------------------------------
                    */

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


                    /*
                    ------------------------------------------
                    SKU
                    ------------------------------------------
                    */

                    {
                        type: "bar",

                        label: "SKU",

                        data: sku,

                        backgroundColor:
                            "rgba(236, 72, 199, 0.62)",

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


                    /*
                    ------------------------------------------
                    LOTES
                    ------------------------------------------
                    */

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


                    /*
                    ------------------------------------------
                    LAUDOS
                    ------------------------------------------
                    */

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


                    /*
                    ------------------------------------------
                    HORAS
                    ------------------------------------------
                    A linha permanece sem números.
                    ------------------------------------------
                    */

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


                /*
                ------------------------------------------
                Espaço adicional para os números das barras
                ------------------------------------------
                */

                layout: {

                    padding: {

                        top: 55,

                        right: 8,

                        bottom: 0,

                        left: 0
                    }
                },


                /*
                ------------------------------------------
                Interação
                ------------------------------------------
                */

                interaction: {

                    mode: "index",

                    intersect: false
                },


                /*
                ------------------------------------------
                Plugins
                ------------------------------------------
                */

                plugins: {


                    /*
                    ------------------------------------------
                    Desliga o plugin global.

                    Os números das barras serão controlados
                    somente pelo plugin local.
                    ------------------------------------------
                    */

                    valorFlutuante: false,


                    /*
                    ------------------------------------------
                    Evita duplicação com ChartDataLabels
                    ------------------------------------------
                    */

                    datalabels: {

                        display: false
                    },


                    /*
                    ------------------------------------------
                    Legenda
                    ------------------------------------------
                    */

                    legend: {

                        position: "top",

                        align: "center",
                       
                       fullSize: true,

                        labels: {

                            usePointStyle: false,

                            boxWidth: 30,

                            boxHeight: 10,

                            padding: 30,

                            color: "#374151",

                            font: {

                                size: 11,

                                weight: "600"
                            }
                        }
                    },


                    /*
                    ------------------------------------------
                    Tooltip
                    ------------------------------------------
                    */

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


                                if (
                                    nome === "Horas"
                                ) {

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


                /*
                ------------------------------------------
                Escalas
                ------------------------------------------
                */

                scales: {


                    /*
                    ------------------------------------------
                    Eixo horizontal
                    ------------------------------------------
                    */

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


                    /*
                    ------------------------------------------
                    Eixo de quantidades
                    ------------------------------------------
                    */

                    y: {

                        beginAtZero: true,

                        position: "left",

                        grace: "20%",

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


                    /*
                    ------------------------------------------
                    Eixo de horas
                    ------------------------------------------
                    */

                    y1: {

                        beginAtZero: true,

                        position: "right",

                        grace: "8%",

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


                /*
                ------------------------------------------
                Animação
                ------------------------------------------
                */

                animation: {

                    duration: 500
                }
            }
        }
    );
}
/* ==========================================================
GRÁFICO — QUANTIDADE POR SKU
========================================================== */

function criarGraficoSkuImportacao(imp) {

const dadosSkuOriginais =
    Array.isArray(imp.paretoSku)
        ? imp.paretoSku
        : [];


/*
----------------------------------------------------------
Normaliza, remove valores inválidos e ordena
do maior para o menor
----------------------------------------------------------
*/

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

                quantidade:
                    quantidade === null
                        ? 0
                        : quantidade
            };
        })

        .filter(item =>
            item.quantidade > 0
        )

        .sort(
            (a, b) =>
                b.quantidade -
                a.quantidade
        )

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


/*
----------------------------------------------------------
Remove instâncias anteriores
----------------------------------------------------------
*/

if (graficoSkuImportacao) {

    graficoSkuImportacao.destroy();
    graficoSkuImportacao = null;
}


const graficoExistente =
    Chart.getChart(canvas);


if (graficoExistente) {

    graficoExistente.destroy();
}


/*
----------------------------------------------------------
Dados finais
----------------------------------------------------------
*/

const labels =
    dadosSku.map(item =>
        item.sku
    );


const quantidades =
    dadosSku.map(item =>
        item.quantidade
    );


/*
----------------------------------------------------------
Criação do gráfico horizontal
----------------------------------------------------------
*/

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
                        label: "Quantidade",

                        data: quantidades,

                        backgroundColor:
                            "rgba(29, 78, 216, 0.82)",

                        borderColor:
                            "#1d4ed8",

                        borderWidth: 1,

                        borderRadius: 5,

                        borderSkipped: false,

                        barThickness: 18,

                        maxBarThickness: 22,

                        minBarLength: 3,

                        _ocultarZero: true
                    }
                ]
            },


            options: {

                responsive: true,

                maintainAspectRatio: false,

                indexAxis: "y",


                /*
                --------------------------------------------------
                Reserva espaço à direita para os valores
                --------------------------------------------------
                */

                layout: {

                    padding: {

                        top: 4,

                        right: 42,

                        bottom: 0,

                        left: 0
                    }
                },


                /*
                --------------------------------------------------
                Interação
                --------------------------------------------------
                */

                interaction: {

                    mode: "nearest",

                    axis: "y",

                    intersect: false
                },


                /*
                --------------------------------------------------
                Plugins
                --------------------------------------------------
                */

                plugins: {


                    /*
                    ------------------------------------------------
                    Desliga o plugin global para impedir
                    valores duplicados
                    ------------------------------------------------
                    */

                    valorFlutuante: false,


                    datalabels: {

                        display: false
                    },


                    legend: {

                        display: false
                    },


                    tooltip: {

                        enabled: true,

                        displayColors: false,

                        callbacks: {

                            title(contextos) {

                                if (
                                    !contextos ||
                                    !contextos.length
                                ) {
                                    return "";
                                }

                                return contextos[0].label;
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
                                    "Quantidade: " +
                                    Number(valor)
                                        .toLocaleString(
                                            "pt-BR"
                                        )
                                );
                            }
                        }
                    }
                },


                /*
                --------------------------------------------------
                Escalas
                --------------------------------------------------
                */

                scales: {


                    /*
                    ------------------------------------------------
                    Eixo dos valores
                    ------------------------------------------------
                    */

                    x: {

                        beginAtZero: true,

                        grace: "12%",

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


                    /*
                    ------------------------------------------------
                    Eixo dos SKUs
                    ------------------------------------------------
                    */

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

                            color: "#334155",

                            padding: 8,

                            font: {

                                size: 10,

                                weight: "600"
                            },


                            /*
                            ------------------------------------------
                            Limita textos muito grandes
                            ------------------------------------------
                            */

                            callback(valor) {

                                const texto =
                                    this.getLabelForValue(
                                        valor
                                    );


                                if (
                                    texto.length > 22
                                ) {

                                    return (
                                        texto.slice(
                                            0,
                                            22
                                        ) +
                                        "..."
                                    );
                                }


                                return texto;
                            }
                        }
                    }
                },


                /*
                --------------------------------------------------
                Animação
                --------------------------------------------------
                */

                animation: {

                    duration: 500
                }
            }
        }
    );
}
/* ==========================================================
TABELA — FLUXO DA INSPEÇÃO DE IMPORTAÇÃO
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

    default:

        return `
            <span class="status-badge">
                ${escaparTextoImportacao(status)}
            </span>
        `;
}
}

/* ==========================================================
LINHAS DA TABELA
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
                ${escaparTextoImportacao(item.po)}
            </td>

            <td>
                ${escaparTextoImportacao(item.sku)}
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

                ${escaparTextoImportacao(
                    item.observacao
                )}

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
BOTÃO VER TODOS
========================================================== */

function verTodosImportacao() {

console.log(
    "Visualizar todos os processos de importação."
);

/*
----------------------------------------------------------

Futuras implementações

• Modal
• Nova página
• Exportação Excel
• Exportação PDF
• Pesquisa
• Filtros
• Ordenação

----------------------------------------------------------
*/
}

/* ==========================================================
EXPORTA PARA O ESCOPO GLOBAL
========================================================== */

window.renderImportacao =
renderImportacao;

window.verTodosImportacao =
verTodosImportacao;


Fechar
