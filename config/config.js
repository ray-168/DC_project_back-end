require('dotenv').config();


module.exports= {
    development: {
        username: process.env.POSTGRES_USERNAME || 'ratana',
        password: process.env.POSTGRES_PASSWORD || 'ratana',
        database: process.env.POSTGRES_DB || 'ratana',
        host: process.env.POSTGRES_HOSTNAME || '192.168.0.61',
        dialect: 'postgres',
        seederStorage: 'sequelize'
    },
    test: {
        username: process.env.POSTGRES_USERNAME,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        host: process.env.POSTGRES_HOSTNAME,
        dialect: 'postgres',
        seederStorage: 'sequelize'
    },
    production: {
        username: process.env.POSTGRES_USERNAME,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        host: process.env.POSTGRES_HOSTNAME,
        dialect: 'postgres',
        seederStorage: 'sequelize'
    },
    mailConfig:{
        appEmail:process.env.APP_EMAIL || 'krean.rathanamsk@gmail.com',
        appEmailPass:process.env.APP_EMAil_PASS || 'rathanamsk9',
        appEmailTokenSecret:process.env.APP_EMAIL_TOKEN_SECRET ||'f92a5f2b21544412d5c9691dd0b29d5786b02b7a70cee4f74df34ad1613520b9',
        appResetPassswordTokenSecret:process.env.APP_EMAIL_REFRESH_TOKEN_SECRET || '10d8cd511665be30f944898e020cec2cc7be38be9691fd5c182df788fa2ade81',
    },
    jwtConfig:{
        tokenSecret:process.env.tokenSecret||'47ccce61c4308313d3d5c1d6360d6362a79763203b3193119ac72f8c45443cdc' ,
        refreshTokenSecret:process.env.refreshTokenSecret ||'ca16bf2242795819cde64e69e8757ad5c1e39717642a6471f392a2c48b8977c4',
        tokenExpire:process.env.tokenExpire || '1d',
        refreshTokenExpire:process.env.refreshTokenExpire || '1d'
    },
    Oauth20Config:{
        Client_ID:process.env.GOOGLE_CLIENT_ID ||'347382594245-cc7802d1l0ilkr9fbi2b1ju24et34uji.apps.googleusercontent.com',
        Client_Secret:process.env.GOOGLE_CLIENT_SECRET || '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'

    },  
    url:{
        urlClient:process.env.URL_CLIENT || 'localhost:3000'
    }
}