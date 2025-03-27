const nodemailer = require('nodemailer');
const { createTestAccount } = require('nodemailer');

async function testMail() {
    let testAccount = await createTestAccount();
    let transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass
        }
    });

    let info = await transporter.sendMail({
        from: '"Test" <test@example.com>',
        to: 'kullanici@example.com',
        subject: 'Şifre Sıfırlama Talebi',
        text: 'Bu bir test e-postasıdır.',
        html: '<b>Bu bir test e-postasıdır.</b>'
    });

    console.log('E-posta gönderildi:', info.messageId);
    console.log('E-posta içeriğini buradan görebilirsin:', nodemailer.getTestMessageUrl(info));
}

testMail();
