# Sistem Analizi ve Tasarımı
**Sistem Analizi ve Tasarımı** dersi için **Gider Takip Sistemi** projesidir.

Projenin canlı **demo** sürümüne [buradan](https://gidertakip.vu4ll.com.tr/) erişebilirsiniz.

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
MONGO_URI=your_mongodb_uri # Required
JWT_SECRET=your_jwt_secret # Required
APP_URL=your_app_url # Optional, default is http://localhost
PORT=your_port # Optional, default is 3000
COOKIE_MAX_AGE=your_max_age # Optional, in day format, default is 7d
COOKIE_SECRET=your_cookie_secret # Required
LOCALE=your_locale # Optional, default is tr
TIMEZONE=your_timezone # Optional, default is Europe/Istanbul
RESET_PASSWORD_EXPIRES=your_reset_password_expires # Optional, in hour format, default is 1h
MAIL_USER=your_gmail # Required
MAIL_PASS=your_app_pass_or_password # Required
DEFAULT_CHART_COLOR=your_chart_color # Optional, in hex color format without #, default is 5CC593
PASSWORD_RESET_RATE_LIMIT=your_rate_limit # Optional, in minute format, default is 15m
PASSWORD_RESET_MAX_ATTEMPT=your_max_attempt # Optional, default is 3
```

4. **Web Uygulamasını Başlatın**
    - `npm start` komutunu girerek veya **Visual Studio Code** üzerinden **F5** tuşu ile uygulamayı başlatabilirsiniz.

5. **Tarayıcınızdan Açın**
    - Tarayıcınızda **http://localhost:3000** adresine gidin.

## Yapılacaklar
- ✅ | **Session** yönetiminden **çerezlere** geçilecek.
    - `express-session` kütüphanesinden `cookie-parser` kütüphanesi kullanılarak çerez kullanımına geçildi.
- ✅ | **Dashboard** da gider tarihlerinde **saat yazmıyor** ve saatler veritabanına **+0 saat diliminde** kaydediliyor bu sorunun çözümü araştırılacak.
    - `moment-timezone` kütüphanesi kullanılarak kullanıcının **saat dilimini** çerezlere kaydederek o saat dilimine göre görüntülenmesi sağlandı.
    - Tarih **22 Mart 2025 21:27** şeklinde görüntülenmekte ama bunu kullanıcının dil bilgisi çerezlerde tutularak göre `moment.locale()` kullanarak işlenmektedir.
    - Kullanıcı tarayıcı dili **Felemenkçe** olarak kullanıyorsa onun saat dilimi ve diline göre göstermektedir. Yani az önce ki tarih kullanıcı da **22 maart 2025 19:27** olarak gözükecektir.
    - Gider miktarları çerezlerden alınan dil bilgisine göre `toLocaleString()` metodu kullanılarak biçimlendirilmiş şekilde gösterilmektedir. 
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
- ✅ | `chart.js` ile grafik oluşturulacak.
    - Gider verilerini almak için **API** oluşturuldu.
    - **HTML** içerisinde bu **API** verilerini grafikte kullanmak için fonksiyon oluşturuldu. `views/js/fetch-expenses.js`
    - **API** için kullanıcı yetkilendirmesi ile güvenlik sağlandı.
- ✅ | Gider kategorileri **HTML** içerisinde yer almayacak onun yerine **veritabanından** çekilecek ve bu veriler işlenecek.
    - Kategoriler için veritabanı modeli oluşturuldu.
    - Geçiçi olarak elle kategorilerin eklenmesi için `/add-categories` hedefi eklendi.
    - Backend tarafta veriler işlenip frontend tarafa gönderilerek seçeneklerin görüntülenmesi sağlandı.
- ✅ | Kategori düzenleme paneli oluşturulacak.
    - Panel için `/categories` hedefi oluşturuldu.
    - Panelde kategoriler listelenmekte ve her kategori için düzenleme ve silme butonları bulunmaktadır.
    - Yeni kategori eklemek için bir form alanı sağlanmıştır.
    - Kategoriler üzerinde yapılan değişiklikler anında veritabanına kaydedilmektedir.
    - Panel yalnızca **admin** yetkisine sahip kullanıcılar tarafından erişilebilir.
    - Yetkilendirme, **JWT token** üzerinden sağlanmaktadır ve kullanıcı rolü kontrol edilmektedir.

### Vize Sonrası

- ✅ | Ana **express** dosyası parçalara bölünecek.
    - `routes` klasörüne hedefler parça parça olarak ayırıldı.
    - Değişkenler bir `config.js` dosyasına taşındı.
- ✅ | Gider düzenlemesi yapıldığında tarih güncellenmiyor, düzeltilecek.
    - Güncellenen veri de `date` değeri güncel tarih ile güncelleniyor.
- ✅ | Kategoriler veritabanında varsayılan olarak belirlenecek.
    - Varsayılan kategoriler otomatik olarak veritabanına eklenmektedir.
    - Uygulama başlatıldığında `Category.initializeDefaults()` metodu çağrılarak varsayılan kategoriler kontrol edilir ve eksik olanlar eklenir.
    - Eğer kategoriler mevcutsa tekrar eklenmez.
- ✅ | Kullanıcı rolünü **JWT** yerine çerezlere şifrelenmiş olarak işlenmeli.
    - Kullanıcı rolü, `crypto` modülü ve **Express**'in **signed cookies** özelliği kullanılarak çerezde güvenli (`signed: true`) bir şekilde tutulur.
    - Şifreleme ve çözme işlemleri için bir `secretKey` kullanılmaktadır ve bu anahtar `.env` dosyasında saklanmaktadır.
    - Çerez içeriği değiştirilmeye çalışıldığında sunucu tarafından imzalama kontrolü yapılır ve geçersiz sayılır.
    - Sunucu tarafında sadece imzası geçerli olan çerezler kabul edilir böylece kullanıcı çerez değerini değiştirerek rol yükseltemez.
- ✅ | Kategorilere renk tanımlanması yapılacak.
    - Kategori veritabanı modeline **color** değeri eklendi ve varsayılan değeri `.env` dosyası üzerinden belirlendi.
    - Kategori yönetim paneline bir renk seçici (`<input type="color">`) eklendi.
    - Kullanıcılar kategori eklerken bir renk seçebilir.
    - `config.js` dosyasına `DEFAULT_CATEGORY_COLOR` değişkeni eklendi ve bu değişken kategoriye özel bir renk atanmadığında kullanılacak varsayılan rengi belirtir.
    - Grafiklerde her kategori atanmış renklerle temsil edilir. Eğer bir kategori için renk atanmadıysa varsayılan renk kullanılır.
    - `/api/categories` ve `/api/default-category-color` **API**'leri ile kategorilere atanmış renkler ve varsayılan renk istemciye sağlanır.
    - Kullanıcılar kategori yönetim panelinden kategorilere özel renkler atayabilir veya mevcut renkleri düzenleyebilir.
- ✅ | Kategori yönetiminde düzenleme paneli eklenecek.
    - Kategori yönetimi `/categories` olan hedefi `/admin/categories` olarak değiştirildi ve admin klasörüne taşındı.
    - `/admin/categories/edit/:id` için **GET** ve **POST** hedefleri eklendi.
    - Düzenleme işlemleri için yeni bir form sayfası oluşturuldu.
- ✅ | `views` klasörü parçalara ayrılacak.
    - **EJS** dosyalarını kolay bulabilmek adına klasörlere ayrıştırıldı.
    - `layout.ejs` içerisindeki **navbar** ve **footer** `partials` klasörüne taşındı.
- ✅ | `bcrypt.hash()` metodunda `salting` yapılacak.
    - `bcryptjs` kütüphanesinden `argon2` kütüphanesine geçildi.
    - **Kayıt olma**, **giriş yapma** ve **şifre sıfırlamadaki** şifreleme ve doğrulama işlemleri `argon2` kütüphanesine uygun bir şekilde değiştirildi.
    - Şifreleme algoritması **Avrupa Birliği** standartlarına uygun hale getirildi.
    - `bcryptjs` kütüphanesi projeden kaldıırldı.
- ✅ | Şifre sıfırlama için **rate limit** eklenecek.
    - `express-rate-limit` kütühanesi kuruldu.
    - `routes/password.js` içerisinde **rate limit** için bir **middleware** oluşturuldu.
    - Bu **middleware** 15 dakika içerisinde üçten fazla deneme yapılırsa bu süre içerisinde daha fazla denemeye izin verilmiyor.
    - `.env` dosyasına `PASSWORD_RESET_RATE_LIMIT` ve `PASSWORD_RESET_MAX_ATTEMPT` değişkenleri tanımlandı ve varsayılan değerleri `util/config.js` içerisinde belirtildi. 
- ✅ | Dashboard'da giderlerin sayfalanması.
    - Kullanıcının giderleri sayfa başına **10 kayıt** olacak şekilde listelenmektedir.
    - **Backend**'de toplam gider sayısına göre toplam sayfa sayısı hesaplanmakta ve ilgili sayfa için veriler `skip` ve `limit` ile çekilmektedir.
    - **Frontend**'de sayfa numaraları, **İlk**, **Önceki**, **Sonraki** ve **Son** butonları ile kullanıcı farklı sayfalara geçiş yapabilmektedir.
    - Aktif sayfa vurgulanmakta ve geçerli olmayan butonlar devre dışı bırakılmaktadır.
    - Eğer kullanıcı giderleri yalnızca 1 sayfadan oluşuyorsa sayfalama bileşeni gösterilmemektedir.
- ✅ | Gönderilen e-postaları veritabanına loglama.
    - `models/emailLog.js` adında yeni bir veritabanı modeli oluşturuldu.
    - **E-posta alıcısı**, **konusu**, **gönderim durumu** (başarılı/başarısız) ve **hata mesajı** gibi bilgiler kaydedilmektedir.
    - `util/mail.js` içerisinde gönderilen e-postaların kayıtları oluşturulmaktadır.
    - E-posta gönderimi **başarılı** olduğunda gönderim bilgileri **success** durumu ile loglanmaktadır.
    - E-posta gönderimi **başarısız** olduğunda hata mesajı ile birlikte **failure** durumu loglanmaktadır.
- ✅ | NoSQL Injection koruması eklenecek.
    - `express-mongo-sanitize` kütüphanesi kuruldu ve **NoSQL Injection** koruması sağlandı.
    - `req.params` üzerinden gelen **ID**'lerin geçerli bir **MongoDB ObjectId** olduğunun kontrolleri sağlandı.
- ✅ | Giderler dosya olarak dışa aktarılmalı.
    - Kullanıcıların giderlerini **Excel**, **PDF** ve **CSV** formatlarında dışa aktarması sağlandı.
    - **ExcelJS** kütüphanesi kullanılarak giderler bir **Excel** dosyasına yazılmakta ve kullanıcıya indirilebilir şekilde sunulmaktadır.
    - **PDFKit** kütüphanesi ile giderler yazdırılabilir bir PDF raporu olarak oluşturulmaktadır. Türkçe karakter desteği için özel font kullanılmıştır.
    - **csv-writer** kütüphanesi ile giderler bir CSV dosyasına dönüştürülmekte ve geçici dosya olarak oluşturulup indirme işlemi tamamlandıktan sonra silinmektedir.
    - Her format için dosya adlandırma standardı uygulanmıştır (`giderler_YYYY-MM-DD.uzantı`).
    - Kullanıcıların yalnızca kendi giderlerini dışa aktarabilmektedir.
- ✖️ | Kullanıcılar birden fazla role sahip olabilmeli.
- ✖️ | Kategorilere alt kategoriler eklenecek.
- ✖️ | Kullanıcılar kendileri için kategoriler oluşturabilsin.
- ✖️ | Detaylı grafikler oluşturulacak.
- ✖️ | Hataları veritabanına loglama.
- ✖️ | `try-catch` mantığı olmadan kullanımı araştırılacak. (async handler?)
- ✖️ | Çoklu dil desteği eklenecek.

✅ Tamamlandı. | ⭕ Üzerinde çalışılıyor. | ✖️ Tamamlanmadı.