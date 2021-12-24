
'use strict';

const bcrypt = require('bcrypt');
const {User,Session} =require('../models');
const { getAdminRole } = require('../../common/util');
const {passwordValidation} = require('../../common/validation');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    {
      const email = process.env.ROOT_EMAIL || 'krean.rathanamsk@gmail.com';
      const password = process.env.ROOT_PASSWORD || 'Coincloud123';
      const hashPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(12));

      // Create user
      return User.create({
        username: 'Coin Super Admin',
        email: email,
        password: hashPassword,
        role: getAdminRole(),
        isConfirm: true,
        session: {
          accessToken: null,
          refreshToken: null
        }
      }, {
        include: [{
          model: Session,
          as: 'session'
        }]
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
