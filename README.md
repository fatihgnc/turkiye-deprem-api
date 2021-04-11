# DEPREM API
Bu API aracılığıyla Türkiye'de ve çevresinde gerçekleşen son 500 deprem bilgisine erişebilirsiniz.

Tarih, büyüklük ve lokasyona göre filtreleme yapabilirsiniz.
Filtreleme işleminde tarih bilgisini girerken, 'yyyy.mm.dd hh:mm:ss' ya da 'yyyy.mm.dd' formatını kullanınız.

## API KULLANIMI
| filter | kullanım | açıklama |
| ------------- | ------------- | ------------- |
| - | / | Bu route'a gelen istekler /api'a yönlendirilir. |
| - | /api | Gerçekleşen son 500 deprem bilgisi döndürülür. |
| tarih_o | /api?tarih_o=2021.04.07 15:30:00 veya /api?tarih_o=2021.04.07 | Girilen tarihten önce gerçekleşen deprem verilerini döndürür. |
| tarih_s | /api?tarih_s=2021.04.07 00:00:00 veya /api?tarih_s=2021.04.07 | Girilen tarihten sonra gerçekleşen deprem verilerini döndürür. |
| min_buyukluk | /api?min_buyukluk=3 | Büyüklüğü girilen değerden büyük olan depremleri döndürür. | 
| max_buyukluk | /api?max_buyukluk=3 | Büyüklüğü girilen değerden küçük olan depremleri döndürür. |
| lokasyon | /api?lokasyon=ege veya /api?lokasyon=akdeniz, yani bölge ya da şehir isimleri girebilirsiniz. | Girilen lokasyonda gerçekleşen deprem verilerini döndürür. |
| min_buyukluk, max_buyukluk | /api?min_buyukluk=3&max_buyukluk=4.5 | Girilen değer aralığında gerçekleşen depremleri getirir. |
| min_buyukluk, max_buyukluk, tarih ve lokasyon birlikte kullanım | /api?tarih_o=2021.04.07 03:39:51&max_buyukluk=5&min_buyukluk=2&lokasyon=ege | Belirtilen tarihten önce, belirtilen lokasyonda ve belirtilen büyüklük aralığında gerçekleşen depremleri döndürür. |    

#### *NOT: Yukarda tüm kullanım örnekleri yoktur. Dilediğiniz filtrelemeyi yapabilir, hepsini(tarih, büyüklük ve lokasyon) birbiriyle harmanlayarak kullanabilirsiniz.*

>Proje: [https://trdepremapi.herokuapp.com/](https://trdepremapi.herokuapp.com/)
#### Verilerin çekildiği kaynak: [Kandilli rasathanesi](http://www.koeri.boun.edu.tr/scripts/lst7.asp)

#### /api
![/api](https://i.resimyukle.xyz/IRbASx.png)

#### /api/filter?lokasyon=akdeniz&min_buyukluk=4
![/api/filter?lokasyon=akdeniz&min_ml=3](https://i.resimyukle.xyz/0QAM7z.png)