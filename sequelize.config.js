/**
 * Diese Datei konfiguriert die Verbindung zur PostgreSQL-Datenbank mit Sequelize, einschließlich Verbindungsparametern, Pooling-Einstellungen und dem spezifischen Schema.
 *
 * @author Miray
 */

require('dotenv').config();
const { Sequelize } = require("sequelize");
const { dbConfig } = require("./ConnectPostgres");

const sequelizeOptions = {
        host: dbConfig.host,
        dialect: "postgres",
        logging: false,
        schema: 'main',
        port: dbConfig.port,
        dialectOptions: dbConfig.ssl ? { ssl: dbConfig.ssl } : {},
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    };

const sequelize = dbConfig.connectionString
    ? new Sequelize(dbConfig.connectionString, sequelizeOptions)
    : new Sequelize(
        dbConfig.database,
        dbConfig.user,
        dbConfig.password,
        sequelizeOptions
    );

module.exports = sequelize;