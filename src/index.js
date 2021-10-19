import db from './db.js'
import express from 'express'
import cors from 'cors'

const app = express();
app.use(cors()); 

app.get('/buscadireta/:nmEvento', async (req, resp) => {
    try {
        let r = await api.tb_evento.findAll( {where: { nm_evento: req.params.nmEvento}});
        
        resp.send(r);
    }
    catch {
        resp.send( {erro: })
    }
})

app.get('/buscadirecionada/:categoria', async (req, resp) => {
    try {
        let r = await api.tb_evento.findAll( {where: { ds_categoria: req.params.categoria }});
        
        resp.send(r);
    }
    catch {
        resp.send( {erro: })
    }
})

app.get('/eventosdestaque', async (req, resp) => {
    try {
       
    }
    catch {
        resp.send( {erro: })
    }
})





app.listen(process.env.PORT,
              x => console.log('Server up at port ${process.env.PORT}'))
                                      