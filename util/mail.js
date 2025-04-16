const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

const sendPasswordResetEmail = async (email, resetLink) => {
    const mailOptions = {
        from: `Gider Takip <${process.env.MAIL_USER}>`,
        to: email,
        subject: "Şifre Sıfırlama Talebi",
        text: `Merhaba,\n\nŞifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:\n${resetLink}\n\nBu bağlantı 1 saat boyunca geçerlidir.\n\nEğer bu talebi siz yapmadıysanız, lütfen bu e-postayı dikkate almayın.`,
        html: `
            <h2>Şifre Sıfırlama Talebi</h2>
            <p>Merhaba, ${email}</p>
            <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
            <p>
                <a href="${resetLink}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Şifremi Sıfırla</a>
            </p>
            <p>Bu bağlantı <strong>1 saat</strong> boyunca geçerlidir.</p>
            <p>Eğer bu talebi siz yapmadıysanız, lütfen bu e-postayı dikkate almayın.</p>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("E-posta gönderildi: ", info.response);
    } catch (error) {
        console.error("E-posta gönderme hatası: ", error);
    }
};

module.exports = sendPasswordResetEmail;
