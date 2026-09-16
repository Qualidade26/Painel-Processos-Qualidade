
/* ==========================================================
   DADOS GLOBAIS DO SISTEMA
========================================================== */

let dados = {};
let graficoAtual = null;
let senhaDescarteLiberada = false;


/* ==========================================================
   PLUGIN — VALORES FLUTUANTES NOS GRÁFICOS
========================================================== */

const valorFlutuantePlugin = {

    id: "valorFlutuante",

    afterDatasetsDraw(chart) {

        /*
        ----------------------------------------------------------
        Permite desligar o plugin em gráficos específicos usando:

        plugins: {
            valorFlutuante: false
        }
        ----------------------------------------------------------
        */

        if (
            chart.options.plugins &&
            chart.options.plugins.valorFlutuante === false
        ) {
            return;
        }


        const { ctx } = chart;

        ctx.save();


        chart.data.datasets.forEach(
            (dataset, datasetIndex) => {

                const meta =
                    chart.getDatasetMeta(datasetIndex);


                /*
                --------------------------------------------------
                Não desenha valores de datasets ocultos
                --------------------------------------------------
                */

                if (meta.hidden) {
                    return;
                }


                meta.data.forEach(
                    (element, index) => {

                        const valor =
                            dataset.data[index];


                        /*
                        ------------------------------------------
                        Ignora valores nulos ou indefinidos
                        ------------------------------------------
                        */

                        if (
                            valor === null ||
                            valor === undefined
                        ) {
                            return;
                        }


                        /*
                        ------------------------------------------
                        Oculta valores zerados quando solicitado
                        ------------------------------------------
                        */

                        if (
                            dataset._ocultarZero &&
                            Number(valor) === 0
                        ) {
                            return;
                        }


                        /*
                        ------------------------------------------
                        Impede desenho sobre elementos inválidos
                        ------------------------------------------
                        */

                        if (
                            !element ||
                            !Number.isFinite(element.x) ||
                            !Number.isFinite(element.y)
                        ) {
                            return;
                        }


                        /*
                        ------------------------------------------
                        FORMATAÇÃO DA FONTE
                        ------------------------------------------
                        */

                        ctx.font = dataset._horas
                            ? "800 10px Arial"
                            : "900 11px Arial";


                        ctx.fillStyle = dataset._horas
                            ? "#c026d3"
                            : "#0f1f4d";


                        /*
                        ------------------------------------------
                        FORMATAÇÃO DO TEXTO
                        ------------------------------------------
                        */

                        let texto;


                        if (dataset._moeda) {

                            texto = moedaCurta(valor);

                        } else if (dataset._horas) {

                            texto =
                                `${Number(valor || 0)
                                    .toLocaleString(
                                        "pt-BR",
                                        {
                                            minimumFractionDigits: 0,
                                            maximumFractionDigits: 2
                                        }
                                    )} h`;

                        } else {

                            texto = numero(valor);
                        }


                        /*
                        ------------------------------------------
                        GRÁFICO HORIZONTAL
                        ------------------------------------------
                        */

                        if (
                            chart.options.indexAxis === "y"
                        ) {

                            ctx.textAlign = "left";
                            ctx.textBaseline = "middle";

                            ctx.fillText(
                                texto,
                                element.x + 8,
                                element.y
                            );

                            return;
                        }


                        /*
                        ------------------------------------------
                        LINHA DE HORAS
                        ------------------------------------------
                        */

                        if (dataset._horas) {

                            ctx.textAlign = "center";
                            ctx.textBaseline = "top";

                            ctx.fillText(
                                texto,
                                element.x,
                                element.y + 11
                            );

                            return;
                        }


                        /*
                        ------------------------------------------
                        GRÁFICO VERTICAL
                        ------------------------------------------
                        */

                        ctx.textAlign = "center";
                        ctx.textBaseline = "bottom";

                        ctx.fillText(
                            texto,
                            element.x,
                            element.y - 7
                        );
                    });
            }
        );


        ctx.restore();
    }
};


/* ==========================================================
   REGISTRO DO PLUGIN
========================================================== */

function registrarPluginValorFlutuante() {

    if (
        typeof Chart === "undefined"
    ) {

        console.error(
            "Chart.js não foi carregado."
        );

        return;
    }


    /*
    ----------------------------------------------------------
    Evita registrar o mesmo plugin mais de uma vez
    ----------------------------------------------------------
    */

    const pluginRegistrado =
        Chart.registry &&
        Chart.registry.plugins &&
        typeof Chart.registry.plugins.get === "function"
            ? Chart.registry.plugins.get(
                "valorFlutuante"
            )
            : null;


    if (!pluginRegistrado) {

        Chart.register(
            valorFlutuantePlugin
        );
    }
}


registrarPluginValorFlutuante();

