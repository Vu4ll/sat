# Yapılacaklar
- ✅ | **Session** yönetiminden **çerezlere** geçilecek.
    - `express-session` kütüphanesinden `cookie-parser` kütüphanesi kullanılarak çerez kullanımına geçildi.
- ✅ | **Dashboard** da gider tarihlerinde **saat yazmıyor** ve saatler veritabanına **+0 saat diliminde** kaydediliyor bu sorunun çözümü araştırılacak.
    - `moment-timezone` kütüphanesi kullanılarak kullanıcının **saat dilimini** çerezlere kaydederek o saat dilimine göre görüntülenmesi sağlandı.
    - Tarih **22 Mart 2025 21:27** şeklinde görüntülenmekte ama bunu kullanıcının dil bilgisi çerezlerde tutularak göre `moment.locale()` kullanarak işlenmektedir.
    - Kullanıcı tarayıcı dili **Felemenkçe** olarak kullanıyorsa onun saat dilimi ve diline göre göstermektedir. Yani az önce ki tarih kullanıcı da **22 maart 2025 19:27** olarak gözükecektir.
- ❌ | Gider kategorileri **HTML** içerisinde yer almayacak onun yerine **veritabanından** çekilecek ve bu veriler işlenecek.