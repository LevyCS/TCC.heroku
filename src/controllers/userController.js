import db from "../db.js";
import nodemailer from 'nodemailer'

import express from "express";
const app = express.Router();

import Sequelize from 'sequelize';

const { Op, col, fn } = Sequelize;

app.get('/TicketPerson', async (req,resp) => { 
    try { 

            let id  = req.query.id; 
            
            const ticket = await db.infoc_nws_tb_venda_item.findAll({   
                 where: {
                     id_venda : id
                 },
                include: [
                    {   
                        model: db.infoc_nws_tb_evento,
                        as: 'id_evento_infoc_nws_tb_evento',
                        attributes: [],
                         include: { 
                             model: db.infoc_nws_tb_categoria, 
                             as: 'id_categoria_infoc_nws_tb_categorium',
                             attributes: []
                         }
                    }, 
                    { 
                        model: db.infoc_nws_tb_venda,
                        as: 'id_venda_infoc_nws_tb_venda',
                        attributes: [], 
                        include: { 
                            model: db.infoc_nws_tb_usuario,
                            as: 'id_usuario_infoc_nws_tb_usuario',
                            attributes: [] 
                        }  
                    } 
                ], 
                attributes: [
                    [col('id_venda_infoc_nws_tb_venda.ds_situacao'), 'situacao do evento'],   
                    [col('id_evento_infoc_nws_tb_evento.ds_local'), 'local'],    
                    [col('id_evento_infoc_nws_tb_evento.nm_evento'), 'evento'],
                    [col('id_evento_infoc_nws_tb_evento.id_categoria_infoc_nws_tb_categorium.ds_tema'), 'categoria']
                ]
            })

            resp.send(ticket); 

    } catch (e) { 
        resp.send({ erro: e.toString() })
    }

})



app.post('/create', async(req, resp) => {
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
        
        let r = await db.infoc_nws_tb_usuario.create({
            nm_usuario: json.nmUsu,
            ds_cpf: json.cpf,
            ds_email: json.email,
            ds_username: json.username,
            ds_senha: json.senha,
            dt_nascimento: json.nascimento,
            img_perfil: json.imagem,
            bt_adm: false
        })

        resp.sendStatus(200);

    } catch (e) {
        resp.send( {erro: e.toString()})
    }
});

app.get('/login', async(req, resp) => {
    try {
        let confirm = await db.infoc_nws_tb_usuario.findOne({where: {ds_email: req.query.mail}});
        if (confirm == null) 
            return resp.send( {erro: "Usuário não cadastrado"})
    
        if (confirm.ds_senha != req.query.senha)
            return resp.send( {erro: "Senha incorreta "})
        
        let r = await db.infoc_nws_tb_usuario.findOne( {where: { id_usuario: confirm.id_usuario }} );
        resp.send(r);
    }
    catch (e) { 
        resp.send({erro: e.toString()})
    }
})

app.post('/forgotpassword', async(req,resp) => {
    try {
        let json = req.body;
        let code = Math.floor(Math.random() * (9999 - 1000) ) + 1000;
    
        if (json.email == null || json.email == '') 
            return resp.send( {erro: "Email obrigatório"})

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
    
        const sendEmail = async() => await sender.sendMail({
            from: '"New Side" <nws.tccinfoc@gmail.com>', // sender address
            to: json.email, // list of receivers
            subject: "Código de verificação", // Subject line
            html:   `<h1> Código de validação: </h1> 
                    <h4> ${code} </h4> ` 
        })
        sendEmail();
    
        const changeCode = async() => {
            await db.infoc_nws_tb_usuario.update({
                ds_codigo: code }, {where: {id_usuario: r.id_usuario}
        })}
        changeCode();
    
        resp.sendStatus(200);
    } catch (e) { resp.send( { erro: e.toString()})}
})

app.put('/changepassword', async(req, resp) => {
    try {
        let { codigo, email, senha } = req.body;
        
        let r = await db.infoc_nws_tb_usuario.findOne({where: {ds_email: email}})

        if (codigo != r.ds_codigo || codigo == '' || codigo == null) 
        return resp.send( {erro: "Código incorreto"})
    
        let updatePasswordNCod = await db.infoc_nws_tb_usuario.update({ds_senha: senha, ds_codigo: null}, {where: {id_usuario: r.id_usuario}})
        resp.sendStatus(200)
    } catch (e) { resp.send( { erro: e.toString()})}
})

app.get('/log', async(req, resp) => { 
    try { 

        let r = await db.infoc_nws_tb_usuario.findAll();
        resp.send(r);

    } catch (e) { 
        resp.send({ erro: e.toString() })
    }

})

function OrderManagement (order) { 
    switch ( order ) {
        case 'Listar em ordem crescente': return [ 'nm_usuario', 'asc'] 
        case 'Listar em ordem decrescente' : return [ 'nm_usuario', 'desc']
        default: return [ 'nm_usuario', 'asc']
    }
}

app.get('/management', async (req, resp) => {
    try { 
         let criteria = OrderManagement(req.query.ordenacao) 

         let filtrarAdm = req.query.ordenacao === 'Listar administradores';

         const management = await db.infoc_nws_tb_usuario.findAll({
            where: { 
                bt_adm: filtrarAdm 
            },
            attributes: [
                ['nm_usuario', 'usuario'], 
                ['ds_email', 'email']
           ],
            order: [
                 criteria
             ]
         })

         resp.send(management)

    } catch (e) { 
        resp.send({ erro: e.toString() })
    }
})

export default app;