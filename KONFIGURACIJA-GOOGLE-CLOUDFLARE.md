# VLK InfoSec Consulting — konfiguracija Google Workspace i Cloudflare

Datum: 22.09.2026. Ovo je uputstvo za pripremljeni kod; nijedno podešavanje naloga nije promenjeno. Nazivi menija mogu malo da se razlikuju. Prvo završavamo lokalni pregled, a objavljivanje sledi tek posle tvoje potvrde.

## 1. Šta već imamo, a šta mi treba od tebe

Poslovno ime, adresa, MB, PIB i kontakt email već su uneti. Za njihovu vidljivost dovoljno je objaviti HTML fajlove. Google Cloud nije potreban za prikaz poslovnih podataka ili za SEO.

Za precizno vođenje kroz naloge pošalji tri screenshota bez tajnih vrednosti:

1. Google Admin → Directory → Users → tvoj korisnik → Alternate emails: da vidimo da li `contact@vlk-infosec.com` već postoji kao alias. Ako je zaseban korisnik, dovoljno je to napisati. Potrebno je znati primarni Workspace nalog koji je vlasnik te adrese; alias nema zasebnu prijavu.
2. Cloudflare → projekat u Workers & Pages → Settings/Build: naziv projekta, povezani repozitorijum, production branch, build command i output directory. Očekivani repo je `MilicaVlk/vlk-infosec-consulting-old`, a statički output `public`; postojeći branch ne menjamo napamet.
3. Cloudflare → domen `vlk-infosec.com` → DNS → Records: samo MX, SPF, DKIM i DMARC. Nije potreban prikaz drugih privatnih hostova ili adresa.

Ne šalji lozinke, jednokratne kodove za prijavu, OAuth client secret, refresh token, API tokene ili Turnstile secret. Unosiš ih direktno u naloge. Javni DNS zapisi i Turnstile site key nisu tajni, ali za početak nisu potrebni u poruci.

## 2. Napravi/proveri kontakt adresu u Google Workspace-u

1. Otvori https://admin.google.com/ administratorskim Workspace nalogom.
2. Idi na Directory → Users i otvori postojeći korisnički nalog u kom želiš da primaš poslovne poruke.
3. Otvori Add Alternate Emails / Alternate email addresses. Ako `contact` ne postoji kao korisnik, grupa ili alias, dodaj `contact` za domen `vlk-infosec.com` i sačuvaj.
4. Alias koristi postojeće sanduče; nije potrebno automatski kupovati novu licencu. Ako adresa već postoji, prvo proveri kome pripada.
5. Posle propagacije pošalji probnu poruku sa svoje druge adrese na `contact@vlk-infosec.com`. Proveri prijem i spam.

