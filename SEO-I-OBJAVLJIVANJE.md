# SEO, favicon i objavljivanje

## Implementirano u pripremljenim fajlovima

Svaka od 14 stranica ima jedinstven title i description, apsolutan canonical na vlk-infosec.com, Open Graph i Twitter podatke, WebPage strukturirane podatke povezane sa WebSite/Organization; Home, About i Bio uključuju Person za Milicu, a unutrašnje stranice BreadcrumbList. Nema izmišljenih ocena, aggregateRating podataka, poslovne adrese ni tvrdnji da je CISSP/CEH sertifikat stečen.

Teme su usklađene sa sadržajem: vCISO, information security consulting, cyber risk, governance/GRC, customer assurance, certification readiness i lokacija Belgrade/Serbia gde je relevantna. Ne dodajemo meta keywords kao navodnu prečicu za Google rangiranje.

- Tačan pregled: SEO-METADATA.json i SEO-PREGLED.html u lokalnom paketu.
- public/robots.txt: dozvoljeno indeksiranje, naveden sitemap.
- public/sitemap.xml: 14 kanonskih stranica, uključujući Company Information.
- public/favicon.ico: 16, 32, 48, 64, 128 i 256 px iz postojećeg kvadratnog VLK simbola.
- public/favicon-32.png, favicon-48.png, favicon-192.png, apple-touch-icon.png.
- Ispravni linkovi ka ikonama u svim head blokovima; lokalni paket prepisuje ih u relativne putanje.
- Ikonica se vidi u browser tabu, a title pri zadržavanju miša. Description, canonical i JSON-LD vide se u View Page Source / DevTools, ne kao tekst stranice.

## Nakon odobrenja i dopune pravnih podataka

1. Objaviti public + Pages Functions iz odobrene verzije; ne objavljivati folder za lokalni preview ili prateće interne dokumente.
2. Proveriti HTTPS, kanonski hostname i redirekcije www/HTTP, status 200 svake stranice, 404 ponašanje nepostojećih ruta, mobilni prikaz i stvarne headere. Cloudflare dashboard postavke još nisu pregledane.
3. Proveriti da produkcija nema noindex, zaštitni login ili Cloudflare pravilo koje blokira pretraživače. Privremeni online preview treba zaštititi od indeksiranja.
4. Verifikovati Google Search Console Domain property kroz DNS (postojeća verifikacija može već postojati; proveriti pre dodavanja). Predati https://vlk-infosec.com/sitemap.xml i uraditi URL Inspection za Home, Services, vCISO, About i Bio.
5. Proveriti favicon direktno na /favicon.ico i /favicon-48.png, pa osvežiti stari cache tabu ili otvoriti novu privatnu sesiju.
6. Proveriti strukturirane podatke i deljenje linkova; pratiti indeksiranje i performanse. Ne postoji garancija da će Google prikazati tačan description, favicon ili određenu poziciju, niti da će indeksirati sve stranice.
7. Kada postoji završena srpska verzija, dodati stvarne prevedene URL-ove i odgovarajući hreflang. U ovom paketu ne oglašavamo nepostojeće prevode.

Izvori provereni 21.09.2026:
- https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- https://developers.google.com/search/docs/appearance/favicon-in-search

Nije izvršeno: upload, Search Console prijava, live DNS provera, provera indeksiranosti ili rangiranja.
