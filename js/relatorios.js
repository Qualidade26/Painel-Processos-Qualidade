

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
            "Carregando e comparando os dados...";
    }


    try{

        /* ==================================================
           RELATÓRIO MENSAL
           CONGELADO X ATUAL
        ================================================== */

        if(
            tipoRelatorioAtual ===
            "mensal"
        ){
const caminhoCongelado =
    `Fechamento/fechamento-${ano}/${mes}.json`;


            const [
                respostaCongelado,
                respostaAtual
            ] =
                await Promise.all([

                    fetch(
                        caminhoCongelado,
                        {
                            cache:"no-store"
                        }
                    ),

                    fetch(
                        "data.json",
                        {
                            cache:"no-store"
                        }
                    )

                ]);


            if(!respostaCongelado.ok){

                throw new Error(
                    `Fechamento não encontrado: ${caminhoCongelado}`
                );
            }


            if(!respostaAtual.ok){

                throw new Error(
                    "Não foi possível carregar data.json"
                );
            }


            const dadosCongelados =
                await respostaCongelado.json();


            const dadosAtuais =
                await respostaAtual.json();


            montarPreviewRelatorio(
                dadosCongelados,
                {
                    tipo:"mensal",
                    ano,
                    mes,
                    escopo,
                    dadosAtuais
                }
            );


        /* ==================================================
           RELATÓRIO ANUAL
        ================================================== */

        }else{

            const caminhoAnual =
                `Relatorio-Anual/${ano}.json`;


            const resposta =
                await fetch(
                    caminhoAnual,
                    {
                        cache:"no-store"
                    }
                );


            if(!resposta.ok){

                throw new Error(
                    `Relatório anual não encontrado: ${caminhoAnual}`
                );
            }


            const dadosAnuais =
                await resposta.json();


            montarPreviewRelatorio(
                dadosAnuais,
                {
                    tipo:"anual",
                    ano,
                    mes:null,
                    escopo,
                    dadosAtuais:null
                }
            );
        }


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
                    Não foi possível gerar o relatório.
                </strong>
                <br>
                ${erro.message}
            `;
        }
    }
}

/* ==========================================================
   PREVIEW EXECUTIVO DO RELATÓRIO
========================================================== */

function montarPreviewRelatorio(
    dadosCongelados,
    configuracao
){

    const preview =
        document.getElementById(
            "relatorioPreview"
        );

    if(!preview){
        return;
    }


    destruirGraficosRelatorio();


    const dadosAtuais =
        configuracao.dadosAtuais ||
        dadosCongelados;


    const mensal =
        configuracao.tipo === "mensal";


    const nomeMesBase =
        obterNomeMes(
            configuracao.mes
        );


    const periodo =
        mensal
            ? obterMesSeguinte(
                configuracao.mes,
                configuracao.ano
            )
            : {
                mes:"",
                ano:configuracao.ano
            };


    const nomeMesRelatorio =
        mensal
            ? obterNomeMes(
                periodo.mes
            )
            : "";


    const dataAtual =
        new Date()
            .toLocaleDateString(
                "pt-BR"
            );


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
            class="relatorio-documento relatorio-executivo"
        >

            <!-- ==========================================
                 CABEÇALHO
            =========================================== -->

            <header class="relatorio-executivo-topo">

                <div class="relatorio-marca">

                    <strong>
                        LABOR
                    </strong>

                    <span>
                        HEALTH SUPPLY
                    </span>

                </div>


                <div class="relatorio-executivo-titulo">

                    <h1>

                        ${
                            mensal
                                ? "RELATÓRIO DE FECHAMENTO MENSAL – SGQ"
                                : "RELATÓRIO ANUAL – SGQ"
                        }

                    </h1>

                    <strong class="relatorio-periodo-principal">

                        ${
                            mensal
                                ? `${nomeMesRelatorio.toUpperCase()} / ${periodo.ano}`
                                : configuracao.ano
                        }

                    </strong>


                    <div class="relatorio-periodo-base">

                        ${
                            mensal
                                ? `
                                    <span>
                                        Base congelada:
                                        <strong>
                                            ${nomeMesBase}/${configuracao.ano}
                                        </strong>
                                    </span>

                                    <span>
                                        Posição atual:
                                        <strong>
                                            ${dataAtual}
                                        </strong>
                                    </span>
                                `
                                : `
                                    <span>
                                        Fechamento anual:
                                        <strong>
                                            ${configuracao.ano}
                                        </strong>
                                    </span>
                                `
                        }

                    </div>

                </div>

            </header>


            <!-- ==========================================
                 CONTEÚDO
            =========================================== -->

            <div class="relatorio-executivo-corpo">

                ${
                    gerarConteudoExecutivo(
                        dadosCongelados,
                        dadosAtuais,
                        configuracao
                    )
                }

            </div>


            <!-- ==========================================
                 RODAPÉ
            =========================================== -->

            <footer class="relatorio-executivo-rodape">

                <span>
                    Dados consolidados do período selecionado.
                </span>

                <span>
                    Relatório gerado automaticamente pelo
                    Painel de Processos SGQ.
                </span>

            </footer>

        </article>
    `;


    requestAnimationFrame(
        () => {

            criarGraficosRelatorio(
                dadosCongelados,
                dadosAtuais,
                configuracao
            );
        }
    );
}


/* ==========================================================
   CONTEÚDO EXECUTIVO
========================================================== */

