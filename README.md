# Sistem Analizi ve Tasarımı
**Sistem Analizi ve Tasarımı** dersi için **Gider Takip Sistemi** projesidir.

## Başlamadan Önce
- Bu proje **Node.js v18** ve üzeri sürümleri içindir.
- Proje de veritabanı olarak **MongoDB** kullanılmıştır ve bir **MongoDB** veritabanına sahip olmalısınız.
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
```

4. **Web Uygulamasını Başlatın**
    - `npm start`

5. **Tarayınıczdan Açın**
    - Tarayıcınızda **http://localhost:3000** adresine gidin.

## Yapılacaklar
- ✅ | **Session** yönetiminden **çerezlere** geçilecek.
    - `express-session` kütüphanesinden `cookie-parser` kütüphanesi kullanılarak çerez kullanımına geçildi.
- ✅ | **Dashboard** da gider tarihlerinde **saat yazmıyor** ve saatler veritabanına **+0 saat diliminde** kaydediliyor bu sorunun çözümü araştırılacak.
    - `moment-timezone` kütüphanesi kullanılarak kullanıcının **saat dilimini** çerezlere kaydederek o saat dilimine göre görüntülenmesi sağlandı.
    - Tarih **22 Mart 2025 21:27** şeklinde görüntülenmekte ama bunu kullanıcının dil bilgisi çerezlerde tutularak göre `moment.locale()` kullanarak işlenmektedir.
    - Kullanıcı tarayıcı dili **Felemenkçe** olarak kullanıyorsa onun saat dilimi ve diline göre göstermektedir. Yani az önce ki tarih kullanıcı da **22 maart 2025 19:27** olarak gözükecektir.
- ❌ | Gider kategorileri **HTML** içerisinde yer almayacak onun yerine **veritabanından** çekilecek ve bu veriler işlenecek.