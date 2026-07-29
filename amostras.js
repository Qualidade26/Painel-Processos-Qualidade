function renderAmostra(){

    const a = dados.amostras || {
        mensal:[],
        top10:[],
        totalHoras:0
    };

    const mensal = Array.isArray(a.mensal)
        ? a.mensal
        : [];

    const top10 = Array.isArray(a.top10)
        ? a.top10
        : [];

    /* =====================================================
       CONVERSÃO SEGURA DE NÚMEROS

       Converte corretamente:
       10
       "10"
       "10,50"
       "1.250,75"
       ===================================================== */

    function numeroSeguro(valor){

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
            .replace(/\s/g,"");

        if(
            texto.includes(".") &&
            texto.includes(",")
        ){
            texto = texto
                .replace(/\./g,"")
                .replace(",",".");
        }
        else if(texto.includes(",")){
            texto = texto.replace(",",".");
        }

        const resultado = Number(texto);

        return Number.isFinite(resultado)
            ? resultado
            : 0;
    }

    const valoresAmostras = mensal.map(item =>
        numeroSeguro(item.valor)
    );

    const valoresHoras = mensal.map(item =>
        numeroSeguro(item.horas)
    );

    const totalAno = valoresAmostras.reduce(
        (soma,valor) => soma + valor,
        0
    );

    const totalHorasInformado =
        numeroSeguro(a.totalHoras);

    const totalHorasMensais =
        valoresHoras.reduce(
            (soma,valor) => soma + valor,
            0
        );

    /*
       Caso totalHoras não esteja preenchido,
       utiliza a soma das horas mensais.
    */

    const totalHoras =
        totalHorasInformado > 0
            ? totalHorasInformado
            : totalHorasMensais;

    const mesesComAmostras =
        valoresAmostras.filter(valor => valor > 0);

    const mediaMensal =
        mesesComAmostras.length > 0
            ? totalAno / mesesComAmostras.length
            : 0;

    let melhorMes = {
        mes:"-",
        valor:0
    };

    mensal.forEach((item,index) => {

        const valor =
            valoresAmostras[index];

        if(valor > melhorMes.valor){

            melhorMes = {
                mes:item.mes || "-",
                valor:valor
            };
        }
    });

    /* =====================================================
       SKU MAIS SOLICITADO
       ===================================================== */

    const rankingSku = top10
        .map(item => ({

            sku:
                item.sku ||
                item.SKU ||
                item.codigo ||
                item.nome ||
                "-",

            quantidade:numeroSeguro(
                item.quantidade ??
                item.qtd ??
                item.valor ??
                item.total
            )
        }))
        .filter(item => item.quantidade > 0)
        .sort(
            (a,b) =>
                b.quantidade - a.quantidade
        );

    const skuMaisSolicitado =
        rankingSku[0] || {
            sku:"-",
            quantidade:0
        };

    const tempoMedioHoras =
        totalAno > 0
            ? totalHoras / totalAno
            : 0;

    const tempoMedioMinutos =
        tempoMedioHoras * 60;

    /* =====================================================
       HTML
       ===================================================== */

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
                totalHoras.toLocaleString(
                    "pt-BR",
                    {
                        minimumFractionDigits:2,
                        maximumFractionDigits:2
                    }
                ),
                "Horas destinadas"
            )}

        </section>

        <section class="amostra-grafico-unico">

            <div class="panel amostra-panel-grafico-unico">

                <h3>
                    📈 EVOLUÇÃO MENSAL DE AMOSTRAS
                </h3>

                <div class="amostra-chart-unico">

                    <canvas
                        id="graficoAmostrasMensal">
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
                                    minimumFractionDigits:1,
                                    maximumFractionDigits:1
                                }
                            )}

                        </strong>

                        <span class="amostra-indicador-subtitulo">
                            Amostras por mês
                        </span>

                    </div>

                </div>

                <div class="amostra-mini-chart">

                    <canvas id="miniMediaAmostras">
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

                    <canvas id="miniMelhorMes">
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
                            class="amostra-indicador-valor amostra-sku">

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

                    <canvas id="miniSku">
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
                                    minimumFractionDigits:2,
                                    maximumFractionDigits:2
                                }
                            )} h

                        </strong>

                        <span class="amostra-indicador-subtitulo">

                            ${tempoMedioMinutos.toLocaleString(
                                "pt-BR",
                                {
                                    minimumFractionDigits:1,
                                    maximumFractionDigits:1
                                }
                            )} min por amostra

                        </span>

                    </div>

                </div>

                <div class="amostra-mini-chart">

                    <canvas id="miniTempoAmostra">
                    </canvas>

                </div>

            </div>

        </section>
    `;

    /* =====================================================
       DESTRUIR GRÁFICOS ANTERIORES
       ===================================================== */

    if(window.graficoAmostrasMensalAtual){

        window.graficoAmostrasMensalAtual
            .destroy();
    }

    if(window.graficoParetoAmostrasAtual){

        window.graficoParetoAmostrasAtual
            .destroy();

        window.graficoParetoAmostrasAtual =
            null;
    }

    if(
        Array.isArray(
            window.miniGraficosAmostra
        )
    ){

        window.miniGraficosAmostra
            .forEach(grafico => {

                if(grafico){
                    grafico.destroy();
                }
            });
    }

    window.miniGraficosAmostra = [];

    /* =====================================================
       ESCALA AUTOMÁTICA

       Cria espaço acima dos maiores valores para os
       números não serem cortados.
       ===================================================== */

    const maiorAmostra = Math.max(
        1,
        ...valoresAmostras
    );

    const maiorHora = Math.max(
        1,
        ...valoresHoras
    );

    const limiteAmostras =
        Math.ceil(maiorAmostra * 1.35);

    const limiteHoras =
        maiorHora * 1.40;

    /* =====================================================
       PLUGIN DE RÓTULOS

       Amostras ficam acima das barras.
       Horas ficam acima ou abaixo da linha.
       Zero não aparece.
       ===================================================== */

    const rotulosEvolucaoAmostra = {

        id:"rotulosEvolucaoAmostra",

        afterDatasetsDraw(chart){

            const ctx = chart.ctx;

            const metaBarras =
                chart.getDatasetMeta(0);

            const metaLinha =
                chart.getDatasetMeta(1);

            ctx.save();

            valoresAmostras.forEach(
                (valor,index) => {

                    if(valor <= 0){
                        return;
                    }

                    const barra =
                        metaBarras.data[index];

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
                        "#12347c";

                    ctx.fillText(
                        numero(valor),
                        barra.x,
                        barra.y - 8
                    );
                }
            );

            valoresHoras.forEach(
                (valor,index) => {

                    if(valor <= 0){
                        return;
                    }

                    const ponto =
                        metaLinha.data[index];

                    const barra =
                        metaBarras.data[index];

                    if(!ponto){
                        return;
                    }

                    /*
                       Se o ponto da linha estiver muito
                       próximo do topo da barra, o valor
                       das horas será colocado abaixo.
                    */

                    const distanciaDaBarra =
                        barra
                            ? Math.abs(
                                ponto.y - barra.y
                            )
                            : 100;

                    const colocarAbaixo =
                        distanciaDaBarra < 25 ||
                        ponto.y < chart.chartArea.top + 25;

                    ctx.font =
                        "bold 11px Arial";

                    ctx.textAlign =
                        "center";

                    ctx.fillStyle =
                        "#a21caf";

                    if(colocarAbaixo){

                        ctx.textBaseline =
                            "top";

                        ctx.fillText(
                            valor.toLocaleString(
                                "pt-BR",
                                {
                                    minimumFractionDigits:1,
                                    maximumFractionDigits:2
                                }
                            ),
                            ponto.x,
                            ponto.y + 11
                        );
                    }
                    else{

                        ctx.textBaseline =
                            "bottom";

                        ctx.fillText(
                            valor.toLocaleString(
                                "pt-BR",
                                {
                                    minimumFractionDigits:1,
                                    maximumFractionDigits:2
                                }
                            ),
                            ponto.x,
                            ponto.y - 11
                        );
                    }
                }
            );

            ctx.restore();
        }
    };

    /* =====================================================
       GRÁFICO PRINCIPAL
       ===================================================== */

    window.graficoAmostrasMensalAtual =
        new Chart(
            document.getElementById(
                "graficoAmostrasMensal"
            ),
            {

                type:"bar",

                data:{

                    labels:mensal.map(
                        item => item.mes
                    ),

                    datasets:[

                        {
                            type:"bar",

                            label:"Amostras",

                            data:valoresAmostras,

                            backgroundColor:
                                "#1d4ed8",

                            borderColor:
                                "#1d4ed8",

                            borderWidth:1,

                            borderRadius:4,

                            maxBarThickness:34,

                            categoryPercentage:.68,

                            barPercentage:.72,

                            yAxisID:"y",

                            order:2
                        },

                        {
                            type:"line",

                            label:"Horas",

                            data:valoresHoras,

                            borderColor:
                                "#c026d3",

                            backgroundColor:
                                "#c026d3",

                            pointBackgroundColor:
                                "#ffffff",

                            pointBorderColor:
                                "#c026d3",

                            pointBorderWidth:2,

                            pointRadius:5,

                            pointHoverRadius:7,

                            borderWidth:2,

                            borderDash:[7,5],

                            tension:.20,

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

                    interaction:{
                        mode:"index",
                        intersect:false
                    },

                    layout:{
                        padding:{
                            top:28,
                            right:10,
                            bottom:4,
                            left:4
                        }
                    },

                    plugins:{

                        legend:{

                            display:true,

                            position:"top",

                            align:"center",

                            labels:{

                                usePointStyle:true,

                                boxWidth:14,

                                padding:18,

                                color:"#1b2b5c",

                                font:{
                                    size:11,
                                    weight:"bold"
                                }
                            }
                        },

                        /*
                           Desativa ChartDataLabels global,
                           caso esteja registrado no painel.
                        */

                        datalabels:{
                            display:false
                        },

                        tooltip:{

                            callbacks:{

                                label(context){

                                    const valor =
                                        numeroSeguro(
                                            context.raw
                                        );

                                    if(
                                        context.dataset
                                            .yAxisID === "y1"
                                    ){

                                        return ` Horas: ${
                                            valor.toLocaleString(
                                                "pt-BR",
                                                {
                                                    minimumFractionDigits:1,
                                                    maximumFractionDigits:2
                                                }
                                            )
                                        } h`;
                                    }

                                    return ` Amostras: ${
                                        numero(valor)
                                    }`;
                                }
                            }
                        }
                    },

                    scales:{

                        y:{

                            beginAtZero:true,

                            suggestedMax:
                                limiteAmostras,

                            position:"left",

                            title:{

                                display:true,

                                text:
                                    "Quantidade de amostras",

                                color:"#0f1f4d",

                                font:{
                                    weight:"bold"
                                }
                            },

                            grid:{
                                color:
                                    "rgba(15,31,77,.08)"
                            },

                            ticks:{

                                precision:0,

                                color:"#5c6c96",

                                callback(valor){

                                    /*
                                       Não escreve zero
                                       na escala.
                                    */

                                    return Number(valor) === 0
                                        ? ""
                                        : numero(valor);
                                }
                            }
                        },

                        y1:{

                            beginAtZero:true,

                            suggestedMax:
                                limiteHoras,

                            position:"right",

                            title:{

                                display:true,

                                text:"Horas",

                                color:"#c026d3",

                                font:{
                                    weight:"bold"
                                }
                            },

                            grid:{
                                drawOnChartArea:false
                            },

                            ticks:{

                                color:"#c026d3",

                                callback(valor){

                                    return Number(valor) === 0
                                        ? ""
                                        : Number(valor)
                                            .toLocaleString(
                                                "pt-BR",
                                                {
                                                    maximumFractionDigits:1
                                                }
                                            );
                                }
                            }
                        },

                        x:{

                            offset:true,

                            grid:{
                                display:false
                            },

                            ticks:{

                                color:"#5c6c96",

                                autoSkip:false,

                                maxRotation:0,

                                minRotation:0,

                                font:{
                                    size:11,
                                    weight:"bold"
                                }
                            }
                        }
                    }
                },

                plugins:[
                    rotulosEvolucaoAmostra
                ]
            }
        );

    /* =====================================================
       MINI GRÁFICOS SEM NÚMEROS
       ===================================================== */

    function criarMiniGrafico(
        id,
        tipo,
        valores,
        cor,
        destacarMaior = false
    ){

        const canvas =
            document.getElementById(id);

        if(!canvas){
            return;
        }

        const maiorValor =
            valores.length
                ? Math.max(...valores)
                : 0;

        const cores = valores.map(
            valor => {

                if(
                    destacarMaior &&
                    valor === maiorValor &&
                    valor > 0
                ){
                    return "#22c55e";
                }

                return cor;
            }
        );

        const grafico =
            new Chart(canvas,{

                type:tipo,

                data:{

                    labels:valores.map(
                        (_,index) => index + 1
                    ),

                    datasets:[{

                        data:valores,

                        backgroundColor:
                            tipo === "bar"
                                ? cores
                                : "transparent",

                        borderColor:cor,

                        borderWidth:
                            tipo === "line"
                                ? 2
                                : 0,

                        pointRadius:0,

                        pointHoverRadius:0,

                        borderRadius:2,

                        maxBarThickness:10,

                        tension:.25,

                        fill:false
                    }]
                },

                options:{

                    responsive:true,

                    maintainAspectRatio:false,

                    events:[],

                    animation:{
                        duration:400
                    },

                    plugins:{

                        legend:{
                            display:false
                        },

                        tooltip:{
                            enabled:false
                        },

                        /*
                           Remove números das barras,
                           mesmo se ChartDataLabels estiver
                           ativo globalmente.
                        */

                        datalabels:{
                            display:false
                        }
                    },

                    scales:{

                        x:{
                            display:false
                        },

                        y:{
                            display:false,
                            beginAtZero:true
                        }
                    }
                }
            });

        window.miniGraficosAmostra
            .push(grafico);
    }

    criarMiniGrafico(
        "miniMediaAmostras",
        "bar",
        valoresAmostras,
        "#3b82f6"
    );

    criarMiniGrafico(
        "miniMelhorMes",
        "bar",
        valoresAmostras,
        "#3b82f6",
        true
    );

    criarMiniGrafico(
        "miniSku",
        "bar",
        rankingSku.map(
            item => item.quantidade
        ),
        "#3b82f6"
    );

    criarMiniGrafico(
        "miniTempoAmostra",
        "line",
        valoresHoras,
        "#2563eb"
    );
}