function gerarConteudoExecutivo(
    congelado,
    atual,
    configuracao
){

    switch(
        configuracao.escopo
    ){

        case "importacao":

            return `
                ${gerarKpisExecutivos(congelado,atual)}
                ${gerarPainelImportacao(congelado,atual,true)}
            `;


        case "esfig":

            return `
                ${gerarKpisExecutivos(congelado,atual)}
                ${gerarPainelEsfig(congelado,atual,true)}
            `;


        case "descarte":

            return `
                ${gerarKpisExecutivos(congelado,atual)}
                ${gerarPainelDescarte(congelado,atual,true)}
            `;


        case "amostras":

            return `
                ${gerarKpisExecutivos(congelado,atual)}
                ${gerarPainelAmostras(congelado,atual,true)}
            `;


        case "retrabalho":

            return `
                ${gerarKpisExecutivos(congelado,atual)}
                ${gerarPainelRetrabalho(congelado,atual,true)}
                ${gerarPainelAdequacao(congelado,atual,true)}
            `;


        case "fornecedores":

            return `
                ${gerarKpisExecutivos(congelado,atual)}
                ${gerarPainelFornecedores(congelado,atual,true)}
            `;
case "geral":
default:

    return `

        ${gerarKpisExecutivos(congelado,atual)}

        <div class="relatorio-grid-principal">

            <!-- =================================================
                 LINHA 1
            ================================================== -->

            ${gerarPainelImportacao(congelado,atual)}

            ${gerarPainelDescarte(congelado,atual)}

            ${gerarPainelAmostras(congelado,atual)}


            <!-- =================================================
                 LINHA 2
            ================================================== -->

            ${gerarPainelRetrabalho(congelado,atual)}

            ${gerarPainelFornecedores(congelado,atual)}

            ${gerarPainelEsfig(congelado,atual)}

        </div>


        <!-- =====================================================
             FAIXA EXECUTIVA FINAL
        ====================================================== -->

        <div class="relatorio-faixa-final">

            ${
                gerarResumoExecutivo(
                    congelado,
                    atual
                )
            }

            ${gerarBlocoInstitucionalRelatorio()}

        </div>

    `;
    }
}


/* ==========================================================
   KPIs SUPERIORES
========================================================== */

function gerarKpisExecutivos(
    congelado,
    atual
){

    const importacaoAnterior =
        congelado.importacao || {};

    const importacaoAtual =
        atual.importacao || {};


    const esfigAtual =
        atual.esfig || {};


    const descarteAnterior =
        congelado.descarte || {};

    const descarteAtual =
        atual.descarte || {};


    const amostrasAnterior =
        congelado.amostras || {};

    const amostrasAtual =
        atual.amostras || {};


    const retrabalhoAnterior =
        congelado.retrabalho || {};

    const retrabalhoAtual =
        atual.retrabalho || {};


    const fornecedoresAtual =
        atual.fornecedores || {};


    const variacaoProcessos =
        calcularVariacao(
            importacaoAnterior.processosAno,
            importacaoAtual.processosAno
        );


    const variacaoDescarte =
        calcularVariacao(
            descarteAnterior.descartadoAno?.total,
            descarteAtual.descartadoAno?.total
        );


    const variacaoAmostras =
        calcularVariacao(
            somarQuantidadeAmostras(
                amostrasAnterior.mensal
            ),
            somarQuantidadeAmostras(
                amostrasAtual.mensal
            )
        );


    const variacaoRetrabalho =
        calcularVariacao(
            retrabalhoAnterior.totalUnidades,
            retrabalhoAtual.totalUnidades
        );


    return `

        <section class="relatorio-kpis-executivos">

            ${
                cardKpiExecutivo(
                    "📦",
                    "Importação",
                    formatarNumero(
                        importacaoAtual.processosAno
                    ),
                    textoMovimento(
                        variacaoProcessos,
                        "processos"
                    )
                )
            }


            ${
                cardKpiExecutivo(
                    "⏱",
                    "ESFIG",
                    formatarHoras(
                        esfigAtual.totalHoras
                    ),
                    "Posição atual"
                )
            }


            ${
                cardKpiExecutivo(
                    "🗑",
                    "Descarte",
                    formatarMoeda(
                        descarteAtual.valorAtual?.total
                    ),
                    textoMovimentoMoeda(
                        variacaoDescarte
                    )
                )
            }


            ${
                cardKpiExecutivo(
                    "📦",
                    "Amostras",
                    formatarNumero(
                        somarQuantidadeAmostras(
                            amostrasAtual.mensal
                        )
                    ),
                    textoMovimento(
                        variacaoAmostras,
                        "no período"
                    )
                )
            }


            ${
                cardKpiExecutivo(
                    "🔄",
                    "Retrabalho",
                    formatarNumero(
                        retrabalhoAtual.totalUnidades
                    ),
                    textoMovimento(
                        variacaoRetrabalho,
                        "unidades"
                    )
                )
            }


            ${
                cardKpiExecutivo(
                    "🏭",
                    "Fornecedores",
                    formatarNumero(
                        fornecedoresAtual.totalfornecedores
                    ),
                    `Índice médio ${
                        formatarPercentual(
                            fornecedoresAtual.indicemedioavaliacao
                        )
                    }`
                )
            }

        </section>
    `;
}


/* ==========================================================
   CARD KPI
========================================================== */

function cardKpiExecutivo(
    icone,
    titulo,
    valor,
    detalhe
){

    return `

        <div class="relatorio-kpi-executivo">

            <div class="relatorio-kpi-icone">
                ${icone}
            </div>

            <div class="relatorio-kpi-conteudo">

                <span>
                    ${titulo}
                </span>

                <strong>
                    ${valor}
                </strong>

                <small>
                    ${detalhe}
                </small>

            </div>

        </div>
    `;
}


/* ==========================================================
   IMPORTAÇÃO
========================================================== */

function gerarPainelImportacao(
    congelado,
    atual,
    larguraTotal = false
){

    const anterior =
        congelado.importacao || {};

    const corrente =
        atual.importacao || {};


    return `

        <section
            class="
                relatorio-painel-executivo
                ${larguraTotal ? "relatorio-painel-total" : ""}
            "
        >

            ${tituloPainelExecutivo(
                "📦",
                "Importação"
            )}

<div class="relatorio-importacao-layout">

                <div>

                    ${
                        gerarTabelaPeriodoAcumulado(
                            [
                                {
                                    titulo:"Processos",
                                    anterior:anterior.processosAno,
                                    atual:corrente.processosAno,
                                    tipo:"numero"
                                },

                                {
                                    titulo:"SKUs",
                                    anterior:anterior.totalSku,
                                    atual:corrente.totalSku,
                                    tipo:"numero"
                                },

                                {
                                    titulo:"Lotes",
                                    anterior:anterior.totalLotes,
                                    atual:corrente.totalLotes,
                                    tipo:"numero"
                                },

                                {
                                    titulo:"Laudos",
                                    anterior:anterior.laudosEmitidos,
                                    atual:corrente.laudosEmitidos,
                                    tipo:"numero"
                                },

                                {
                                    titulo:"Horas",
                                    anterior:anterior.totalHoras,
                                    atual:corrente.totalHoras,
                                    tipo:"horas"
                                }
                            ]
                        )
                    }

                </div>


                <div class="relatorio-grafico-box">

                    <canvas
                        id="relatorioGraficoImportacao"
                    ></canvas>

                </div>

            </div>

        </section>
    `;
}

