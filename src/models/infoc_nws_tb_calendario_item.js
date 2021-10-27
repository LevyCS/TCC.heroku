import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class infoc_nws_tb_calendario_item extends Model {
  static init(sequelize, DataTypes) {
  super.init({
    id_calendario_item: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_calendario: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'infoc_nws_tb_calendario',
        key: 'id_calendario'
      }
    },
    hr_evento: {
      type: DataTypes.TIME,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'infoc_nws_tb_calendario_item',
    timestamps: false
  });
  return infoc_nws_tb_calendario_item;
  }
}
