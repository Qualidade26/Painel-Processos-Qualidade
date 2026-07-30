/* ==========================================================
   TEMA GLOBAL DOS GRÁFICOS — CHART.JS
========================================================== */

(function configurarTemaDosGraficos() {

    if (typeof Chart === "undefined") {
        console.error(
            "chart-theme.js: Chart.js ainda não foi carregado."
        );
        return;
    }

    /* ======================================================
       QUALIDADE E RESPONSIVIDADE
    ====================================================== */

    Chart.defaults.devicePixelRatio = 2;
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = false;

    /* ======================================================
       TIPOGRAFIA
    ====================================================== */

    Chart.defaults.font.family =
        "'Segoe UI', Arial, sans-serif";

    Chart.defaults.font.size = 11;
    Chart.defaults.font.weight = "600";

    Chart.defaults.color = "#344260";

    /* ======================================================
       ANIMAÇÃO
    ====================================================== */

    Chart.defaults.animation.duration = 700;
    Chart.defaults.animation.easing = "easeOutQuart";

    /* ======================================================
       LINHAS
    ====================================================== */

    Chart.defaults.elements.line.borderWidth = 2.5;
    Chart.defaults.elements.line.tension = 0.25;

    Chart.defaults.elements.point.radius = 4;
    Chart.defaults.elements.point.hoverRadius = 6;
    Chart.defaults.elements.point.borderWidth = 2;
    Chart.defaults.elements.point.backgroundColor = "#ffffff";

    /* ======================================================
       BARRAS
    ====================================================== */

    Chart.defaults.elements.bar.borderWidth = 1;
    Chart.defaults.elements.bar.borderRadius = 4;
    Chart.defaults.elements.bar.borderSkipped = false;

    /* ======================================================
       LEGENDA
    ====================================================== */

    Chart.defaults.plugins.legend.display = true;
    Chart.defaults.plugins.legend.position = "top";
    Chart.defaults.plugins.legend.align = "center";

    Chart.defaults.plugins.legend.labels.color = "#172653";
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.pointStyle = "circle";
    Chart.defaults.plugins.legend.labels.boxWidth = 8;
    Chart.defaults.plugins.legend.labels.boxHeight = 8;
    Chart.defaults.plugins.legend.labels.padding = 8;

    Chart.defaults.plugins.legend.labels.font = {
        family: "'Segoe UI', Arial, sans-serif",
        size: 11,
        weight: "700"
    };

    /* ======================================================
       TÍTULO
    ====================================================== */

    Chart.defaults.plugins.title.display = false;

    Chart.defaults.plugins.title.padding = {
        top: 0,
        bottom: 4
    };

    /* ======================================================
       TOOLTIP
    ====================================================== */

    Chart.defaults.plugins.tooltip.enabled = true;

    Chart.defaults.plugins.tooltip.backgroundColor =
        "rgba(255,255,255,.98)";

    Chart.defaults.plugins.tooltip.titleColor = "#102052";
    Chart.defaults.plugins.tooltip.bodyColor = "#344260";

    Chart.defaults.plugins.tooltip.borderColor = "#93c5fd";
    Chart.defaults.plugins.tooltip.borderWidth = 1;

    Chart.defaults.plugins.tooltip.cornerRadius = 8;
    Chart.defaults.plugins.tooltip.padding = 10;

    Chart.defaults.plugins.tooltip.displayColors = true;
    Chart.defaults.plugins.tooltip.boxPadding = 5;

    Chart.defaults.plugins.tooltip.titleFont = {
        family: "'Segoe UI', Arial, sans-serif",
        size: 12,
        weight: "700"
    };

    Chart.defaults.plugins.tooltip.bodyFont = {
        family: "'Segoe UI', Arial, sans-serif",
        size: 11,
        weight: "600"
    };

    /* ======================================================
       EIXOS
    ====================================================== */

    Chart.defaults.scale.grid.color =
        "rgba(15,31,77,.08)";

    Chart.defaults.scale.grid.lineWidth = 1;
    Chart.defaults.scale.grid.drawTicks = false;

    Chart.defaults.scale.border.color =
        "rgba(15,31,77,.15)";

    Chart.defaults.scale.ticks.color = "#44516f";
    Chart.defaults.scale.ticks.padding = 7;

    Chart.defaults.scale.ticks.font = {
        family: "'Segoe UI', Arial, sans-serif",
        size: 11,
        weight: "600"
    };

    Chart.defaults.scale.title.color = "#172653";

    Chart.defaults.scale.title.font = {
        family: "'Segoe UI', Arial, sans-serif",
        size: 11,
        weight: "700"
    };

    /* ======================================================
       LAYOUT INTERNO
    ====================================================== */

    Chart.defaults.layout.padding = {
        top: 0,
        right: 8,
        bottom: 3,
        left: 5
    };

    console.log(
        "Tema global dos gráficos carregado com sucesso."
    );

})();