/* ==========================================================
   LEITURA SEGURA DO DATA.JSON

   Se o JSON inteiro estiver válido:
   - carrega normalmente.

   Se existir erro em um módulo:
   - tenta recuperar cada bloco principal separadamente.
   - um módulo inválido não impede os anteriores de carregarem.
========================================================== */

function interpretarJsonSeguro(texto) {

    if (
        typeof texto !== "string" ||
        !texto.trim()
    ) {

        console.warn(
            "data.json vazio ou inválido."
        );

        return {};
    }


    /*
    ==========================================================
    1. PRIMEIRA TENTATIVA
       JSON normal
    ==========================================================
    */

    try {

        return JSON.parse(texto);

    } catch (erro) {

        console.warn(
            "data.json possui erro de sintaxe. " +
            "Tentando recuperar os módulos válidos...",
            erro
        );
    }


    /*
    ==========================================================
    2. RECUPERAÇÃO DOS MÓDULOS
    ==========================================================
    */

    const resultado = {};

    let i = 0;

    const tamanho =
        texto.length;


    /*
    ==========================================================
    REMOVE BOM, CASO EXISTA
    ==========================================================
    */

    if (
        texto.charCodeAt(0) === 0xFEFF
    ) {

        texto =
            texto.slice(1);
    }


    /*
    ==========================================================
    PROCURA A ABERTURA DO OBJETO PRINCIPAL
    ==========================================================
    */

    while (
        i < tamanho &&
        texto[i] !== "{"
    ) {

        i++;
    }


    if (
        texto[i] !== "{"
    ) {

        console.error(
            "Não foi possível localizar o início do data.json."
        );

        return {};
    }


    i++;


    /*
    ==========================================================
    PERCORRE AS CHAVES PRINCIPAIS
    ==========================================================
    */

    while (
        i < texto.length
    ) {


        /*
        ------------------------------------------------------
        Ignora espaços, quebras de linha e vírgulas
        ------------------------------------------------------
        */

        while (
            i < texto.length &&
            (
                /\s/.test(texto[i]) ||
                texto[i] === ","
            )
        ) {

            i++;
        }


        /*
        ------------------------------------------------------
        Final do objeto principal
        ------------------------------------------------------
        */

        if (
            texto[i] === "}"
        ) {

            break;
        }


        /*
        ------------------------------------------------------
        Toda chave precisa começar com aspas
        ------------------------------------------------------
        */

        if (
            texto[i] !== '"'
        ) {

            i++;
            continue;
        }


        /*
        ======================================================
        LÊ O NOME DA CHAVE
        ======================================================
        */

        const inicioChave =
            i;

        i++;

        let escapeChave =
            false;


        while (
            i < texto.length
        ) {

            const caractere =
                texto[i];


            if (
                escapeChave
            ) {

                escapeChave =
                    false;

                i++;

                continue;
            }


            if (
                caractere === "\\"
            ) {

                escapeChave =
                    true;

                i++;

                continue;
            }


            if (
                caractere === '"'
            ) {

                i++;

                break;
            }


            i++;
        }


        const textoChave =
            texto.slice(
                inicioChave,
                i
            );


        let chave;


        try {

            chave =
                JSON.parse(
                    textoChave
                );

        } catch (erro) {

            console.error(
                "Erro ao identificar uma chave do data.json.",
                textoChave
            );

            continue;
        }


        /*
        ======================================================
        LOCALIZA :
        ======================================================
        */

        while (
            i < texto.length &&
            /\s/.test(texto[i])
        ) {

            i++;
        }


        if (
            texto[i] !== ":"
        ) {

            console.warn(
                `Módulo ${chave}: ":" não encontrado.`
            );

            continue;
        }


        i++;


        while (
            i < texto.length &&
            /\s/.test(texto[i])
        ) {

            i++;
        }


        /*
        ======================================================
        INÍCIO DO VALOR DO MÓDULO
        ======================================================
        */

        const inicioValor =
            i;


        let nivelObjeto =
            0;

        let nivelArray =
            0;

        let dentroString =
            false;

        let escape =
            false;


        while (
            i < texto.length
        ) {

            const caractere =
                texto[i];


            /*
            --------------------------------------------------
            Dentro de uma string
            --------------------------------------------------
            */

            if (
                dentroString
            ) {

                if (
                    escape
                ) {

                    escape =
                        false;

                } else if (
                    caractere === "\\"
                ) {

                    escape =
                        true;

                } else if (
                    caractere === '"'
                ) {

                    dentroString =
                        false;
                }


                i++;

                continue;
            }


            /*
            --------------------------------------------------
            Início de string
            --------------------------------------------------
            */

            if (
                caractere === '"'
            ) {

                dentroString =
                    true;

                i++;

                continue;
            }


            /*
            --------------------------------------------------
            Controle dos objetos
            --------------------------------------------------
            */

            if (
                caractere === "{"
            ) {

                nivelObjeto++;

                i++;

                continue;
            }


            if (
                caractere === "}"
            ) {

                if (
                    nivelObjeto > 0
                ) {

                    nivelObjeto--;

                    i++;

                    continue;
                }


                /*
                Final do objeto principal
                */

                break;
            }


            /*
            --------------------------------------------------
            Controle dos arrays
            --------------------------------------------------
            */

            if (
                caractere === "["
            ) {

                nivelArray++;

                i++;

                continue;
            }


            if (
                caractere === "]"
            ) {

                if (
                    nivelArray > 0
                ) {

                    nivelArray--;
                }


                i++;

                continue;
            }


            /*
            --------------------------------------------------
            Encontrou o próximo módulo
            --------------------------------------------------
            */

            if (
                caractere === "," &&
                nivelObjeto === 0 &&
                nivelArray === 0
            ) {

                break;
            }


            i++;
        }


        const textoValor =
            texto
                .slice(
                    inicioValor,
                    i
                )
                .trim();


        /*
        ======================================================
        TENTA CONVERTER SOMENTE ESTE MÓDULO
        ======================================================
        */

        try {

            resultado[chave] =
                JSON.parse(
                    textoValor
                );


            console.log(
                `✅ ${chave}: carregado`
            );


        } catch (erro) {


            console.error(
                `❌ ${chave}: módulo ignorado por conter erro.`,
                erro
            );


            /*
            Não interrompe os outros módulos
            */

        }


        /*
        ======================================================
        PASSA PARA O PRÓXIMO
        ======================================================
        */

        if (
            texto[i] === ","
        ) {

            i++;
        }
    }


    return resultado;
}
/* ==========================================================
   CARREGAMENTO DOS DADOS
========================================================== */

