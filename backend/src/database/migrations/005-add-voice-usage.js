"use strict";

/** @param {import('sequelize').QueryInterface} queryInterface */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("voice_usage", {
			id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
			user_id: { type: Sequelize.STRING(255), allowNull: false },
			exchange_count: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
			billing_month: { type: Sequelize.DATEONLY, allowNull: false },
			created_at: { type: Sequelize.DATE, allowNull: false },
			updated_at: { type: Sequelize.DATE, allowNull: false },
		});

		await queryInterface.addConstraint("voice_usage", {
			fields: ["user_id", "billing_month"],
			type: "unique",
			name: "voice_usage_user_id_billing_month_unique",
		});

		await queryInterface.addIndex("voice_usage", ["user_id", "billing_month"], {
			name: "idx_voice_usage_user_month",
		});
	},

	down: async (queryInterface) => {
		await queryInterface.dropTable("voice_usage");
	},
};
