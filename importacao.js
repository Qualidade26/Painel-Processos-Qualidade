let graficoParetoImportacao = null;


/*
|--------------------------------------------------------------------------
| TRATAMENTO DOS VALORES ZERADOS
|--------------------------------------------------------------------------
| Mantém todos os meses no eixo do gráfico, mas transforma valores 0,
| vazios, nulos ou inválidos em null. Assim, o Chart.js não desenha
| barras, pontos ou linhas nesses valores.
*/
function ocultarZero(valor) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return null;
    }

    const valorNumerico = Number(valor);

    if (
        !Number.isFinite(valorNumerico) ||
        valorNumerico === 0
    ) {
        return null;
    }

    return valorNumerico;
}


/*
|--------------------------------------------------------------------------
| RENDERIZAÇÃO DA PÁGINA DE IMPORTAÇÃO
|--------------------------------------------------------------------------
*/
function renderImportacao() {

    const imp = dados.importacao || {
        processosAno: 0,
        totalSku: 0,
        totalLotes: 0,
        laudosEmitidos: 0,
        totalHoras: 0,
        mensal: [],
        paretoSku: [],
        fluxo: []
    };

    /*
    |----------------------------------------------------------------------
    | Evita gráficos duplicados quando o usuário troca de aba e volta.
    |----------------------------------------------------------------------
    */
    if (
        typeof graficoAtual !== "undefined" &&
        graficoAtual
    ) {
        graficoAtual.destroy();
        graficoAtual = null;
    }

    if (graficoParetoImportacao) {
        graficoParetoImportacao.destroy();
        graficoParetoImportacao = null;
    }

    conteudo.innerHTML = `
        <div class="page-title">
            📦 INSPEÇÃO DE IMPORTAÇÃO
        </div>

        <section class="cards">

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
                "📑",
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
                numero(imp.totalHoras),
                "Horas da atividade"
            )}

        </section>

        <section class="panel">

            <h3>
                📊 Evolução Mensal da Inspeção de Importação
            </h3>

            <div class="chart-box chart-box-importacao">
                <canvas id="graficoImportacao"></canvas>
            </div>

        </section>

        <section class="importacao-bottom-grid">

            <div class="panel">

                <h3>
                    📈 Pareto de SKUs Inspecionados — Ano
                </h3>

                <div class="chart-box chart-box-pareto">
                    <canvas id="graficoParetoImportacao"></canvas>
                </div>

            </div>

            <div class="panel">

                <h3>
                    📋 Fluxo da Inspeção de Importação
                </h3>

                ${
                    tabelaFixa(
                        [
                            "PO",
                            "Descrição do Produto",
                            "Status",
                            "Observação"
                        ],
                        montarLinhasImportacao(imp.fluxo || []),
                        false
                    )
                }

                <div class="table-footer">

                    <button
                        type="button"
                        class="btn-ver-todos"
                        onclick="verTodosImportacao()"
                    >
                        VER TODOS
                    </button>

                </div>

            </div>

        </section>
    `;

    criarGraficoMensalImportacao(imp);
    criarGraficoParetoImportacao(imp);
}


