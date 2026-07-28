const conteudo =
    document.getElementById("conteudo");

function numero(v){

    return Number(v || 0)
        .toLocaleString("pt-BR");
}

function moeda(v){

    return Number(v || 0)
        .toLocaleString(
            "pt-BR",
            {
                style:"currency",
                currency:"BRL"
            }
        );
}

function moedaCurta(v){

    return moeda(v);
}

function card(
    icone,
    titulo,
    valor,
    subtitulo
){

    return `
        <div class="kpi-card">

            <div class="kpi-icon">
                ${icone}
            </div>

            <div>

                <h3>${titulo}</h3>

                <strong>${valor}</strong>

                <small>${subtitulo}</small>

            </div>

        </div>
    `;
}

function dsLine(
    label,
    data,
    color
){

    return {

        label,

        data,

        borderColor:color,

        backgroundColor:color,

        borderWidth:3,

        tension:.35,

        pointRadius:4,

        pointHoverRadius:6,

        fill:false
    };
}
function baseOptions(){

    return {

        responsive:true,

        maintainAspectRatio:false,

        plugins:{

            legend:{
                position:"bottom",
                labels:{
                    usePointStyle:true,
                    boxWidth:10,
                    font:{
                        weight:"bold"
                    }
                }
            }

        },

        scales:{

            x:{
                grid:{
                    display:false
                }
            },

            y:{
                beginAtZero:true,
                grid:{
                    color:"rgba(15,31,77,.08)"
                }
            }

        }

    };
}

function tabelaFixa(
    headers,
    rows,
    infinito=false
){

    const tabela = `
        <table>

            <thead>
                <tr>
                    ${
                        headers
                        .map(h => `<th>${h}</th>`)
                        .join("")
                    }
                </tr>
            </thead>

            <tbody>
                ${rows}
            </tbody>

        </table>
    `;

    if(!infinito){

        return `
            <div class="table-wrap">
                <div class="table-scroll">
                    ${tabela}
                </div>
            </div>
        `;
    }

    return `
        <div class="table-wrap">
            <div class="table-scroll infinite">
                <div class="scroll-content">
                    ${tabela}
                    ${tabela}
                </div>
            </div>
        </div>
    `;
}
function montarLinhasImportacao(lista){

    if(!lista || !lista.length)
        return "";

    return lista.map(i => `
        <tr>

            <td>
                ${i.po || "-"}
            </td>

            <td>
                ${i.sku || "-"}
            </td>

            <td class="desc">
                ${i.descricao || "-"}
            </td>

            <td>
                ${i.lote || "-"}
            </td>

            <td class="${
                String(i.status || "")
                    .toUpperCase() === "OK"
                    ? "status-ok"
                    : "status-nok"
            }">
                ${i.status || "-"}
            </td>

            <td class="desc">
                ${i.observacao || "-"}
            </td>

        </tr>
    `).join("");
}

function montarLinhasEsfig(lista){

    if(!lista || !lista.length)
        return "";

    return lista.map(i => `
       return lista.map(i => `
 <tr>
    <td>${i.sku || "-"}</td>
    <td class="desc">${i.descricao || "-"}</td>

    <td>${numero(i.aguardando || 0)}</td>
    <td>${numero(i.desmontado || 0)}</td>
    <td>${numero(i.aferidos || 0)}</td>

    <td>${
        Number(i.aferidos || 0) > 0
            ? "Concluído"
            : (
                Number(i.aguardando || 0) > 0 ||
                Number(i.desmontado || 0) > 0
            )
                ? "Pendente"
                : "-"
    }</td>
</tr>

function montarLinhasTopDescarte(lista){

    if(!lista || !lista.length)
        return "";

    return lista.map(i => `
        <tr>
            <td>${i.sku || "-"}</td>
            <td class="desc">${i.descricao || "-"}</td>
            <td>${moeda(i.valor || 0)}</td>
        </tr>
    `).join("");
}

function montarLinhasAmostra(lista){

    if(!lista || !lista.length)
        return "";

    return lista.map(i => `
        <tr>
            <td>${i.sku || "-"}</td>
            <td class="desc">${i.descricao || "-"}</td>
            <td>${numero(i.quantidade || 0)}</td>
        </tr>
    `).join("");
}
function montarLinhasRetrabalho(lista){

    if(!lista || !lista.length)
        return "";

    return lista.map(i => `
        <tr>
            <td>${i.fabricante || "-"}</td>
            <td>${numero(i.quantidade || 0)}</td>
            <td>${numero(i.horas || 0)}</td>
            <td class="desc">${i.motivo || "-"}</td>
        </tr>
    `).join("");
}

function montarLinhasEquipamentos(lista){

    if(!lista || !lista.length)
        return "";

    return lista.map(i => `
        <tr>
            <td>${i.equipamento || "-"}</td>
            <td>${i.codigo || "-"}</td>
            <td>${i.status || "-"}</td>
            <td>${i.proximaCalibracao || "-"}</td>
        </tr>
    `).join("");
}

function rankTop3(lista){

    const top = [...(lista || [])]
        .sort((a,b)=>
            Number(b.valor || 0) -
            Number(a.valor || 0)
        )
        .slice(0,3);

    return `
        <div class="rank-grid">
            ${
                top.map((i,idx)=>`
                    <div class="rank-card">
                        <div class="rank-num">
                            ${idx+1}
                        </div>
                        <div>
                            ${i.nome || "-"}
                            <strong>
                                ${moeda(i.valor || 0)}
                            </strong>
                        </div>
                    </div>
                `).join("")
            }
        </div>
    `;
}
function rankTop3Origem(lista){

    const top = [...(lista || [])]
        .sort((a,b)=>
            Number(b.valor || 0) -
            Number(a.valor || 0)
        )
        .slice(0,3);

    return `
        <div class="rank-grid">
            ${
                top.map((i,idx)=>`
                    <div class="rank-card">
                        <div class="rank-num">
                            ${idx+1}
                        </div>
                        <div>
                            ${i.nome || "-"}
                            <strong>
                                ${moeda(i.valor || 0)}
                            </strong>
                        </div>
                    </div>
                `).join("")
            }
        </div>
    `;
}
