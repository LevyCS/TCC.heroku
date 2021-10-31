import db from "../db.js";

import Sequelize from 'sequelize';
const { Op, col, fn } = Sequelize;


import express from "express";
const app = express.Router();


app.get('/crud', async(req, resp) => {
    try {
        let {nome, categoria} = req.query;
    
        function filterChoose() {
            if(categoria != null && categoria != "")
                return {'$id_categoria_infoc_nws_tb_categorium.ds_tema$': categoria, bt_ativo: true};
            else if (nome != null && nome != "")
                return {nm_evento: {[Op.like]: `%${nome}%`}, bt_ativo: true};
            else {
                return {bt_ativo: true}
            }
        }
    
        let events = await db.infoc_nws_tb_evento.findAll({
            where: filterChoose(),
            include: [
                {
                    model: db.infoc_nws_tb_categoria,
                    as: 'id_categoria_infoc_nws_tb_categorium',
                    required: true
                },
                {
                    model: db.infoc_nws_tb_calendario,
                    as: 'infoc_nws_tb_calendarios',
                    required: true,
                    include: [
                        {
                            model: db.infoc_nws_tb_calendario_item,
                            as: 'infoc_nws_tb_calendario_items',
                            required: true
                        }
                    ]
                },
            ]
        })
    
        resp.send(events)

    } catch (e) {
        resp.send( {erro: e.toString()})
    }
})



app.post('/crud', async(req, resp) => {
    try {
        let { nmEvento, categoria, duracao, classificacao, valorIngresso, local, dtMin, dtMax, elenco, descEvento, genero, imgCapa, imgFundo, imgSec } = req.body;
        
        categoria = categoria.toLowerCase();
        
        let category = await db.infoc_nws_tb_categoria.findOne({ where: {ds_tema: categoria}});
    
        let validate = [nmEvento, categoria, duracao, classificacao, valorIngresso, local, dtMin, dtMax, elenco, descEvento, genero, imgCapa, imgFundo, imgSec]
        if (validate.some(item => {
            item == "" || item == null
        }))
            return resp.send( {erro: "Todos os campos são obrigatórios"} )

        if (isNaN(valorIngresso) || valorIngresso <= 0)
            return resp.send( { erro: "O Valor do ingresso deve ser um número positivo"})

        let createEvent = await db.infoc_nws_tb_evento.create({
            nm_evento: nmEvento,
            id_categoria: category.id_categoria,
            ds_duracao: duracao,
            ds_classificacao: classificacao,
            vl_ingresso: valorIngresso,
            ds_local: local,
            dt_min: dtMin,
            dt_max: dtMax,
            ds_elenco: elenco,
            ds_evento: descEvento, 
            img_capa: imgCapa,
            img_fundo: imgFundo,
            img_sec: imgSec,
            ds_genero: genero,
            bt_ativo: true,
            dt_inclusao: new Date()
        })

        let createCalendary = req.body.datas.map(async item => {
            let dates = await db.infoc_nws_tb_calendario.create({
                id_evento: createEvent.id_evento,
                dt_evento: item.data
            })

            item.horarios.map(async i => {
                await db.infoc_nws_tb_calendario_item.create({
                    id_calendario: dates.id_calendario,
                    hr_evento: i.hora
                })
            })
        }) 
    
        resp.sendStatus(200);
        
    } catch (e) {
        resp.send( { erro: e.toString()})
    }
})



app.post('/crud/teste', async (req, resp) => {
    try {
        // let { nmEvento, categoria, duracao, classificacao, valorIngresso, local, dtMin, dtMax, elenco, descEvento, imgCapa, imgFundo, imgSec} = req.body;
        // categoria = categoria.toLowerCase();
        
        // let category = await db.infoc_nws_tb_categoria.findOne({ where: {ds_tema: categoria}})
    
        // let validate = [nmEvento, categoria, duracao, classificacao, valorIngresso, local, dtMin, dtMax, elenco, descEvento, imgCapa, imgFundo, imgSec]
        // if (validate.some(item => {
        //     item == "" || item == null
        // }))
        //     return resp.send( {erro: "Todos os campos são obrigatórios"} )

        // if (isNaN(valorIngresso) || valorIngresso <= 0)
        //     return resp.send( { erro: "O Valor do ingresso deve ser um número positivo"})

        // let updateEvent = await db.infoc_nws_tb_evento.update({
        //     nm_evento: nmEvento,
        //     id_categoria: category.id_categoria,
        //     ds_duracao: duracao,
        //     ds_classificacao: classificacao,
        //     vl_ingresso: valorIngresso,
        //     ds_local: local,
        //     dt_min: dtMin,
        //     dt_max: dtMax,
        //     ds_elenco: elenco,
        //     ds_evento: descEvento, 
        //     img_capa: imgCapa,
        //     img_fundo: imgFundo,
        //     img_sec: imgSec },
        //     {where: {id_evento: req.query.id}}   
        // )

        // let updateCalendar = req.body.datas.map(async item => {
        //     let dates = await db.infoc_nws_tb_calendario.update({

        //     })
        // })

        let r = await db.infoc_nws_tb_calendario.findAll({where: {id_evento: req.query.id}})
        


        resp.send(r);

    } catch (e) {
        resp.send( {erro: e.toString()})
    }
})



app.delete('/crud', async(req, resp) => {
    try {
        let r = await db.infoc_nws_tb_evento.destroy({
            where: {id_evento: req.query.id}
        })
        resp.sendStatus(200);
    } catch (e) {
        resp.send( {erro: e.toString()})
    }
})



app.get('/crud/getall', async(req, resp) => {
    let r = await db.infoc_nws_tb_evento.findAll()
    resp.send(r);
})



app.get('/buscadireta', async (req,resp) => {
    try {
        let search = req.query.search;
        let r = await db.infoc_nws_tb_evento.findAll( 
            { where: {
                [Op.or]: [
                    { 'nm_evento': {[Op.like]: `%${search}%` }},
                    { 'ds_elenco': {[Op.like]: `%${search}%` }},
                    { 'ds_evento': {[Op.like]: `%${search}%` }},
                    { 'ds_classificacao': {[Op.like]: `%${search}%` }},
                    { 'ds_genero': {[Op.like]: `%${search}%` }}
                ],

                bt_ativo: true
            },
            attributes: camps()
         });
        resp.send(r);

    } catch(e) {
        resp.send({ erro: e.toString()})
    }
})



app.get('/buscadirecionada', async (req,resp) => {
    try {

        let categoria = req.query.id;

        let r = await db.infoc_nws_tb_evento.findAll( 
            { where: 
                { id_categoria: categoria, 
                    bt_ativo: true },
                attributes: camps() 
            });


        resp.send(r);

    } catch (e) {
        resp.send ({ erro: e.toString() })
    }
})

function camps() {
    return [
        ['nm_evento', 'nomevento'],
        ['ds_elenco', 'elenco'],
        ['ds_classificacao', 'classificacao'],
        ['ds_duracao', 'duracao'],
        ['ds_evento', 'sinopse'],
        ['ds_genero', 'gênero'],
        ['img_capa', 'imagemcapa'],
        ['vl_ingresso', 'preco'],
        ['ds_local', 'local'],
        ['dt_min', 'dataminima'],
        ['dt_max', 'datamaxima'],
        ['ds_elenco', 'elenco'],
        ['img_fundo', 'imagemfundo'],
        ['img_sec', 'imagemsecundaria']
    ]
}


export default app;