function carregarDadosIniciais() {

    fetch("data.json", {
        cache: "no-store"
    })

        .then(resposta => {

            if (!resposta.ok) {

                throw new Error(
                    `Erro ao carregar data.json: ${resposta.status}`
                );
            }

            return resposta.text();
        })

       .then(texto => {

    const json =
        interpretarJsonSeguro(
            texto
        );

    dados =
        normalizarDados(
            json
        );

    renderImportacao();
})

        .catch(erro => {

            console.error(
                "Não foi possível carregar os dados:",
                erro
            );

            dados = normalizarDados({});

            renderImportacao();
        });
}


carregarDadosIniciais();


/* ==========================================================
   ATUALIZAÇÃO AUTOMÁTICA DOS DADOS
========================================================== */

const intervaloAtualizacaoDados = setInterval(
    atualizarDadosAutomaticamente,
    120000
);


function atualizarDadosAutomaticamente() {

    fetch("data.json", {
        cache: "no-store"
    })

        .then(resposta => {

            if (!resposta.ok) {

                throw new Error(
                    `Erro ao atualizar data.json: ${resposta.status}`
                );
            }

            return resposta.text();
        })

       .then(texto => {

    const json =
        interpretarJsonSeguro(
            texto
        );

    dados =
        normalizarDados(
            json
        );
            /*
            ------------------------------------------------------
            Atualiza somente a aba que estiver aberta
            ------------------------------------------------------
            */

            const abaAtiva =
                document.querySelector(
                    ".menu button.active"
                );


            if (abaAtiva) {

                abaAtiva.click();

                return;
            }


            /*
            ------------------------------------------------------
            Caso nenhum botão esteja marcado como ativo
            ------------------------------------------------------
            */

            renderImportacao();
        })

        .catch(erro => {

            console.error(
                "Erro na atualização automática:",
                erro
            );
        });
}


/* ==========================================================
   NORMALIZAÇÃO DOS DADOS
========================================================== */

function normalizarDados(json) {

    const dadosNormalizados =
        json &&
        typeof json === "object"
            ? json
            : {};


    /*
    ----------------------------------------------------------
    Compatibilidade com o formato antigo da área ESFIG
    ----------------------------------------------------------
    */

    if (
        Array.isArray(
            dadosNormalizados.esfig
        )
    ) {

        dadosNormalizados.esfig = {

            ultimaAfericao:
                dadosNormalizados
                    .ultimaAfericao || "",

            proximaAfericao:
                dadosNormalizados
                    .proximaAfericao || "",

            produtos:
                dadosNormalizados.esfig
        };
    }


    return dadosNormalizados;
}


/* ==========================================================
   ABERTURA DAS ABAS
========================================================== */

