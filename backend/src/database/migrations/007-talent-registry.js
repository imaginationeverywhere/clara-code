"use strict";

const fs = require("node:fs");
const path = require("node:path");

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const sqlPath = path.join(__dirname, "../../../migrations/006_talent_registry.sql");
		const sql = fs.readFileSync(sqlPath, "utf8");
		await queryInterface.sequelize.query(sql);

		await queryInterface.addColumn("api_keys", "role", {
			type: Sequelize.STRING(50),
			allowNull: false,
			defaultValue: "user",
		});
	},
	down: async (queryInterface) => {
		await queryInterface.removeColumn("api_keys", "role");
		await queryInterface.sequelize.query("DROP TABLE IF EXISTS talent_installs CASCADE;");
		await queryInterface.sequelize.query("DROP TABLE IF EXISTS talents CASCADE;");
		await queryInterface.sequelize.query("DROP TABLE IF EXISTS developer_programs CASCADE;");
	},
};