/* ==========================================================
   ESFIG
========================================================== */

function gerarPainelEsfig(
    congelado,
    atual,
    larguraTotal = false
){

    const anterior =
        congelado.esfig || {};

    const corrente =
        atual.esfig || {};


    const resumoAnterior =
        anterior.resumoAfericoes || {};

    const resumoAtual =
        corrente.resumoAfericoes || {};


    return `

        <section
            class="
                relatorio-painel-executivo
                relatorio-painel-esfig
                ${larguraTotal ? "relatorio-painel-total" : ""}
            "
        >

            ${tituloPainelExecutivo(
                "⏱",
                "Esfigmomanômetro"
            )}


            ${
                gerarTabelaPeriodoAcumulado(
                    [
                        {
                            titulo:"Total aferido",

                            anterior:
                                resumoAnterior.totalAferido,

                            atual:
                                resumoAtual.totalAferido,

                            tipo:"numero"
                        },

                        {
                            titulo:"Aprovado",

                            anterior:
                                resumoAnterior.totalAprovado,

                            atual:
                                resumoAtual.totalAprovado,

                            tipo:"numero"
                        },

                        {
                            titulo:"Reprovado",

                            anterior:
                                resumoAnterior.totalReprovado,

                            atual:
                                resumoAtual.totalReprovado,

                            tipo:"numero"
                        },

                        {
                            titulo:"Horas",

                            anterior:
                                anterior.totalHoras,

                            atual:
                                corrente.totalHoras,

                            tipo:"horas"
                        },

                        {
                            titulo:"GRU Inmetro",

                            anterior:
                                anterior.totalGruInmetro,

                            atual:
                                corrente.totalGruInmetro,

                            tipo:"moeda"
                        }
                    ]
                )
            }


            <div class="relatorio-info-faixa">

                <span>

                    Última aferição:

                    <strong>
                        ${corrente.ultimaAfericao || "-"}
                    </strong>

                </span>


                <span>

                    Próxima aferição:

                    <strong>
                        ${corrente.proximaAfericao || "-"}
                    </strong>

                </span>

            </div>

        </section>
    `;
}
/* ==========================================================
   DESCARTE
========================================================== */

function gerarPainelDescarte(
    congelado,
    atual,
    larguraTotal = false
){

    const anterior =
        congelado.descarte || {};

    const corrente =
        atual.descarte || {};


    const movimento =
        calcularVariacao(
            anterior.descartadoAno?.total,
            corrente.descartadoAno?.total
        );


    return `

        <section
            class="
                relatorio-painel-executivo
                ${larguraTotal ? "relatorio-painel-total" : ""}
            "
        >

            ${tituloPainelExecutivo(
                "🗑",
                "Descarte"
            )}

<div class="relatorio-descarte-layout">

                <div class="relatorio-descarte-resumo">

                    ${
                        miniIndicador(
                            "Valor no período",
                            formatarMovimentoMoeda(
                                movimento
                            )
                        )
                    }

                    ${
                        miniIndicador(
                            "Acumulado no ano",
                            formatarMoeda(
                                corrente.descartadoAno?.total
                            )
                        )
                    }

                    ${
                        miniIndicador(
                            "Valor atual",
                            formatarMoeda(
                                corrente.valorAtual?.total
                            )
                        )
                    }


                    <div class="relatorio-legenda-executiva">

                        <strong>
                            Principais origens
                        </strong>

                        ${
                            gerarListaOrigensDescarte(
                                corrente
                            )
                        }

                    </div>

                </div>


                <div class="relatorio-grafico-box">

                    <canvas
                        id="relatorioGraficoDescarte"
                    ></canvas>

                </div>

            </div>

        </section>
    `;
}


/* ==========================================================
   AMOSTRAS
========================================================== */

function gerarPainelAmostras(
    congelado,
    atual,
    larguraTotal = false
){

    const anterior =
        congelado.amostras || {};

    const corrente =
        atual.amostras || {};


    return `

        <section
            class="
                relatorio-painel-executivo
                ${larguraTotal ? "relatorio-painel-total" : ""}
            "
        >

            ${tituloPainelExecutivo(
                "📦",
                "Amostras"
            )}


            <div class="relatorio-painel-duplo">

                <div>

                    ${
                        gerarTabelaPeriodoAcumulado(
                            [
                                {
                                    titulo:"Quantidade",
                                    anterior:
                                        somarQuantidadeAmostras(
                                            anterior.mensal
                                        ),

                                    atual:
                                        somarQuantidadeAmostras(
                                            corrente.mensal
                                        ),

                                    tipo:"numero"
                                },

                                {
                                    titulo:"Horas",
                                    anterior:anterior.totalHoras,
                                    atual:corrente.totalHoras,
                                    tipo:"horas"
                                }
                            ]
                        )
                    }

                </div>


                <div class="relatorio-grafico-box">

                    <canvas
                        id="relatorioGraficoAmostras"
                    ></canvas>

                </div>

            </div>

        </section>
    `;
}


/* ==========================================================
   RETRABALHO
========================================================== */

