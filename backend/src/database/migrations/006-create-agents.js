"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("agents", {
			id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
			user_id: { type: Sequelize.STRING, allowNull: false },
			name: { type: Sequelize.STRING, allowNull: false },
			soul: { type: Sequelize.TEXT, allowNull: false },
			created_at: { type: Sequelize.DATE, allowNull: false },
			updated_at: { type: Sequelize.DATE, allowNull: false },
		});
		await queryInterface.addIndex("agents", ["user_id"]);
	},
	down: async (queryInterface) => {
		await queryInterface.dropTable("agents");
	},
};
