let dados = {};
let graficoAtual = null;
let senhaDescarteLiberada = false;

const valorFlutuantePlugin = {
    id:"valorFlutuante",
    afterDatasetsDraw(chart){
        const {ctx} = chart;
        ctx.save();

        chart.data.datasets.forEach((dataset, datasetIndex) => {

            const meta = chart.getDatasetMeta(datasetIndex);

            if(meta.hidden) return;

            meta.data.forEach((element, index) => {

                const valor = dataset.data[index];

                if(
                    valor === null ||
                    valor === undefined ||
                    (dataset._ocultarZero && Number(valor) === 0)
                ) return;

                ctx.font = dataset._horas
                    ? "800 10px Arial"
                    : "900 11px Arial";

                ctx.fillStyle = dataset._horas
                    ? "#c026d3"
                    : "#0f1f4d";

                const texto = dataset._moeda
                    ? moedaCurta(valor)
                    : dataset._horas
                        ? `${Number(valor || 0).toLocaleString("pt-BR", {
                            minimumFractionDigits:0,
                            maximumFractionDigits:2
                        })} h`
                        : numero(valor);

                if(chart.options.indexAxis === "y"){

                    ctx.textAlign = "left";
                    ctx.textBaseline = "middle";

                    ctx.fillText(
                        texto,
                        element.x + 8,
                        element.y
                    );

                }else if(dataset._horas){

                    ctx.textAlign = "center";
                    ctx.textBaseline = "top";

                    ctx.fillText(
                        texto,
                        element.x,
                        element.y + 11
                    );

                }else{

                    ctx.textAlign = "center";
                    ctx.textBaseline = "bottom";

                    ctx.fillText(
                        texto,
                        element.x,
                        element.y - 7
                    );
                }

            });

        });

        ctx.restore();
    }
};

Chart.register(valorFlutuantePlugin);

fetch("data.json")
.then(r => r.json())
.then(json => {

    dados = normalizarDados(json);
    renderImportacao();

})
.catch(() => {

    dados = normalizarDados({});
    renderImportacao();

});

setInterval(()=>{

    fetch("data.json")
    .then(r=>r.json())
    .then(json=>{

        dados = normalizarDados(json);

        const abaAtiva =
            document.querySelector(".menu button.active");

        if(abaAtiva){
            abaAtiva.click();
        }

    });

},120000);

function normalizarDados(json){

    if(Array.isArray(json.esfig)){

        json.esfig = {

            ultimaAfericao:
                json.ultimaAfericao || "",

            proximaAfericao:
                json.proximaAfericao || "",

            produtos:
                json.esfig
        };
    }

    return json;
}

function abrirAba(aba, botao){

    document
        .querySelectorAll(".menu button")
        .forEach(b => b.classList.remove("active"));

    if(botao)
        botao.classList.add("active");

    destruirGrafico();

    if(aba === "importacao")
        renderImportacao();

    if(aba === "esfig")
        renderEsfig();

    if(aba === "descarte")
        renderDescarte();

    if(aba === "amostra")
        renderAmostra();

    if(aba === "retrabalho")
        renderRetrabalho();

    if(aba === "fornecedores")
    renderFornecedores();

    if(aba === "informativo")
        renderInformativo();
}

function destruirGrafico(){

    if(graficoAtual){

        graficoAtual.destroy();
        graficoAtual = null;

    }
}

function atualizarRelogio(){

    const agora = new Date();

    const dia =
        String(agora.getDate()).padStart(2,"0");

    const mes =
        agora
        .toLocaleDateString("pt-BR",{month:"long"})
        .toUpperCase();

    const ano =
        agora.getFullYear();

    document.getElementById("dataAtual").innerText =
        `${dia} ${mes} ${ano}`;

    document.getElementById("horaAtual").innerText =
        agora.toLocaleTimeString("pt-BR");
}

setInterval(atualizarRelogio,1000);

atualizarRelogio();

function toggleMenu(){

    const wrap =
        document.getElementById("mainWrap");

    const btn =
        document.getElementById("btnToggleMenu");

    wrap.classList.toggle("menu-collapsed");

    const recolhido =
        wrap.classList.contains("menu-collapsed");

    btn.innerText =
        recolhido ? "▶" : "◀";

    btn.title =
        recolhido
            ? "Mostrar menu"
            : "Esconder menu";
}
