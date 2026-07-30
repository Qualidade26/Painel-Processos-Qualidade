/* ==========================================================
   RÓTULOS EXTERNOS DO GRÁFICO DE PIZZA
========================================================== */

const rotulosExternosPizza = {

    id: "rotulosExternosPizza",

    afterDatasetsDraw(chart) {

        const {
            ctx,
            data
        } = chart;

        const dataset = data.datasets[0];

        if (!dataset || !dataset.data) {
            return;
        }

        const valores = dataset.data.map(valor =>
            Number(valor || 0)
        );

        const total = valores.reduce(
            (soma, valor) => soma + valor,
            0
        );

        if (total <= 0) {
            return;
        }

        const meta = chart.getDatasetMeta(0);

        ctx.save();

        ctx.font = "700 11px 'Segoe UI', Arial, sans-serif";
        ctx.fillStyle = "#0f2557";
        ctx.strokeStyle = "#64748b";
        ctx.lineWidth = 1.2;
        ctx.textBaseline = "middle";

        meta.data.forEach((elemento, indice) => {

            if (!chart.getDataVisibility(indice)) {
                return;
            }

            const valor = valores[indice];

            const percentual =
                (valor / total) * 100;

            const propriedades = elemento.getProps(
                [
                    "x",
                    "y",
                    "startAngle",
                    "endAngle",
                    "outerRadius"
                ],
                true
            );

            const angulo =
                (
                    propriedades.startAngle +
                    propriedades.endAngle
                ) / 2;

            const direcaoX = Math.cos(angulo);
            const direcaoY = Math.sin(angulo);

            const inicioX =
                propriedades.x +
                direcaoX *
                (propriedades.outerRadius + 2);

            const inicioY =
                propriedades.y +
                direcaoY *
                (propriedades.outerRadius + 2);

            const meioX =
                propriedades.x +
                direcaoX *
                (propriedades.outerRadius + 14);

            const meioY =
                propriedades.y +
                direcaoY *
                (propriedades.outerRadius + 14);

            const ladoDireito =
                direcaoX >= 0;

            const finalX =
                meioX +
                (
                    ladoDireito
                        ? 15
                        : -15
                );

            ctx.beginPath();

            ctx.moveTo(
                inicioX,
                inicioY
            );

            ctx.lineTo(
                meioX,
                meioY
            );

            ctx.lineTo(
                finalX,
                meioY
            );

            ctx.stroke();

            ctx.textAlign =
                ladoDireito
                    ? "left"
                    : "right";

            const texto =
                percentual.toLocaleString(
                    "pt-BR",
                    {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1
                    }
                ) + "%";

            ctx.fillText(
                texto,
                finalX +
                (
                    ladoDireito
                        ? 4
                        : -4
                ),
                meioY
            );
        });

        ctx.restore();
    }
};


/* ==========================================================
   TEXTO CENTRAL DA ROSCA
========================================================== */

const totalCentroPizza = {

    id: "totalCentroPizza",

    afterDraw(chart) {

        const {
            ctx,
            chartArea
        } = chart;

        if (!chartArea) {
            return;
        }

        const centroX =
            (
                chartArea.left +
                chartArea.right
            ) / 2;

        const centroY =
            (
                chartArea.top +
                chartArea.bottom
            ) / 2;

        ctx.save();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillStyle = "#0f2557";

        ctx.font =
            "900 27px 'Segoe UI', Arial, sans-serif";

        ctx.fillText(
            "100%",
            centroX,
            centroY - 7
        );

        ctx.font =
            "800 12px 'Segoe UI', Arial, sans-serif";

        ctx.fillText(
            "Total",
            centroX,
            centroY + 17
        );

        ctx.restore();
    }
};
"origens": [
  {
    "nome": "Avaria estoque",
    "valor": 3446.36
  },
  {
    "nome": "Devolução avaria",
    "valor": 11625.72
  },
  {
    "nome": "Desvio de Qualidade",
    "valor": 150618.83
  },
  {
    "nome": "Vencido",
    "valor": 421475.70
  },
  {
    "nome": "Avaria Nacional",
    "valor": 186.78
  },
  {
    "nome": "Destinado pela Empresa",
    "valor": 405596.38
  }
]