function gerarPainelRetrabalho(
    congelado,
    atual,
    larguraTotal = false
){

    const anterior =
        congelado.retrabalho || {};

    const corrente =
        atual.retrabalho || {};


    return `

        <section
            class="
                relatorio-painel-executivo
                ${larguraTotal ? "relatorio-painel-total" : ""}
            "
        >

            ${tituloPainelExecutivo(
                "🔄",
                "Retrabalho"
            )}


            <div class="relatorio-painel-duplo">

                <div>

                    ${
                        gerarTabelaPeriodoAcumulado(
                            [
                                {
                                    titulo:"Processos",
                                    anterior:anterior.processos,
                                    atual:corrente.processos,
                                    tipo:"numero"
                                },

                                {
                                    titulo:"Unidades",
                                    anterior:anterior.totalUnidades,
                                    atual:corrente.totalUnidades,
                                    tipo:"numero"
                                },

                                {
                                    titulo:"Horas",
                                    anterior:anterior.totalHoras,
                                    atual:corrente.totalHoras,
                                    tipo:"horas"
                                }
                            ]
                        )
                    }

                </div>


                <div class="relatorio-grafico-box">

                    <canvas
                        id="relatorioGraficoRetrabalho"
                    ></canvas>

                </div>

            </div>

        </section>
    `;
}


/* ==========================================================
   ADEQUAÇÃO DE CAIXA
========================================================== */

function gerarPainelAdequacao(
    congelado,
    atual,
    larguraTotal = false
){

    const anterior =
        congelado.adequacaocaixa || {};

    const corrente =
        atual.adequacaocaixa || {};


    return `

        <section
            class="
                relatorio-painel-executivo
                ${larguraTotal ? "relatorio-painel-total" : ""}
            "
        >

            ${tituloPainelExecutivo(
                "📦",
                "Adequação de Caixa"
            )}


            ${
                gerarTabelaPeriodoAcumulado(
                    [
                        {
                            titulo:"Ocorrências",
                            anterior:
                                anterior.totalocorrenciasano,

                            atual:
                                corrente.totalocorrenciasano,

                            tipo:"numero"
                        },

                        {
                            titulo:"Quantidade retrabalhada",
                            anterior:
                                anterior.quantidaderetrabalhada,

                            atual:
                                corrente.quantidaderetrabalhada,

                            tipo:"numero"
                        },

                        {
                            titulo:"Horas",
                            anterior:
                                anterior.totalhoras,

                            atual:
                                corrente.totalhoras,

                            tipo:"horas"
                        }
                    ]
                )
            }

        </section>
    `;
}


/* ==========================================================
   FORNECEDORES
========================================================== */

function gerarPainelFornecedores(
    congelado,
    atual,
    larguraTotal = false
){

    const anterior =
        congelado.fornecedores || {};

    const corrente =
        atual.fornecedores || {};


    const indice =
        Number(
            corrente.indicemedioavaliacao || 0
        );


    return `

        <section
            class="
                relatorio-painel-executivo
                ${larguraTotal ? "relatorio-painel-total" : ""}
            "
        >

            ${tituloPainelExecutivo(
                "🏭",
                "Fornecedores"
            )}


            <div class="relatorio-fornecedores-layout">

                <div>

                    ${
                        gerarTabelaPeriodoAcumulado(
                            [
                                {
                                    titulo:"Processos",
                                    anterior:
                                        anterior.totalprocessos,

                                    atual:
                                        corrente.totalprocessos,

                                    tipo:"numero"
                                },

                                {
                                    titulo:"RNC",
                                    anterior:
                                        anterior.totalrncano,

                                    atual:
                                        corrente.totalrncano,

                                    tipo:"numero"
                                },

                                {
                                    titulo:"Retrabalhos",
                                    anterior:
                                        anterior.totalretrabalho,

                                    atual:
                                        corrente.totalretrabalho,

                                    tipo:"numero"
                                },

                                {
                                    titulo:"Ocorrências",
                                    anterior:
                                        anterior.indicadores
                                            ?.ocorrencias
                                            ?.quantidade,

                                    atual:
                                        corrente.indicadores
                                            ?.ocorrencias
                                            ?.quantidade,

                                    tipo:"numero"
                                }
                            ]
                        )
                    }

                </div>


                <div class="relatorio-indice-fornecedor">

                    <span>
                        Índice médio
                    </span>

                    <strong>
                        ${formatarPercentual(indice)}
                    </strong>

                    <small>
                        ${
                            classificacaoIndice(
                                indice
                            )
                        }
                    </small>

                </div>

            </div>


            ${
                gerarFornecedoresAtencao(
                    corrente.avaliados
                )
            }

        </section>
    `;
}


/* ==========================================================
   RESUMO EXECUTIVO
========================================================== */

