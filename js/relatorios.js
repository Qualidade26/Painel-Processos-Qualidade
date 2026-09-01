/* ==========================================================
   RELATÓRIOS SGQ
========================================================== */

function renderRelatorios(){

    const conteudo =
        document.getElementById("conteudo");

    if(!conteudo){
        return;
    }


    conteudo.innerHTML = `

        <section class="pagina-relatorios">

            <div class="relatorios-cabecalho">

                <div>
                    <h2>
                        📄 Relatórios SGQ
                    </h2>

                    <p>
                        Fechamento mensal e relatório anual
                    </p>
                </div>

            </div>


            <div class="relatorios-controles">

                <div class="relatorios-tipo">

                    <button
                        type="button"
                        class="relatorio-tipo-btn ativo"
                        data-tipo="mensal"
                    >
                        Fechamento Mensal
                    </button>

                    <button
                        type="button"
                        class="relatorio-tipo-btn"
                        data-tipo="anual"
                    >
                        Relatório Anual
                    </button>

                </div>


                <div class="relatorios-filtros">

                    <label>

                        <span>
                            Escopo
                        </span>

                        <select id="relatorioEscopo">

                            <option value="geral">
                                Geral SGQ
                            </option>

                            <option value="importacao">
                                Importação
                            </option>

                            <option value="esfig">
                                ESFIG
                            </option>

                            <option value="descarte">
                                Descarte
                            </option>

                            <option value="amostras">
                                Amostras
                            </option>

                            <option value="retrabalho">
                                Retrabalho
                            </option>

                            <option value="fornecedores">
                                Fornecedores
                            </option>

                        </select>

                    </label>


                    <label>

                        <span>
                            Ano
                        </span>

                        <select id="relatorioAno">

                            <option value="2026">
                                2026
                            </option>

                        </select>

                    </label>


                    <label
                        id="campoRelatorioMes"
                    >

                        <span>
                            Mês
                        </span>

                        <select id="relatorioMes">

                            <option value="01">
                                Janeiro
                            </option>

                            <option value="02">
                                Fevereiro
                            </option>

                            <option value="03">
                                Março
                            </option>

                            <option value="04">
                                Abril
                            </option>

                            <option value="05">
                                Maio
                            </option>

                            <option value="06">
                                Junho
                            </option>

                            <option value="07">
                                Julho
                            </option>

                            <option value="08" selected>
                                Agosto
                            </option>

                            <option value="09">
                                Setembro
                            </option>

                            <option value="10">
                                Outubro
                            </option>

                            <option value="11">
                                Novembro
                            </option>

                            <option value="12">
                                Dezembro
                            </option>

                        </select>

                    </label>


                    <button
                        type="button"
                        id="btnGerarRelatorio"
                        class="btn-gerar-relatorio"
                    >
                        Visualizar Relatório
                    </button>

                </div>

            </div>


            <div
                id="relatorioAviso"
                class="relatorio-aviso"
            >
                Selecione o período e clique em
                <strong>Visualizar Relatório</strong>.
            </div>


            <div
                id="relatorioPreview"
                class="relatorio-preview"
            ></div>

        </section>
    `;


    iniciarEventosRelatorios();
}


/* ==========================================================
   ESTADO
========================================================== */

let tipoRelatorioAtual = "mensal";


/* ==========================================================
   EVENTOS
========================================================== */

function iniciarEventosRelatorios(){

    const botoesTipo =
        document.querySelectorAll(
            ".relatorio-tipo-btn"
        );

    const campoMes =
        document.getElementById(
            "campoRelatorioMes"
        );

    const btnGerar =
        document.getElementById(
            "btnGerarRelatorio"
        );


    botoesTipo.forEach(botao => {

        botao.addEventListener(
            "click",
            () => {

                botoesTipo.forEach(item => {

                    item.classList.remove(
                        "ativo"
                    );
                });


                botao.classList.add(
                    "ativo"
                );


                tipoRelatorioAtual =
                    botao.dataset.tipo;


                if(campoMes){

                    campoMes.style.display =
                        tipoRelatorioAtual ===
                        "mensal"
                            ? ""
                            : "none";
                }


                limparPreviewRelatorio();
            }
        );
    });


    if(btnGerar){

        btnGerar.addEventListener(
            "click",
            gerarRelatorioSelecionado
        );
    }
}


