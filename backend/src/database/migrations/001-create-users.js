'use strict';

/** Clerk-backed users table — aligned with `src/models/User.ts` (snake_case columns). */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      clerk_id: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      first_name: { type: Sequelize.STRING, allowNull: true },
      last_name: { type: Sequelize.STRING, allowNull: true },
      phone: { type: Sequelize.STRING, allowNull: true },
      role: {
        type: Sequelize.ENUM('SITE_OWNER', 'SITE_ADMIN', 'ADMIN', 'STAFF', 'USER'),
        allowNull: false,
        defaultValue: 'USER',
      },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED'),
        allowNull: false,
        defaultValue: 'ACTIVE',
      },
      image_url: { type: Sequelize.STRING, allowNull: true },
      date_of_birth: { type: Sequelize.DATE, allowNull: true },
      address: { type: Sequelize.JSONB, allowNull: true },
      preferences: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {
          emailNotifications: true,
          smsNotifications: false,
          marketingEmails: true,
          adminAlerts: false,
          orderNotifications: true,
        },
      },
      notes: { type: Sequelize.TEXT, allowNull: true },
      tags: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
        defaultValue: [],
      },
      last_login_at: { type: Sequelize.DATE, allowNull: true },
      is_guest: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      guest_session_id: { type: Sequelize.STRING, allowNull: true },
      converted_to_registered_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.addIndex('users', ['role']);
    await queryInterface.addIndex('users', ['status']);
    await queryInterface.addIndex('users', ['created_at']);
    await queryInterface.addIndex('users', ['is_guest']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('users');
  },
};