function gerarResumoExecutivo(
    congelado,
    atual
){

    const destaques = [];
    const atencoes = [];


    const diffProcessos =
        calcularVariacao(
            congelado.importacao?.processosAno,
            atual.importacao?.processosAno
        );


    const diffHorasImportacao =
        calcularVariacao(
            congelado.importacao?.totalHoras,
            atual.importacao?.totalHoras
        );


    const diffRnc =
        calcularVariacao(
            congelado.fornecedores?.totalrncano,
            atual.fornecedores?.totalrncano
        );


    const diffRetrabalho =
        calcularVariacao(
            congelado.retrabalho?.totalUnidades,
            atual.retrabalho?.totalUnidades
        );


    const indiceFornecedor =
        Number(
            atual.fornecedores
                ?.indicemedioavaliacao || 0
        );


    if(
        numeroValido(diffProcessos) &&
        diffProcessos > 0
    ){

        destaques.push(
            `${formatarNumero(diffProcessos)} novo(s) processo(s) de importação no período.`
        );
    }


    if(
        numeroValido(diffHorasImportacao) &&
        diffHorasImportacao > 0
    ){

        destaques.push(
            `${formatarHoras(diffHorasImportacao)} dedicadas à inspeção de importação.`
        );
    }


    if(
        diffRnc === 0
    ){

        destaques.push(
            "Sem aumento de RNC no período."
        );
    }


    if(
        diffRetrabalho === 0
    ){

        destaques.push(
            "Sem aumento de unidades retrabalhadas."
        );
    }


    if(
        numeroValido(diffRnc) &&
        diffRnc > 0
    ){

        atencoes.push(
            `${formatarNumero(diffRnc)} nova(s) RNC registrada(s).`
        );
    }


    if(
        numeroValido(diffRetrabalho) &&
        diffRetrabalho > 0
    ){

        atencoes.push(
            `${formatarNumero(diffRetrabalho)} unidade(s) adicionadas ao retrabalho.`
        );
    }


    if(
        indiceFornecedor > 0 &&
        indiceFornecedor < 0.90
    ){

        atencoes.push(
            `Índice médio de fornecedores em ${formatarPercentual(indiceFornecedor)}.`
        );
    }


    identificarRevisao(
        congelado.importacao?.totalLotes,
        atual.importacao?.totalLotes,
        "Lotes de importação",
        atencoes
    );


    identificarRevisao(
        congelado.importacao?.laudosEmitidos,
        atual.importacao?.laudosEmitidos,
        "Laudos emitidos",
        atencoes
    );


   return `

    <section
        class="
            relatorio-painel-executivo
            relatorio-painel-resumo
        "
    >

        ${tituloPainelExecutivo(
            "📋",
            "Resumo Executivo"
        )}


        <div class="relatorio-resumo-executivo">

            <div class="relatorio-destaques">

                <h3>
                    ✅ Destaques
                </h3>

                ${
                    gerarListaResumo(
                        destaques,
                        "Sem destaques automáticos no período."
                    )
                }

            </div>


            <div class="relatorio-atencoes">

                <h3>
                    ⚠ Pontos de atenção
                </h3>

                ${
                    gerarListaResumo(
                        atencoes,
                        "Nenhum ponto crítico identificado automaticamente."
                    )
                }

            </div>


            <div class="relatorio-compromisso">

                <h3>
                    🛡 Nosso compromisso
                </h3>

                <p>
                    Gestão da Qualidade que assegura
                    segurança, rastreabilidade e
                    conformidade em cada etapa.
                </p>

                <p>
                    Do recebimento à entrega,
                    cuidamos da qualidade para
                    proteger vidas.
                </p>

                <strong>
                    QUALIDADE É NOSSO CONTROLE.
                    SEGURANÇA É NOSSA ENTREGA.
                </strong>

            </div>

        </div>

        </section>
    `;
}


/* ==========================================================
   TÍTULO DOS PAINÉIS
========================================================== */

function tituloPainelExecutivo(
    icone,
    titulo
){

    return `

        <div class="relatorio-painel-titulo">

            <span>
                ${icone}
            </span>

            <strong>
                ${titulo}
            </strong>

        </div>
    `;
}


/* ==========================================================
   MINI INDICADOR
========================================================== */

function miniIndicador(
    titulo,
    valor
){

    return `

        <div class="relatorio-mini-indicador">

            <span>
                ${titulo}
            </span>

            <strong>
                ${valor}
            </strong>

        </div>
    `;
}


/* ==========================================================
   TABELA PERÍODO X ACUMULADO
========================================================== */

function gerarTabelaPeriodoAcumulado(
    indicadores
){

    const linhas =
        indicadores
            .map(
                indicador => {

                    const movimento =
                        calcularVariacao(
                            indicador.anterior,
                            indicador.atual
                        );


                    return `

                        <tr>

                            <td>
                                ${indicador.titulo}
                            </td>

                            <td>
                                ${
                                    formatarMovimentoExecutivo(
                                        movimento,
                                        indicador.tipo
                                    )
                                }
                            </td>

                            <td>
                                ${
                                    formatarValorExecutivo(
                                        indicador.atual,
                                        indicador.tipo
                                    )
                                }
                            </td>

                        </tr>
                    `;
                }
            )
            .join("");


    return `

        <div class="relatorio-tabela-executiva-wrap">

            <table class="relatorio-tabela-executiva">

                <thead>

                    <tr>

                        <th>
                            Indicador
                        </th>

                        <th>
                            No período
                        </th>

                        <th>
                            Acumulado
                        </th>

                    </tr>

                </thead>

                <tbody>
                    ${linhas}
                </tbody>

            </table>

        </div>
    `;
}

function obterCorOrigemDescarte(nome){

    const chave =
        String(nome || "")
            .trim()
            .toLowerCase();


    const cores = {

        "vencido":
            "#ef4444",

        "certificação":
            "#8b5cf6",

        "certificacao":
            "#8b5cf6",

        "desvio de qualidade":
            "#f59e0b",

        "desvio qualidade":
            "#f59e0b",

        "avaria importação":
            "#2563eb",

        "avaria importacao":
            "#2563eb",

        "devolução avaria":
            "#22c55e",

        "devolucao avaria":
            "#22c55e",

        "avaria estoque":
            "#06b6d4",

        "avaria nacional":
            "#ec4899"
    };


    return cores[chave] || "#94a3b8";
}

/* ==========================================================
   LISTA DE ORIGENS DO DESCARTE
========================================================== */

function gerarListaOrigensDescarte(
    descarte
){

    const lista =
        obterOrigensDescarte(
            descarte
        )
        .slice(0,3);


    if(!lista.length){

        return `
            <span class="relatorio-sem-dados">
                Sem dados de origem.
            </span>
        `;
    }


    return `

        <ul>

            ${
                lista
                    .map(
                        item => `
<li>

    <span class="relatorio-origem-nome">

        <i
            class="relatorio-origem-cor"
            style="background:${obterCorOrigemDescarte(item.nome)}"
        ></i>

        ${item.nome}

    </span>

    <strong>
        ${
            formatarMoeda(
                item.valor
            )
        }
    </strong>

</li>
                        `
                    )
                    .join("")
            }

        </ul>
    `;
}


/* ==========================================================
   FORNECEDORES EM ATENÇÃO
========================================================== */

function gerarFornecedoresAtencao(
    lista
){

    if(
        !Array.isArray(lista)
    ){

        return "";
    }


    const fornecedores =
        lista
            .filter(
                item =>
                    Number(
                        item.indiceavaliacao || 0
                    ) > 0
            )
            .sort(
                (a,b) =>
                    Number(
                        a.indiceavaliacao || 0
                    ) -
                    Number(
                        b.indiceavaliacao || 0
                    )
            )
            .slice(0,3);


    if(!fornecedores.length){

        return "";
    }


    return `

        <div class="relatorio-fornecedores-atencao">

            <strong>
                Fornecedores que exigem acompanhamento
            </strong>

            <div>

                ${
                    fornecedores
                        .map(
                            item => `

                                <span>

                                    ${item.fabricante}

                                    <b>
                                        ${
                                            formatarPercentual(
                                                item.indiceavaliacao
                                            )
                                        }
                                    </b>

                                </span>
                            `
                        )
                        .join("")
                }

            </div>

        </div>
    `;
}


