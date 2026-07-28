/* ==========================================================
   ESFIGMOMANÔMETRO — NOVO LAYOUT
   Pareto acima, fluxo abaixo e tabela no final
   ========================================================== */

.esfig-pareto-destaque,
.esfig-flow-destaque,
.esfig-tabela{
    width:100%;
    box-sizing:border-box;
    margin-top:8px;
}


/* TÍTULOS DOS PAINÉIS */

.esfig-pareto-destaque h3,
.esfig-flow-destaque h3,
.esfig-tabela h3{
    margin:0 0 10px;
    text-align:center;
    color:#0646ff;
    font-size:14px;
    font-weight:900;
    text-transform:uppercase;
    letter-spacing:.2px;
}


/* ==========================================================
   PARETO
   ========================================================== */

.esfig-pareto-destaque{
    margin-bottom:10px;
    padding:14px 16px 12px;
}

.esfig-pareto-grande{
    position:relative;
    width:100%;
    height:390px;
    min-height:390px;
}

.esfig-pareto-grande canvas{
    width:100% !important;
    height:100% !important;
}


/* RESUMO DO PARETO */

.esfig-pareto-resumo{
    display:flex;
    align-items:center;
    gap:12px;

    margin-top:10px;
    padding:10px 14px;

    border:1px solid #bdd2ff;
    border-radius:10px;

    background:
        linear-gradient(
            90deg,
            #edf4ff,
            #f8fbff
        );

    color:#132657;
}

.esfig-pareto-resumo-icone{
    flex:0 0 30px;

    display:flex;
    align-items:center;
    justify-content:center;

    width:30px;
    height:30px;

    border-radius:50%;

    background:#0754ef;
    color:#ffffff;

    font-size:18px;
    font-weight:900;
}

.esfig-pareto-resumo strong{
    display:block;
    margin-bottom:2px;
    color:#073eae;
}

.esfig-pareto-resumo p{
    margin:0;
    font-size:12px;
    line-height:1.45;
}


/* ==========================================================
   FLUXO OPERACIONAL
   ========================================================== */

.esfig-flow-destaque{
    margin-bottom:10px;
    padding:14px 16px;
}

.esfig-fluxo-horizontal{
    display:flex;
    align-items:center;
    justify-content:center;

    width:100%;
    gap:16px;
}

.esfig-fluxo-horizontal .fluxo-item{
    flex:1;
    max-width:320px;
    min-height:76px;

    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
}

.esfig-fluxo-horizontal .fluxo-item strong{
    line-height:1;
}

.esfig-fluxo-horizontal .fluxo-arrow{
    flex:0 0 auto;
    font-size:22px;
}

.esfig-flow-destaque .progress-title{
    margin-top:12px;
    text-align:center;
}

.esfig-flow-destaque .progress-box{
    width:100%;
    margin-top:6px;
}


/* ==========================================================
   TABELA
   ========================================================== */

.esfig-tabela{
    padding:14px 10px 10px;
}

.esfig-tabela .table-wrap,
.esfig-tabela .table-container,
.esfig-tabela .table-box{
    width:100%;
    max-height:340px;
    overflow:auto;
}


/* CABEÇALHO FIXO DA TABELA */

.esfig-tabela table thead th{
    position:sticky;
    top:0;
    z-index:2;
}


/* ==========================================================
   TELAS MENORES
   ========================================================== */

@media(max-width:1100px){

    .esfig-pareto-grande{
        height:350px;
        min-height:350px;
    }
}


@media(max-width:800px){

    .esfig-pareto-grande{
        height:330px;
        min-height:330px;
    }

    .esfig-fluxo-horizontal{
        flex-direction:column;
        gap:9px;
    }

    .esfig-fluxo-horizontal .fluxo-item{
        width:100%;
        max-width:none;
    }

    .esfig-fluxo-horizontal .fluxo-arrow{
        transform:rotate(90deg);
    }

    .esfig-pareto-resumo{
        align-items:flex-start;
    }
}


@media(max-width:520px){

    .esfig-pareto-destaque,
    .esfig-flow-destaque,
    .esfig-tabela{
        padding-left:8px;
        padding-right:8px;
    }

    .esfig-pareto-grande{
        height:300px;
        min-height:300px;
    }
}
