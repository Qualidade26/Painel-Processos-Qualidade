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

    conteudo.innerHTML = `
        <div class="page-title">📦 INSPEÇÃO DE IMPORTAÇÃO</div>

        <section class="cards">
            ${card("📦","Processos por Ano",numero(imp.processosAno),"Quantidade de processos")}
            ${card("🏷️","Total de SKU",numero(imp.totalSku),"SKUs inspecionados")}
            ${card("📑","Total de Lotes",numero(imp.totalLotes),"Lotes controlados")}
            ${card("🧾","Laudos Emitidos",numero(imp.laudosEmitidos),"Registros emitidos")}
            ${card("⏱","Total de Horas",numero(imp.totalHoras),"Horas da atividade")}
        </section>

        <section class="panel">
            <h3>📊 Evolução Mensal da Inspeção de Importação</h3>
            <div class="chart-box">
                <canvas id="grafico"></canvas>
            </div>
        </section>

        <section class="panel">
            <h3>Fluxo Inspeção de Importação</h3>
            ${
                tabelaFixa(
                    ["PO","Descrição do Produto","Status","Observação"],
                    montarLinhasImportacao(imp.fluxo),
                    false
                )
            }
        </section>
    `;

    graficoAtual = new Chart(
        document.getElementById("grafico"),
        {

            type:"line",

            data:{

                labels:(imp.mensal || []).map(i => i.mes),

                datasets:[

                    {
                        ...dsLine(
                            "Processos",
                            (imp.mensal || []).map(i => i.processos || 0),
                            "#1d4eff"
                        ),
                        yAxisID:"y"
                    },

                    {
                        ...dsLine(
                            "SKU",
                            (imp.mensal || []).map(i => i.sku || 0),
                            "#f04dd8"
                        ),
                        yAxisID:"y"
                    },

                    {
                        ...dsLine(
                            "Lotes",
                            (imp.mensal || []).map(i => i.lotes || 0),
                            "#22c55e"
                        ),
                        yAxisID:"y"
                    },

                    {
                        ...dsLine(
                            "Laudos",
                            (imp.mensal || []).map(i => i.laudos || 0),
                            "#8b5cf6"
                        ),
                        yAxisID:"y"
                    },

                    {
                        ...dsLine(
                            "Horas",
                            (imp.mensal || []).map(i => i.horas || 0),
                            "#f97316"
                        ),
                        yAxisID:"y1",
                        borderDash:[8,5]
                    }

                ]
            },

            options:{

                responsive:true,
                maintainAspectRatio:false,

                interaction:{
                    mode:"index",
                    intersect:false
                },

                scales:{

                    y:{
                        beginAtZero:true,
                        position:"left",
                        title:{
                            display:true,
                            text:"Quantidade"
                        }
                    },

                    y1:{
                        beginAtZero:true,
                        position:"right",

                        title:{
                            display:true,
                            text:"Horas"
                        },

                        grid:{
                            drawOnChartArea:false
                        }
                    }

                }

            }

        }
    );

}