/* ==========================================================
   RESUMO - LISTAS
========================================================== */

function gerarListaResumo(
    lista,
    vazio
){

    if(!lista.length){

        return `
            <p>
                ${vazio}
            </p>
        `;
    }


    return `

        <ul>

            ${
                lista
                    .map(
                        item => `
                            <li>
                                ${item}
                            </li>
                        `
                    )
                    .join("")
            }

        </ul>
    `;
}


/* ==========================================================
   IDENTIFICAR AJUSTE DE BASE
========================================================== */

function identificarRevisao(
    anterior,
    atual,
    titulo,
    lista
){

    if(
        !numeroValido(anterior) ||
        !numeroValido(atual)
    ){

        return;
    }


    const diferenca =
        Number(atual) -
        Number(anterior);


    if(diferenca < 0){

        lista.push(
            `${titulo}: ajuste de ${formatarNumero(
                Math.abs(diferenca)
            )} registro(s) na posição acumulada.`
        );
    }
}
/* ==========================================================
   CRIAÇÃO DOS GRÁFICOS
========================================================== */

window.graficosRelatorio =
    window.graficosRelatorio || [];


function destruirGraficosRelatorio(){

    if(
        !Array.isArray(
            window.graficosRelatorio
        )
    ){

        window.graficosRelatorio = [];
        return;
    }


    window.graficosRelatorio
        .forEach(
            grafico => {

                try{

                    grafico.destroy();

                }catch(erro){

                    console.warn(
                        "Não foi possível destruir gráfico do relatório.",
                        erro
                    );
                }
            }
        );


    window.graficosRelatorio = [];
}


/* ==========================================================
   INICIALIZAR GRÁFICOS
========================================================== */

function criarGraficosRelatorio(
    congelado,
    atual,
    configuracao
){

    if(
        typeof Chart === "undefined"
    ){

        return;
    }


  criarGraficoImportacaoRelatorio(
    congelado.importacao,
    atual.importacao,
    configuracao
);


    criarGraficoDescarteRelatorio(
        atual.descarte
    );


    criarGraficoAmostrasRelatorio(
        atual.amostras
    );


    criarGraficoRetrabalhoRelatorio(
        atual.retrabalho
    );
}
/* ==========================================================
   GRÁFICO IMPORTAÇÃO
   HISTÓRICO CONGELADO + MOVIMENTO ATUAL
========================================================== */

function criarGraficoImportacaoRelatorio(
    congelado,
    atual,
    configuracao
){

    const canvas =
        document.getElementById(
            "relatorioGraficoImportacao"
        );


    if(!canvas){
        return;
    }


    const mensalCongelado =
        Array.isArray(
            congelado?.mensal
        )
            ? congelado.mensal
            : [];


    if(!mensalCongelado.length){
        return;
    }


    /* ==================================================
       COPIA O HISTÓRICO DO FECHAMENTO
    ================================================== */

    const lista =
        mensalCongelado.map(
            item => ({
                mes:item.mes || "",
                processos:
                    Number(
                        item.processos || 0
                    )
            })
        );


    /* ==================================================
       CALCULA O MÊS POSTERIOR AO CONGELAMENTO
    ================================================== */

    const periodoAtual =
        obterMesSeguinte(
            configuracao.mes,
            configuracao.ano
        );


    const nomeMesAtual =
        obterNomeMes(
            periodoAtual.mes
        );


    const diferencaProcessos =
        calcularVariacao(
            congelado?.processosAno,
            atual?.processosAno
        );


    /* ==================================================
       INSERE O MOVIMENTO ATUAL
    ================================================== */

    const itemPeriodo =
        lista.find(
            item =>
                item.mes === nomeMesAtual
        );


    if(itemPeriodo){

        itemPeriodo.processos =
            diferencaProcessos !== null &&
            diferencaProcessos > 0

                ? diferencaProcessos

                : 0;
    }


    const labels =
        lista.map(
            item =>
                abreviarMesRelatorio(
                    item.mes
                )
        );


    const valores =
        lista.map(
            item =>
                Number(
                    item.processos || 0
                )
        );


    const grafico =
        new Chart(
            canvas,
            {
                type:"bar",

                data:{

                    labels,

                    datasets:[
                        {
                            label:"Processos",

                            data:valores,

                            backgroundColor:
                                "#1d4eff",

                            borderColor:
                                "#0f3cc9",

                            borderWidth:1,

                            borderRadius:4,

                            _ocultarZero:true
                        }
                    ]
                },


                options:{

                    ...opcoesGraficoRelatorio(),

                    plugins:{

                        ...opcoesGraficoRelatorio()
                            .plugins,

                        /*
                        Impede o plugin global do painel
                        de escrever números fora do lugar.
                        */
                        valorFlutuante:false,

                        legend:{
                            display:false
                        },

                        datalabels:{
                            display:true,

                            color:"#0f2557",

                            anchor:"end",

                            align:"top",

                            offset:1,

                            formatter(valor){

                                return Number(valor) > 0
                                    ? valor
                                    : "";
                            },

                            font:{
                                size:8,
                                weight:"bold"
                            }
                        }
                    },


                    scales:{

                        x:{

                            grid:{
                                display:false
                            },

                            ticks:{

                                color:"#5c6c96",

                                font:{
                                    size:7,
                                    weight:"600"
                                }
                            }
                        },


                        y:{

                            beginAtZero:true,

                            grace:"15%",

                            grid:{

                                color:
                                    "rgba(15,37,87,.06)"
                            },

                            ticks:{

                                precision:0,

                                color:"#5c6c96",

                                font:{
                                    size:7
                                }
                            }
                        }
                    }
                }
            }
        );


    window.graficosRelatorio.push(
        grafico
    );
}

/* ==========================================================
   GRÁFICO DESCARTE
========================================================== */