/*
|--------------------------------------------------------------------------
| GRÁFICO DE EVOLUÇÃO MENSAL
|--------------------------------------------------------------------------
*/
function criarGraficoMensalImportacao(imp) {

    const mensal = Array.isArray(imp.mensal)
        ? imp.mensal
        : [];

    const canvas = document.getElementById(
        "graficoImportacao"
    );

    if (!canvas) {
        console.error(
            "Canvas graficoImportacao não encontrado."
        );
        return;
    }

    graficoAtual = new Chart(
        canvas,
        {
            data: {

                /*
                |----------------------------------------------------------
                | Todos os meses continuam aparecendo no eixo horizontal.
                |----------------------------------------------------------
                */
                labels: mensal.map(item =>
                    item.mes || ""
                ),

                datasets: [

                    {
                        type: "bar",
                        label: "Processos",

                        data: mensal.map(item =>
                            ocultarZero(item.processos)
                        ),

                        backgroundColor: "#1d4eff",
                        borderColor: "#1d4eff",
                        borderWidth: 1,
                        borderRadius: 3,
                        yAxisID: "y",
                        order: 2
                    },

                    {
                        type: "bar",
                        label: "SKU",

                        data: mensal.map(item =>
                            ocultarZero(item.sku)
                        ),

                        backgroundColor:
                            "rgba(240, 77, 216, 0.65)",

                        borderColor: "#f04dd8",
                        borderWidth: 2,
                        borderRadius: 3,
                        yAxisID: "y",
                        order: 2
                    },

                    {
                        type: "bar",
                        label: "Lotes",

                        data: mensal.map(item =>
                            ocultarZero(item.lotes)
                        ),

                        backgroundColor:
                            "rgba(34, 197, 94, 0.55)",

                        borderColor: "#22c55e",
                        borderWidth: 2,
                        borderRadius: 3,
                        yAxisID: "y",
                        order: 2
                    },

                    {
                        type: "bar",
                        label: "Laudos",

                        data: mensal.map(item =>
                            ocultarZero(item.laudos)
                        ),

                        backgroundColor:
                            "rgba(139, 92, 246, 0.55)",

                        borderColor: "#6d28d9",
                        borderWidth: 2,
                        borderRadius: 3,
                        yAxisID: "y",
                        order: 2
                    },

                    {
                        type: "line",
                        label: "Horas",

                        data: mensal.map(item =>
                            ocultarZero(item.horas)
                        ),

                        borderColor: "#f97316",
                        backgroundColor: "#f97316",
                        pointBackgroundColor: "#f97316",
                        pointBorderColor: "#ffffff",
                        pointBorderWidth: 1,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        borderWidth: 2,
                        tension: 0.35,

                        /*
                        |--------------------------------------------------
                        | Não liga a linha através dos meses sem dados.
                        |--------------------------------------------------
                        */
                        spanGaps: false,

                        yAxisID: "y1",
                        order: 1
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

                plugins: {

                    legend: {
                        position: "top",

                        labels: {
                            usePointStyle: false,
                            boxWidth: 32,
                            padding: 18
                        }
                    },

                    tooltip: {
                        enabled: true,

                        /*
                        |--------------------------------------------------
                        | Não mostra no tooltip os valores nulos ou zerados.
                        |--------------------------------------------------
                        */
                        filter: function(context) {

                            return (
                                context.raw !== null &&
                                context.raw !== undefined &&
                                Number(context.raw) !== 0
                            );
                        },

                        callbacks: {

                            label: function(context) {

                                if (
                                    context.raw === null ||
                                    context.raw === undefined
                                ) {
                                    return "";
                                }

                                const nome =
                                    context.dataset.label || "";

                                return `${nome}: ${context.raw}`;
                            }
                        }
                    }
                },

                scales: {

                    x: {
                        grid: {
                            display: false
                        },

                        ticks: {
                            autoSkip: false,
                            maxRotation: 45,
                            minRotation: 0
                        }
                    },

                    y: {
                        beginAtZero: true,
                        position: "left",

                        title: {
                            display: true,
                            text: "Quantidade"
                        },

                        ticks: {
                            precision: 0
                        }
                    },

                    y1: {
                        beginAtZero: true,
                        position: "right",

                        title: {
                            display: true,
                            text: "Horas"
                        },

                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        }
    );
}


/*
|--------------------------------------------------------------------------
| GRÁFICO DE PARETO DOS SKUs
|--------------------------------------------------------------------------
*/
function criarGraficoParetoImportacao(imp) {

    const paretoOriginal = Array.isArray(imp.paretoSku)
        ? imp.paretoSku
        : [];

    /*
    |----------------------------------------------------------------------
    | Remove registros vazios ou com quantidade zero somente do Pareto.
    |----------------------------------------------------------------------
    */
    const pareto = paretoOriginal
        .map(item => ({
            sku: item.sku || "Sem identificação",
            quantidade: Number(item.quantidade) || 0
        }))
        .filter(item => item.quantidade > 0)
        .sort(
            (a, b) =>
                b.quantidade - a.quantidade
        );

    const canvas = document.getElementById(
        "graficoParetoImportacao"
    );

    if (!canvas) {
        console.error(
            "Canvas graficoParetoImportacao não encontrado."
        );
        return;
    }

    const labels = pareto.map(item =>
        item.sku
    );

    const quantidades = pareto.map(item =>
        item.quantidade
    );

    const total = quantidades.reduce(
        (soma, valor) => soma + valor,
        0
    );

    let acumulado = 0;

    const percentuaisAcumulados =
        quantidades.map(valor => {

            acumulado += valor;

            if (total === 0) {
                return null;
            }

            return Number(
                (
                    (acumulado / total) * 100
                ).toFixed(1)
            );
        });

    graficoParetoImportacao = new Chart(
        canvas,
        {
            data: {

                labels,

                datasets: [

                    {
                        type: "bar",
                        label: "Quantidade",

                        data: quantidades,

                        backgroundColor: "#1455d9",
                        borderColor: "#1455d9",
                        borderWidth: 1,
                        borderRadius: 3,

                        xAxisID: "x",
                        order: 2
                    },

                    {
                        type: "line",
                        label: "% Acumulado",

                        data: percentuaisAcumulados,

                        borderColor: "#f97316",
                        backgroundColor: "#f97316",
                        pointBackgroundColor: "#f97316",
                        pointBorderColor: "#ffffff",
                        pointBorderWidth: 1,
                        pointRadius: 3,
                        pointHoverRadius: 5,
                        borderWidth: 2,
                        tension: 0.2,

                        xAxisID: "x1",
                        order: 1
                    }

                ]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: "y",

                interaction: {
                    mode: "index",
                    intersect: false
                },

                plugins: {

                    legend: {
                        position: "top",

                        labels: {
                            boxWidth: 25,
                            padding: 15
                        }
                    },

                    tooltip: {
                        enabled: true,

                        filter: function(context) {
                            return (
                                context.raw !== null &&
                                context.raw !== undefined &&
                                Number(context.raw) !== 0
                            );
                        },

                        callbacks: {

                            label: function(context) {

                                if (
                                    context.dataset.label ===
                                    "% Acumulado"
                                ) {
                                    return (
                                        `% acumulado: ` +
                                        `${context.raw}%`
                                    );
                                }

                                return (
                                    `Quantidade: ` +
                                    `${context.raw}`
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

                        title: {
                            display: true,
                            text: "SKU"
                        }
                    },

                    x: {
                        beginAtZero: true,
                        position: "bottom",

                        title: {
                            display: true,
                            text: "Quantidade"
                        },

                        ticks: {
                            precision: 0
                        }
                    },

                    x1: {
                        beginAtZero: true,
                        max: 100,
                        position: "top",

                        grid: {
                            drawOnChartArea: false
                        },

                        ticks: {
                            callback: function(valor) {
                                return `${valor}%`;
                            }
                        },

                        title: {
                            display: true,
                            text: "% Acumulado"
                        }
                    }
                }
            }
        }
    );
}


/*
|--------------------------------------------------------------------------
| BOTÃO VER TODOS
|--------------------------------------------------------------------------
*/
function verTodosImportacao() {

    console.log(
        "Abrir todos os registros da inspeção de importação."
    );

    /*
    | Aqui poderá ser adicionada futuramente:
    |
    | - abertura de um modal;
    | - exibição de uma tabela completa;
    | - redirecionamento para outra página;
    | - exportação dos registros.
    */
}
