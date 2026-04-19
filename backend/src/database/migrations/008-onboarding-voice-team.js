"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("user_voice_clones", {
			id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
			user_id: { type: Sequelize.STRING(255), allowNull: false, unique: true },
			voice_id: { type: Sequelize.STRING(255), allowNull: false },
			sample_url: { type: Sequelize.STRING(512), allowNull: true },
			is_default: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
			created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
			updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
		});
		await queryInterface.addIndex("user_voice_clones", ["user_id"], { unique: true });

		await queryInterface.addColumn("agents", "slot_index", {
			type: Sequelize.INTEGER,
			allowNull: false,
			defaultValue: 0,
		});
		await queryInterface.addColumn("agents", "role", {
			type: Sequelize.ENUM("frontend", "backend", "devops"),
			allowNull: false,
			defaultValue: "frontend",
		});
		await queryInterface.addColumn("agents", "voice_id", {
			type: Sequelize.STRING(255),
			allowNull: true,
		});
		await queryInterface.addColumn("agents", "model_tier", {
			type: Sequelize.ENUM("fast", "deep", "high-effort"),
			allowNull: false,
			defaultValue: "fast",
		});
		await queryInterface.addColumn("agents", "is_active", {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		});
	},
	async down(queryInterface) {
		await queryInterface.removeColumn("agents", "is_active");
		await queryInterface.removeColumn("agents", "model_tier");
		await queryInterface.removeColumn("agents", "voice_id");
		await queryInterface.removeColumn("agents", "role");
		await queryInterface.removeColumn("agents", "slot_index");
		await queryInterface.dropTable("user_voice_clones");
	},
};