function criarGraficoDescarteRelatorio(
    dados
){

    const canvas =
        document.getElementById(
            "relatorioGraficoDescarte"
        );


    if(!canvas){
        return;
    }


    const lista =
        obterOrigensDescarte(
            dados
        )
        .slice(0,5);


    if(!lista.length){
        return;
    }


    const grafico =
        new Chart(
            canvas,
            {
                type:"doughnut",

                data:{

                    labels:
                        lista.map(
                            item =>
                                item.nome
                        ),

                    datasets:[
                        {
                            data:
                                lista.map(
                                    item =>
                                        Number(
                                            item.valor || 0
                                        )
                                ),

                            backgroundColor:
                                lista.map(
                                    item =>
                                        obterCorOrigemDescarte(
                                            item.nome
                                        )
                                ),

                            borderWidth:2,

                            borderColor:"#ffffff"
                        }
                    ]
                },


                options:{

                    responsive:true,

                    maintainAspectRatio:false,

                    cutout:"62%",

                    plugins:{

                        valorFlutuante:false,

                        legend:{
                            display:false
                        },

                        datalabels:false,
                        

                        tooltip:{

                            enabled:true,

                            callbacks:{

                                label(context){

                                    return (
                                        context.label +
                                        ": " +
                                        formatarMoeda(
                                            context.raw
                                        )
                                    );
                                }
                            }
                        }
                    }
                }
            }
        );


    window.graficosRelatorio.push(
        grafico
    );
}

/* ==========================================================
   GRÁFICO AMOSTRAS
========================================================== */

function criarGraficoAmostrasRelatorio(
    dados
){

    const canvas =
        document.getElementById(
            "relatorioGraficoAmostras"
        );


    if(
        !canvas ||
        !Array.isArray(
            dados?.mensal
        )
    ){

        return;
    }


    const labels =
        dados.mensal.map(
            item =>
                item.mes || ""
        );


    const valores =
        dados.mensal.map(
            item =>
                obterQuantidadeAmostra(
                    item
                )
        );


    const grafico =
        new Chart(
            canvas,
            {
                type:"bar",

                data:{
                    labels,

                    datasets:[
                        {
                            label:"Amostras",
                            data:valores,
                            backgroundColor:
                                "#3b82f6",
                            borderRadius:4
                        }
                    ]
                },

                options:
                    opcoesGraficoRelatorio()
            }
        );


    window.graficosRelatorio.push(
        grafico
    );
}

/* ==========================================================
   GRÁFICO RETRABALHO
========================================================== */

function criarGraficoRetrabalhoRelatorio(
    dados
){

    const canvas =
        document.getElementById(
            "relatorioGraficoRetrabalho"
        );


    if(
        !canvas ||
        !Array.isArray(
            dados?.fabricantes
        )
    ){

        return;
    }


    const lista =
        dados.fabricantes

            .filter(
                item =>
                    Number(
                        item.quantidade || 0
                    ) > 0
            )

            .sort(
                (a,b) =>
                    Number(
                        b.quantidade || 0
                    ) -
                    Number(
                        a.quantidade || 0
                    )
            )

            .slice(0,4);


    if(!lista.length){
        return;
    }


    const grafico =
        new Chart(
            canvas,
            {
                type:"bar",

                data:{

                    labels:
                        lista.map(
                            item =>
                                item.fabricante
                        ),

                    datasets:[
                        {
                            label:"Unidades",

                            data:
                                lista.map(
                                    item =>
                                        Number(
                                            item.quantidade || 0
                                        )
                                ),

                            backgroundColor:
                                "#2563eb",

                            borderRadius:4
                        }
                    ]
                },

                options:{
                    ...opcoesGraficoRelatorio(),

                    indexAxis:"y"
                }
            }
        );


    window.graficosRelatorio.push(
        grafico
    );
}


/* ==========================================================
   OPÇÕES PADRÃO DOS GRÁFICOS
========================================================== */

function opcoesGraficoRelatorio(){

    return {

        responsive:true,

        maintainAspectRatio:false,

        animation:false,

        plugins:{

            legend:{
                display:false
            },

            datalabels:{
                display:false
            },

            tooltip:{
                enabled:true
            }
        },

        scales:{

            x:{

                beginAtZero:true,

                grid:{
                    display:false
                },

                ticks:{
                    font:{
                        size:8
                    }
                }
            },

            y:{

                beginAtZero:true,

                grid:{
                    color:
                        "rgba(15,37,87,.06)"
                },

                ticks:{
                    font:{
                        size:8
                    }
                }
            }
        }
    };
}


/* ==========================================================
   ORIGENS DO DESCARTE
========================================================== */

function obterOrigensDescarte(
    dados
){

    const possibilidades = [

        dados?.valorAtual?.origens,

        dados?.origensAtual,

        dados?.descartadoAno?.origens,

        dados?.origensAcumulado

    ];


    const lista =
        possibilidades.find(
            item =>
                Array.isArray(item)
        ) || [];


    return lista

        .map(
            item => ({

                nome:
                    item.nome ||
                    item.origem ||
                    item.descricao ||
                    "Origem",

                valor:
                    Number(
                        item.valor ||
                        item.total ||
                        0
                    )
            })
        )

        .filter(
            item =>
                item.valor > 0
        )

        .sort(
            (a,b) =>
                b.valor -
                a.valor
        );
}


/* ==========================================================
   SOMAR AMOSTRAS
========================================================== */

function somarQuantidadeAmostras(
    lista
){

    if(
        !Array.isArray(lista)
    ){

        return 0;
    }


    return lista.reduce(
        (
            soma,
            item
        ) =>

            soma +
            obterQuantidadeAmostra(
                item
            ),

        0
    );
}


function obterQuantidadeAmostra(
    item
){

    return Number(

        item?.quantidade ??
        item?.valor ??
        item?.total ??
        item?.amostras ??
        0

    );
}


/* ==========================================================
   VARIAÇÃO
========================================================== */

function calcularVariacao(
    anterior,
    atual
){

    if(
        !numeroValido(anterior) ||
        !numeroValido(atual)
    ){

        return null;
    }


    return (
        Number(atual) -
        Number(anterior)
    );
}