/* ==========================================================
   GERAR RELATÓRIO
========================================================== */

async function gerarRelatorioSelecionado(){

    const ano =
        document.getElementById(
            "relatorioAno"
        )?.value;

    const mes =
        document.getElementById(
            "relatorioMes"
        )?.value;

    const escopo =
        document.getElementById(
            "relatorioEscopo"
        )?.value || "geral";


    const aviso =
        document.getElementById(
            "relatorioAviso"
        );

    const preview =
        document.getElementById(
            "relatorioPreview"
        );


    if(!ano || !preview){
        return;
    }


    if(aviso){

        aviso.innerHTML =
            "Carregando relatório...";
    }


    try{

        let caminho;


        if(
            tipoRelatorioAtual ===
            "mensal"
        ){

            caminho =
                `Fechamento/${ano}/${mes}.json`;

        }else{

            caminho =
                `Relatorio-Anual/${ano}.json`;
        }


        const resposta =
            await fetch(
                caminho,
                {
                    cache:"no-store"
                }
            );


        if(!resposta.ok){

            throw new Error(
                `Arquivo não encontrado: ${caminho}`
            );
        }


        const dadosRelatorio =
            await resposta.json();


        montarPreviewRelatorio(
            dadosRelatorio,
            {
                tipo:
                    tipoRelatorioAtual,

                ano,

                mes,

                escopo
            }
        );


        if(aviso){

            aviso.innerHTML = "";
        }

    }catch(erro){

        console.error(
            "Erro ao gerar relatório:",
            erro
        );


        preview.innerHTML = "";


        if(aviso){

            aviso.innerHTML = `
                <strong>
                    Não foi possível carregar o relatório.
                </strong>
                <br>
                Verifique se o arquivo de fechamento existe.
            `;
        }
    }
}


/* ==========================================================
   PREVIEW
========================================================== */

function montarPreviewRelatorio(
    dadosRelatorio,
    configuracao
){

    const preview =
        document.getElementById(
            "relatorioPreview"
        );

    if(!preview){
        return;
    }


    const nomeMes =
        obterNomeMes(
            configuracao.mes
        );


    const tituloPeriodo =
        configuracao.tipo === "mensal"
            ? `${nomeMes} / ${configuracao.ano}`
            : `Ano ${configuracao.ano}`;


    preview.innerHTML = `

        <div class="relatorio-acoes nao-imprimir">

            <button
                type="button"
                onclick="window.print()"
            >
                🖨 Imprimir / PDF
            </button>

        </div>


        <article
            id="relatorioDocumento"
            class="relatorio-documento"
        >

            <header class="relatorio-documento-topo">

                <div>

                    <strong>
                        LABOR
                    </strong>

                    <span>
                        HEALTH SUPPLY
                    </span>

                </div>


                <div>

                    <h1>
                        ${
                            configuracao.tipo ===
                            "mensal"
                                ? "RELATÓRIO DE FECHAMENTO SGQ"
                                : "RELATÓRIO ANUAL SGQ"
                        }
                    </h1>

                    <p>
                        ${tituloPeriodo}
                    </p>

                </div>

            </header>


            <div class="relatorio-corpo">

                ${
                    gerarConteudoRelatorio(
                        dadosRelatorio,
                        configuracao
                    )
                }

            </div>


            <footer class="relatorio-rodape">

                Painel de Processos SGQ

            </footer>

        </article>
    `;
}


/* ==========================================================
   CONTEÚDO POR ESCOPO
========================================================== */

function gerarConteudoRelatorio(
    dadosRelatorio,
    configuracao
){

    if(
        configuracao.escopo ===
        "geral"
    ){

        return `
            ${gerarResumoGeral(dadosRelatorio)}
            ${gerarBlocoImportacao(dadosRelatorio)}
            ${gerarBlocoEsfig(dadosRelatorio)}
            ${gerarBlocoDescarte(dadosRelatorio)}
            ${gerarBlocoAmostras(dadosRelatorio)}
            ${gerarBlocoRetrabalho(dadosRelatorio)}
            ${gerarBlocoFornecedores(dadosRelatorio)}
        `;
    }


    switch(
        configuracao.escopo
    ){

        case "importacao":
            return gerarBlocoImportacao(
                dadosRelatorio
            );

        case "esfig":
            return gerarBlocoEsfig(
                dadosRelatorio
            );

        case "descarte":
            return gerarBlocoDescarte(
                dadosRelatorio
            );

        case "amostras":
            return gerarBlocoAmostras(
                dadosRelatorio
            );

        case "retrabalho":
            return gerarBlocoRetrabalho(
                dadosRelatorio
            );

        case "fornecedores":
            return gerarBlocoFornecedores(
                dadosRelatorio
            );

        default:
            return gerarResumoGeral(
                dadosRelatorio
            );
    }
}


