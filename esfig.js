function renderEsfig(){

    const esfig = dados.esfig || {};


    /*
    |--------------------------------------------------------------------------
    | PRODUTOS
    |--------------------------------------------------------------------------
    | Mantém a tabela ordenada numericamente pelo SKU.
    */
    const produtos = [...(esfig.produtos || [])]
        .sort((a,b) => {

            const skuA = parseInt(a.sku,10);
            const skuB = parseInt(b.sku,10);

            if(
                Number.isNaN(skuA) &&
                Number.isNaN(skuB)
            ){
                return String(a.sku || "")
                    .localeCompare(
                        String(b.sku || ""),
                        "pt-BR"
                    );
            }

            if(Number.isNaN(skuA)){
                return 1;
            }

            if(Number.isNaN(skuB)){
                return -1;
            }

            return skuA - skuB;
        });


    /*
    |--------------------------------------------------------------------------
    | TOTAIS DO FLUXO OPERACIONAL
    |--------------------------------------------------------------------------
    */
    const totalAguardando =
        produtos.reduce(
            (soma,item) =>
                soma + Number(item.aguardando || 0),
            0
        );

    const totalDesmontado =
        produtos.reduce(
            (soma,item) =>
                soma + Number(item.desmontado || 0),
            0
        );

    const totalAferidos =
        produtos.reduce(
            (soma,item) =>
                soma + Number(item.aferidos || 0),
            0
        );


    /*
    |--------------------------------------------------------------------------
    | PERCENTUAL DE PROCESSAMENTO
    |--------------------------------------------------------------------------
    | Considera todas as etapas do fluxo.
    */
    const totalFluxo =
        totalAguardando +
        totalDesmontado +
        totalAferidos;

    const conclusao =
        totalFluxo > 0
            ? Number(
                (
                    totalAferidos /
                    totalFluxo *
                    100
                ).toFixed(1)
            )
            : 0;

    const larguraConclusao =
        Math.min(
            Math.max(conclusao,0),
            100
        );


    /*
    |--------------------------------------------------------------------------
    | DADOS DO PARETO
    |--------------------------------------------------------------------------
    | Filtra valores positivos e ordena do maior para o menor.
    */
    const dadosPareto =
        produtos
            .map(item => ({

                sku:
                    item.sku ||
                    "Sem SKU",

                quantidade:
                    Number(
                        item.totalAnualSku || 0
                    )

            }))
            .filter(item =>

                Number.isFinite(item.quantidade) &&
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
    | TOTAL DO PARETO
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
    | PERCENTUAL ACUMULADO
    |--------------------------------------------------------------------------
    */
    let acumuladoPareto = 0;

    const percentualAcumulado =
        quantidadesPareto.map(valor => {

            acumuladoPareto += valor;

            if(totalPareto <= 0){
                return null;
            }

            return Number(
                (
                    acumuladoPareto /
                    totalPareto *
                    100
                ).toFixed(1)
            );
        });


    /*
    |--------------------------------------------------------------------------
    | IDENTIFICA OS SKUs ATÉ 80%
    |--------------------------------------------------------------------------
    */
    let indiceLimite80 =
        percentualAcumulado.findIndex(
            percentual =>
                percentual !== null &&
                percentual >= 80
        );

    if(
        indiceLimite80 < 0 &&
        percentualAcumulado.length
    ){
        indiceLimite80 =
            percentualAcumulado.length - 1;
    }

    const quantidadeSkus80 =
        indiceLimite80 >= 0
            ? indiceLimite80 + 1
            : 0;

    const percentualLimite80 =
        indiceLimite80 >= 0
            ? percentualAcumulado[
                indiceLimite80
            ]
            : 0;


    /*
    |--------------------------------------------------------------------------
    | CORES DAS BARRAS
    |--------------------------------------------------------------------------
    | Os SKUs que formam os primeiros 80% recebem maior destaque.
    */
    const coresBarras =
        quantidadesPareto.map(
            (valor,indice) => {

                if(indice <= indiceLimite80){
                    return "#1455f5";
                }

                return "#8db4ff";
            }
        );

    const bordasBarras =
        quantidadesPareto.map(
            (valor,indice) => {

                if(indice <= indiceLimite80){
                    return "#0d42cf";
                }

                return "#6395ef";
            }
        );


    /*
    |--------------------------------------------------------------------------
    | HTML DA PÁGINA
    |--------------------------------------------------------------------------
    */
    conteudo.innerHTML = `

        <div class="page-title">
            ⏱ ESFIGMOMANÔMETRO
        </div>


        <!-- CARDS -->

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

        <!-- GRÁFICO PRINCIPAL -->

<section class="panel">

    <h3>
        📊 Total Anual por SKU — Pareto
    </h3>

    <div class="chart-box chart-box-esfig">
        <canvas id="grafico"></canvas>
    </div>

    ${
        dadosPareto.length
            ? `
                <div class="esfig-pareto-resumo">

                    <div class="esfig-pareto-resumo-icone">
                        ℹ
                    </div>

                    <div>
                        <strong>
                            Análise de Pareto
                        </strong>

                        <p>
                            Aproximadamente
                            <b>${percentualLimite80}%</b>
                            das aferições estão concentradas nos primeiros
                            <b>${quantidadeSkus80} SKU(s)</b>.
                        </p>
                    </div>

                </div>
            `
            : ""
    }

</section>


<!-- PARTE INFERIOR IGUAL À IMPORTAÇÃO -->

<section class="esfig-bottom-grid">


    <!-- FLUXO OPERACIONAL -->

    <div class="panel">

        <h3>
            ⏱ Fluxo Operacional
        </h3>

        <div class="fluxo esfig-fluxo-horizontal">

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

    </div>


    <!-- TABELA -->

    <div class="panel">

        <h3>
            📋 Controle de Produtos
        </h3>

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


</section>

`;



    /*
    |--------------------------------------------------------------------------
    | DESTRÓI GRÁFICO ANTERIOR
    |--------------------------------------------------------------------------
    */
    if(
        typeof graficoAtual !== "undefined" &&
        graficoAtual
    ){
        graficoAtual.destroy();
        graficoAtual = null;
    }


    /*
    |--------------------------------------------------------------------------
    | LOCALIZA O CANVAS
    |--------------------------------------------------------------------------
    */
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
    | SEM DADOS
    |--------------------------------------------------------------------------
    */
    if(!dadosPareto.length){

        const contexto =
            canvas.getContext("2d");

        contexto.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        contexto.save();

        contexto.textAlign = "center";
        contexto.textBaseline = "middle";
        contexto.font =
            "600 16px Arial, sans-serif";

        contexto.fillStyle =
            "#54617a";

        contexto.fillText(
            "Não há dados disponíveis para o Pareto.",
            canvas.width / 2,
            canvas.height / 2
        );

        contexto.restore();

        return;
    }


    /*
    |--------------------------------------------------------------------------
    | PLUGIN DA LINHA DE 80%
    |--------------------------------------------------------------------------
    */
    const linhaMetaPareto = {

        id:"linhaMetaPareto",

        afterDraw(chart){

            const escalaPercentual =
                chart.scales.y1;

            const area =
                chart.chartArea;

            if(
                !escalaPercentual ||
                !area
            ){
                return;
            }

            const contexto =
                chart.ctx;

            const posicaoY =
                escalaPercentual.getPixelForValue(80);

            contexto.save();

            contexto.beginPath();

            contexto.setLineDash([7,5]);

            contexto.moveTo(
                area.left,
                posicaoY
            );

            contexto.lineTo(
                area.right,
                posicaoY
            );

            contexto.lineWidth = 1.5;

            contexto.strokeStyle =
                "rgba(65,76,97,0.75)";

            contexto.stroke();

            contexto.setLineDash([]);

            contexto.font =
                "bold 11px Arial, sans-serif";

            contexto.textAlign = "right";
            contexto.textBaseline = "bottom";

            contexto.fillStyle =
                "#35415a";

            contexto.fillText(
                "Meta 80%",
                area.right - 6,
                posicaoY - 5
            );

            contexto.restore();
        }
    };


    /*
    |--------------------------------------------------------------------------
    | PLUGINS DISPONÍVEIS
    |--------------------------------------------------------------------------
    */
    const pluginsGrafico = [
        linhaMetaPareto
    ];

    if(
        typeof ChartDataLabels !==
        "undefined"
    ){
        pluginsGrafico.push(
            ChartDataLabels
        );
    }


    /*
    |--------------------------------------------------------------------------
    | CRIAÇÃO DO PARETO
    |--------------------------------------------------------------------------
    */
    graficoAtual = new Chart(
        canvas,
        {

            type:"bar",

            plugins:pluginsGrafico,


            data:{

                labels:labelsPareto,

                datasets:[

                    /*
                    |--------------------------------------------------------------------------
                    | BARRAS
                    |--------------------------------------------------------------------------
                    */
                    {
                        type:"bar",

                        label:
                            "Total de Aferições",

                        data:
                            quantidadesPareto,

                        backgroundColor:
                            coresBarras,

                        borderColor:
                            bordasBarras,

                        borderWidth:1,

                        borderRadius:{
                            topLeft:5,
                            topRight:5
                        },

                        borderSkipped:false,

                        maxBarThickness:72,

                        yAxisID:"y",

                        order:2
                    },


                    /*
                    |--------------------------------------------------------------------------
                    | LINHA ACUMULADA
                    |--------------------------------------------------------------------------
                    */
                    {
                        type:"line",

                        label:
                            "% Acumulado",

                        data:
                            percentualAcumulado,

                        borderColor:
                            "#ef2bb3",

                        backgroundColor:
                            "#ef2bb3",

                        pointBackgroundColor:
                            "#ef2bb3",

                        pointBorderColor:
                            "#ffffff",

                        pointBorderWidth:2,

                        pointRadius:5,

                        pointHoverRadius:7,

                        pointHitRadius:14,

                        borderWidth:3,

                        tension:0.25,

                        fill:false,

                        spanGaps:false,

                        yAxisID:"y1",

                        order:1
                    }

                ]
            },


            options:{

                responsive:true,

                maintainAspectRatio:false,


                layout:{

                    padding:{

                        top:25,
                        right:18,
                        bottom:8,
                        left:8
                    }
                },


                interaction:{

                    mode:"index",

                    intersect:false
                },


                animation:{

                    duration:650
                },


                plugins:{

                    /*
                    |--------------------------------------------------------------------------
                    | LEGENDA
                    |--------------------------------------------------------------------------
                    */
                    legend:{

                        display:true,

                        position:"top",

                        align:"center",

                        labels:{

                            boxWidth:28,

                            boxHeight:10,

                            padding:20,

                            usePointStyle:false,

                            font:{

                                size:12,

                                weight:"600"
                            }
                        }
                    },


                    /*
                    |--------------------------------------------------------------------------
                    | TOOLTIP
                    |--------------------------------------------------------------------------
                    */
                    tooltip:{

                        enabled:true,

                        backgroundColor:
                            "rgba(8,25,71,0.94)",

                        titleColor:"#ffffff",

                        bodyColor:"#ffffff",

                        padding:12,

                        cornerRadius:8,

                        displayColors:true,

                        filter:function(context){

                            return (
                                context.raw !== null &&
                                context.raw !== undefined
                            );
                        },

                        callbacks:{

                            label:function(context){

                                if(
                                    context.dataset.label ===
                                    "% Acumulado"
                                ){
                                    return (
                                        "% acumulado: " +
                                        context.raw +
                                        "%"
                                    );
                                }

                                return (
                                    "Total de aferições: " +
                                    numero(context.raw)
                                );
                            }
                        }
                    },


                    /*
                    |--------------------------------------------------------------------------
                    | RÓTULOS DOS DADOS
                    |--------------------------------------------------------------------------
                    */
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


                        formatter:function(
                            valor,
                            context
                        ){

                            if(
                                context.dataset.label ===
                                "% Acumulado"
                            ){
                                return `${valor}%`;
                            }

                            return numero(valor);
                        },


                        color:function(context){

                            if(
                                context.dataset.label ===
                                "% Acumulado"
                            ){
                                return "#15224a";
                            }

                            return "#15224a";
                        },


                        anchor:function(context){

                            if(
                                context.dataset.label ===
                                "% Acumulado"
                            ){
                                return "center";
                            }

                            return "end";
                        },


                        align:function(context){

                            if(
                                context.dataset.label ===
                                "% Acumulado"
                            ){
                                return "top";
                            }

                            return "top";
                        },


                        offset:function(context){

                            if(
                                context.dataset.label ===
                                "% Acumulado"
                            ){
                                return 7;
                            }

                            return 3;
                        },


                        clamp:true,

                        clip:false,


                        font:function(context){

                            if(
                                context.dataset.label ===
                                "% Acumulado"
                            ){
                                return {

                                    size:11,

                                    weight:"bold"
                                };
                            }

                            return {

                                size:11,

                                weight:"bold"
                            };
                        }
                    }
                },


                scales:{

                    /*
                    |--------------------------------------------------------------------------
                    | EIXO DOS SKUs
                    |--------------------------------------------------------------------------
                    */
                    x:{

                        offset:true,

                        grid:{

                            display:false
                        },

                        border:{

                            color:
                                "rgba(24,61,129,0.30)"
                        },

                        title:{

                            display:true,

                            text:"SKU",

                            color:"#40506b",

                            font:{

                                size:12,

                                weight:"600"
                            }
                        },

                        ticks:{

                            autoSkip:false,

                            maxRotation:0,

                            minRotation:0,

                            color:"#44516a",

                            font:{

                                size:11,

                                weight:"500"
                            }
                        }
                    },


                    /*
                    |--------------------------------------------------------------------------
                    | EIXO DAS QUANTIDADES
                    |--------------------------------------------------------------------------
                    */
                    y:{

                        beginAtZero:true,

                        position:"left",

                        grace:"10%",

                        grid:{

                            color:
                                "rgba(15,31,77,0.08)"
                        },

                        border:{

                            display:false
                        },

                        title:{

                            display:true,

                            text:
                                "Total de aferições",

                            color:"#40506b",

                            font:{

                                size:12,

                                weight:"600"
                            }
                        },

                        ticks:{

                            precision:0,

                            color:"#536078",

                            callback:function(valor){

                                return numero(valor);
                            }
                        }
                    },


                    /*
                    |--------------------------------------------------------------------------
                    | EIXO DO PERCENTUAL
                    |--------------------------------------------------------------------------
                    */
                    y1:{

                        beginAtZero:true,

                        min:0,

                        max:100,

                        position:"right",

                        grid:{

                            drawOnChartArea:false
                        },

                        border:{

                            display:false
                        },

                        title:{

                            display:true,

                            text:
                                "% Acumulado",

                            color:"#40506b",

                            font:{

                                size:12,

                                weight:"600"
                            }
                        },

                        ticks:{

                            stepSize:20,

                            color:"#536078",

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