function abrirAba(aba, botao) {

    /*
    ----------------------------------------------------------
    Remove a marcação ativa dos botões
    ----------------------------------------------------------
    */

    document
        .querySelectorAll(
            ".menu button"
        )
        .forEach(item => {

            item.classList.remove(
                "active"
            );
        });


    /*
    ----------------------------------------------------------
    Marca o botão selecionado
    ----------------------------------------------------------
    */

    if (botao) {

        botao.classList.add(
            "active"
        );
    }


    /*
    ----------------------------------------------------------
    Destrói gráficos da página anterior
    ----------------------------------------------------------
    */

    destruirGrafico();


    /*
    ----------------------------------------------------------
    Renderiza a aba solicitada
    ----------------------------------------------------------
    */

    switch (aba) {

        case "importacao":

            if (
                typeof renderImportacao ===
                "function"
            ) {

                renderImportacao();
            }

            break;


        case "esfig":

            if (
                typeof renderEsfig ===
                "function"
            ) {

                renderEsfig();
            }

            break;


        case "descarte":

            if (
                typeof renderDescarte ===
                "function"
            ) {

                renderDescarte();
            }

            break;


        case "amostra":

            if (
                typeof renderAmostra ===
                "function"
            ) {

                renderAmostra();
            }

            break;


        case "retrabalho":

            if (
                typeof renderRetrabalho ===
                "function"
            ) {

                renderRetrabalho();
            }

            break;


                  case "fornecedores": {

            const conteudo =
                document.getElementById("conteudo");

            if (!conteudo) {

                console.error(
                    "Área principal #conteudo não encontrada."
                );

                break;
            }


            conteudo.innerHTML = `
                <section
                    id="pagina-fornecedores"
                    class="pagina-fornecedores"
                ></section>
            `;


            if (
                typeof renderizarFornecedores ===
                "function"
            ) {

                renderizarFornecedores(
                    dados.fornecedores,
                    "#pagina-fornecedores"
                );

            } else {

                console.error(
                    "A função renderizarFornecedores não foi encontrada."
                );
            }

            break;
        }

case "relatorios":

    if (
        typeof renderRelatorios ===
        "function"
    ) {

        renderRelatorios();

    } else {

        console.error(
            "A função renderRelatorios não foi encontrada."
        );
    }

    break;
        default:

            console.warn(
                `Aba não reconhecida: ${aba}`
            );

            if (
                typeof renderImportacao ===
                "function"
            ) {

                renderImportacao();
            }
    }
}


/* ==========================================================
   DESTRUIÇÃO DOS GRÁFICOS
========================================================== */
function destruirGrafico() {

    /*
    ----------------------------------------------------------
    Gráfico padrão utilizado pelas outras páginas
    ----------------------------------------------------------
    */

    if (graficoAtual) {

        graficoAtual.destroy();
        graficoAtual = null;
    }


    /*
    ----------------------------------------------------------
    Gráficos específicos da página de Importação
    ----------------------------------------------------------
    */

    if (
        typeof destruirGraficosImportacao ===
        "function"
    ) {

        destruirGraficosImportacao();
    }


    /*
    ----------------------------------------------------------
    Gráficos específicos da página de Fornecedores
    ----------------------------------------------------------
    */

    if (
        typeof destruirGraficosFornecedores ===
        "function"
    ) {

        destruirGraficosFornecedores();
    }
}


/* ==========================================================
   RELÓGIO DO PAINEL
========================================================== */

function atualizarRelogio() {

    const agora = new Date();


    const dia =
        String(
            agora.getDate()
        ).padStart(
            2,
            "0"
        );


    const mes =
        agora
            .toLocaleDateString(
                "pt-BR",
                {
                    month: "long"
                }
            )
            .toUpperCase();


    const ano =
        agora.getFullYear();


    const elementoData =
        document.getElementById(
            "dataAtual"
        );


    const elementoHora =
        document.getElementById(
            "horaAtual"
        );


    if (elementoData) {

        elementoData.innerText =
            `${dia} ${mes} ${ano}`;
    }


    if (elementoHora) {

        elementoHora.innerText =
            agora.toLocaleTimeString(
                "pt-BR"
            );
    }
}


setInterval(
    atualizarRelogio,
    1000
);


atualizarRelogio();


/* ==========================================================
   ABRIR E FECHAR MENU LATERAL
========================================================== */

function toggleMenu() {

    const wrap =
        document.getElementById(
            "mainWrap"
        );


    const btn =
        document.getElementById(
            "btnToggleMenu"
        );


    if (!wrap || !btn) {

        console.warn(
            "Elementos do menu não encontrados."
        );

        return;
    }


    wrap.classList.toggle(
        "menu-collapsed"
    );


    const recolhido =
        wrap.classList.contains(
            "menu-collapsed"
        );


    btn.innerText =
        recolhido
            ? "▶"
            : "◀";


    btn.title =
        recolhido
            ? "Mostrar menu"
            : "Esconder menu";
}