/* ==========================================================
   RESUMO GERAL
========================================================== */

function gerarResumoGeral(d){

    return `

        <section class="relatorio-secao">

            <h2>
                Visão Geral SGQ
            </h2>

            <div class="relatorio-cards">

                ${cardRelatorio(
                    "Importação",
                    extrairValor(
                        d,
                        [
                            "importacao.processosAno",
                            "importacao.totalProcessos"
                        ]
                    )
                )}

                ${cardRelatorio(
                    "ESFIG",
                    extrairValor(
                        d,
                        [
                            "esfig.totalHoras"
                        ]
                    ),
                    " h"
                )}

                ${cardRelatorio(
                    "Descarte",
                    extrairValor(
                        d,
                        [
                            "descarte.total",
                            "descarte.descartadoAno.total"
                        ]
                    ),
                    "",
                    true
                )}

                ${cardRelatorio(
                    "Amostras",
                    extrairValor(
                        d,
                        [
                            "amostras.total",
                            "amostra.total"
                        ]
                    )
                )}

                ${cardRelatorio(
                    "Retrabalho",
                    extrairValor(
                        d,
                        [
                            "retrabalho.totalUnidades",
                            "retrabalho.totalRetrabalhado"
                        ]
                    )
                )}

                ${cardRelatorio(
                    "Fornecedores",
                    extrairValor(
                        d,
                        [
                            "fornecedores.resumo.totalFornecedores",
                            "fornecedores.totalFornecedores"
                        ]
                    )
                )}

            </div>

        </section>
    `;
}


/* ==========================================================
   IMPORTAÇÃO
========================================================== */

function gerarBlocoImportacao(d){

    const item =
        d.importacao || {};

    return `
        <section class="relatorio-secao">

            <h2>
                📦 Importação
            </h2>

            <div class="relatorio-cards">

                ${cardRelatorio(
                    "Processos",
                    item.processosAno
                )}

                ${cardRelatorio(
                    "SKUs",
                    item.totalSku
                )}

                ${cardRelatorio(
                    "Lotes",
                    item.totalLotes
                )}

                ${cardRelatorio(
                    "Laudos",
                    item.laudosEmitidos
                )}

                ${cardRelatorio(
                    "Horas",
                    item.totalHoras,
                    " h"
                )}

            </div>

        </section>
    `;
}


/* ==========================================================
   ESFIG
========================================================== */

function gerarBlocoEsfig(d){

    const item =
        d.esfig || {};

    return `
        <section class="relatorio-secao">

            <h2>
                ⏱ ESFIG
            </h2>

            <div class="relatorio-cards">

                ${cardRelatorio(
                    "Horas",
                    item.totalHoras,
                    " h"
                )}

                ${cardRelatorio(
                    "GRU Inmetro",
                    item.totalGruInmetro,
                    "",
                    true
                )}

                ${cardRelatorio(
                    "Última aferição",
                    item.ultimaAfericao
                )}

                ${cardRelatorio(
                    "Próxima aferição",
                    item.proximaAfericao
                )}

            </div>

        </section>
    `;
}


/* ==========================================================
   DESCARTE
========================================================== */

function gerarBlocoDescarte(d){

    const item =
        d.descarte || {};

    const total =
        item.descartadoAno?.total ??
        item.total ??
        0;

    return `
        <section class="relatorio-secao">

            <h2>
                🗑 Descarte
            </h2>

            <div class="relatorio-cards">

                ${cardRelatorio(
                    "Total",
                    total,
                    "",
                    true
                )}

            </div>

        </section>
    `;
}


/* ==========================================================
   AMOSTRAS
========================================================== */