/* ==========================================================
   MOVIMENTO EXECUTIVO
========================================================== */

function formatarMovimentoExecutivo(
    valor,
    tipo
){

    if(
        valor === null ||
        valor === undefined
    ){

        return "-";
    }


    /* ======================================================
       VALOR NEGATIVO
       Não trata automaticamente como erro.
       Exibe apenas a posição de ajuste.
    ====================================================== */

    if(valor < 0){

        return `
            <span class="relatorio-ajuste">
                Ajuste
            </span>
        `;
    }


    /* ======================================================
       MOEDA
    ====================================================== */

    if(tipo === "moeda"){

        return formatarMoeda(
            valor
        );
    }


    /* ======================================================
       HORAS
    ====================================================== */

    if(tipo === "horas"){

        return formatarHoras(
            valor
        );
    }


    /* ======================================================
       NÚMERO
    ====================================================== */

    return formatarNumero(
        valor
    );
}
/* ==========================================================
   VALOR EXECUTIVO
========================================================== */

function formatarValorExecutivo(
    valor,
    tipo
){

    if(tipo === "moeda"){

        return formatarMoeda(
            valor
        );
    }


    if(tipo === "horas"){

        return formatarHoras(
            valor
        );
    }


    if(tipo === "percentual"){

        return formatarPercentual(
            valor
        );
    }


    return formatarNumero(
        valor
    );
}


/* ==========================================================
   FORMATAÇÕES
========================================================== */

function formatarNumero(
    valor
){

    const numero =
        Number(valor);


    if(
        !Number.isFinite(numero)
    ){

        return "-";
    }


    return numero
        .toLocaleString(
            "pt-BR",
            {
                maximumFractionDigits:2
            }
        );
}


function formatarHoras(
    valor
){

    const numero =
        Number(valor);


    if(
        !Number.isFinite(numero)
    ){

        return "-";
    }


    return (
        numero
            .toLocaleString(
                "pt-BR",
                {
                    maximumFractionDigits:2
                }
            ) +
        " h"
    );
}


function formatarMoeda(
    valor
){

    const numero =
        Number(valor);


    if(
        !Number.isFinite(numero)
    ){

        return "-";
    }


    return numero
        .toLocaleString(
            "pt-BR",
            {
                style:"currency",
                currency:"BRL"
            }
        );
}


function formatarPercentual(
    valor
){

    const numero =
        Number(valor);


    if(
        !Number.isFinite(numero)
    ){

        return "-";
    }


    return (
        numero * 100
    )
        .toLocaleString(
            "pt-BR",
            {
                maximumFractionDigits:1
            }
        ) +
        "%";
}


/* ==========================================================
   TEXTO DOS KPIs
========================================================== */

function textoMovimento(
    valor,
    complemento = ""
){

    if(
        valor === null ||
        valor === undefined
    ){

        return "Sem comparação";
    }


    if(valor < 0){

        return "Ajuste de base";
    }


    if(valor === 0){

        return "Sem alteração";
    }


    return `+${formatarNumero(valor)} ${complemento}`;
}


function textoMovimentoMoeda(
    valor
){

    if(
        valor === null ||
        valor === undefined
    ){

        return "Sem comparação";
    }


    if(valor < 0){

        return "Ajuste de base";
    }


    if(valor === 0){

        return "Sem alteração";
    }


    return `+${formatarMoeda(valor)} no período`;
}


function formatarMovimentoMoeda(
    valor
){

    if(
        valor === null ||
        valor === undefined
    ){

        return "-";
    }


    if(valor < 0){

        return "Ajuste de base";
    }


    return formatarMoeda(
        valor
    );
}

/* ==========================================================
   CLASSIFICAÇÃO DO ÍNDICE
========================================================== */

function classificacaoIndice(
    indice
){

    const percentual =
        Number(indice) * 100;


    if(!Number.isFinite(percentual)){

        return "-";
    }


    if(percentual >= 95){

        return "Excelente";
    }


    if(percentual >= 90){

        return "Muito bom";
    }


    if(percentual >= 80){

        return "Atenção";
    }


    if(percentual >= 70){

        return "Ruim";
    }


    return "Crítico";
}


/* ==========================================================
   MÊS SEGUINTE
========================================================== */

function obterMesSeguinte(
    mes,
    ano
){

    let numeroMes =
        Number(mes);

    let numeroAno =
        Number(ano);


    numeroMes++;


    if(numeroMes > 12){

        numeroMes = 1;
        numeroAno++;
    }


    return {

        mes:
            String(numeroMes)
                .padStart(
                    2,
                    "0"
                ),

        ano:
            String(numeroAno)
    };
}

/* ==========================================================
   ABREVIAR MÊS
========================================================== */

function abreviarMesRelatorio(
    mes
){

    const mapa = {

        "Janeiro":"Jan",
        "Fevereiro":"Fev",
        "Março":"Mar",
        "Abril":"Abr",
        "Maio":"Mai",
        "Junho":"Jun",
        "Julho":"Jul",
        "Agosto":"Ago",
        "Setembro":"Set",
        "Outubro":"Out",
        "Novembro":"Nov",
        "Dezembro":"Dez"
    };


    return mapa[mes] || mes;
}
/* ==========================================================
   NOME DO MÊS
========================================================== */

function obterNomeMes(
    mes
){

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
   NÚMERO VÁLIDO
========================================================== */

function numeroValido(
    valor
){

    return (

        valor !== null &&

        valor !== undefined &&

        valor !== "" &&

        Number.isFinite(
            Number(valor)
        )
    );
}


/* ==========================================================
   LIMPAR PREVIEW
========================================================== */

function limparPreviewRelatorio(){

    destruirGraficosRelatorio();


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
/* ==========================================================
   BLOCO INSTITUCIONAL DO RELATÓRIO
========================================================== */

function gerarBlocoInstitucionalRelatorio(){

    return `

        <section class="relatorio-institucional">

            <div class="relatorio-institucional-imagem">

                <img
                    src="img/relatorio-qualidade.png"
                    alt="Equipamentos hospitalares e instrumentos de qualidade"
                >

            </div>

        </section>

    `;
}
