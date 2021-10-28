import db from './db.js'
import express from 'express'
import cors from 'cors'
import nodemailer from 'nodemailer'
import Sequelize from 'sequelize'

const { Op, fn, col } = Sequelize;

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

// Autentication
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
        
        let r = await db.infoc_nws_tb_usuario.create({
            nm_usuario: json.nmUsu,
            ds_cpf: json.cpf,
            ds_email: json.email,
            ds_username: json.username,
            ds_senha: json.senha,
            dt_nascimento: json.nascimento,
            bt_adm: false
        })

        resp.sendStatus(200);

    } catch (e) {
        resp.send( {erro: e.toString()})
    }
});

app.get('/user/login/', async(req, resp) => {
    try {
        let confirm = await db.infoc_nws_tb_usuario.findOne({where: {ds_email: req.query.email}});
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

app.post('/user/forgotpassword', async(req,resp) => {
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

app.put('/user/changepassword', async(req, resp) => {
    try {
        let { codigo, email, senha } = req.body;
        
        let r = await db.infoc_nws_tb_usuario.findOne({where: {ds_email: email}})

        if (codigo != r.ds_codigo || codigo == '' || codigo == null) 
        return resp.send( {erro: "Código incorreto"})
    
        let updatePasswordNCod = await db.infoc_nws_tb_usuario.update({ds_senha: senha, ds_codigo: null}, {where: {id_usuario: r.id_usuario}})
        resp.sendStatus(200)
    } catch (e) { resp.send( { erro: e.toString()})}
})

app.get('/user/getall/test', async (req, resp) => {
    let r = await db.infoc_nws_tb_usuario.findAll();
    resp.send(r);
})

/////

// Crud in events 
app.get('/crud/events', async(req, resp) => {
    let events = await db.infoc_nws_tb_evento.findAll({where: {bt_ativo: true}, })
})

app.post('/crud/events', async(req, resp) => {
    try {
        let { nmEvento, categoria, duracao, classificacao, valorIngresso, local, dtMin, dtMax, elenco, descEvento, imgCapa, imgFundo, imgSec} = req.body;
        categoria = categoria.toLowerCase();
        
        let category = await db.infoc_nws_tb_categoria.findOne({ where: {ds_tema: categoria}})
    
        let validate = [nmEvento, categoria, duracao, classificacao, valorIngresso, local, dtMin, dtMax, elenco, descEvento, imgCapa, imgFundo, imgSec]
        if (validate.some(item => {
            item == "" || item == null
        })) {
            return resp.send( {erro: "Todos os campos são obrigatórios"} )
        }

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
            bt_ativo: true,
            dt_inclusao: new Date()
        })
      
        resp.sendStatus(200);
        
    } catch (e) {
        resp.send( { erro: e.toString()})
    }
})

app.get('/crud/events/getall', async(req, resp) => {
    let r = await db.infoc_nws_tb_evento.findAll()
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

app.get('/user/log', async(req, resp) => { 
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

app.get('/user/management', async (req, resp) => {
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

app.get('/confirmTicket', async (req,resp) => { 
    const vendas = await db.infoc_nws_tb_venda.findAll({
        where: {
            'ds_situacao': 'Aguardando'
        },
        include: [
            {
                model: db.infoc_nws_tb_usuario,
                as: 'id_usuario_infoc_nws_tb_usuario',
                attributes: [],
                required: true
            },
            {
                model: db.infoc_nws_tb_venda_item,
                as: 'infoc_nws_tb_venda_items',
                attributes: [],
                required: true,
                include: [
                    {
                        model: db.infoc_nws_tb_evento,
                        as: 'id_evento_infoc_nws_tb_evento',
                        attributes: [],
                        required: true
                    }
                ]
            }
        ],
        attributes: [
            [col('infoc_nws_tb_venda.id_venda'), 'id'],
            [col('infoc_nws_tb_venda.ds_situacao'), 'situacao'],
            [col('tp_pagamento'), 'tipoPagamento'],
            [col('id_usuario_infoc_nws_tb_usuario.nm_usuario'), 'usuario'],
            [col('infoc_nws_tb_venda_items.id_evento_infoc_nws_tb_evento.nm_evento'), 'evento']
        ],
        group: [
            col('infoc_nws_tb_venda.id_venda'),
            col('infoc_nws_tb_venda.ds_situacao'),
            col('tp_pagamento'),
            col('id_usuario_infoc_nws_tb_usuario.nm_usuario'),
            col('infoc_nws_tb_venda_items.id_evento_infoc_nws_tb_evento.nm_evento')
        ]
    })

    resp.send(vendas);
});



app.put('/confirmTicket/:idVenda', async (req,resp) => { 
    const { aprovado } = req.body;
    const { idVenda  } = req.params;
     
    try { 
        const r = await db.infoc_nws_tb_venda.update({
            'ds_situacao': aprovado === true ? 'Aprovado' : 'Reprovado'
        }, {
            where: { id_venda: idVenda }
        })

        resp.sendStatus(200);
    } catch (e) { 
        resp.send({ erro: e.toString() })
    }
})


app.get('/TicketPerson', async (req,resp) => { 
    try { 

            let id  = req.query.id; 
            
            const ticket = await db.infoc_nws_tb_venda_item.findAll({   
                 where: {
                     id_venda_item : id
                 },
                include: [
                    {   
                        model: db.infoc_nws_tb_evento,
                        as: 'id_evento_infoc_nws_tb_evento',
                        attributes: [],
                        include: { 
                            model: db.infoc_nws_tb_categoria, 
                            as: 'id_categoria_infoc_nws_tb_categoria',
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
                            attributes: [], 
                        }  
                    } 
                ], 
                attributes: [
                    [col('id_venda_infoc_nws_tb_venda.ds_situacao'), 'situacao do evento'],   
                    [col('id_evento_infoc_nws_tb_evento.ds_local'), 'local'],    
                    [col('id_evento_infoc_nws_tb_evento.nm_evento'), 'evento'],
                    [col('id_categoria_infoc_nws_tb_categoria.ds_tema'), 'categoria']
                ]
            })

            resp.send(ticket); 

    } catch (e) { 
        resp.send({ erro: e.toString() })
    }

})


app.listen(process.env.PORT,
              x => console.log(`Server up at port ${process.env.PORT}`))
                                      
              