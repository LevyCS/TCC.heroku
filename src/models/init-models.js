import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _infoc_nws_tb_calendario from  "./infoc_nws_tb_calendario.js";
import _infoc_nws_tb_calendario_item from  "./infoc_nws_tb_calendario_item.js";
import _infoc_nws_tb_cartao from  "./infoc_nws_tb_cartao.js";
import _infoc_nws_tb_categoria from  "./infoc_nws_tb_categoria.js";
import _infoc_nws_tb_evento from  "./infoc_nws_tb_evento.js";
import _infoc_nws_tb_pix from  "./infoc_nws_tb_pix.js";
import _infoc_nws_tb_usuario from  "./infoc_nws_tb_usuario.js";
import _infoc_nws_tb_venda from  "./infoc_nws_tb_venda.js";
import _infoc_nws_tb_venda_item from  "./infoc_nws_tb_venda_item.js";

export default function initModels(sequelize) {
  const infoc_nws_tb_calendario = _infoc_nws_tb_calendario.init(sequelize, DataTypes);
  const infoc_nws_tb_calendario_item = _infoc_nws_tb_calendario_item.init(sequelize, DataTypes);
  const infoc_nws_tb_cartao = _infoc_nws_tb_cartao.init(sequelize, DataTypes);
  const infoc_nws_tb_categoria = _infoc_nws_tb_categoria.init(sequelize, DataTypes);
  const infoc_nws_tb_evento = _infoc_nws_tb_evento.init(sequelize, DataTypes);
  const infoc_nws_tb_pix = _infoc_nws_tb_pix.init(sequelize, DataTypes);
  const infoc_nws_tb_usuario = _infoc_nws_tb_usuario.init(sequelize, DataTypes);
  const infoc_nws_tb_venda = _infoc_nws_tb_venda.init(sequelize, DataTypes);
  const infoc_nws_tb_venda_item = _infoc_nws_tb_venda_item.init(sequelize, DataTypes);


  infoc_nws_tb_calendario_item.belongsTo(infoc_nws_tb_calendario, { as: "id_calendario_infoc_nws_tb_calendario", foreignKey: "id_calendario"});
  infoc_nws_tb_calendario.hasMany(infoc_nws_tb_calendario_item, { as: "infoc_nws_tb_calendario_items", foreignKey: "id_calendario"});
  infoc_nws_tb_evento.belongsTo(infoc_nws_tb_categoria, { as: "id_categoria_infoc_nws_tb_categorium", foreignKey: "id_categoria"});
  infoc_nws_tb_categoria.hasMany(infoc_nws_tb_evento, { as: "infoc_nws_tb_eventos", foreignKey: "id_categoria"});
  infoc_nws_tb_calendario.belongsTo(infoc_nws_tb_evento, { as: "id_evento_infoc_nws_tb_evento", foreignKey: "id_evento"});
  infoc_nws_tb_evento.hasMany(infoc_nws_tb_calendario, { as: "infoc_nws_tb_calendarios", foreignKey: "id_evento"});
  infoc_nws_tb_venda_item.belongsTo(infoc_nws_tb_evento, { as: "id_evento_infoc_nws_tb_evento", foreignKey: "id_evento"});
  infoc_nws_tb_evento.hasMany(infoc_nws_tb_venda_item, { as: "infoc_nws_tb_venda_items", foreignKey: "id_evento"});
  infoc_nws_tb_venda.belongsTo(infoc_nws_tb_usuario, { as: "id_usuario_infoc_nws_tb_usuario", foreignKey: "id_usuario"});
  infoc_nws_tb_usuario.hasMany(infoc_nws_tb_venda, { as: "infoc_nws_tb_vendas", foreignKey: "id_usuario"});
  infoc_nws_tb_cartao.belongsTo(infoc_nws_tb_venda, { as: "id_venda_infoc_nws_tb_venda", foreignKey: "id_venda"});
  infoc_nws_tb_venda.hasMany(infoc_nws_tb_cartao, { as: "infoc_nws_tb_cartaos", foreignKey: "id_venda"});
  infoc_nws_tb_pix.belongsTo(infoc_nws_tb_venda, { as: "id_venda_infoc_nws_tb_venda", foreignKey: "id_venda"});
  infoc_nws_tb_venda.hasMany(infoc_nws_tb_pix, { as: "infoc_nws_tb_pixes", foreignKey: "id_venda"});
  infoc_nws_tb_venda_item.belongsTo(infoc_nws_tb_venda, { as: "id_venda_infoc_nws_tb_venda", foreignKey: "id_venda"});
  infoc_nws_tb_venda.hasMany(infoc_nws_tb_venda_item, { as: "infoc_nws_tb_venda_items", foreignKey: "id_venda"});
  
  return {
    
    infoc_nws_tb_calendario,
    infoc_nws_tb_calendario_item,
    infoc_nws_tb_cartao,
    infoc_nws_tb_categoria,
    infoc_nws_tb_evento,
    infoc_nws_tb_pix,
    infoc_nws_tb_usuario,
    infoc_nws_tb_venda,
    infoc_nws_tb_venda_item,
  
  };
}
