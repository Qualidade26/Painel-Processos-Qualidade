/* ==========================================================
   TEMA GLOBAL DOS GRÁFICOS — CHART.JS
   Ajustado para maior nitidez, estabilidade e consistência
========================================================== */

(function configurarTemaDosGraficos() {

    "use strict";

    if(typeof Chart === "undefined"){

        console.error(
            "chart-theme.js: Chart.js ainda não foi carregado."
        );

        return;
    }


    /* ======================================================
       QUALIDADE E NITIDEZ RESPONSIVA

       - Mantém os gráficos nítidos em telas comuns e HiDPI.
       - Limita o DPR em 3 para evitar consumo excessivo.
       - O fornecedores.js pode definir devicePixelRatio:3
         localmente sem conflito.
    ====================================================== */

    function obterProporcaoNitidezGrafico(){

        const proporcaoTela =
            Number(
                window.devicePixelRatio || 1
            );

        return Math.max(
            2,
            Math.min(
                proporcaoTela * 1.5,
                3
            )
        );
    }


    Chart.defaults.devicePixelRatio =
        obterProporcaoNitidezGrafico();

    Chart.defaults.responsive =
        true;

    Chart.defaults.maintainAspectRatio =
        false;

    Chart.defaults.resizeDelay =
        120;


    /* ======================================================
       TIPOGRAFIA
    ====================================================== */

    Chart.defaults.font.family =
        "'Segoe UI', Arial, sans-serif";

    Chart.defaults.font.size =
        11;

    Chart.defaults.font.weight =
        "600";

    Chart.defaults.color =
        "#344260";


    /* ======================================================
       ANIMAÇÃO
    ====================================================== */

    Chart.defaults.animation.duration =
        650;

    Chart.defaults.animation.easing =
        "easeOutQuart";


    /* ======================================================
       LINHAS
    ====================================================== */

    Chart.defaults.elements.line.borderWidth =
        2.5;

    Chart.defaults.elements.line.tension =
        0.25;

    Chart.defaults.elements.point.radius =
        4;

    Chart.defaults.elements.point.hoverRadius =
        6;

    Chart.defaults.elements.point.borderWidth =
        2;

    Chart.defaults.elements.point.backgroundColor =
        "#ffffff";


    /* ======================================================
       BARRAS

       Os gráficos específicos podem sobrescrever espessura,
       raio ou cores sem perder o padrão global.
    ====================================================== */

    Chart.defaults.elements.bar.borderWidth =
        0;

    Chart.defaults.elements.bar.borderRadius =
        3;

    Chart.defaults.elements.bar.borderSkipped =
        false;


    /* ======================================================
       LEGENDA
    ====================================================== */

    Chart.defaults.plugins.legend.display =
        true;

    Chart.defaults.plugins.legend.position =
        "top";

    Chart.defaults.plugins.legend.align =
        "center";

    Chart.defaults.plugins.legend.labels.color =
        "#172653";

    Chart.defaults.plugins.legend.labels.usePointStyle =
        true;

    Chart.defaults.plugins.legend.labels.pointStyle =
        "circle";

    Chart.defaults.plugins.legend.labels.boxWidth =
        9;

    Chart.defaults.plugins.legend.labels.boxHeight =
        9;

    Chart.defaults.plugins.legend.labels.padding =
        10;

    Chart.defaults.plugins.legend.labels.font = {

        family:
            "'Segoe UI', Arial, sans-serif",

        size:
            11,

        weight:
            "700"
    };


    /* ======================================================
       TÍTULO
    ====================================================== */

    Chart.defaults.plugins.title.display =
        false;

    Chart.defaults.plugins.title.padding = {

        top:
            0,

        bottom:
            4
    };


    /* ======================================================
       TOOLTIP
    ====================================================== */

    Chart.defaults.plugins.tooltip.enabled =
        true;

    Chart.defaults.plugins.tooltip.backgroundColor =
        "rgba(255,255,255,.985)";

    Chart.defaults.plugins.tooltip.titleColor =
        "#102052";

    Chart.defaults.plugins.tooltip.bodyColor =
        "#344260";

    Chart.defaults.plugins.tooltip.borderColor =
        "#93c5fd";

    Chart.defaults.plugins.tooltip.borderWidth =
        1;

    Chart.defaults.plugins.tooltip.cornerRadius =
        8;

    Chart.defaults.plugins.tooltip.padding =
        10;

    Chart.defaults.plugins.tooltip.displayColors =
        true;

    Chart.defaults.plugins.tooltip.boxPadding =
        5;

    Chart.defaults.plugins.tooltip.titleFont = {

        family:
            "'Segoe UI', Arial, sans-serif",

        size:
            12,

        weight:
            "700"
    };

    Chart.defaults.plugins.tooltip.bodyFont = {

        family:
            "'Segoe UI', Arial, sans-serif",

        size:
            11,

        weight:
            "600"
    };


    /* ======================================================
       EIXOS
    ====================================================== */

    Chart.defaults.scale.grid.color =
        "rgba(15,31,77,.075)";

    Chart.defaults.scale.grid.lineWidth =
        1;

    Chart.defaults.scale.grid.drawTicks =
        false;

    Chart.defaults.scale.border.color =
        "rgba(15,31,77,.14)";

    Chart.defaults.scale.border.width =
        1;

    Chart.defaults.scale.ticks.color =
        "#44516f";

    Chart.defaults.scale.ticks.padding =
        7;

    Chart.defaults.scale.ticks.font = {

        family:
            "'Segoe UI', Arial, sans-serif",

        size:
            11,

        weight:
            "600"
    };

    Chart.defaults.scale.title.color =
        "#172653";

    Chart.defaults.scale.title.font = {

        family:
            "'Segoe UI', Arial, sans-serif",

        size:
            11,

        weight:
            "700"
    };


    /* ======================================================
       LAYOUT INTERNO
    ====================================================== */

    Chart.defaults.layout.padding = {

        top:
            0,

        right:
            8,

        bottom:
            3,

        left:
            5
    };


    /* ======================================================
       DATALABELS

       Se o plugin estiver carregado globalmente, fica
       desligado por padrão. Cada gráfico ativa quando precisar.
       Isso evita textos duplicados nos painéis.
    ====================================================== */

    if(
        Chart.defaults.plugins &&
        Chart.defaults.plugins.datalabels
    ){

        Chart.defaults.plugins.datalabels.display =
            false;
    }


    /* ======================================================
       ATUALIZAÇÃO AUTOMÁTICA DA NITIDEZ

       Recalcula apenas quando a proporção realmente muda.
       Evita o setInterval a cada 500ms, reduzindo consumo.
    ====================================================== */

    let proporcaoNitidezAnterior =
        obterProporcaoNitidezGrafico();

    let temporizadorNitidez =
        null;


    function obterInstanciasChart(){

        const instancias =
            Chart.instances || {};

        if(instancias instanceof Map){

            return Array.from(
                instancias.values()
            );
        }

        return Object.values(
            instancias
        );
    }


    function atualizarNitidezDosGraficos(){

        clearTimeout(
            temporizadorNitidez
        );

        temporizadorNitidez =
            setTimeout(
                () => {

                    const novaProporcao =
                        obterProporcaoNitidezGrafico();

                    const proporcaoMudou =
                        Math.abs(
                            novaProporcao -
                            proporcaoNitidezAnterior
                        ) > 0.01;

                    if(!proporcaoMudou){
                        return;
                    }

                    proporcaoNitidezAnterior =
                        novaProporcao;

                    Chart.defaults.devicePixelRatio =
                        novaProporcao;


                    obterInstanciasChart().forEach(
                        grafico => {

                            if(
                                !grafico ||
                                typeof grafico.resize !==
                                "function"
                            ){
                                return;
                            }


                            /*
                               Respeita gráficos que definem DPR
                               próprio (ex.: fornecedores = 3).
                            */

                            const possuiDprLocal =
                                grafico.config?._config?.options
                                    ?.devicePixelRatio !==
                                undefined;


                            if(!possuiDprLocal){

                                grafico.options.devicePixelRatio =
                                    novaProporcao;
                            }


                            grafico.resize();

                            grafico.update(
                                "none"
                            );
                        }
                    );
                },
                160
            );
    }


    window.addEventListener(
        "resize",
        atualizarNitidezDosGraficos,
        {
            passive:true
        }
    );


    if(window.visualViewport){

        window.visualViewport.addEventListener(
            "resize",
            atualizarNitidezDosGraficos,
            {
                passive:true
            }
        );
    }


    /*
       Alguns navegadores mudam o devicePixelRatio ao mover
       a janela entre monitores. orientationchange também
       força uma nova verificação.
    */

    window.addEventListener(
        "orientationchange",
        atualizarNitidezDosGraficos,
        {
            passive:true
        }
    );


    console.log(
        "Tema global dos gráficos carregado com sucesso."
    );

})();
