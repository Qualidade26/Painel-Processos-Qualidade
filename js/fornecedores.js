/* ==========================================================
   PÁGINA — FORNECEDORES
   Requer Chart.js carregado antes deste arquivo.

   Uso recomendado:
   renderizarFornecedores(dados.fornecedores);

   O HTML precisa conter somente:
   <section id="pagina-fornecedores" class="pagina-fornecedores"></section>
========================================================== */

(function fornecedoresModulo(){
    "use strict";

    const estado = {
        raiz:null,
        dadosBrutos:null,
        resumo:null,
        fornecedores:[],
        fornecedorSelecionadoId:null,
        graficos:new Map()
    };

    const CORES = {
        azul:"#0b45d8",
        azulEscuro:"#0736ad",
        azulClaro:"#3b82f6",
        excelente:"#22b955",
        muitoBom:"#84cc16",
        atencao:"#facc15",
        ruim:"#f97316",
        critico:"#ef3340",
        grade:"rgba(148,163,184,.24)",
        texto:"#334155"
    };

    const ORDEM_CLASSIFICACOES = [
        "excelente",
        "muito-bom",
        "atencao",
        "ruim",
        "critico"
    ];

    const ROTULOS_CLASSIFICACOES = {
        "excelente":"Excelente",
        "muito-bom":"Muito bom",
        "atencao":"Atenção",
        "ruim":"Ruim",
        "critico":"Crítico"
    };


    /* ======================================================
       UTILITÁRIOS
    ====================================================== */

    function escaparHtml(valor){
        return String(valor ?? "")
            .replaceAll("&","&amp;")
            .replaceAll("<","&lt;")
            .replaceAll(">","&gt;")
            .replaceAll('"',"&quot;")
            .replaceAll("'","&#039;");
    }

    function normalizarTexto(valor){
        return String(valor ?? "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g,"")
            .toLowerCase()
            .trim();
    }

    function criarId(nome,indice){
        const base = normalizarTexto(nome)
            .replace(/[^a-z0-9]+/g,"-")
            .replace(/^-|-$/g,"");

        return `fornecedor-${indice}-${base || "sem-nome"}`;
    }

    function numero(valor){
        if(typeof valor === "number"){
            return Number.isFinite(valor) ? valor : 0;
        }

        if(valor === null || valor === undefined || valor === ""){
            return 0;
        }

        let texto = String(valor)
            .trim()
            .replace(/\s/g,"")
            .replace(/%/g,"")
            .replace(/R\$/gi,"");

        if(texto.includes(",") && texto.includes(".")){
            texto = texto.replace(/\./g,"").replace(",",".");
        }else if(texto.includes(",")){
            texto = texto.replace(",",".");
        }else if((texto.match(/\./g) || []).length > 1){
            texto = texto.replace(/\./g,"");
        }

        texto = texto.replace(/[^0-9.-]/g,"");

        const resultado = Number(texto);
        return Number.isFinite(resultado) ? resultado : 0;
    }

    function primeiroValor(objeto,chaves,valorPadrao){
        for(const chave of chaves){
            const valor = objeto?.[chave];

            if(valor !== undefined && valor !== null && valor !== ""){
                return valor;
            }
        }

        return valorPadrao;
    }

    function primeiroNumero(objeto,chaves,valorPadrao = 0){
        const valor = primeiroValor(objeto,chaves,undefined);
        return valor === undefined ? valorPadrao : numero(valor);
    }

    function formatarInteiro(valor){
        return Math.round(numero(valor)).toLocaleString("pt-BR");
    }

    function formatarPercentual(valor){
        const n = Math.max(0,Math.min(100,numero(valor)));
        const casas = Number.isInteger(n) ? 0 : 1;

        return `${n.toLocaleString("pt-BR",{
            minimumFractionDigits:casas,
            maximumFractionDigits:1
        })}%`;
    }

    function media(lista){
        if(!lista.length){
            return 0;
        }

        return lista.reduce((soma,item) => soma + numero(item),0) / lista.length;
    }

    function somar(lista,chave){
        return lista.reduce((soma,item) => soma + numero(item[chave]),0);
    }


    /* ======================================================
       CLASSIFICAÇÃO DO ÍNDICE
       95–100 Excelente | 90–94 Muito bom | 80–89 Atenção
       70–79 Ruim | abaixo de 70 Crítico
    ====================================================== */

    function obterClassificacao(indice){
        const valor = Math.max(0,Math.min(100,numero(indice)));

        if(valor >= 95){
            return {slug:"excelente",rotulo:"Excelente",cor:CORES.excelente};
        }

        if(valor >= 90){
            return {slug:"muito-bom",rotulo:"Muito bom",cor:CORES.muitoBom};
        }

        if(valor >= 80){
            return {slug:"atencao",rotulo:"Atenção",cor:CORES.atencao};
        }

        if(valor >= 70){
            return {slug:"ruim",rotulo:"Ruim",cor:CORES.ruim};
        }

        return {slug:"critico",rotulo:"Crítico",cor:CORES.critico};
    }

    function normalizarIndice(valor){
        let indice = numero(valor);

        if(indice > 0 && indice <= 1){
            indice *= 100;
        }

        return Math.max(0,Math.min(100,indice));
    }


    /* ======================================================
       NORMALIZAÇÃO DOS DADOS
       Aceita nomes alternativos para facilitar integração
       com o JSON atual do painel.
    ====================================================== */
function normalizarFornecedor(item,indice){

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


    const avaliacao = normalizarIndice(
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


    const classificacao = obterClassificacao(avaliacao);


    return {

        id: criarId(nome,indice),

        nome,

        processos: primeiroNumero(
            item,
            [
                "processosano",
                "processosAno",
                "processos",
                "totalProcessos"
            ],
            0
        ),

        produtos: primeiroNumero(
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

        rncs: primeiroNumero(
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

        retrabalhos: primeiroNumero(
            item,
            [
                "retrabalhos",
                "retrabalho",
                "totalRetrabalhos",
                "totalRetrabalho"
            ],
            0
        ),

        reclamacoes: primeiroNumero(
            item,
            [
                "reclamacoes",
                "reclamações",
                "totalReclamacoes",
                "totalReclamações"
            ],
            0
        ),

        ocorrencias: primeiroNumero(
            item,
            [
                "ocorrencias",
                "ocorrências"
            ],
            0
        ),

        horas: primeiroNumero(
            item,
            ["horas"],
            0
        ),

        indice: avaliacao,

        classificacao,

        original: item
    };
}


function localizarLista(entrada,raizDados){

    const candidatas = [

        Array.isArray(entrada)
            ? entrada
            : null,

        raizDados?.avaliados,

        raizDados?.lista,

        raizDados?.avaliacoes,

        raizDados?.avaliações,

        raizDados?.detalhes,

        Array.isArray(raizDados?.fornecedores)
            ? raizDados.fornecedores
            : null,

        raizDados?.ranking
    ];


    return candidatas.find(Array.isArray) || [];
}


function normalizarEntrada(entrada){

    let raizDados = entrada || {};


    if(
        !Array.isArray(entrada) &&
        entrada?.fornecedores &&
        !Array.isArray(entrada.fornecedores)
    ){
        raizDados = entrada.fornecedores;
    }


    const lista = localizarLista(
        entrada,
        raizDados
    )
        .filter(
            item =>
                item &&
                typeof item === "object"
        )
        .map(normalizarFornecedor);


    const resumo = {

        totalFornecedores: primeiroNumero(
            raizDados,
            [
                "totalfornecedores",
                "totalFornecedores",
                "fornecedoresAno",
                "quantidadeFornecedores"
            ],
            lista.length
        ),


        processos: primeiroNumero(
            raizDados,
            [
                "totalprocessos",
                "totalProcessos",
                "processosAno",
                "processos"
            ],
            somar(lista,"processos")
        ),


        rncs: primeiroNumero(
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
            somar(lista,"rncs")
        ),


        retrabalhos: primeiroNumero(
            raizDados,
            [
                "totalretrabalho",
                "totalRetrabalho",
                "totalRetrabalhos",
                "retrabalhosAno"
            ],
            somar(lista,"retrabalhos")
        ),


        indiceMedio: normalizarIndice(
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
                        item => item.indice
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
       ÍCONES SVG
    ====================================================== */

    function iconeSvg(nome){
        const caminhos = {
            usuarios:'<path d="M16 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM6.5 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2 21v-2.1C2 15.65 4.65 13 7.9 13h1.2c1.02 0 1.98.26 2.82.72A7.47 7.47 0 0 0 9 19.65V21H2Zm9 0v-1.35A5.65 5.65 0 0 1 16.65 14h.7A5.65 5.65 0 0 1 23 19.65V21H11Z"/>',
            documento:'<path d="M6 2h8l5 5v15H6V2Zm8 1.8V8h4.2L14 3.8ZM9 12v2h7v-2H9Zm0 4v2h7v-2H9Z"/>',
            alerta:'<path d="M12 2 1.5 21h21L12 2Zm-1 6h2v7h-2V8Zm0 9h2v2h-2v-2Z"/>',
            ferramenta:'<path d="M22 5.7a6 6 0 0 1-7.7 7.7l-7.9 7.9a2 2 0 1 1-2.8-2.8l7.9-7.9A6 6 0 0 1 19.3 3l-3.8 3.8 1.7 1.7L22 5.7Z"/>',
            estrela:'<path d="m12 2.2 3.02 6.12 6.76.98-4.89 4.76 1.15 6.73L12 17.62l-6.04 3.17 1.15-6.73L2.22 9.3l6.76-.98L12 2.2Z"/>',
            cubo:'<path d="m12 2 9 5v10l-9 5-9-5V7l9-5Zm0 2.3L6.1 7.58 12 10.86l5.9-3.28L12 4.3Zm-7 4.96v6.57l6 3.33v-6.57L5 9.26Zm8 9.9 6-3.33V9.26l-6 3.33v6.57Z"/>',
            comentario:'<path d="M3 3h18v14H8l-5 4V3Zm5 6v2h2V9H8Zm4 0v2h2V9h-2Zm4 0v2h2V9h-2Z"/>',
            trofeu:'<path d="M8 2h8v2h5v3c0 3.15-2.1 5.8-5 6.65A6.04 6.04 0 0 1 13 17v2h4v2H7v-2h4v-2a6.04 6.04 0 0 1-3-3.35C5.1 12.8 3 10.15 3 7V4h5V2Zm8 4v5.45A4.02 4.02 0 0 0 19 7V6h-3ZM5 6v1a4.02 4.02 0 0 0 3 4.45V6H5Z"/>',
            pesquisa:'<path d="M10.5 3a7.5 7.5 0 1 0 4.68 13.36L20.82 22 22 20.82l-5.64-5.64A7.5 7.5 0 0 0 10.5 3Zm0 2a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Z"/>'
        };

        return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${caminhos[nome] || caminhos.documento}</svg>`;
    }


    /* ======================================================
       ESTRUTURA HTML
    ====================================================== */

    function montarEstrutura(raiz){
        raiz.classList.add("pagina-fornecedores");
        raiz.innerHTML = `
            <nav class="fornecedores-abas" aria-label="Abas de fornecedores">
                <button
                    type="button"
                    class="fornecedores-aba is-active"
                    data-fornecedores-aba="visao-geral"
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
                data-fornecedores-conteudo="visao-geral"
            >
                <div class="fornecedores-indicadores">
                    ${criarKpi("TOTAL DE FORNECEDORES","usuarios","azul","forn-kpi-total")}
                    ${criarKpi("PROCESSOS NO ANO","documento","azul","forn-kpi-processos")}
                    ${criarKpi("RNCs NO ANO","alerta","vermelho","forn-kpi-rncs")}
                    ${criarKpi("RETRABALHOS","ferramenta","laranja","forn-kpi-retrabalhos")}
                    ${criarKpi("ÍNDICE MÉDIO","estrela","verde","forn-kpi-indice")}
                </div>

                <div class="fornecedores-graficos">
                    ${criarPainelGrafico("RANKING DE AVALIAÇÃO","grafico-fornecedores-ranking")}
                    ${criarPainelGrafico("FORNECEDORES COM MAIS RNCs","grafico-fornecedores-rncs")}
                    ${criarPainelGrafico("DISTRIBUIÇÃO POR CLASSIFICAÇÃO","grafico-fornecedores-classificacao",true)}
                    ${criarPainelGrafico("PROCESSOS POR FORNECEDOR","grafico-fornecedores-processos")}
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
                                <span class="fornecedores-pesquisa__icone">${iconeSvg("pesquisa")}</span>
                                <input
                                    id="fornecedores-pesquisa"
                                    type="search"
                                    placeholder="Pesquisar fornecedor..."
                                    autocomplete="off"
                                >
                            </label>

                            <label class="fornecedores-filtro">
                                <select id="fornecedores-classificacao" aria-label="Filtrar classificação">
                                    <option value="">Todas as classificações</option>
                                    <option value="excelente">Excelente</option>
                                    <option value="muito-bom">Muito bom</option>
                                    <option value="atencao">Atenção</option>
                                    <option value="ruim">Ruim</option>
                                    <option value="critico">Crítico</option>
                                </select>
                            </label>
                        </div>

                        <div class="fornecedores-tabela-wrap">
                            <table class="fornecedores-tabela">
                                <thead>
                                    <tr>
                                        <th>Fornecedor</th>
                                        <th>Processos</th>
                                        <th>Produtos/SKUs</th>
                                        <th>RNCs</th>
                                        <th>Retrabalhos</th>
                                        <th>Reclamações</th>
                                        <th>Índice</th>
                                        <th>Classificação</th>
                                    </tr>
                                </thead>
                                <tbody id="fornecedores-tabela-corpo"></tbody>
                            </table>
                        </div>
                    </div>

                    <aside class="fornecedor-detalhe" aria-live="polite">
                        <p class="fornecedor-detalhe__rotulo">Fornecedor selecionado</p>
                        <h3 class="fornecedor-detalhe__nome" id="fornecedor-detalhe-nome">—</h3>

                        <div class="fornecedor-gauge" id="fornecedor-gauge">
                            <div class="fornecedor-gauge__arco"></div>
                            <div class="fornecedor-gauge__conteudo">
                                <span class="fornecedor-gauge__valor" id="fornecedor-gauge-valor">0%</span>
                                <span class="fornecedor-gauge__classificacao" id="fornecedor-gauge-classificacao">—</span>
                            </div>
                        </div>

                        <div class="fornecedor-detalhe__metricas">
                            ${criarMetrica("Processos","documento","azul","forn-detalhe-processos")}
                            ${criarMetrica("Produtos/SKUs","cubo","azul","forn-detalhe-produtos")}
                            ${criarMetrica("RNCs","alerta","vermelho","forn-detalhe-rncs")}
                            ${criarMetrica("Retrabalhos","ferramenta","laranja","forn-detalhe-retrabalhos")}
                            ${criarMetrica("Reclamações","comentario","roxo","forn-detalhe-reclamacoes")}
                            ${criarMetrica("Posição no ranking","trofeu","azul","forn-detalhe-posicao")}
                        </div>

                    </aside>
                </div>
            </section>
        `;
    }

    function criarKpi(titulo,icone,cor,idValor){
        return `
            <article class="fornecedor-kpi">
                <h3 class="fornecedor-kpi__titulo">${titulo}</h3>
                <span class="fornecedor-kpi__icone fornecedor-kpi__icone--${cor}">
                    ${iconeSvg(icone)}
                </span>
                <strong class="fornecedor-kpi__valor" id="${idValor}">0</strong>
            </article>
        `;
    }

    function criarPainelGrafico(titulo,idCanvas,rosca = false){
        return `
            <article class="fornecedores-panel">
                <h3 class="fornecedores-panel__titulo">${titulo}</h3>
                <div class="fornecedores-chart-box${rosca ? " fornecedores-chart-box--rosca" : ""}">
                    <canvas id="${idCanvas}" role="img" aria-label="${titulo}"></canvas>
                </div>
            </article>
        `;
    }

    function criarMetrica(label,icone,cor,idValor){
        return `
            <div class="fornecedor-metrica">
                <span class="fornecedor-metrica__icone fornecedor-metrica__icone--${cor}">
                    ${iconeSvg(icone)}
                </span>
                <span class="fornecedor-metrica__label">${label}</span>
                <strong class="fornecedor-metrica__valor" id="${idValor}">0</strong>
            </div>
        `;
    }


    /* ======================================================
       INDICADORES
    ====================================================== */

    function preencherIndicadores(){
        const resumo = estado.resumo;

        definirTexto("forn-kpi-total",formatarInteiro(resumo.totalFornecedores));
        definirTexto("forn-kpi-processos",formatarInteiro(resumo.processos));
        definirTexto("forn-kpi-rncs",formatarInteiro(resumo.rncs));
        definirTexto("forn-kpi-retrabalhos",formatarInteiro(resumo.retrabalhos));
        definirTexto("forn-kpi-indice",formatarPercentual(resumo.indiceMedio));
    }

    function definirTexto(id,valor){
        const elemento = estado.raiz?.querySelector(`#${id}`);

        if(elemento){
            elemento.textContent = valor;
        }
    }


    /* ======================================================
       ABAS E EVENTOS
    ====================================================== */

    function configurarEventos(){
        const botoes = estado.raiz.querySelectorAll("[data-fornecedores-aba]");

        botoes.forEach(botao => {
            botao.addEventListener("click",() => abrirAba(botao.dataset.fornecedoresAba));
        });

        estado.raiz
            .querySelector("#fornecedores-pesquisa")
            ?.addEventListener("input",aplicarFiltros);

        estado.raiz
            .querySelector("#fornecedores-classificacao")
            ?.addEventListener("change",aplicarFiltros);

        const corpo = estado.raiz.querySelector("#fornecedores-tabela-corpo");

        corpo?.addEventListener("click",evento => {
            const linha = evento.target.closest("tr[data-fornecedor-id]");

            if(linha){
                selecionarFornecedor(linha.dataset.fornecedorId);
            }
        });

        corpo?.addEventListener("keydown",evento => {
            if(evento.key !== "Enter" && evento.key !== " "){
                return;
            }

            const linha = evento.target.closest("tr[data-fornecedor-id]");

            if(linha){
                evento.preventDefault();
                selecionarFornecedor(linha.dataset.fornecedorId);
            }
        });

    }

    function abrirAba(nome){
        estado.raiz.querySelectorAll("[data-fornecedores-aba]").forEach(botao => {
            const ativa = botao.dataset.fornecedoresAba === nome;
            botao.classList.toggle("is-active",ativa);
            botao.setAttribute("aria-selected",String(ativa));
        });

        estado.raiz.querySelectorAll("[data-fornecedores-conteudo]").forEach(conteudo => {
            conteudo.hidden = conteudo.dataset.fornecedoresConteudo !== nome;
        });

        if(nome === "visao-geral"){
            requestAnimationFrame(() => {
                estado.graficos.forEach(grafico => grafico.resize());
            });
        }
    }

    /* ======================================================
       TABELA, PESQUISA E DETALHAMENTO
    ====================================================== */

    function aplicarFiltros(){
        const busca = normalizarTexto(
            estado.raiz.querySelector("#fornecedores-pesquisa")?.value
        );

        const classificacao = estado.raiz
            .querySelector("#fornecedores-classificacao")
            ?.value || "";

        const filtrados = estado.fornecedores
            .filter(item => !busca || normalizarTexto(item.nome).includes(busca))
            .filter(item => !classificacao || item.classificacao.slug === classificacao)
            .sort((a,b) => b.indice - a.indice || b.processos - a.processos || b.produtos - a.produtos);

        renderizarTabela(filtrados);

        if(!filtrados.some(item => item.id === estado.fornecedorSelecionadoId)){
            selecionarFornecedor(filtrados[0]?.id || null);
        }else{
            destacarLinhaSelecionada();
        }
    }

    function renderizarTabela(lista){
        const corpo = estado.raiz.querySelector("#fornecedores-tabela-corpo");

        if(!corpo){
            return;
        }

        if(!lista.length){
            corpo.innerHTML = `
                <tr>
                    <td class="fornecedores-tabela-vazia" colspan="8">
                        Nenhum fornecedor encontrado.
                    </td>
                </tr>
            `;
            return;
        }

        corpo.innerHTML = lista.map(item => `
            <tr
                data-fornecedor-id="${escaparHtml(item.id)}"
                tabindex="0"
                aria-label="Selecionar ${escaparHtml(item.nome)}"
            >
                <td>${escaparHtml(item.nome)}</td>
                <td>${formatarInteiro(item.processos)}</td>
                <td>${formatarInteiro(item.produtos)}</td>
                <td>${formatarInteiro(item.rncs)}</td>
                <td>${formatarInteiro(item.retrabalhos)}</td>
                <td>${formatarInteiro(item.reclamacoes)}</td>
                <td>${formatarPercentual(item.indice)}</td>
                <td>
                    <span class="fornecedor-badge fornecedor-badge--${item.classificacao.slug}">
                        ${item.classificacao.rotulo}
                    </span>
                </td>
            </tr>
        `).join("");

        destacarLinhaSelecionada();
    }

    function selecionarFornecedor(id){
        estado.fornecedorSelecionadoId = id;

        const fornecedor = estado.fornecedores.find(item => item.id === id) || null;
        atualizarDetalhe(fornecedor);
        destacarLinhaSelecionada();
    }

    function destacarLinhaSelecionada(){
        estado.raiz.querySelectorAll("tr[data-fornecedor-id]").forEach(linha => {
            linha.classList.toggle(
                "is-selected",
                linha.dataset.fornecedorId === estado.fornecedorSelecionadoId
            );
        });
    }

    function atualizarDetalhe(fornecedor){
        const nome = fornecedor?.nome || "Nenhum fornecedor";
        const indice = fornecedor?.indice || 0;
        const classificacao = fornecedor?.classificacao || obterClassificacao(0);

        definirTexto("fornecedor-detalhe-nome",nome);
        definirTexto("fornecedor-gauge-valor",formatarPercentual(indice));
        definirTexto("fornecedor-gauge-classificacao",fornecedor ? classificacao.rotulo : "—");

        const gauge = estado.raiz.querySelector("#fornecedor-gauge");

        if(gauge){
            gauge.style.setProperty("--gauge-valor",String(indice));
            gauge.style.setProperty("--gauge-cor",classificacao.cor);
        }

        definirTexto("forn-detalhe-processos",formatarInteiro(fornecedor?.processos || 0));
        definirTexto("forn-detalhe-produtos",formatarInteiro(fornecedor?.produtos || 0));
        definirTexto("forn-detalhe-rncs",formatarInteiro(fornecedor?.rncs || 0));
        definirTexto("forn-detalhe-retrabalhos",formatarInteiro(fornecedor?.retrabalhos || 0));
        definirTexto("forn-detalhe-reclamacoes",formatarInteiro(fornecedor?.reclamacoes || 0));

        const posicao = fornecedor ? obterPosicaoRanking(fornecedor.id) : 0;
        definirTexto("forn-detalhe-posicao",posicao ? `${posicao}º` : "—");

    }

    function obterPosicaoRanking(id){
        const ranking = [...estado.fornecedores].sort(
            (a,b) => b.indice - a.indice || b.processos - a.processos || b.produtos - a.produtos
        );

        const indice = ranking.findIndex(item => item.id === id);
        return indice >= 0 ? indice + 1 : 0;
    }


    /* ======================================================
       GRÁFICOS
    ====================================================== */

    const pluginRotulosBarras = {
        id:"rotulosFimBarraFornecedores",
        afterDatasetsDraw(grafico,_args,opcoes){
            if(grafico.options.indexAxis !== "y"){
                return;
            }

            const {ctx,chartArea} = grafico;
            const meta = grafico.getDatasetMeta(0);
            const dados = grafico.data.datasets[0]?.data || [];
            const sufixo = opcoes?.sufixo || "";

            ctx.save();
            ctx.fillStyle = "#111827";
            ctx.font = "600 11px Segoe UI, Arial, sans-serif";
            ctx.textBaseline = "middle";

            meta.data.forEach((barra,indice) => {
                const valor = numero(dados[indice]);
                const posicao = barra.tooltipPosition();
                const texto = sufixo === "%"
                    ? formatarPercentual(valor)
                    : formatarInteiro(valor);
                const largura = ctx.measureText(texto).width;
                let x = posicao.x + 7;

                if(x + largura > chartArea.right + 44){
                    x = posicao.x - largura - 7;
                    ctx.fillStyle = "#fff";
                }else{
                    ctx.fillStyle = "#111827";
                }

                ctx.fillText(texto,x,posicao.y);
            });

            ctx.restore();
        }
    };

    function destruirGraficosFornecedores(){
        estado.graficos.forEach(grafico => {
            try{
                grafico.destroy();
            }catch(erro){
                console.warn("Não foi possível destruir um gráfico de fornecedores.",erro);
            }
        });

        estado.graficos.clear();
    }

    function criarGraficos(){
        destruirGraficosFornecedores();

        if(typeof window.Chart === "undefined"){
            mostrarAvisoGraficos("Chart.js não foi carregado.");
            return;
        }

        const ranking = [...estado.fornecedores]
            .sort((a,b) => b.indice - a.indice || b.processos - a.processos)
            .slice(0,10);

        const maisRncs = [...estado.fornecedores]
            .filter(item => item.rncs > 0)
            .sort((a,b) => b.rncs - a.rncs || b.processos - a.processos)
            .slice(0,10);

        const maisProcessos = [...estado.fornecedores]
            .filter(item => item.processos > 0)
            .sort((a,b) => b.processos - a.processos || b.produtos - a.produtos)
            .slice(0,10);

        criarGraficoBarras(
            "grafico-fornecedores-ranking",
            ranking,
            item => item.indice,
            ranking.map(item => item.classificacao.cor),
            "%",
            100
        );

        criarGraficoBarras(
            "grafico-fornecedores-rncs",
            maisRncs,
            item => item.rncs,
            CORES.critico,
            ""
        );

        criarGraficoClassificacoes();

        criarGraficoBarras(
            "grafico-fornecedores-processos",
            maisProcessos,
            item => item.processos,
            CORES.azul,
            ""
        );
    }

    function criarGraficoBarras(idCanvas,lista,obterValor,cor,sufixo,maximo){
        const canvas = estado.raiz.querySelector(`#${idCanvas}`);

        if(!canvas){
            return;
        }

        if(!lista.length){
            mostrarAvisoCanvas(canvas,"Sem dados para exibir.");
            return;
        }

        const valores = lista.map(obterValor);

        const grafico = new window.Chart(canvas,{
            type:"bar",
            data:{
                labels:lista.map(item => item.nome),
                datasets:[{
                    data:valores,
                    backgroundColor:cor,
                    borderColor:cor,
                    borderWidth:0,
                    borderRadius:0,
                    barPercentage:.72,
                    categoryPercentage:.84
                }]
            },
            plugins:[pluginRotulosBarras],
            options:{
                indexAxis:"y",
                responsive:true,
                maintainAspectRatio:false,
                animation:{duration:650,easing:"easeOutQuart"},
                layout:{padding:{top:3,right:50,bottom:2,left:0}},
                plugins:{
                    legend:{display:false},
                    tooltip:{
                        displayColors:false,
                        callbacks:{
                            label(context){
                                return sufixo === "%"
                                    ? ` ${formatarPercentual(context.raw)}`
                                    : ` ${formatarInteiro(context.raw)}`;
                            }
                        }
                    },
                    rotulosFimBarraFornecedores:{sufixo}
                },
                scales:{
                    x:{
                        beginAtZero:true,
                        suggestedMax:maximo,
                        max:maximo,
                        grid:{color:CORES.grade,drawBorder:false},
                        border:{display:false},
                        ticks:{
                            color:CORES.texto,
                            precision:0,
                            font:{family:"Segoe UI",size:10,weight:"600"}
                        }
                    },
                    y:{
                        grid:{display:false,drawBorder:false},
                        border:{display:false},
                        ticks:{
                            color:"#1f2937",
                            autoSkip:false,
                            font:{family:"Segoe UI",size:10,weight:"600"}
                        }
                    }
                }
            }
        });

        estado.graficos.set(idCanvas,grafico);
    }

    function criarGraficoClassificacoes(){
        const canvas = estado.raiz.querySelector("#grafico-fornecedores-classificacao");

        if(!canvas){
            return;
        }

        const totais = Object.fromEntries(ORDEM_CLASSIFICACOES.map(slug => [slug,0]));

        estado.fornecedores.forEach(item => {
            totais[item.classificacao.slug] += 1;
        });

        const dados = ORDEM_CLASSIFICACOES.map(slug => totais[slug]);

        if(!dados.some(Boolean)){
            mostrarAvisoCanvas(canvas,"Sem avaliações para exibir.");
            return;
        }

        const rotulos = [
            "Excelente (95% - 100%)",
            "Muito bom (90% - 94%)",
            "Atenção (80% - 89%)",
            "Ruim (70% - 79%)",
            "Crítico (< 70%)"
        ];

        const cores = [
            CORES.excelente,
            CORES.muitoBom,
            CORES.atencao,
            CORES.ruim,
            CORES.critico
        ];

        const total = dados.reduce((soma,valor) => soma + valor,0);

        const grafico = new window.Chart(canvas,{
            type:"doughnut",
            data:{
                labels:rotulos,
                datasets:[{
                    data:dados,
                    backgroundColor:cores,
                    borderColor:"#fff",
                    borderWidth:2,
                    hoverOffset:4
                }]
            },
            options:{
                responsive:true,
                maintainAspectRatio:false,
                cutout:"58%",
                animation:{duration:650,easing:"easeOutQuart"},
                layout:{padding:5},
                plugins:{
                    legend:{
                        position:"right",
                        align:"center",
                        labels:{
                            color:"#1f2937",
                            boxWidth:12,
                            boxHeight:12,
                            padding:14,
                            font:{family:"Segoe UI",size:10,weight:"600"},
                            generateLabels(chart){
                                const padrao = window.Chart.defaults.plugins.legend.labels.generateLabels(chart);

                                return padrao.map((item,indice) => {
                                    const valor = dados[indice];
                                    const percentual = total ? Math.round((valor / total) * 100) : 0;
                                    item.text = `${rotulos[indice]}  ${valor} (${percentual}%)`;
                                    return item;
                                });
                            }
                        }
                    },
                    tooltip:{
                        callbacks:{
                            label(context){
                                const valor = numero(context.raw);
                                const percentual = total ? ((valor / total) * 100).toFixed(1).replace(".",",") : "0";
                                return ` ${context.label}: ${valor} (${percentual}%)`;
                            }
                        }
                    }
                }
            }
        });

        estado.graficos.set("grafico-fornecedores-classificacao",grafico);
    }

    function mostrarAvisoGraficos(mensagem){
        estado.raiz.querySelectorAll(".fornecedores-chart-box").forEach(box => {
            box.innerHTML = `<div class="fornecedores-chart-aviso">${escaparHtml(mensagem)}</div>`;
        });
    }

    function mostrarAvisoCanvas(canvas,mensagem){
        const box = canvas.parentElement;

        if(box){
            box.innerHTML = `<div class="fornecedores-chart-aviso">${escaparHtml(mensagem)}</div>`;
        }
    }


    /* ======================================================
       INICIALIZAÇÃO PÚBLICA
    ====================================================== */

    function encontrarRaiz(alvo){
        if(alvo instanceof Element){
            return alvo;
        }

        if(typeof alvo === "string"){
            return document.querySelector(alvo);
        }

        return document.querySelector("#pagina-fornecedores, .pagina-fornecedores");
    }

    function renderizarFornecedores(entrada,alvo){
        const raiz = encontrarRaiz(alvo);

        if(!raiz){
            console.warn(
                "Página de fornecedores não encontrada. Use #pagina-fornecedores ou .pagina-fornecedores."
            );
            return false;
        }

        destruirGraficosFornecedores();

        const normalizado = normalizarEntrada(entrada);

        estado.raiz = raiz;
        estado.dadosBrutos = entrada;
        estado.resumo = normalizado.resumo;
        estado.fornecedores = normalizado.lista;
        estado.fornecedorSelecionadoId = null;

        montarEstrutura(raiz);
        preencherIndicadores();
        configurarEventos();
        aplicarFiltros();

        requestAnimationFrame(criarGraficos);

        raiz.dataset.fornecedoresInicializado = "true";
        return true;
    }

    function atualizarFornecedores(novosDados){
        return renderizarFornecedores(novosDados,estado.raiz);
    }

    function tentarInicializacaoAutomatica(){
        const raiz = encontrarRaiz();

        if(!raiz || raiz.dataset.fornecedoresInicializado === "true"){
            return;
        }

        const fonte =
            window.dadosFornecedores ||
            window.dadosPainel?.fornecedores ||
            window.dados?.fornecedores;

        if(fonte){
            renderizarFornecedores(fonte,raiz);
        }
    }

    window.renderizarFornecedores = renderizarFornecedores;
    window.inicializarFornecedores = renderizarFornecedores;
    window.carregarFornecedores = renderizarFornecedores;
    window.atualizarFornecedores = atualizarFornecedores;
    window.destruirGraficosFornecedores = destruirGraficosFornecedores;

    if(document.readyState === "loading"){
        document.addEventListener("DOMContentLoaded",tentarInicializacaoAutomatica,{once:true});
    }else{
        tentarInicializacaoAutomatica();
    }
})();
