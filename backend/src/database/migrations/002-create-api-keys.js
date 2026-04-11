'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('api_keys', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      user_id: { type: Sequelize.STRING, allowNull: false },
      key: { type: Sequelize.STRING(200), allowNull: false, unique: true },
      name: { type: Sequelize.STRING, allowNull: false },
      last_used_at: { type: Sequelize.DATE, allowNull: true },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('api_keys', ['user_id']);
    await queryInterface.addIndex('api_keys', ['key']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('api_keys');
  },
};
