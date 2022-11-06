const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (EmailTo, EmailText, EmailSubject, Token, URL)=>{
    let transport = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    const verifyUrl = `${process.env.BASE_URL}/${URL}/${EmailTo}/${Token}`;
    const template = `<div style="background: aliceblue; border: 0.5px solid gray; padding: 10px">
        <h4>${EmailText}</h4>
        <div style="text-align: center">
            <a href="${verifyUrl}" style="padding: 10px 20px; border-radius: 15px; background: green; color: white; text-decoration: none">Verify Now</a>
        </div>
        <h5>if verify button not work. click it: <a href="${verifyUrl}">${verifyUrl}</a></h5>
    </div>`;

    let mailOptions = {
        from: 'Todo App <info@todo-app.com',
        to: EmailTo,
        subject: EmailSubject,
        html: template
    };

    return await transport.sendMail(mailOptions);
};

module.exports = sendEmail;