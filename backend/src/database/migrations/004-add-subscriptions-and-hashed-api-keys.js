"use strict";

/** @param {import('sequelize').QueryInterface} queryInterface */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("subscriptions", {
			id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
			user_id: { type: Sequelize.STRING(255), allowNull: false, unique: true },
			stripe_customer_id: { type: Sequelize.STRING(255), allowNull: true },
			stripe_subscription_id: { type: Sequelize.STRING(255), allowNull: true },
			tier: {
				type: Sequelize.STRING(50),
				allowNull: false,
				defaultValue: "free",
			},
			status: {
				type: Sequelize.STRING(50),
				allowNull: false,
				defaultValue: "active",
			},
			current_period_start: { type: Sequelize.DATE, allowNull: true },
			current_period_end: { type: Sequelize.DATE, allowNull: true },
			created_at: { type: Sequelize.DATE, allowNull: false },
			updated_at: { type: Sequelize.DATE, allowNull: false },
		});

		await queryInterface.addIndex("subscriptions", ["user_id"], { name: "idx_subscriptions_user_id" });
		await queryInterface.addIndex("subscriptions", ["stripe_customer_id"], {
			name: "idx_subscriptions_stripe_customer",
		});

		await queryInterface.addColumn("api_keys", "key_hash", {
			type: Sequelize.STRING(255),
			allowNull: true,
			unique: true,
		});
		await queryInterface.addColumn("api_keys", "key_prefix", {
			type: Sequelize.STRING(20),
			allowNull: true,
		});
		await queryInterface.addColumn("api_keys", "tier", {
			type: Sequelize.STRING(50),
			allowNull: false,
			defaultValue: "free",
		});

		await queryInterface.changeColumn("api_keys", "key", {
			type: Sequelize.STRING(200),
			allowNull: true,
			unique: true,
		});

		await queryInterface.addIndex("api_keys", ["key_prefix"], { name: "idx_api_keys_key_prefix" });
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeIndex("api_keys", "idx_api_keys_key_prefix");
		await queryInterface.removeColumn("api_keys", "tier");
		await queryInterface.removeColumn("api_keys", "key_prefix");
		await queryInterface.removeColumn("api_keys", "key_hash");
		await queryInterface.changeColumn("api_keys", "key", {
			type: Sequelize.STRING(200),
			allowNull: false,
			unique: true,
		});
		await queryInterface.dropTable("subscriptions");
	},
};
