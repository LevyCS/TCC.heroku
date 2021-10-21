import db from './db.js'
import express from 'express'
import cors from 'cors'

const app = express();
app.use(cors()); 
app.use(express.json())


app.get('/buscadireta/:nmEvento', async (req, resp) => {
    try {
        let r = await db.tb_evento.findAll( {where: { nm_evento: req.params.nmEvento}});
        
        resp.send(r);
    }
    catch {
        resp.send( {erro: ""})
    }
})

app.post('/user/create', async(req, resp) => {
    try {
        let json = req.body;
        let parts = json.nascimento.split('-');
        
        let validacaoCpf = await db.infoc_nws_tb_usuario.findOne({where: {ds_cpf: json.cpf}})
        if (validacaoCpf != null)
            return resp.send( {erro: "Cpf já cadastrado"})

        let validacaoEmail = await db.infoc_nws_tb_usuario.findOne({where: {ds_email: json.email}})
        if (validacaoEmail != null) 
            return resp.send( { erro: "Email já cadastrado"})
        
        let validacaoUsername = await db.infoc_nws_tb_usuario.findOne({where: {ds_username: json.username}})
        if (validacaoUsername != null)
            return resp.send({ erro: "Username já cadastrado"})
        
        let r = await db.infoc_nws_tb_usuario.create({
            nm_usuario: json.nmUsu,
            ds_cpf: json.cpf,
            ds_email: json.email,
            ds_username: json.username,
            ds_senha: json.senha,
            dt_nascimento: new Date(parts[0], parts[1] - 1, parts[2]),
            bt_adm: false
        })

        resp.sendStatus(200);

    } catch (e) {
        resp.send( {erro: e.toString()})
    }
});

app.get('/user/login/', async(req, resp) => {
    try {
        let confirm = await db.infoc_nws_tb_usuario.findOne({where: {ds_email: req.query.email, ds_senha: req.query.senha} })
        if (confirm == null) 
            return resp.send( {erro: "usuário não cadastrado"})

        let r = await db.infoc_nws_tb_usuario.findOne( {where: { id_usuario: confirm.id_usuario }} );
        resp.send(r);
    }
    catch (e) { 
        resp.send({erro: e.toString()})
    }
})

app.get('/buscadireta', async (req,resp) => {
    try {

        let r = await db.infoc_nws_tb_evento.findAll( { where: { nm_evento: req.query.evento, ds_elenco: req.query.evento, ds_local: req.query.evento } } )
        resp.send(r);

    } catch(e) {
        resp.send({ erro: e.toString()})
    }
})

 // Arrumar 
app.get('/buscadirecionada', async (req,resp) => {
    try {

        let r = await db.infoc_nws_tb_evento.findAll( { where: { ds_categoria: req.query.categoria } } )
        resp.send(r);

    } catch (e) {
        resp.send ({ erro: e.toString() })
    }
})
// ------>>>


app.get('/compra/evento/:id', async (req,resp) => {
    try {
        let id = req.params.id;

        let r = await db.infoc_nws_tb_evento.findAll( { where: { id_evento: id } } )
        resp.send(r);
    } catch (e) {
        resp.send({ erro: e.toString() });
    }
})
// Conferir

app.post ('/compra/evento', async (req, resp) => {
    try {
        let a = req.body;

        let r = await db.infoc_nws_tb_venda.create({
            id_usuario: a.idUsu,
            ds_situacao: a.situacao,
            tp_pagamento: a.pagamento
        })

        resp.send(r);

    } catch (e) {
        resp.send({ erro: e.toString() })
    }

})

app.post ('/compra/evento/cartao', async (req,resp) => {
    try {

        let a = req.body;
        let p = a.pagamento;

        let r = await db.infoc_nws_tb_cartao.create({
            id_venda: a.idvenda,
            nr_cartao: a.cartao,
            nm_titular: a.titular,
            ds_cvc: a.cvc,
            dt_vencimento: a.vencimento,
            ds_cpf: a.cpf
        })

        resp.send(r);

    } catch(e) {
        resp.send({ erro: e.toString() })
    }
})

app.post('/compra/evento/item', async (req,resp) => {
    try {

        let a = req.body;

        let r = await db.infoc_nws_tb_venda_item.create({
            id_venda: a.idvenda,
            id_evento: a.idevento,
            ds_qrcode: a.qrcode
        })

    } catch(e) {
        resp.send({ erro: e.toString() })
    }
})
// ----------->>>


app.listen(process.env.PORT,
              x => console.log(`Server up at port ${process.env.PORT}`))
                                      