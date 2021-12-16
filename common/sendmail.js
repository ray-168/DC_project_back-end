require('dotenv').config();
const nodemailer = require('nodemailer');
const { mailConfig } = require ('../config/config');
const hbs = require('nodemailer-express-handlebars');
const ejs = require('ejs');
const sendMail = (emailSubject , toEmail , html) =>{
    const transpot = nodemailer.createTransport({
        service: 'Gmail',
        host: "smtp.google.com",
        port: 465,
        secure: true, // use TLS
        auth: {
          user: `${mailConfig.appEmail}`,
          pass: `${mailConfig.appEmailPass}`,
        },
      });
      const mailOptions = {
        from: `${mailConfig.appEmail}`, 
        to: toEmail,
        subject: emailSubject,
        html: html
      };
      transpot.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error.message);
          return error;
        }
        console.log('Email has been sent: ' + info.response);
        return info;
      });

};





module.exports = {
  sendMail
}