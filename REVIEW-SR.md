# VLK InfoSec Consulting — lokalni pregled v3, 22.09.2026

Izvor: MilicaVlk/vlk-infosec-consulting-old, commit d762d6e7884b493920d32a409f261e1768ab802f. Ništa nije poslato na GitHub niti objavljeno na Cloudflare-u.

## Otvaranje

Raspakuj ceo ZIP kroz Extract All. Otvori OTVORI-PREVIEW.html. Nisu potrebne instalacije, Python ili Node. Iz početnog pregleda otvori biografiju, kontakt, kompanijske podatke ili SEO-PREGLED.html. Lokalni demo email koda koristi 123456; ništa se ne šalje.

## Izmene u ovoj verziji

- Obrazovanje tačno prema poslednjoj poruci: MSc in Electrical Engineering and Telecommunications | Oct 2007; Specialist of Applied Studies in New Computer Technologies | October 2014, škole, obe teze i 1-year post-graduate specialist program. Ispravljeno Home/About/Bio. EDUCATION-CANONICAL.md čuva referentni tekst za buduće CV/biografije; ranije zasebno izvezene CV datoteke nisu automatski promenjene.
- Zadržane sve prethodne izmene profesionalnog razvoja, sertifikata, obuka, projekata i linkova.
- 249 zemalja/teritorija, lokalni predlozi tokom kucanja (datalist); bez spoljnog country API-ja. Nazivi na engleskom, može se ostaviti prazno.
- 48 grupisanih uloga: vlasnici/osnivači, C-level, direktori, menadžment, tehničke i savetodavne uloge, Other bez dodatnog obaveznog objašnjenja.
- Tamara Velanac: izvorni tekst, datum preporuke 13.09.2026 i veza sa iskustvom iz 2024. Na Full Bio ukupno 16 jedinstvenih preporučilaca. Preporuke u dve kolone na desktopu i jednoj na mobilnom.
- Company Information stranica i linkovi iz svakog footera. Poslovno ime, sedište, MB, PIB, registar i poslovni email; bez iznosa poreza i poreskog statusa.
- Uklonjene ponavljane draft oznake i tehničke uredničke beleške sa stranica. Engagement Principles razlikuju opšte principe od stvarno ugovorenih obaveza. Privacy i Companies zadržavaju precizno označene činjenice koje još nedostaju.
- SEO: jedinstveni naslovi i opisi na 14 stranica; canonical, OG/Twitter, Organization/WebSite/WebPage/Person/Breadcrumb strukturirani podaci, robots i sitemap.
- ICO i PNG favicon iz postojećeg kvadratnog VLK simbola; Apple touch icon. Ispravljene i lokalne CSS putanje pozadina.
- Popravljena ranije oštećena HTML stranica uslova angažovanja; _headers sada sadrži sigurnosne headere i CSP usklađen sa JSON-LD i Turnstile-om.
- _routes.json ograničava pozivanje Functions na /api/*; indeksi isteka u dodatnoj D1 migraciji.

## Provere

- Struktura svih 14 HTML stranica i 535 lokalnih linkova/asset referenci: bez grešaka.
- JavaScript sintaksa i serverski testovi sa simuliranim Google/Turnstile odgovorima: prolaze. Provereni origin, email, anti-bot odbijanje, pogrešan kod, vezivanje za adresu, uspeh, ponovna upotreba, maksimalni pokušaji, istek i rate limit.
- Chromium provera lokalnih fajlova na 1440px i 390px: bez horizontalnog preliva na glavnim stranicama; dve/jedna kolona preporuka; country lista, Other polje i kompletan demo email tok rade; bez JavaScript grešaka. Screenshotovi obrazovanja i preporuka pregledani.
- Favicon fajlovi sadrže validne slike i povezani su iz svih stranica. Google-ov prikaz favicona/rezultata pretrage nije testiran: verzija nije javno objavljena.

## Šta još nije aktivirano ili potvrđeno

Stvarna isporuka Google Workspace emaila, Cloudflare konfiguracija, DNS SPF/DKIM/DMARC, produkcijski headeri/cookie inventar, Search Console i pravni/poslovni podaci. Pogledaj PODACI-ZA-FINALIZACIJU.md, SEO-I-OBJAVLJIVANJE.md i ACTIVATION.md.

Ne postoji tvrdnja o potpunoj zakonskoj usklađenosti, sertifikaciji sajta, garantovanom rangiranju ili završenoj verifikaciji naloga.


## Dopuna v2.1 — 22.09.2026.
Popunjeni poslovni podaci i kontakt contact@vlk-infosec.com; PDV status prema pojašnjenju o paušalnom oporezivanju. Detalji i preostale provere: POSLOVNI-PODACI-UPDATE.md.

## Dopuna v3

Naziv VLK InfoSec Consulting je ujednačen u javnom sadržaju i metapodacima. Other je dodat uz Not sure i u dinamičke izbore opsega; nema posebnog obaveznog objašnjenja. SQL injection, HTML/JavaScript tekst i email-header injection provereni su lokalnim testovima uz simulirane provajdere. Prava isporuka emaila i Cloudflare zaštite zahtevaju konfiguraciju opisanu u KONFIGURACIJA-GOOGLE-CLOUDFLARE.md. Ništa nije objavljeno.