[Google: dodavanje aliasa](https://knowledge.workspace.google.com/admin/users/add-or-delete-an-alternate-email-address-email-alias)

## 3. Omogući slanje sa contact adrese

1. U Gmail-u primarnog Workspace korisnika otvori Settings → See all settings → Accounts / Accounts and Import.
2. U Send mail as proveri da li postoji `contact@vlk-infosec.com`. Ako ne, dodaj adresu; display name neka bude **VLK InfoSec Consulting**. Završi Google-ovu proveru vlasništva ako se zatraži.
3. Pošalji sebi test poruku sa izabranim From: `contact@vlk-infosec.com` i odgovori na nju. Proveri From i Reply-To, kao i sanduče u koje odgovor stiže.
4. Ne koristi samo Cloudflare forwarding adresu kao dokaz da Gmail API može da šalje sa nje. Mora da postoji važeći Gmail sender/send-as alias.

[Google: Send mail as](https://support.google.com/mail/answer/22370?hl=en)

## 4. Proveri DNS i autentifikaciju emaila

U Cloudflare DNS-u prvo dokumentuj postojeće MX i TXT zapise. Pošto je ranije korišćen i Cloudflare Email Routing, nemoj nasumično zamenjivati MX ili uklanjati SPF delove: prvo utvrđujemo ko prima i šalje poštu. Ne mešamo dva MX sistema bez namerno projektovanog rutiranja.

DKIM: Google Admin → Apps → Google Workspace → Gmail → Authenticate email. Izaberi domen; ako autentifikacija već radi, sačuvaj postojeće podešavanje. Ako nije podešena, generiši ključ (2048-bit kada je podržano), prekopiraj tačno prikazane TXT host/value u Cloudflare DNS, pa u Google Admin izaberi Start authentication. Ne izmišljaj DKIM vrednosti.

Posle toga pošalji test poruku i u Gmail-u otvori Show original: proveri SPF, DKIM i DMARC rezultate. O SPF/DMARC izmenama odlučujemo na osnovu stvarnih zapisa i legitimnih pošiljalaca. Ne pravimo drugi SPF zapis i ne uključujemo strogu DMARC politiku bez provere svih izvora slanja.

[Google: DKIM](https://knowledge.workspace.google.com/admin/security/set-up-dkim)

## 5. Google Cloud projekat i Gmail API

1. Otvori https://console.cloud.google.com/ primarnim Workspace nalogom.
2. Izaberi organizaciju kojoj pripada domen i napravi projekat za sajt, npr. `VLK InfoSec Consulting Website`. Ako već postoji odgovarajući projekat, koristi njega.
3. APIs & Services → Library → Gmail API → Enable.
4. Google Auth Platform / OAuth consent screen: unesi naziv **VLK InfoSec Consulting**, support email i developerski kontakt koji nadgledaš. Ako forma traži linkove, koristi stvarne objavljene Home/Privacy/Terms URL-ove.
5. Audience: **Internal**, ako projekat pripada tvojoj Workspace organizaciji i ta opcija je dostupna. Nalog koji će slati poruke mora da bude iz te organizacije. Ako Internal nije dostupan, pošalji screenshot Audience ekrana pre nastavka: External ima drugačije zahteve i testing tokeni mogu biti kratkog veka.
6. Data Access / Scopes: dodaj samo `https://www.googleapis.com/auth/gmail.send`. Ne traži čitanje cele pošte i ne uključuj domain-wide delegation za ovaj tok.

Ovo ovlašćenje daje tvoj sender nalog. Posetioci sajta ne prijavljuju se na Google i ne odobravaju pristup svom sandučetu.

[Google: OAuth za web aplikacije](https://developers.google.com/identity/protocols/oauth2/web-server)

## 6. Dobijanje refresh tokena — radiš u svom browseru

Za inicijalno povezivanje može se koristiti zvanični Google OAuth Playground sa **tvojim OAuth klijentom**:

1. U projektu: Clients / Credentials → Create OAuth client → Web application.
2. Dodaj Authorized redirect URI: `https://developers.google.com/oauthplayground` — tačno, bez završne kose crte. Sačuvaj Client ID i Client secret u svom password manager-u.
3. Otvori https://developers.google.com/oauthplayground/ . U Settings uključi **Use your own OAuth credentials** i unesi upravo kreirane vrednosti. Ostavi Google OAuth endpoints i offline access; ne koristi nepoznate custom endpoints.
4. U Step 1 unesi `https://www.googleapis.com/auth/gmail.send`, izaberi Authorize APIs, prijavi se primarnim Workspace sender nalogom i odobri slanje.
5. Step 2 → Exchange authorization code for tokens. Refresh token upotrebi kao Cloudflare secret `GOOGLE_REFRESH_TOKEN`; ne kratkotrajni access token.
6. Ako nema refresh tokena, proveri offline access i consent podešavanja; ne ponavljaj automatski mnogo autorizacija. Ne odobravaj šire scope-ove da bi rešila problem.
7. Ne koristi Playground-ove podrazumevane credentials za trajnu integraciju. Ne šalji screenshot tokena niti link koji sadrži tokens/credentials. Posle čuvanja ukloni tajne iz Playground prikaza/browser sesije, bez opoziva dozvole koja je potrebna aktivnoj integraciji.

[Google OAuth Playground](https://developers.google.com/oauthplayground/)

## 7. Cloudflare: Turnstile

1. Otvori Cloudflare dashboard i pronađi Turnstile → Add widget.
2. Naziv: `VLK InfoSec Consulting Contact`. Režim: Managed.
3. Dodaj hostname `vlk-infosec.com`. Ako ćemo testirati poseban preview hostname, eksplicitno dodaj baš njega i koristi zasebno preview podešavanje; ne dozvoljavaj proizvoljne domene.
4. Sačuvaj. Site key ide u `TURNSTILE_SITE_KEY`, a secret key u `TURNSTILE_SECRET`.
5. Kod očekuje Turnstile action `enquiry` i hostname usklađen sa `APP_ORIGIN`. Widget proverava botove; email kod zasebno proverava pristup sandučetu.

[Cloudflare: Turnstile](https://developers.cloudflare.com/turnstile/get-started/)

## 8. Cloudflare: D1 baza

1. Storage & Databases → D1 → Create database. Predlog naziva: `vlk-infosec-contact`.
2. U bazi otvori Console i pokreni sadržaj oba fajla iz paketa, redom: `website/migrations/0001_verification.sql`, zatim `0002_expiry_indexes.sql`.
3. Proveri da postoje tabele `challenges` i `rate_limits` i indeksi isteka. One ne čuvaju sadržaj upita.
4. Workers & Pages → postojeći Pages projekat → Settings → Bindings → Add → D1 database. Variable name mora biti **DB**, a izabrana baza upravo kreirana.
5. Za testiranje koristi zasebnu bazu i preview environment. Ne pretpostavljaj da se production bindings automatski prenose na preview.

[Cloudflare: D1](https://developers.cloudflare.com/d1/get-started/)

## 9. Cloudflare: promenljive i tajne

U Pages projektu otvori Settings → Variables and Secrets / Environment variables. Postavi zasebno za okruženje koje testiraš. Secrets unesi kao šifrovane tajne; ne u javni JavaScript ili GitHub.

| Naziv | Vrednost / poreklo | Tip |
|---|---|---|
| APP_ORIGIN | `https://vlk-infosec.com` bez završne `/`; preview koristi svoj tačan origin | Variable |
| MAIL_FROM | `contact@vlk-infosec.com`, tek kad send-as radi | Variable |
| MAIL_TO | `contact@vlk-infosec.com` | Variable |
| TURNSTILE_SITE_KEY | Javni ključ widgeta | Variable |
| TURNSTILE_SECRET | Tajni ključ widgeta | Secret |
| GOOGLE_CLIENT_ID | ID tvog Google OAuth klijenta | Variable ili Secret |
| GOOGLE_CLIENT_SECRET | Secret istog klijenta | Secret |
| GOOGLE_REFRESH_TOKEN | Refresh token autorizovanog sender naloga | Secret |
| RATE_SECRET | Nova nasumična tajna od najmanje 32 bajta | Secret |
| DB | D1 binding, ne tekstualna promenljiva | Binding |

`RATE_SECRET` generiši lokalno, na primer iz password manager-a kao dugačku slučajnu vrednost; ne koristi lozinku naloga. Bez potrebnih podešavanja API vraća 503 umesto lažnog uspeha. Izmene bindings/secrets zahtevaju novo deployment izdanje prema Cloudflare toku.

[Cloudflare: Pages bindings](https://developers.cloudflare.com/pages/functions/bindings/)

## 10. Redovno čišćenje i čuvanje podataka

Aplikacija ima i čišćenje prilikom zahteva, ali ne treba oslanjati brisanje samo na sledećeg posetioca. U paketu je `website/maintenance/cleanup.js` za zaseban Worker. Posle odobrenja:

1. Napravi maintenance Worker, unesi taj kod i poveži istu bazu kao `DB`.
2. Settings → Triggers / Cron Triggers → dodaj `17 2 * * *` (svaki dan 02:17 UTC).
3. Proveri scheduled test/izvršenje i broj isteklih redova. Worker briše samo istekle verification/rate-limit zapise; nema pristup mailboxu.
4. Posebno definiši rokove za upite, Sent poruke, backupove i provider logove. Istek koda nije automatsko brisanje emaila iz Google Workspace-a.

[Cloudflare: Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)

## 11. Objavljivanje i provera — tek posle tvoje potvrde

Za kasniju integraciju koristi `website/public`, `website/functions`, `website/migrations` i potrebne maintenance fajlove. `functions` mora ostati u korenu repozitorijuma uz `public`. Ne uploaduj lokalni `preview` folder, početni pregled, dokumentaciju ili tajne. Postojeći Pages output je potrebno potvrditi kao `public`; za ovaj statički kod nije potreban frontend build.

Prvo izolovani preview deploy: zasebni secrets/DB, dozvoljeni Turnstile hostname i tačan APP_ORIGIN. Proveri primitak stvarnog koda, odbijanje pogrešnog/isteklog koda, zabranu ponovne upotrebe, dostavu upita u contact sanduče i Reply-To posetioca. Ispitaj i grešku slanja: ne sme prikazati uspeh. Testovi koji šalju poruke rade se na adresama koje odobriš.

Na kraju proveri produkcijski HTTPS, /api/contact, _headers/CSP, Turnstile učitavanje i mobilni prikaz. Ispuni stvarne provider/retention podatke u Privacy tekstu. Lokalni demo `123456` ne radi kao produkcijski kod.

## 12. Google Search Console i vidljivost

Nakon odobrenog objavljivanja otvori Search Console → Add property → Domain i unesi `vlk-infosec.com`. Proveri da li property već postoji. Ako ne postoji, prekopiraj dati verification TXT u Cloudflare DNS i potvrdi vlasništvo. Ne uklanjaj Workspace verification zapise.

Zatim Sitemaps → predaj `https://vlk-infosec.com/sitemap.xml`; URL Inspection → proveri i zatraži indeksiranje ključnih stranica. Produkcija treba da vraća 200 i da nema `noindex` ili zaštitni login. Lokalni preview namerno ima noindex. Favicon proveri na `/favicon.ico` i otvori nov browser tab ako stari kešira ikonu. Indeksiranje, tačan snippet i pozicija nisu garantovani.

[Google: verifikacija Search Console vlasništva](https://support.google.com/webmasters/answer/9008080?hl=en)

## Kojim redom nastavljamo zajedno

Prvo pošalji screenshot postojećeg contact aliasa i Pages podešavanja, pa DNS email zapise. Na osnovu toga biramo tačne naredne korake. Nije potrebno ponovo slati poslovne podatke firme. Tajne unosiš u svoje naloge, a javni sajt menjamo nakon pregleda i potvrde.
