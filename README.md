# Sistem Analizi ve Tasarımı
**Sistem Analizi ve Tasarımı** dersi için **Gider Takip Sistemi** projesidir.

## Başlamadan Önce
- Bu proje **Node.js v18** ve üzeri sürümleri içindir.
- Proje de veritabanı olarak **MongoDB** kullanılmıştır ve bir **MongoDB** veritabanına sahip olmalısınız.
- E-posta servisi olarak **Gmail** kullanılmıştır ve bir **Google** hesabına sahip olmalısınız.
- Projeyi çalıştırmak için aşağıdaki adımları izleyiniz:

1. **Depoyu Klonlayın**
    - `git clone https://github.com/Vu4ll/sat`
    - `cd sat`

2. **Gerekli Kütüphaneleri Yükleyin**
    - `npm install`

3. **Değişkenleri Ayarlayın**
    - `.env` dosyası oluşturun ve gerekli değişkenleri ekleyin. Örnek `.env` dosyası:
```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
APP_URL=your_app_url # Default is http://localhost:your_port
PORT=your_port # Default is 3000
COOKIE_MAX_AGE=your_max_age # In day format, default is 7d
LOCALE=your_locale # Default is tr
TIMEZONE=your_timezone # Default is Europe/Istanbul
RESET_PASSWORD_EXPIRES=your_reset_password_expires # In hour format, default is 1h
MAIL_USER=your_gmail
MAIL_PASS=your_app_pass_or_password
```

4. **Web Uygulamasını Başlatın**
    - `npm start`

5. **Tarayıcınızdan Açın**
    - Tarayıcınızda **http://localhost:3000** adresine gidin.

## Yapılacaklar
- ✅ | **Session** yönetiminden **çerezlere** geçilecek.
    - `express-session` kütüphanesinden `cookie-parser` kütüphanesi kullanılarak çerez kullanımına geçildi.
- ✅ | **Dashboard** da gider tarihlerinde **saat yazmıyor** ve saatler veritabanına **+0 saat diliminde** kaydediliyor bu sorunun çözümü araştırılacak.
    - `moment-timezone` kütüphanesi kullanılarak kullanıcının **saat dilimini** çerezlere kaydederek o saat dilimine göre görüntülenmesi sağlandı.
    - Tarih **22 Mart 2025 21:27** şeklinde görüntülenmekte ama bunu kullanıcının dil bilgisi çerezlerde tutularak göre `moment.locale()` kullanarak işlenmektedir.
    - Kullanıcı tarayıcı dili **Felemenkçe** olarak kullanıyorsa onun saat dilimi ve diline göre göstermektedir. Yani az önce ki tarih kullanıcı da **22 maart 2025 19:27** olarak gözükecektir.
- ✅ | Şifre sıfırlama.
    - `nodemailer` kütüphanesi kuruldu.
    - Test etmek için `nodemailer` içerisinde dahil olan test e-postası gönderilmesi denendi. `util/testmail.js`
    - Şifre sıfırlama işlemi için formlar oluşturuldu **1 saat** geçerli bir token ile şifre sıfırlama işlemi gerçekleştirilmektedir.
    - Şifre sıfırlama talebinden **5 saniye** sonra otomatik olarak `/login` hedefine yönlendirme yapılmaktadır.
    - Token doğrulaması ile güvenlik sağlandı.
    - Gerçek e-posta gönderilmesi **Google** aracılıyla sağlandı.
- ✅ | `login.ejs` ve `register.ejs` düzenlenecek.
    - **Bir hesabınız yok mu?** ve **Hesabınız var mı?** yazıları eklendi.
    - **Şifrenizi mi unuttunuz?** yazısı eklendi.
    - Girişlere `placeholder` eklendi.
    - Kayıt olma işlemi için şifrenin **2 kere** girilmesi sağlandı.
- ✅ | Sabitler `.env` dosyasına taşınacak.
    - Sabitler `.env` dosyasına taşındı ve varsayılan değerler belirtildi.
- ⭕ | `chart.js` ile grafik oluşturulacak.
- ❌ | Gider kategorileri **HTML** içerisinde yer almayacak onun yerine **veritabanından** çekilecek ve bu veriler işlenecek.
- ❌ | Gönderilen e-postaları veritabanına loglama.
- ❌ | Hataları veritabanına loglama.
- ❌ | `bcrypt.hash()` metodunda `salting` yapılacak.
- ❌ | Çoklu dil desteği eklenecek.

✅ Tamamlandı. | ⭕ Üzerinde çalışılıyor. | ❌ Tamamlanmadı.