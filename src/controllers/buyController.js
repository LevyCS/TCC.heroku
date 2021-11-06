import db from "../db.js";


import express from "express";
const app = express.Router();


app.get('/event/:id', async (req,resp) => {
    try {
        let id = req.params.id;

        let r = await db.infoc_nws_tb_evento.findAll( { where: { id_evento: id } } )
        resp.send(r);
    } catch (e) {
        resp.send({ erro: e.toString() });
    }
})

//2 gets, 1 para pegar as datas, recebdo o id
// outro para pegar os horarios, recebendo a o id calendario

app.get('/eventdate/:id', async(req, resp) => {
    try { 
        let r = await db.infoc_nws_tb_calendario.findAll({where: {id_evento: req.params.id}})
        resp.send(r);
    } catch (e) { resp.send( {erro: e.toString()})} 
})

app.get('/eventhour/:id', async (req, resp) => {
    try {
        let r = await db.infoc_nws_tb_calendario_item.findAll({where: {id_calendario: req.params.id}})
        resp.send(r)
    } catch (e) {resp.send( {erro: e.toString()} )}
})

app.post ('/event', async (req, resp) => {
    try {
        let { idUsu, situacao, pagamento, compracartao, item } = req.body;
        let { cardNumber, cardOwner, cvc, validity, cpf } = req.body.creditCard;
        let { idevento, qrcode } = item;

        let createCreditcard = await db.infoc_nws_tb_cartao.create({
            nr_cartao: cardNumber,
            nm_titular: cardOwner,
            ds_cvc: cvc,
            dt_vencimento: validity,
            ds_cpf: cpf
        })

        let createSell = await db.infoc_nws_tb_venda.create({
            id_usuario: idUsu,
            id_cartao: creditCard.id_cartao,
            ds_situacao: situacao,
            tp_pagamento: pagamento
        })

        let createSellitem = await db.infoc_nws_tb_venda_item.create({
            id_venda: venda.id_usuario,
            id_evento: idevento,
            ds_qrcode: qrcode
        })

        resp.send( "Tudo lindo por aqui!" );

    } catch (e) {
        resp.send({ erro: e.toString() })
    }

})

app.get('/', async (req,resp) => {
    let r = await db.infoc_nws_tb_venda.findAll();
    resp.send(r);
})


export default app;