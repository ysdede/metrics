var childDivs = document.getElementsByTagName('ul')[0].getElementsByTagName('a'); // Tüm linkleri bul
//document.getElementsByTagName('ul')[0].getElementsByTagName('li').style.display = 'none'; // linklerin içine bulunduğu ul/li öğelerini gizle

// tüm linkleri dön
for (i = 0; i < childDivs.length; i++) {
    childDivs[i].closest('li').style.display = 'none'; // linki gizle
    var pageAddress = childDivs[i].getAttribute('href'); // linklerdeki adresleri al
    if (pageAddress != undefined) { // adres bilgisi boş değilse

        pageAddress = pageAddress.replace('http://ysdede.github.io/benchmarks/', ''); // cross origin kısıtlamasına takılmamak için
        // kök adresi sil kendi siten içindeki dosyayı okuduğun anlaşılsın
        // sayfa içeriğini çek
        fetch(pageAddress)
            .then(response => response.text())
            .then(result => { // içerik çekme tamamlandığında
                let parser = new DOMParser();
                doc = parser.parseFromString(result, 'text/html'); // içeriği html dom yapısına çevir
                var getContent = doc.getElementById('left').firstElementChild.innerHTML; // çekilen sayfada left IS'si altındaki ilk divi içini al
                getContent = '<a href="' + pageAddress + '" target="_blank">' + getContent + '</a>'; // sayfadan çektiğin içeriğe sayfanın linkini ekle
                var body = document.getElementsByTagName('BODY')[0];
                body.insertAdjacentHTML('beforeend', getContent); // bulunduğun sayfanın gövdesinde sona bas
            });
    }
}