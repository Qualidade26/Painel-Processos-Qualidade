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

    conteudo.innerHTML = `
        <div class="page-title">📦 INSPEÇÃO DE IMPORTAÇÃO</div>

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
                "📋",
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
            <h3>Evolução Mensal da Inspeção de Importação</h3>

            <div class="chart-box chart-box-importacao">
                <canvas id="graficoImportacao"></canvas>
            </div>
        </section>

        <section class="importacao-bottom-grid">

            <div class="panel">
                <h3>Pareto de SKUs Inspecionados (Ano)</h3>

                <div class="chart-box chart-box-pareto">
                    <canvas id="graficoParetoImportacao"></canvas>
                </div>
            </div>

            <div class="panel">
                <h3>Fluxo Inspeção de Importação</h3>

                ${
                    tabelaFixa(
                        [
                            "PO",
                            "Descrição do Produto",
                            "Status",
                            "Observação"
                        ],
                        montarLinhasImportacao(imp.fluxo),
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


function criarGraficoMensalImportacao(imp) {

    const mensal = imp.mensal || [];

    graficoAtual = new Chart(
        document.getElementById("graficoImportacao"),
        {
            data: {
                labels: mensal.map(item => item.mes),

                datasets: [
                    {
                        type: "bar",
                        label: "Processos",
                        data: mensal.map(item => item.processos || 0),
                        backgroundColor: "#1d4eff",
                        borderColor: "#1d4eff",
                        borderWidth: 1,
                        yAxisID: "y",
                        order: 2
                    },

                    {
                        type: "bar",
                        label: "SKU",
                        data: mensal.map(item => item.sku || 0),
                        backgroundColor: "rgba(240, 77, 216, 0.65)",
                        borderColor: "#f04dd8",
                        borderWidth: 2,
                        yAxisID: "y",
                        order: 2
                    },

                    {
                        type: "bar",
                        label: "Lotes",
                        data: mensal.map(item => item.lotes || 0),
                        backgroundColor: "rgba(34, 197, 94, 0.55)",
                        borderColor: "#22c55e",
                        borderWidth: 2,
                        yAxisID: "y",
                        order: 2
                    },

                    {
                        type: "bar",
                        label: "Laudos",
                        data: mensal.map(item => item.laudos || 0),
                        backgroundColor: "rgba(139, 92, 246, 0.55)",
                        borderColor: "#6d28d9",
                        borderWidth: 2,
                        yAxisID: "y",
                        order: 2
                    },

                    {
                        type: "line",
                        label: "Horas (eixo secundário)",
                        data: mensal.map(item => item.horas || 0),
                        borderColor: "#f97316",
                        backgroundColor: "#f97316",
                        pointBackgroundColor: "#f97316",
                        pointBorderColor: "#f97316",
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        borderWidth: 2,
                        tension: 0.35,
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
                        enabled: true
                    }
                },

                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },

                    y: {
                        beginAtZero: true,
                        position: "left",

                        title: {
                            display: true,
                            text: "Quantidade"
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


function criarGraficoParetoImportacao(imp) {

    const pareto = imp.paretoSku || [];

    const labels = pareto.map(item => item.sku);
    const quantidades = pareto.map(item => item.quantidade || 0);

    const total = quantidades.reduce(
        (soma, valor) => soma + valor,
        0
    );

    let acumulado = 0;

    const percentuaisAcumulados = quantidades.map(valor => {
        acumulado += valor;

        if (total === 0) {
            return 0;
        }

        return Number(
            ((acumulado / total) * 100).toFixed(1)
        );
    });

    window.graficoParetoImportacao = new Chart(
        document.getElementById("graficoParetoImportacao"),
        {
            data: {
                labels,

                datasets: [
                    {
                        type: "bar",
                        label: "Quantidade de SKUs",
                        data: quantidades,
                        backgroundColor: "#1455d9",
                        borderColor: "#1455d9",
                        borderWidth: 1,
                        indexAxis: "y",
                        xAxisID: "x",
                        order: 2
                    },

                    {
                        type: "line",
                        label: "% Acumulado",
                        data: percentuaisAcumulados,
                        borderColor: "#0b3b9e",
                        backgroundColor: "#0b3b9e",
                        pointBackgroundColor: "#0b3b9e",
                        pointRadius: 3,
                        borderWidth: 2,
                        tension: 0.15,
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
                        display: false
                    },

                    tooltip: {
                        callbacks: {
                            label: function(context) {

                                if (context.dataset.label === "% Acumulado") {
                                    return `${context.raw}% acumulado`;
                                }

                                return `${context.raw} SKUs`;
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
                            text: "Quantidade de SKUs"
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
                            callback: valor => `${valor}%`
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


function verTodosImportacao() {
    console.log("Abrir todos os registros de importação");
}
