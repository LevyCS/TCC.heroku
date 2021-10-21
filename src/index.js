import db from './db.js'
import express from 'express'
import cors from 'cors'
import nodemailer from 'nodemailer'

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
        if (json.nmUsu == "" || json.nmUsu == null || json.cpf == ""  || json.cpf == null || json.email == "" || json.email == null || json.username == "" || json.username == null || json.senha == "" || json.senha == null || json.nascimento == "" || json.nascimento == null ) 
            return resp.send( {erro: "Todos os campos são obrigatórios "})

        let validacaoCpf = await db.infoc_nws_tb_usuario.findOne({where: {ds_cpf: json.cpf}})
        if (validacaoCpf != null)
            return resp.send( {erro: "Cpf já cadastrado"})

        let validacaoEmail = await db.infoc_nws_tb_usuario.findOne({where: {ds_email: json.email}})
        if (validacaoEmail != null) 
            return resp.send( { erro: "Email já cadastrado"})
        
        let validacaoUsername = await db.infoc_nws_tb_usuario.findOne({where: {ds_username: json.username}})
        if (validacaoUsername != null)
            return resp.send({ erro: "Username já cadastrado"})
        
        let parts = json.nascimento.split('-');
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
        let confirm = await db.infoc_nws_tb_usuario.findOne({where: {ds_username: req.query.username, ds_senha: req.query.senha} })
        if (confirm == null) 
            return resp.send( {erro: "usuário não cadastrado"})
        
        let r = await db.infoc_nws_tb_usuario.findOne( {where: { id_usuario: confirm.id_usuario }} );
        resp.send(r);
    }
    catch (e) { 
        resp.send({erro: e.toString()})
    }
})

app.post('/user/forgotpass', async(req,resp) => {
    let json = req.body;
    let code = Math.floor(Math.random() * (9999 - 1000) ) + 1000;

    let r = await db.infoc_nws_tb_usuario.findOne({where: {ds_email: json.email}})
    if (r == null)  
        return resp.send( {erro: "Email não cadastrado"})

    const sender = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, 
        auth: {
            user: 'nws.tccinfoc@gmail.com',
            pass: 'nwsinfoc',
        },
    });

    let sendEmail = await sender.sendMail({
        from: '"New Side" <nws.tccinfoc@gmail.com>', // sender address
        to: json.email, // list of receivers
        subject: "Código de verificação", // Subject line
        html:   `<h1> Código de validação: </h1> 
                <h4> ${code} </h4> ` 
    })

    const changeCode = async() => {
        await db.infoc_nws_tb_usuario.update({
            ds_codigo: code }, {where: {id_usuario: r.id_usuario}
    })}
    changeCode();

    resp.sendStatus(200);
})

app.put('/user/changepass', async(req, resp) => {
    let { codigo, email, senha } = req.body;
    
    let r = await db.infoc_nws_tb_usuario.findOne({where: {ds_email: email}})

    if (codigo != r.ds_codigo || codigo == '' || codigo == null) 
        return resp.send( {erro: "Código incorreto"})

    let updatePasswordNCod = await db.infoc_nws_tb_usuario.update({ds_senha: senha, ds_codigo: null}, {where: {id_usuario: r.id_usuario}})
    resp.sendStatus(200)
})

app.get('/user/getall/test', async (req, resp) => {
    let r = await db.infoc_nws_tb_usuario.findAll();
    resp.send(r);
})

app.get('/buscadireta', async (req,resp) => {
    try {

        let r = await db.infoc_nws_tb_evento.findAll( { where: { nm_evento: req.query.evento, ds_elenco: req.query.evento, ds_local: req.query.evento } } )
        resp.send(r);

    } catch(e) {
        resp.send({ erro: e.toString()})
    }
})


app.get('/buscadirecionada/:id', async (req,resp) => {
    try {

        let categoria = req.params.id;

        let r = await db.infoc_nws_tb_evento.findAll( { where: { id_categoria: categoria } } )
        resp.send(r);

    } catch (e) {
        resp.send ({ erro: e.toString() })
    }
})


app.get('/compra/evento/:id', async (req,resp) => {
    try {
        let id = req.params.id;

        let r = await db.infoc_nws_tb_evento.findAll( { where: { id_evento: id } } )
        resp.send(r);
    } catch (e) {
        resp.send({ erro: e.toString() });
    }
})

app.post ('/compra/evento', async (req, resp) => {
    try {
        let { idUsu, situacao, pagamento, compracartao, item } = req.body;
        let { cartao, titular, cvc, vencimento, cpf } = compracartao;
        let { idevento, qrcode } = item;

        let venda = await db.infoc_nws_tb_venda.create({
            id_usuario: idUsu,
            ds_situacao: situacao,
            tp_pagamento: pagamento
        })

        let cartaodecredito = await db.infoc_nws_tb_cartao.create({
            id_venda: venda.id_usuario,
            nr_cartao: cartao,
            nm_titular: titular,
            ds_cvc: cvc,
            dt_vencimento: vencimento,
            ds_cpf: cpf
        })

        let vendaitem = await db.infoc_nws_tb_venda_item.create({
            id_venda: venda.id_usuario,
            id_evento: idevento,
            ds_qrcode: qrcode
        })

        resp.send( "Tudo lindo por aqui!" );

    } catch (e) {
        resp.send({ erro: e.toString() })
    }

})

app.get('/relatorios', async (req,resp) => {
    try {



    } catch (e) {
        resp.send({ erro: e.toString() })
    }
})

app.listen(process.env.PORT,
              x => console.log(`Server up at port ${process.env.PORT}`))
                                      