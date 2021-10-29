import db from './db.js'

import express from 'express'
import cors from 'cors'

import admGeneralController from './controllers/admGeneralController.js'
import buyController from './controllers/buyController.js'
import eventsController from './controllers/eventsController.js'
import userController from './controllers/userController.js'

const server = express();
server.use(cors()); 
server.use(express.json());

// For all the informations in ADM pages but without crud events
server.use('/general', admGeneralController);

// For all about events, all the crud informations and searchs
server.use('/events', eventsController);


//For all informations that we have about the users, all about login informations, profile, etc
server.use('/user', userController);

// It's all about the buy page
server.use('/buy', buyController);


server.listen(process.env.PORT,
              x => console.log(`Server up at port ${process.env.PORT}`));