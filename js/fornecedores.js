
/* ==========================================================
   FORNECEDORES.JS
   Painel de Processos SGQ

   Entrada esperada:
   renderizarFornecedores(dados.fornecedores)

   Estrutura compatível:
   fornecedores
   ├── totalrncano
   ├── totalfornecedores
   ├── totalprocessos
   ├── totalretrabalho
   ├── totalreclamacao
   ├── indicemedioavaliacao
   ├── indicadores
   ├── avaliados
   ├── ranking
   └── top10Rnc
========================================================== */

(function(){

    "use strict";


    /* ======================================================
       CONFIGURAÇÕES
    ====================================================== */

    const CORES = {

        azul:"#1557d6",
        azulEscuro:"#0b45d8",

        verde:"#20b957",
        amarelo:"#ffc20a",
        laranja:"#ff7a00",
        vermelho:"#f52f3e",
        vermelhoEscuro:"#b91c1c",

        texto:"#1f2937",
        textoSecundario:"#64748b",

        grade:"rgba(148,163,184,.22)"
    };


    const CLASSIFICACOES = {

        excelente:{
            slug:"excelente",
            label:"Excelente",
            cor:CORES.verde
        },

        muitoBom:{
            slug:"muito-bom",
            label:"Muito bom",
            cor:"#84cc16"
        },

        atencao:{
            slug:"atencao",
            label:"Atenção",
            cor:CORES.amarelo
        },

        ruim:{
            slug:"ruim",
            label:"Ruim",
            cor:CORES.laranja
        },

        critico:{
            slug:"critico",
            label:"Crítico",
            cor:CORES.vermelho
        }
    };


    const ORDEM_CLASSIFICACOES = [
        "excelente",
        "muito-bom",
        "atencao",
        "ruim",
        "critico"
    ];


    /* ======================================================
       ESTADO
    ====================================================== */

    const estado = {

        raiz:null,

        dados:null,

        fornecedores:[],

        resumo:null,

        abaAtual:"geral",

        termoBusca:"",

        filtroClassificacao:"todos",

        fornecedorSelecionado:null,

        graficos:new Map()
    };


    /* ======================================================
       UTILITÁRIOS
    ====================================================== */

    function numero(valor){

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


        if(!texto){
            return 0;
        }


        texto = texto.replace("%","");


        /*
           Formato brasileiro:
           1.234,56
        */

        if(
            texto.includes(",") &&
            texto.includes(".")
        ){

            texto = texto
                .replace(/\./g,"")
                .replace(",",".");
        }

        else if(texto.includes(",")){

            texto = texto.replace(",",".");
        }


        const convertido =
            Number(texto);


        return Number.isFinite(convertido)
            ? convertido
            : 0;
    }


    function primeiroValor(
        objeto,
        chaves,
        padrao = null
    ){

        if(
            !objeto ||
            typeof objeto !== "object"
        ){
            return padrao;
        }


        for(const chave of chaves){

            if(
                objeto[chave] !== undefined &&
                objeto[chave] !== null &&
                objeto[chave] !== ""
            ){
                return objeto[chave];
            }
        }


        return padrao;
    }


    function primeiroNumero(
        objeto,
        chaves,
        padrao = 0
    ){

        const valor =
            primeiroValor(
                objeto,
                chaves,
                null
            );


        if(
            valor === null ||
            valor === undefined ||
            valor === ""
        ){
            return padrao;
        }


        return numero(valor);
    }


    function normalizarIndice(valor){

        let indice =
            numero(valor);


        /*
           Permite:
           0.95
           95
           "95%"
        */

        if(indice > 1){
            indice = indice / 100;
        }


        return Math.max(
            0,
            Math.min(1,indice)
        );
    }


    function formatarInteiro(valor){

        return Math.round(
            numero(valor)
        ).toLocaleString(
            "pt-BR"
        );
    }


    function formatarPercentual(valor){

        const n =
            numero(valor);


        const percentual =
            n <= 1
                ? n * 100
                : n;


        return `${Math.round(percentual)}%`;
    }


    function escaparHtml(valor){

        return String(
            valor ?? ""
        )
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");
    }


    function normalizarTexto(valor){

        return String(
            valor ?? ""
        )
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .trim();
    }


    function criarId(
        nome,
        indice
    ){

        const base =
            normalizarTexto(nome)
                .replace(
                    /[^a-z0-9]+/g,
                    "-"
                )
                .replace(
                    /^-+|-+$/g,
                    ""
                );


        return `${base || "fornecedor"}-${indice}`;
    }


    function somar(
        lista,
        campo
    ){

        return lista.reduce(
            (total,item) =>
                total +
                numero(item[campo]),
            0
        );
    }


    function media(lista){

        if(!lista.length){
            return 0;
        }


        return lista.reduce(
            (total,valor) =>
                total +
                numero(valor),
            0
        ) / lista.length;
    }


    /* ======================================================
       CLASSIFICAÇÃO
    ====================================================== */

    function obterClassificacao(indice){

        const percentual =
            normalizarIndice(indice) * 100;


        if(percentual >= 95){

            return CLASSIFICACOES.excelente;
        }


        if(percentual >= 90){

            return CLASSIFICACOES.muitoBom;
        }


        if(percentual >= 80){

            return CLASSIFICACOES.atencao;
        }


        if(percentual >= 70){

            return CLASSIFICACOES.ruim;
        }


        return CLASSIFICACOES.critico;
    }


    function obterClassificacaoPorSlug(
        slug
    ){

        return Object.values(
            CLASSIFICACOES
        )
        .find(
            item =>
                item.slug === slug
        ) || CLASSIFICACOES.critico;
    }


    /* ======================================================
       NORMALIZAÇÃO DO FORNECEDOR
    ====================================================== */

    function normalizarFornecedor(
        item,
        indice
    ){

        const nome = String(
            primeiroValor(
                item,
                [
                    "fabricante",
                    "fornecedor",
                    "nome",
                    "razaoSocial",
                    "descricao"
                ],
                `Fornecedor ${indice + 1}`
            )
        ).trim();


        const avaliacao =
            normalizarIndice(
                primeiroValor(
                    item,
                    [
                        "indiceavaliacao",
                        "indiceAvaliacao",
                        "indice",
                        "scoreFinal",
                        "score",
                        "percentual"
                    ],
                    0
                )
            );


        const classificacao =
            obterClassificacao(
                avaliacao
            );


        return {

            id:
                criarId(
                    nome,
                    indice
                ),

            nome,

            processos:
                primeiroNumero(
                    item,
                    [
                        "processosano",
                        "processosAno",
                        "processos",
                        "totalProcessos"
                    ],
                    0
                ),

            produtos:
                primeiroNumero(
                    item,
                    [
                        "produtosfornecidos",
                        "produtos",
                        "totalProdutos",
                        "skuano",
                        "sku",
                        "skus",
                        "totalSku",
                        "quantidadeProdutos"
                    ],
                    0
                ),

            rncs:
                primeiroNumero(
                    item,
                    [
                        "rnc",
                        "rncs",
                        "totalRnc",
                        "naoConformidades",
                        "nãoConformidades"
                    ],
                    0
                ),

            retrabalhos:
                primeiroNumero(
                    item,
                    [
                        "retrabalhos",
                        "retrabalho",
                        "totalRetrabalhos",
                        "totalRetrabalho"
                    ],
                    0
                ),

            reclamacoes:
                primeiroNumero(
                    item,
                    [
                        "reclamacoes",
                        "reclamações",
                        "totalReclamacoes",
                        "totalReclamações"
                    ],
                    0
                ),

            ocorrencias:
                primeiroNumero(
                    item,
                    [
                        "ocorrencias",
                        "ocorrências"
                    ],
                    0
                ),

            horas:
                primeiroNumero(
                    item,
                    [
                        "horas"
                    ],
                    0
                ),

            indice:
                avaliacao,

            classificacao,

            original:item
        };
    }


    /* ======================================================
       LOCALIZAR LISTA
    ====================================================== */

    function localizarLista(
        entrada,
        raizDados
    ){

        const candidatas = [

            Array.isArray(entrada)
                ? entrada
                : null,

            /*
               avaliados precisa vir antes de ranking,
               porque ranking pode conter somente
               informações resumidas.
            */

            raizDados?.avaliados,

            raizDados?.lista,

            raizDados?.avaliacoes,

            raizDados?.avaliações,

            raizDados?.detalhes,

            Array.isArray(
                raizDados?.fornecedores
            )
                ? raizDados.fornecedores
                : null,

            raizDados?.ranking
        ];


        return candidatas.find(
            Array.isArray
        ) || [];
    }


    /* ======================================================
       NORMALIZAR ENTRADA
    ====================================================== */

    function normalizarEntrada(
        entrada
    ){

        let raizDados =
            entrada || {};


        /*
           Aceita:

           renderizarFornecedores(
               dados.fornecedores
           )

           e também:

           renderizarFornecedores(
               dados
           )
        */

        if(
            !Array.isArray(entrada) &&
            entrada?.fornecedores &&
            !Array.isArray(
                entrada.fornecedores
            )
        ){

            raizDados =
                entrada.fornecedores;
        }


        const lista =
            localizarLista(
                entrada,
                raizDados
            )
            .filter(
                item =>
                    item &&
                    typeof item === "object"
            )
            .map(
                normalizarFornecedor
            );


        const resumo = {

            totalFornecedores:
                primeiroNumero(
                    raizDados,
                    [
                        "totalfornecedores",
                        "totalFornecedores",
                        "fornecedoresAno",
                        "quantidadeFornecedores"
                    ],
                    lista.length
                ),

            processos:
                primeiroNumero(
                    raizDados,
                    [
                        "totalprocessos",
                        "totalProcessos",
                        "processosAno",
                        "processos"
                    ],
                    somar(
                        lista,
                        "processos"
                    )
                ),

            rncs:
                primeiroNumero(
                    raizDados,
                    [
                        "totalrncano",
                        "totalRncAno",
                        "totalRnc",
                        "totalRncs",
                        "rncAno",
                        "rncsAno",
                        "naoConformidades"
                    ],
                    somar(
                        lista,
                        "rncs"
                    )
                ),

            retrabalhos:
                primeiroNumero(
                    raizDados,
                    [
                        "totalretrabalho",
                        "totalRetrabalho",
                        "totalRetrabalhos",
                        "retrabalhosAno"
                    ],
                    somar(
                        lista,
                        "retrabalhos"
                    )
                ),

            indiceMedio:
                normalizarIndice(
                    primeiroValor(
                        raizDados,
                        [
                            "indicemedioavaliacao",
                            "indiceMedioAvaliacao",
                            "indiceMedio",
                            "mediaIndice",
                            "scoreMedio",
                            "avaliacaoMedia"
                        ],
                        media(
                            lista.map(
                                item =>
                                    item.indice
                            )
                        )
                    )
                )
        };


        if(
            !resumo.totalFornecedores &&
            lista.length
        ){

            resumo.totalFornecedores =
                lista.length;
        }


        return {
            resumo,
            lista,
            raizDados
        };
    }


    /* ======================================================
       ÍCONES
    ====================================================== */

    function iconeSvg(tipo){

        const icones = {

            fornecedores:`
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3Zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V20h14v-3.5C15 14.17 10.33 13 8 13Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V20h6v-3.5c0-2.33-4.67-3.5-7-3.5Z"/>
                </svg>
            `,

            processos:`
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 2h9l5 5v15H6V2Zm8 1.5V8h4.5L14 3.5ZM9 12v2h8v-2H9Zm0 4v2h8v-2H9Z"/>
                </svg>
            `,

            alerta:`
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M1 21h22L12 2 1 21Zm12-3h-2v-2h2v2Zm0-4h-2v-4h2v4Z"/>
                </svg>
            `,

            ferramenta:`
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22.7 19.3 14.9 11.5a6 6 0 0 1-7.4-7.4l3.6 3.6 2.8-2.8-3.6-3.6a6 6 0 0 1 7.4 7.4l7.8 7.8-2.8 2.8Z"/>
                </svg>
            `,

            estrela:`
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m12 2.5 2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.31l-5.8 3.05 1.11-6.46-4.7-4.58 6.49-.94L12 2.5Z"/>
                </svg>
            `
        };


        return icones[tipo] || "";
    }


    /* ======================================================
       PAINÉIS E MÉTRICAS
    ====================================================== */

    function criarPainelGrafico(
        titulo,
        idCanvas,
        rosca = false
    ){

        return `
            <article class="fornecedores-panel">

                <h3 class="fornecedores-panel__titulo">
                    ${titulo}
                </h3>

                <div class="fornecedores-chart-box${rosca ? " fornecedores-chart-box--rosca" : ""}">

                    <canvas
                        id="${idCanvas}"
                        role="img"
                        aria-label="${titulo}"
                    ></canvas>

                </div>

            </article>
        `;
    }


    function criarMetrica(
        label,
        icone,
        cor,
        idValor
    ){

        return `
            <div class="fornecedor-metrica">

                <span class="fornecedor-metrica__icone fornecedor-metrica__icone--${cor}">
                    ${iconeSvg(icone)}
                </span>

                <span class="fornecedor-metrica__label">
                    ${label}
                </span>

                <strong
                    class="fornecedor-metrica__valor"
                    id="${idValor}"
                >
                    0
                </strong>

            </div>
        `;
    }


    /* ======================================================
       CRIAÇÃO DOS KPIs
    ====================================================== */

    function criarKpi(
        titulo,
        icone,
        classeCor,
        idValor
    ){

        return `
            <article class="fornecedor-kpi">

                <h3 class="fornecedor-kpi__titulo">
                    ${titulo}
                </h3>

                <span class="fornecedor-kpi__icone fornecedor-kpi__icone--${classeCor}">
                    ${iconeSvg(icone)}
                </span>

                <strong
                    class="fornecedor-kpi__valor"
                    id="${idValor}"
                >
                    0
                </strong>

            </article>
        `;
    }
       /* ======================================================
       MONTAGEM DA ESTRUTURA
    ====================================================== */

    function montarEstrutura(raiz){

        raiz.classList.add(
            "pagina-fornecedores"
        );


        raiz.innerHTML = `

            <nav
                class="fornecedores-abas"
                aria-label="Abas de fornecedores"
            >

                <button
                    type="button"
                    class="fornecedores-aba is-active"
                    data-fornecedores-aba="geral"
                    aria-selected="true"
                >
                    Visão geral
                </button>


                <button
                    type="button"
                    class="fornecedores-aba"
                    data-fornecedores-aba="avaliacao"
                    aria-selected="false"
                >
                    Avaliação por fornecedor
                </button>

            </nav>


            <section
                class="fornecedores-conteudo"
                data-fornecedores-conteudo="geral"
            >

                <div class="fornecedores-indicadores">

                    ${criarKpi(
                        "TOTAL DE FORNECEDORES",
                        "fornecedores",
                        "azul",
                        "forn-kpi-total"
                    )}

                    ${criarKpi(
                        "PROCESSOS NO ANO",
                        "processos",
                        "azul",
                        "forn-kpi-processos"
                    )}

                    ${criarKpi(
                        "RNCs NO ANO",
                        "alerta",
                        "vermelho",
                        "forn-kpi-rncs"
                    )}

                    ${criarKpi(
                        "RETRABALHOS",
                        "ferramenta",
                        "laranja",
                        "forn-kpi-retrabalhos"
                    )}

                    ${criarKpi(
                        "ÍNDICE MÉDIO",
                        "estrela",
                        "verde",
                        "forn-kpi-indice"
                    )}

                </div>


                <div class="fornecedores-graficos">

                    ${criarPainelGrafico(
                        "RANKING DE AVALIAÇÃO",
                        "grafico-fornecedores-ranking"
                    )}

                    ${criarPainelGrafico(
                        "FORNECEDORES COM MAIS RNCs",
                        "grafico-fornecedores-rncs"
                    )}

                    ${criarPainelGrafico(
                        "DISTRIBUIÇÃO POR CLASSIFICAÇÃO",
                        "grafico-fornecedores-classificacao",
                        true
                    )}

                    ${criarPainelGrafico(
                        "PROCESSOS POR FORNECEDOR",
                        "grafico-fornecedores-processos"
                    )}

                </div>

            </section>


            <section
                class="fornecedores-conteudo"
                data-fornecedores-conteudo="avaliacao"
                hidden
            >

                <div class="fornecedores-avaliacao-grid">

                    <div class="fornecedores-lista-panel">

                        <div class="fornecedores-controles">

                            <label class="fornecedores-pesquisa">

                                <span>
                                    Pesquisar fornecedor
                                </span>

                                <input
                                    id="fornecedores-pesquisa"
                                    type="search"
                                    placeholder="Digite o nome..."
                                    autocomplete="off"
                                >

                            </label>


                            <label class="fornecedores-filtro">

                                <span>
                                    Classificação
                                </span>

                                <select
                                    id="fornecedores-classificacao"
                                >

                                    <option value="todos">
                                        Todas
                                    </option>

                                    <option value="excelente">
                                        Excelente
                                    </option>

                                    <option value="muito-bom">
                                        Muito bom
                                    </option>

                                    <option value="atencao">
                                        Atenção
                                    </option>

                                    <option value="ruim">
                                        Ruim
                                    </option>

                                    <option value="critico">
                                        Crítico
                                    </option>

                                </select>

                            </label>

                        </div>


                        <div class="fornecedores-tabela-wrap">

                            <table class="fornecedores-tabela">

                                <thead>

                                    <tr>

                                        <th>
                                            Fornecedor
                                        </th>

                                        <th>
                                            Processos
                                        </th>

                                        <th>
                                            Produtos/SKUs
                                        </th>

                                        <th>
                                            RNCs
                                        </th>

                                        <th>
                                            Retrabalhos
                                        </th>

                                        <th>
                                            Reclamações
                                        </th>

                                        <th>
                                            Índice
                                        </th>

                                        <th>
                                            Classificação
                                        </th>

                                    </tr>

                                </thead>


                                <tbody
                                    id="fornecedores-tabela-corpo"
                                ></tbody>

                            </table>

                        </div>

                    </div>


                    <aside
                        class="fornecedor-detalhe"
                        aria-live="polite"
                    >

                        <p class="fornecedor-detalhe__rotulo">
                            Fornecedor selecionado
                        </p>


                        <h3
                            class="fornecedor-detalhe__nome"
                            id="fornecedor-detalhe-nome"
                        >
                            —
                        </h3>


                        <div
                            class="fornecedor-gauge"
                            id="fornecedor-gauge"
                        >

                            <div class="fornecedor-gauge__arco">
                            </div>


                            <div class="fornecedor-gauge__conteudo">

                                <span
                                    class="fornecedor-gauge__valor"
                                    id="fornecedor-gauge-valor"
                                >
                                    0%
                                </span>


                                <span
                                    class="fornecedor-gauge__classificacao"
                                    id="fornecedor-gauge-classificacao"
                                >
                                    —
                                </span>

                            </div>

                        </div>


                        <div class="fornecedor-detalhe__metricas">

                            ${criarMetrica(
                                "Processos",
                                "processos",
                                "azul",
                                "forn-detalhe-processos"
                            )}

                            ${criarMetrica(
                                "Produtos/SKUs",
                                "processos",
                                "azul",
                                "forn-detalhe-produtos"
                            )}

                            ${criarMetrica(
                                "RNCs",
                                "alerta",
                                "vermelho",
                                "forn-detalhe-rncs"
                            )}

                            ${criarMetrica(
                                "Retrabalhos",
                                "ferramenta",
                                "laranja",
                                "forn-detalhe-retrabalhos"
                            )}

                            ${criarMetrica(
                                "Reclamações",
                                "alerta",
                                "roxo",
                                "forn-detalhe-reclamacoes"
                            )}

                            ${criarMetrica(
                                "Posição no ranking",
                                "estrela",
                                "azul",
                                "forn-detalhe-posicao"
                            )}

                        </div>

                    </aside>

                </div>

            </section>
        `;
    }


    /* ======================================================
       PREENCHER INDICADORES
    ====================================================== */

    function preencherIndicadores(){

        const resumo =
            estado.resumo || {};


        definirTexto(
            "forn-kpi-total",
            formatarInteiro(
                resumo.totalFornecedores
            )
        );


        definirTexto(
            "forn-kpi-processos",
            formatarInteiro(
                resumo.processos
            )
        );


        definirTexto(
            "forn-kpi-rncs",
            formatarInteiro(
                resumo.rncs
            )
        );


        definirTexto(
            "forn-kpi-retrabalhos",
            formatarInteiro(
                resumo.retrabalhos
            )
        );


        definirTexto(
            "forn-kpi-indice",
            formatarPercentual(
                resumo.indiceMedio
            )
        );
    }


    function definirTexto(
        id,
        valor
    ){

        const elemento =
            estado.raiz?.querySelector(
                `#${id}`
            );


        if(elemento){

            elemento.textContent =
                valor;
        }
    }


    /* ======================================================
       ABAS
    ====================================================== */

    function abrirAba(nome){

        estado.abaAtual =
            nome;


        estado.raiz
            .querySelectorAll(
                "[data-fornecedores-aba]"
            )
            .forEach(
                botao => {

                    const ativa =
                        botao.dataset.fornecedoresAba === nome;


                    botao.classList.toggle(
                        "is-active",
                        ativa
                    );


                    botao.setAttribute(
                        "aria-selected",
                        String(ativa)
                    );
                }
            );


        estado.raiz
            .querySelectorAll(
                "[data-fornecedores-conteudo]"
            )
            .forEach(
                conteudo => {

                    conteudo.hidden =
                        conteudo.dataset.fornecedoresConteudo !== nome;
                }
            );


        if(nome === "geral"){

            requestAnimationFrame(
                () => {

                    estado.graficos.forEach(
                        grafico => {

                            try{

                                grafico.resize();

                            }catch(_erro){
                                /* vazio */
                            }
                        }
                    );
                }
            );
        }
    }


    /* ======================================================
       EVENTOS
    ====================================================== */

    function configurarEventos(){

        const botoes =
            estado.raiz.querySelectorAll(
                "[data-fornecedores-aba]"
            );


        botoes.forEach(
            botao => {

                botao.addEventListener(
                    "click",
                    () => {

                        abrirAba(
                            botao.dataset.fornecedoresAba
                        );
                    }
                );
            }
        );


        const pesquisa =
            estado.raiz.querySelector(
                "#fornecedores-pesquisa"
            );


        pesquisa?.addEventListener(
            "input",
            evento => {

                estado.termoBusca =
                    evento.target.value;

                aplicarFiltros();
            }
        );


        const filtro =
            estado.raiz.querySelector(
                "#fornecedores-classificacao"
            );


        filtro?.addEventListener(
            "change",
            evento => {

                estado.filtroClassificacao =
                    evento.target.value;

                aplicarFiltros();
            }
        );


        const corpo =
            estado.raiz.querySelector(
                "#fornecedores-tabela-corpo"
            );


        corpo?.addEventListener(
            "click",
            evento => {

                const linha =
                    evento.target.closest(
                        "tr[data-fornecedor-id]"
                    );


                if(!linha){
                    return;
                }


                selecionarFornecedor(
                    linha.dataset.fornecedorId
                );
            }
        );


        corpo?.addEventListener(
            "keydown",
            evento => {

                if(
                    evento.key !== "Enter" &&
                    evento.key !== " "
                ){
                    return;
                }


                const linha =
                    evento.target.closest(
                        "tr[data-fornecedor-id]"
                    );


                if(!linha){
                    return;
                }


                evento.preventDefault();


                selecionarFornecedor(
                    linha.dataset.fornecedorId
                );
            }
        );
    }


    /* ======================================================
       FILTROS
    ====================================================== */

    function aplicarFiltros(){

        const busca =
            normalizarTexto(
                estado.termoBusca
            );


        const classificacao =
            estado.filtroClassificacao;


        const filtrados =
            [...estado.fornecedores]

            .filter(
                item => {

                    if(!busca){
                        return true;
                    }


                    return normalizarTexto(
                        item.nome
                    ).includes(
                        busca
                    );
                }
            )

            .filter(
                item => {

                    if(
                        !classificacao ||
                        classificacao === "todos"
                    ){
                        return true;
                    }


                    return item.classificacao.slug === classificacao;
                }
            )

            .sort(
                (a,b) =>

                    b.indice -
                    a.indice ||

                    b.processos -
                    a.processos ||

                    b.produtos -
                    a.produtos
            );


        renderizarTabela(
            filtrados
        );


        const selecionadoExiste =
            filtrados.some(
                item =>
                    item.id ===
                    estado.fornecedorSelecionado
            );


        if(!selecionadoExiste){

            selecionarFornecedor(
                filtrados[0]?.id || null
            );

        }else{

            destacarLinhaSelecionada();
        }
    }


    /* ======================================================
       TABELA
    ====================================================== */

    function renderizarTabela(lista){

        const corpo =
            estado.raiz.querySelector(
                "#fornecedores-tabela-corpo"
            );


        if(!corpo){
            return;
        }


        if(!lista.length){

            corpo.innerHTML = `
                <tr>

                    <td
                        colspan="8"
                        class="fornecedores-tabela-vazia"
                    >
                        Nenhum fornecedor encontrado.
                    </td>

                </tr>
            `;

            return;
        }


        corpo.innerHTML =
            lista.map(
                item => {

                    return `
                        <tr
                            data-fornecedor-id="${escaparHtml(item.id)}"
                            tabindex="0"
                        >

                            <td>
                                ${escaparHtml(item.nome)}
                            </td>

                            <td>
                                ${formatarInteiro(item.processos)}
                            </td>

                            <td>
                                ${formatarInteiro(item.produtos)}
                            </td>

                            <td>
                                ${formatarInteiro(item.rncs)}
                            </td>

                            <td>
                                ${formatarInteiro(item.retrabalhos)}
                            </td>

                            <td>
                                ${formatarInteiro(item.reclamacoes)}
                            </td>

                            <td>
                                ${formatarPercentual(item.indice)}
                            </td>

                            <td>

                                <span
                                    class="fornecedor-badge fornecedor-badge--${item.classificacao.slug}"
                                >
                                    ${item.classificacao.label}
                                </span>

                            </td>

                        </tr>
                    `;
                }
            )
            .join("");


        destacarLinhaSelecionada();
    }


    /* ======================================================
       SELEÇÃO
    ====================================================== */

    function selecionarFornecedor(id){

        estado.fornecedorSelecionado =
            id;


        const fornecedor =
            estado.fornecedores.find(
                item =>
                    item.id === id
            ) || null;


        atualizarDetalhe(
            fornecedor
        );


        destacarLinhaSelecionada();
    }


    function destacarLinhaSelecionada(){

        estado.raiz
            .querySelectorAll(
                "tr[data-fornecedor-id]"
            )
            .forEach(
                linha => {

                    linha.classList.toggle(
                        "is-selected",
                        linha.dataset.fornecedorId ===
                        estado.fornecedorSelecionado
                    );
                }
            );
    }


    /* ======================================================
       DETALHE DO FORNECEDOR
    ====================================================== */

    function atualizarDetalhe(
        fornecedor
    ){

        const nome =
            fornecedor?.nome ||
            "Nenhum fornecedor";


        const indice =
            fornecedor?.indice || 0;


        const classificacao =
            fornecedor?.classificacao ||
            CLASSIFICACOES.critico;


        definirTexto(
            "fornecedor-detalhe-nome",
            nome
        );


        definirTexto(
            "fornecedor-gauge-valor",
            formatarPercentual(
                indice
            )
        );


        definirTexto(
            "fornecedor-gauge-classificacao",
            fornecedor
                ? classificacao.label
                : "—"
        );


        const gauge =
            estado.raiz.querySelector(
                "#fornecedor-gauge"
            );


        if(gauge){

            gauge.style.setProperty(
                "--gauge-valor",
                String(
                    indice * 100
                )
            );


            gauge.style.setProperty(
                "--gauge-cor",
                classificacao.cor
            );
        }


        definirTexto(
            "forn-detalhe-processos",
            formatarInteiro(
                fornecedor?.processos || 0
            )
        );


        definirTexto(
            "forn-detalhe-produtos",
            formatarInteiro(
                fornecedor?.produtos || 0
            )
        );


        definirTexto(
            "forn-detalhe-rncs",
            formatarInteiro(
                fornecedor?.rncs || 0
            )
        );


        definirTexto(
            "forn-detalhe-retrabalhos",
            formatarInteiro(
                fornecedor?.retrabalhos || 0
            )
        );


        definirTexto(
            "forn-detalhe-reclamacoes",
            formatarInteiro(
                fornecedor?.reclamacoes || 0
            )
        );


        const posicao =
            fornecedor
                ? obterPosicaoRanking(
                    fornecedor.id
                )
                : 0;


        definirTexto(
            "forn-detalhe-posicao",
            posicao
                ? `${posicao}º`
                : "—"
        );
    }


    function obterPosicaoRanking(id){

        const ranking =
            [...estado.fornecedores]

            .sort(
                (a,b) =>

                    b.indice -
                    a.indice ||

                    b.processos -
                    a.processos ||

                    b.produtos -
                    a.produtos
            );


        const indice =
            ranking.findIndex(
                item =>
                    item.id === id
            );


        return indice >= 0
            ? indice + 1
            : 0;
    }


    /* ======================================================
       DESTRUIR GRÁFICOS
    ====================================================== */

    function destruirGraficosFornecedores(){

        estado.graficos.forEach(
            grafico => {

                try{

                    grafico.destroy();

                }catch(erro){

                    console.warn(
                        "Não foi possível destruir gráfico de fornecedores.",
                        erro
                    );
                }
            }
        );


        estado.graficos.clear();
    }

    /* ======================================================
       PLUGINS EXCLUSIVOS DOS GRÁFICOS
    ====================================================== */

    const rotuloBarraFornecedores = {

        id:"rotuloBarraFornecedoresUnico",

        afterDatasetsDraw(chart,args,options){

            if(
                chart.config.type !== "bar" ||
                chart.options.indexAxis !== "y"
            ){
                return;
            }

            const dataset = chart.data.datasets[0];
            const meta = chart.getDatasetMeta(0);

            if(!dataset || !meta){
                return;
            }

            const ctx = chart.ctx;
            const sufixo = options?.sufixo || "";

            ctx.save();
            ctx.font = "700 11px Segoe UI, Arial, sans-serif";
            ctx.fillStyle = "#172033";
            ctx.textBaseline = "middle";
            ctx.textAlign = "left";

            meta.data.forEach((barra,indice) => {

                const valor = numero(dataset.data[indice]);

                const texto = sufixo === "%"
                    ? `${Math.round(valor)}%`
                    : formatarInteiro(valor);

                const posicao = barra.tooltipPosition();

                ctx.fillText(
                    texto,
                    posicao.x + 7,
                    posicao.y
                );
            });

            ctx.restore();
        }
    };


    const rotuloRoscaFornecedores = {

        id:"rotuloRoscaFornecedores",

        afterDatasetsDraw(chart){

            if(chart.config.type !== "doughnut"){
                return;
            }

            const dataset = chart.data.datasets[0];
            const meta = chart.getDatasetMeta(0);

            if(!dataset || !meta){
                return;
            }

            const total = dataset.data.reduce(
                (soma,valor) => soma + numero(valor),
                0
            );

            if(!total){
                return;
            }

            const ctx = chart.ctx;

            ctx.save();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "800 12px Segoe UI, Arial, sans-serif";
            ctx.fillStyle = "#ffffff";

            meta.data.forEach((arco,indice) => {

                const valor = numero(dataset.data[indice]);

                if(!valor){
                    return;
                }

                const percentual = Math.round((valor / total) * 100);

                // Evita poluir visualmente fatias muito pequenas.
                if(percentual < 5){
                    return;
                }

                const ponto = arco.getCenterPoint();

                ctx.fillText(
                    `${percentual}%`,
                    ponto.x,
                    ponto.y
                );
            });

            ctx.restore();
        },

        afterDraw(chart,args,options){

            if(chart.config.type !== "doughnut"){
                return;
            }

            const total = chart.data.datasets[0].data.reduce(
                (soma,valor) => soma + numero(valor),
                0
            );

            if(!total){
                return;
            }

            const legend = chart.legend;

            if(!legend){
                return;
            }

            const ctx = chart.ctx;
            const x = legend.left + 2;
            const y = Math.min(
                chart.height - 12,
                legend.bottom + 18
            );

            ctx.save();
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.font = "700 11px Segoe UI, Arial, sans-serif";
            ctx.fillStyle = "#172033";
            ctx.fillText(
                `Total de fornecedores: ${formatarInteiro(total)}`,
                x,
                y
            );
            ctx.restore();
        }
    };


    /* ======================================================
       PREPARAR DADOS DOS GRÁFICOS
    ====================================================== */

    function criarGraficos(){

        destruirGraficosFornecedores();

        if(typeof window.Chart === "undefined"){

            mostrarAvisoGraficos(
                "Chart.js não foi carregado."
            );

            return;
        }


        /* ==================================================
           RANKING DE AVALIAÇÃO
           Mesmo enquadramento da imagem-modelo.
        ================================================== */

        const ranking = [...estado.fornecedores]
            .filter(item => item.processos > 0)
            .sort((a,b) =>
                b.indice - a.indice ||
                b.processos - a.processos ||
                b.produtos - a.produtos
            )
            .slice(0,8);


        /* ==================================================
           FORNECEDORES COM MAIS RNCs
        ================================================== */

        const maisRncs = [...estado.fornecedores]
            .filter(item => item.rncs > 0)
            .sort((a,b) =>
                b.rncs - a.rncs ||
                b.processos - a.processos
            )
            .slice(0,5);


        /* ==================================================
           PROCESSOS POR FORNECEDOR
        ================================================== */

        const maisProcessos = [...estado.fornecedores]
            .filter(item => item.processos > 0)
            .sort((a,b) =>
                b.processos - a.processos ||
                b.produtos - a.produtos
            )
            .slice(0,5);


        criarGraficoBarras(
            "grafico-fornecedores-ranking",
            ranking,
            item => item.indice * 100,
            ranking.map(item => item.classificacao.cor),
            "%",
            100,
            "Índice de Avaliação (%)"
        );


        criarGraficoBarras(
            "grafico-fornecedores-rncs",
            maisRncs,
            item => item.rncs,
            CORES.vermelho,
            "",
            null,
            "Quantidade de RNCs"
        );


        criarGraficoClassificacoes();


        criarGraficoBarras(
            "grafico-fornecedores-processos",
            maisProcessos,
            item => item.processos,
            CORES.azul,
            "",
            null,
            "Quantidade de Processos"
        );
    }


    /* ======================================================
       GRÁFICO DE BARRAS
    ====================================================== */

    function criarGraficoBarras(
        idCanvas,
        lista,
        obterValor,
        cor,
        sufixo,
        maximo,
        tituloEixoX = ""
    ){

        const canvas = estado.raiz.querySelector(
            `#${idCanvas}`
        );

        if(!canvas){
            return;
        }

        if(!lista.length){

            mostrarAvisoCanvas(
                canvas,
                "Sem dados para exibir."
            );

            return;
        }

        const valores = lista.map(obterValor);
        const maiorValor = Math.max(...valores,1);

        const limiteX = maximo || Math.max(
            1,
            Math.ceil(maiorValor * 1.12)
        );

        const grafico = new window.Chart(
            canvas,
            {
                type:"bar",

                data:{
                    labels:lista.map(item => item.nome),

                    datasets:[{
                        data:valores,
                        backgroundColor:cor,
                        borderColor:cor,
                        borderWidth:0,
                        borderRadius:1,
                        borderSkipped:false,
                        barThickness:14,
                        maxBarThickness:16,
                        categoryPercentage:.72,
                        datalabels:{
                            display:false
                        }
                    }]
                },

                plugins:[
                    rotuloBarraFornecedores
                ],

                options:{
                    indexAxis:"y",
                    responsive:true,
                    maintainAspectRatio:false,
                    devicePixelRatio:2,

                    animation:{
                        duration:650,
                        easing:"easeOutQuart"
                    },

                    layout:{
                        padding:{
                            top:8,
                            right:44,
                            bottom:2,
                            left:0
                        }
                    },

                    plugins:{
                        legend:{
                            display:false
                        },

                        datalabels:{
                            display:false
                        },

                        rotuloBarraFornecedoresUnico:{
                            sufixo:sufixo
                        },

                        tooltip:{
                            displayColors:false,

                            callbacks:{
                                title(context){
                                    return context[0]?.label || "";
                                },

                                label(context){

                                    if(sufixo === "%"){
                                        return ` ${Math.round(numero(context.raw))}%`;
                                    }

                                    return ` ${formatarInteiro(context.raw)}`;
                                }
                            }
                        }
                    },

                    scales:{
                        x:{
                            beginAtZero:true,
                            max:limiteX,

                            title:{
                                display:Boolean(tituloEixoX),
                                text:tituloEixoX,
                                color:"#374151",
                                padding:{
                                    top:8
                                },
                                font:{
                                    family:"Segoe UI",
                                    size:11,
                                    weight:"600"
                                }
                            },

                            grid:{
                                color:CORES.grade,
                                drawTicks:false
                            },

                            border:{
                                display:true,
                                color:"#cfd6e3",
                                width:1
                            },

                            ticks:{
                                color:CORES.texto,
                                precision:0,
                                padding:7,
                                font:{
                                    family:"Segoe UI",
                                    size:10,
                                    weight:"500"
                                }
                            }
                        },

                        y:{
                            grid:{
                                display:false
                            },

                            border:{
                                display:false
                            },

                            ticks:{
                                color:"#1f2937",
                                autoSkip:false,
                                padding:9,

                                font:{
                                    family:"Segoe UI",
                                    size:10,
                                    weight:"500"
                                },

                                callback:function(value){

                                    const label = String(
                                        this.getLabelForValue(value) ?? ""
                                    );

                                    if(label.length > 28){
                                        return `${label.slice(0,28)}…`;
                                    }

                                    return label;
                                }
                            },

                            afterFit(scale){
                                scale.width = 175;
                            }
                        }
                    }
                }
            }
        );

        estado.graficos.set(
            idCanvas,
            grafico
        );
    }


    /* ======================================================
       DISTRIBUIÇÃO POR CLASSIFICAÇÃO
    ====================================================== */

    function criarGraficoClassificacoes(){

        const canvas = estado.raiz.querySelector(
            "#grafico-fornecedores-classificacao"
        );

        if(!canvas){
            return;
        }

        const totais = {
            excelente:0,
            "muito-bom":0,
            atencao:0,
            ruim:0,
            critico:0
        };

        // A distribuição usa todos os fornecedores avaliados.
        estado.fornecedores.forEach(item => {

            const slug = item.classificacao.slug;

            if(totais[slug] !== undefined){
                totais[slug] += 1;
            }
        });

        const configuracoes = [
            {
                slug:"excelente",
                label:"Excelente",
                faixa:"95% - 100%",
                cor:CLASSIFICACOES.excelente.cor
            },
            {
                slug:"muito-bom",
                label:"Muito bom",
                faixa:"90% - 94%",
                cor:CLASSIFICACOES.muitoBom.cor
            },
            {
                slug:"atencao",
                label:"Atenção",
                faixa:"80% - 89%",
                cor:CLASSIFICACOES.atencao.cor
            },
            {
                slug:"ruim",
                label:"Ruim",
                faixa:"70% - 79%",
                cor:CLASSIFICACOES.ruim.cor
            },
            {
                slug:"critico",
                label:"Crítico",
                faixa:"< 70%",
                cor:CLASSIFICACOES.critico.cor
            }
        ];

        const dados = configuracoes.map(
            item => totais[item.slug]
        );

        const total = dados.reduce(
            (soma,valor) => soma + numero(valor),
            0
        );

        if(!total){

            mostrarAvisoCanvas(
                canvas,
                "Sem avaliações para exibir."
            );

            return;
        }

        const grafico = new window.Chart(
            canvas,
            {
                type:"doughnut",

                data:{
                    labels:configuracoes.map(item => item.label),

                    datasets:[{
                        data:dados,
                        backgroundColor:configuracoes.map(item => item.cor),
                        borderColor:"#ffffff",
                        borderWidth:2,
                        hoverOffset:3,
                        datalabels:{
                            display:false
                        }
                    }]
                },

                plugins:[
                    rotuloRoscaFornecedores
                ],

                options:{
                    responsive:true,
                    maintainAspectRatio:false,
                    devicePixelRatio:2,
                    cutout:"58%",
                    radius:"88%",

                    animation:{
                        duration:650,
                        easing:"easeOutQuart"
                    },

                    layout:{
                        padding:{
                            top:4,
                            right:4,
                            bottom:24,
                            left:4
                        }
                    },

                    plugins:{
                        datalabels:{
                            display:false
                        },

                        legend:{
                            display:true,
                            position:"right",
                            align:"center",

                            labels:{
                                color:"#1f2937",
                                usePointStyle:false,
                                boxWidth:12,
                                boxHeight:12,
                                padding:14,

                                font:{
                                    family:"Segoe UI",
                                    size:10,
                                    weight:"600"
                                },

                                generateLabels(){

                                    return configuracoes.map((item,indice) => {

                                        const valor = dados[indice];
                                        const percentual = total
                                            ? Math.round((valor / total) * 100)
                                            : 0;

                                        return {
                                            text:`${item.label} (${item.faixa})     ${valor} (${percentual}%)`,
                                            fillStyle:item.cor,
                                            strokeStyle:item.cor,
                                            lineWidth:0,
                                            hidden:false,
                                            index:indice
                                        };
                                    });
                                }
                            },

                            onClick(evento,item,legend){

                                const indice = item.index;
                                const chart = legend.chart;

                                chart.toggleDataVisibility(indice);
                                chart.update();
                            }
                        },

                        tooltip:{
                            displayColors:true,

                            callbacks:{
                                label(context){

                                    const indice = context.dataIndex;
                                    const valor = numero(context.raw);
                                    const percentual = total
                                        ? ((valor / total) * 100)
                                            .toFixed(1)
                                            .replace(".",",")
                                        : "0";

                                    const item = configuracoes[indice];

                                    return (
                                        ` ${item.label}: ` +
                                        `${valor} fornecedores ` +
                                        `(${percentual}%)`
                                    );
                                }
                            }
                        }
                    }
                }
            }
        );

        estado.graficos.set(
            "grafico-fornecedores-classificacao",
            grafico
        );
    }

    /* ======================================================
       AVISOS NOS GRÁFICOS
    ====================================================== */

    function mostrarAvisoGraficos(
        mensagem
    ){

        estado.raiz
            .querySelectorAll(
                ".fornecedores-chart-box"
            )
            .forEach(
                box => {

                    box.innerHTML = `
                        <div class="fornecedores-chart-aviso">
                            ${escaparHtml(mensagem)}
                        </div>
                    `;
                }
            );
    }


    function mostrarAvisoCanvas(
        canvas,
        mensagem
    ){

        const box =
            canvas.parentElement;


        if(!box){
            return;
        }


        box.innerHTML = `
            <div class="fornecedores-chart-aviso">
                ${escaparHtml(mensagem)}
            </div>
        `;
    }


    /* ======================================================
       LOCALIZAR RAIZ
    ====================================================== */

    function encontrarRaiz(
        alvo
    ){

        if(
            typeof Element !==
                "undefined" &&
            alvo instanceof Element
        ){

            return alvo;
        }


        if(
            typeof alvo ===
            "string"
        ){

            return document
                .querySelector(
                    alvo
                );
        }


        return document
            .querySelector(
                "#pagina-fornecedores, .pagina-fornecedores"
            );
    }


    /* ======================================================
       RENDERIZAÇÃO PRINCIPAL
    ====================================================== */

    function renderizarFornecedores(
        entrada,
        alvo
    ){

        const raiz =
            encontrarRaiz(
                alvo
            );


        if(!raiz){

            console.warn(
                "Área da página de fornecedores não encontrada."
            );

            return false;
        }


        destruirGraficosFornecedores();


        const normalizado =
            normalizarEntrada(
                entrada
            );


        estado.raiz =
            raiz;


        estado.dados =
            normalizado.raizDados;


        estado.resumo =
            normalizado.resumo;


        estado.fornecedores =
            normalizado.lista;


        estado.abaAtual =
            "geral";


        estado.termoBusca =
            "";


        estado.filtroClassificacao =
            "todos";


        estado.fornecedorSelecionado =
            null;


        montarEstrutura(
            raiz
        );


        preencherIndicadores();


        configurarEventos();


        aplicarFiltros();


        requestAnimationFrame(
            () => {

                criarGraficos();
            }
        );


        raiz.dataset
            .fornecedoresInicializado =
            "true";


        return true;
    }


    /* ======================================================
       ATUALIZAÇÃO DOS DADOS
    ====================================================== */

    function atualizarFornecedores(
        novosDados
    ){

        if(!estado.raiz){

            return renderizarFornecedores(
                novosDados
            );
        }


        return renderizarFornecedores(
            novosDados,
            estado.raiz
        );
    }


    /* ======================================================
       INICIALIZAÇÃO AUTOMÁTICA
    ====================================================== */

    function tentarInicializacaoAutomatica(){

        const raiz =
            encontrarRaiz();


        if(
            !raiz ||
            raiz.dataset
                .fornecedoresInicializado ===
                "true"
        ){

            return;
        }


        const fonte =

            window.dadosFornecedores ||

            window.dadosPainel
                ?.fornecedores ||

            window.dados
                ?.fornecedores;


        if(fonte){

            renderizarFornecedores(
                fonte,
                raiz
            );
        }
    }


    /* ======================================================
       FUNÇÕES PÚBLICAS
    ====================================================== */

    window.renderizarFornecedores =
        renderizarFornecedores;


    window.inicializarFornecedores =
        renderizarFornecedores;


    window.carregarFornecedores =
        renderizarFornecedores;


    window.atualizarFornecedores =
        atualizarFornecedores;


    window.destruirGraficosFornecedores =
        destruirGraficosFornecedores;


    /* ======================================================
       BOOT
    ====================================================== */

    if(
        document.readyState ===
        "loading"
    ){

        document.addEventListener(
            "DOMContentLoaded",
            tentarInicializacaoAutomatica,
            {
                once:true
            }
        );

    }else{

        tentarInicializacaoAutomatica();
    }


})();

