import initdb from './models/init-models.js'
import Sequelize from 'sequelize';
const sequelize = new Sequelize(
    'nsftcc',
    'mysql_17753_nsftcc',
    'nsf@tcc', {
    host: 'my01.winhost.com',
    dialect: 'mysql',
    logging: false
    });
const db = initdb(sequelize);
export default db;