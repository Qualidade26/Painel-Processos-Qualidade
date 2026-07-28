function renderEsfig(){

    const esfig = dados.esfig || {};

    const produtos = [...(esfig.produtos || [])].sort((a,b) => {

        const na = parseInt(a.sku,10);
        const nb = parseInt(b.sku,10);

        if(Number.isNaN(na) && Number.isNaN(nb))
            return String(a.sku).localeCompare(String(b.sku));

        if(Number.isNaN(na))
            return 1;

        if(Number.isNaN(nb))
            return -1;

        return na - nb;
    });

    const totalAguardando =
        produtos.reduce(
            (s,i) =>
                s + Number(i.aguardando || 0),
            0
        );

    const totalDesmontado =
        produtos.reduce(
            (s,i) =>
                s + Number(i.desmontado || 0),
            0
        );

    const totalAferidos =
        produtos.reduce(
            (s,i) =>
                s + Number(i.aferidos || 0),
            0
        );

    const totalGeral =
        totalAguardando +
        totalDesmontado +
        totalAferidos;

    const conclusao =
        totalGeral
            ? (
                (totalAferidos / totalGeral) *
                100
            ).toFixed(1)
            : 0;


    /*
    |--------------------------------------------------------------------------
    | DADOS DO PARETO
    |--------------------------------------------------------------------------
    | Remove SKUs sem valor e ordena do maior para o menor.
    */
    const dadosPareto = produtos
        .map(item => ({
            sku: item.sku || "-",
            quantidade:
                Number(item.totalAnualSku || 0)
        }))
        .filter(item =>
            item.quantidade > 0
        )
        .sort(
            (a,b) =>
                b.quantidade -
                a.quantidade
        );


    const labelsPareto =
        dadosPareto.map(item =>
            String(item.sku)
        );

    const quantidadesPareto =
        dadosPareto.map(item =>
            item.quantidade
        );


    /*
    |--------------------------------------------------------------------------
    | TOTAL GERAL DO PARETO
    |--------------------------------------------------------------------------
    */
    const totalPareto =
        quantidadesPareto.reduce(
            (soma,valor) =>
                soma + valor,
            0
        );


   /*
|--------------------------------------------------------------------------
| LINHA DO PARETO
|--------------------------------------------------------------------------
| Calcula o percentual acumulado e inverte somente a apresentação
| da linha para que ela suba da esquerda para a direita.
*/
let acumulado = 0;

const percentualCalculado =
    quantidadesPareto.map(valor => {

        acumulado += valor;

        if(totalPareto === 0){
            return null;
        }

        return Number(
            (
                (acumulado / totalPareto) *
                100
            ).toFixed(1)
        );
    });

const percentualAcumulado =
    [...percentualCalculado].reverse();


    conteudo.innerHTML = `
        <div class="page-title">
            ⏱ ESFIGMOMANÔMETRO
        </div>

        <section class="cards">

            ${card(
                "💰",
                "Total Gasto por GRU",
                moeda(esfig.totalGruInmetro),
                "Valor pago ao Inmetro"
            )}

            ${card(
                "📅",
                "Última Aferição",
                esfig.ultimaAfericao || "-",
                "Data registrada"
            )}

            ${card(
                "📆",
                "Próxima Aferição",
                esfig.proximaAfericao || "-",
                "Previsão"
            )}

            ${card(
                "⏱",
                "Total de Horas",
                numero(esfig.totalHoras),
                "Horas da atividade"
            )}

        </section>

        <section class="grid-3-2">

            <div class="panel esfig-flow">

                <h3>
                    ⏱ Esfigmomanômetro - Fluxo Operacional
                </h3>

                <div class="fluxo">

                    <div class="fluxo-item">

                        <strong>
                            ${numero(totalAguardando)}
                        </strong>

                        <small>
                            Aguardando Desmontagem
                        </small>

                    </div>

                    <div class="fluxo-arrow">
                        →
                    </div>

                    <div class="fluxo-item pink">

                        <strong>
                            ${numero(totalDesmontado)}
                        </strong>

                        <small>
                            Desmontado
                        </small>

                    </div>

                    <div class="fluxo-arrow">
                        →
                    </div>

                    <div class="fluxo-item green">

                        <strong>
                            ${numero(totalAferidos)}
                        </strong>

                        <small>
                            Aferidos / Montagem
                        </small>

                    </div>

                </div>

                <div class="progress-title">
                    Processamento geral
                </div>

                <div class="progress-box">

                    <div
                        class="progress-bar"
                        style="width:${conclusao}%"
                    >
                        ${conclusao}% concluído
                    </div>

                </div>

                ${
                    tabelaFixa(
                        [
                            "SKU",
                            "Descrição",
                            "Aguard.",
                            "Desm.",
                            "Afer.",
                            "Status"
                        ],
                        montarLinhasEsfig(produtos),
                        true
                    )
                }

            </div>


            <div class="panel esfig-chart">

                <h3>
                    Total Anual por SKU — Pareto
                </h3>

                <div class="chart-box esfig-large">
                    <canvas id="grafico"></canvas>
                </div>

            </div>

        </section>
    `;


    /*
    |--------------------------------------------------------------------------
    | EVITA GRÁFICO DUPLICADO
    |--------------------------------------------------------------------------
    */
    if(
        typeof graficoAtual !== "undefined" &&
        graficoAtual
    ){
        graficoAtual.destroy();
        graficoAtual = null;
    }


    const canvas =
        document.getElementById("grafico");

    if(!canvas){

        console.error(
            "Canvas do gráfico Esfig não encontrado."
        );

        return;
    }


    /*
    |--------------------------------------------------------------------------
    | CRIAÇÃO DO GRÁFICO PARETO
    |--------------------------------------------------------------------------
    */
    graficoAtual = new Chart(
        canvas,
        {
            data:{

                labels:labelsPareto,

                datasets:[

                    {
                        type:"bar",
                        label:"Total de Aferições",

                        data:quantidadesPareto,

                        backgroundColor:"#1d4eff",
                        borderColor:"#1d4eff",
                        borderWidth:1,
                        borderRadius:3,

                        xAxisID:"x",
                        order:2
                    },

                    {
    type: "line",
    label: "% Acumulado",

    data: percentualAcumulado,

    borderColor: "#f04dd8",
    backgroundColor: "#f04dd8",

    pointBackgroundColor: "#f04dd8",
    pointBorderColor: "#ffffff",
    pointBorderWidth: 1,

    pointRadius: 4,
    pointHoverRadius: 6,

    borderWidth: 2,
    tension: 0.25,
    spanGaps: false,

    xAxisID: "x1",
    order: 1
}

                ]
            },

            options:{

                responsive:true,
                maintainAspectRatio:false,
                indexAxis:"y",

                layout:{
                    padding:{
                        top:20,
                        right:30,
                        left:8,
                        bottom:8
                    }
                },

                interaction:{
                    mode:"index",
                    intersect:false
                },

                plugins:{

                    legend:{
                        display:true,
                        position:"top",

                        labels:{
                            usePointStyle:false,
                            boxWidth:25,
                            padding:15
                        }
                    },

                    tooltip:{
                        enabled:true,

                        filter:function(context){

                            return (
                                context.raw !== null &&
                                context.raw !== undefined &&
                                Number(context.raw) !== 0
                            );
                        },

                        callbacks:{

                            label:function(context){

                                if(
                                    context.dataset.label ===
                                    "% Acumulado"
                                ){
                                    return (
                                        `% acumulado: ` +
                                        `${context.raw}%`
                                    );
                                }

                                return (
                                    `Total de aferições: ` +
                                    `${numero(context.raw)}`
                                );
                            }
                        }
                    },

                    datalabels:{

                        display:function(context){

                            const valor =
                                context.dataset.data[
                                    context.dataIndex
                                ];

                            return (
                                valor !== null &&
                                valor !== undefined &&
                                Number(valor) !== 0
                            );
                        },

                        formatter:function(valor,context){

                            if(
                                context.dataset.label ===
                                "% Acumulado"
                            ){
                                return `${valor}%`;
                            }

                            return numero(valor);
                        }
                    }
                },

                scales:{

                    y:{

                        grid:{
                            display:false
                        },

                        title:{
                            display:true,
                            text:"SKU"
                        }
                    },

                    x:{

                        beginAtZero:true,
                        position:"bottom",

                        title:{
                            display:true,
                            text:"Total de aferições"
                        },

                        ticks:{

                            precision:0,

                            callback:function(valor){
                                return numero(valor);
                            }
                        }
                    },

                    x1:{

                        beginAtZero:true,
                        max:100,
                        position:"top",

                        grid:{
                            drawOnChartArea:false
                        },

                        title:{
                            display:true,
                            text:"% Acumulado"
                        },

                        ticks:{

                            stepSize:20,

                            callback:function(valor){
                                return `${valor}%`;
                            }
                        }
                    }
                }
            }
        }
    );
}