function gerarBlocoAmostras(d){

    const item =
        d.amostras ||
        d.amostra ||
        {};

    return `
        <section class="relatorio-secao">

            <h2>
                📦 Amostras
            </h2>

            <div class="relatorio-cards">

                ${cardRelatorio(
                    "Total",
                    item.total
                )}

                ${cardRelatorio(
                    "Horas",
                    item.totalHoras,
                    " h"
                )}

            </div>

        </section>
    `;
}


/* ==========================================================
   RETRABALHO
========================================================== */

function gerarBlocoRetrabalho(d){

    const item =
        d.retrabalho || {};

    return `
        <section class="relatorio-secao">

            <h2>
                🔄 Retrabalho
            </h2>

            <div class="relatorio-cards">

                ${cardRelatorio(
                    "Processos",
                    item.processos
                )}

                ${cardRelatorio(
                    "Unidades",
                    item.totalUnidades
                )}

                ${cardRelatorio(
                    "Horas",
                    item.totalHoras,
                    " h"
                )}

            </div>

        </section>
    `;
}


/* ==========================================================
   FORNECEDORES
========================================================== */

function gerarBlocoFornecedores(d){

    const item =
        d.fornecedores || {};

    const resumo =
        item.resumo || {};

    return `
        <section class="relatorio-secao">

            <h2>
                🏭 Fornecedores
            </h2>

            <div class="relatorio-cards">

                ${cardRelatorio(
                    "Fornecedores",
                    resumo.totalFornecedores
                )}

                ${cardRelatorio(
                    "Processos",
                    resumo.processos
                )}

                ${cardRelatorio(
                    "RNC",
                    resumo.rncs
                )}

                ${cardRelatorio(
                    "Retrabalhos",
                    resumo.retrabalhos
                )}

                ${cardRelatorio(
                    "Índice médio",
                    resumo.indiceMedio,
                    "%"
                )}

            </div>

        </section>
    `;
}


/* ==========================================================
   CARD
========================================================== */

function cardRelatorio(
    titulo,
    valor,
    sufixo = "",
    moeda = false
){

    let valorExibido = "-";


    if(
        valor !== undefined &&
        valor !== null &&
        valor !== ""
    ){

        if(
            moeda &&
            !isNaN(Number(valor))
        ){

            valorExibido =
                Number(valor)
                    .toLocaleString(
                        "pt-BR",
                        {
                            style:"currency",
                            currency:"BRL"
                        }
                    );

        }else if(
            typeof valor === "number"
        ){

            valorExibido =
                valor.toLocaleString(
                    "pt-BR",
                    {
                        maximumFractionDigits:2
                    }
                ) + sufixo;

        }else{

            valorExibido =
                `${valor}${sufixo}`;
        }
    }


    return `

        <div class="relatorio-card">

            <span>
                ${titulo}
            </span>

            <strong>
                ${valorExibido}
            </strong>

        </div>
    `;
}


/* ==========================================================
   BUSCA SEGURA
========================================================== */

function extrairValor(
    objeto,
    caminhos
){

    for(
        const caminho of caminhos
    ){

        const partes =
            caminho.split(".");

        let atual =
            objeto;


        for(
            const parte of partes
        ){

            if(
                atual === null ||
                atual === undefined
            ){

                atual =
                    undefined;

                break;
            }

            atual =
                atual[parte];
        }


        if(
            atual !== undefined &&
            atual !== null
        ){

            return atual;
        }
    }


    return null;
}


/* ==========================================================
   NOME DO MÊS
========================================================== */

function obterNomeMes(mes){

    const meses = {

        "01":"Janeiro",
        "02":"Fevereiro",
        "03":"Março",
        "04":"Abril",
        "05":"Maio",
        "06":"Junho",
        "07":"Julho",
        "08":"Agosto",
        "09":"Setembro",
        "10":"Outubro",
        "11":"Novembro",
        "12":"Dezembro"

    };


    return meses[mes] || "";
}


/* ==========================================================
   LIMPAR PREVIEW
========================================================== */

function limparPreviewRelatorio(){

    const preview =
        document.getElementById(
            "relatorioPreview"
        );

    const aviso =
        document.getElementById(
            "relatorioAviso"
        );


    if(preview){

        preview.innerHTML = "";
    }


    if(aviso){

        aviso.innerHTML = `
            Selecione o período e clique em
            <strong>
                Visualizar Relatório
            </strong>.
        `;
    }
}
