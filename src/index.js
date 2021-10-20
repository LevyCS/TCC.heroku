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

app.get('/buscadirecionada/:categoria', async (req, resp) => {
    try {
        let r = await api.tb_evento.findAll( {where: { ds_categoria: req.params.categoria }});
        
        resp.send(r);
    }
    catch {
        resp.send( {erro: ""})
    }
})

app.get('/eventosdestaque', async (req, resp) => {
    try {
       
    }
    catch {
        resp.send( {erro: ""})
    }
})

// Usuário 

app.post('/user/create', async(req, resp) => {
    try {
        let json = req.body;

        let r = await db.infoc_nws_tb_usuario.create({
            nm_usuario: json.nmUsu,
            ds_cpf: json.cpf,
            ds_email: json.email,
            ds_username: json.username,
            ds_senha: json.senha,
            dt_nascimento: json.nascimento,
            bt_admin: false
        })

        resp.sendStatus(200);

    } catch (e) {
        resp.send( {erro: e.toString()})
    }
});

app.get('/user/login', async(req, resp) => {
    try {

    }
    catch (e) { 
        resp.send({erro: e.tostring()})
    }
})

app.listen(process.env.PORT,
              x => console.log(`Server up at port ${process.env.PORT}`))
                                      