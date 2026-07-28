function renderAmostra(){

    const a = dados.amostras || {
        mensal:[],
        top10:[],
        totalHoras:0
    };

    const totalAno =
        (a.mensal || [])
        .reduce((s,i)=>s+Number(i.valor||0),0);

    conteudo.innerHTML = `
        <div class="page-title">📦 AMOSTRA</div>

        <section class="cards">

            ${card(
                "📦",
                "Amostras Solicitadas no Ano",
                numero(totalAno),
                "Total acumulado"
            )}

            ${card(
                "⏱",
                "Total de Horas",
                numero(a.totalHoras),
                "Horas destinadas"
            )}

        </section>

        <section class="grid-2">

            <div class="panel">

                <h3>📈 Evolução Mensal de Amostras</h3>

                <div class="chart-box">
                    <canvas id="grafico"></canvas>
                </div>

            </div>

            <div class="panel">

                <h3>Amostras Mais Solicitadas</h3>

                ${
                    tabelaFixa(
                        ["SKU","Descrição","Qtd."],
                        montarLinhasAmostra(a.top10 || []),
                        true
                    )
                }

            </div>

        </section>
    `;

    const opcoesAmostra = baseOptions();

    opcoesAmostra.interaction = {
        mode:"index",
        intersect:false
    };

    opcoesAmostra.scales = {

        y:{
            beginAtZero:true,
            position:"left",

            title:{
                display:true,
                text:"Quantidade de amostras",
                color:"#0f1f4d",
                font:{weight:"bold"}
            },

            grid:{
                color:"rgba(15,31,77,.08)"
            },

            ticks:{
                color:"#5c6c96"
            }
        },

        y1:{
            beginAtZero:true,
            position:"right",

            title:{
                display:true,
                text:"Horas",
                color:"#c026d3",
                font:{weight:"bold"}
            },

            grid:{
                drawOnChartArea:false
            },

            ticks:{
                color:"#c026d3"
            }
        },

        x:{
            grid:{
                display:false
            },

            ticks:{
                color:"#5c6c96"
            }
        }
    };

    const datasetAmostras = dsLine(
        "Amostras",
        (a.mensal || []).map(i => Number(i.valor || 0)),
        "#1d4eff"
    );

    datasetAmostras.yAxisID = "y";
    datasetAmostras._ocultarZero = true;

    const datasetHoras = dsLine(
        "Horas",
        (a.mensal || []).map(i => Number(i.horas || 0)),
        "#c026d3"
    );

    datasetHoras.yAxisID = "y1";
    datasetHoras._horas = true;
    datasetHoras._ocultarZero = true;
    datasetHoras.borderWidth = 2;
    datasetHoras.borderDash = [7,5];
    datasetHoras.pointStyle = "rectRot";
    datasetHoras.pointRadius = 5;
    datasetHoras.pointHoverRadius = 7;

    graficoAtual = new Chart(
        document.getElementById("grafico"),
        {

            type:"line",

            data:{
                labels:(a.mensal || []).map(i => i.mes),

                datasets:[
                    datasetAmostras,
                    datasetHoras
                ]
            },

            options:opcoesAmostra

        }
    );
}
