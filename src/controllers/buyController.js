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
        let { cardNumber, cardOwner, cvc, validity, cpf } = req.body.creditCard;
        let { userId, paymentMethod } = req.body.selling;

        validity = validity.split('/')

        let createCreditcard = await db.infoc_nws_tb_cartao.create({
            nr_cartao: cardNumber,
            nm_titular: cardOwner,
            ds_cvc: cvc,
            dt_vencimento: new Date(`20${validity[1]}-${validity[0]}-01`),
            ds_cpf: cpf
        })

        let createSelling = await db.infoc_nws_tb_venda.create({
            id_usuario: userId,
            id_cartao: createCreditcard.id_cartao,
            ds_situacao: "aguardando",
            tp_pagamento: paymentMethod
        })

        req.body.sellingItems.map(async (item) => {
            let createSellingItems = await db.infoc_nws_tb_venda_item.create({
                id_calendario_item: item.calendary_item,
                id_venda: createSelling.id_venda,
                ds_qrcode: "nseikkkk"
            })
        })
    
        resp.sendStatus(200);

    } catch (e) {
        resp.send({ erro: e.toString() })
    }

})

app.get('/', async (req,resp) => {
    let r = await db.infoc_nws_tb_venda.findAll();
    resp.send(r);
})


export default app;