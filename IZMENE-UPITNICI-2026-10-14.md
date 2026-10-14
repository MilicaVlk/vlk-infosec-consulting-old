# Upitnici i preporuke za VLK sajt

Paket je pripremljen za pregled 14. oktobra 2026. Javna objava, povezivanje naloga i stvarno slanje email-a nisu izvršeni ovim radom.

## Sta je dodato

| Stranica | Putanja | Namena |
| --- | --- | --- |
| Izbor upitnika | `/client-assessment/` | Dva jasna ulaza za posetioce |
| Security Service Finder | `/security-service-finder/` | vCISO, readiness, rizik, customer assurance, program setup i posebno autorizovan pentest |
| AI Security & Governance Intake | `/ai-security-intake/` | Gotovi i sopstveni AI alati, LLM, RAG, agenti, predictive ML, podaci, hosting i governance |

Na pocetnoj i na stranici Services postoje dve kartice. Meni Services ima linkove za obe forme. Postojeci Start a conversation ostaje dostupan za opsti kontakt.

Dve forme koriste iste kataloge drzava i uloga i isti kontaktni korak. Dok posetilac koristi veze izmedju upitnika unutar otvorene stranice, moze da zadrzi odgovore i kontakt, i napravi jedan brief za oba obima. Osvezavanje stranice, zatvaranje ili odlazak na drugu stranicu brise nesacuvani draft. Copy/Download ne salju podatke.

Ako se promeni zajednicki podatak o organizaciji, prethodno zavrseni drugi obim treba ponovo pregledati pre ukljucivanja. Ovo sprecava izvoz zastarele preporuke.

## Preporuke na pocetnoj

1. Nenad Zeljkovic
2. Veljko Sinobad

Preuzeti su puni postojeci tekstovi iz biografije, bez menjanja citata. Tamarina preporuka ostaje u biografiji. Originalne fotografije i logo fajlovi nisu menjani.

## Email potvrda

Kod za novi `/api/intake` endpoint je ukljucen u paket, ali je slanje podrazumevano iskljuceno. Potreban je serverski flag `INTAKE_EMAIL_ENABLED=true`, postojece Google Workspace/Turnstile postavke, ispravan `APP_ORIGIN`, D1 binding `DB` i primenjena migracija `migrations/0003_intake_verification.sql`. Ne menjati flag pre odobrenja, podesavanja i kontrolisanog testa.

Korisnicki tok ima dve izricite radnje: zahtev za email kod, zatim **Confirm code & send enquiry**. Zahtev za kod ne salje upitnik. Upitnik i kontakt se salju tek u drugom koraku. Preporuka se ponovo racuna na serveru. Draft uvek oznacava da vlasnistvo email adrese nije potvrdjeno.

Novi endpoint koristi odvojene `intake_*` tabele. Originalni `/api/contact` nije menjan. Google/Cloudflare tajne se ne nalaze u fajlovima i ne unose se u browser ili Git.

## Kako postaviti za pregled

1. Raspakovati ZIP. Radni koren je direktorijum `vlk-infosec-consulting-old-main`.
2. U pripremljenu granu za pregled preneti sadrzaj tog direktorijuma. Ne ugnjezditi ceo direktorijum unutar postojeceg projekta.
3. Cloudflare publish direktorijum je i dalje `public`; `functions` je pored njega u korenu repozitorijuma. Sam upload foldera `public` ne instalira serversku email funkciju.
4. Za privatni pregled koristiti pristupom zasticen preview. Obicna staging adresa nije sama po sebi privatna.
5. Pregledati desktop i mobilni prikaz, tastaturu, linkove, oba upitnika, kombinovani brief i preporuke na pocetnoj.
6. Za buduce ukljucivanje email-a prvo primeniti migracije na odobrenoj test bazi; zatim podesiti serverske tajne/binding i Turnstile action `client-intake`. Postojeci kontakt koristi action `enquiry`.
7. Ažurirani `maintenance/cleanup.js` brise i istekle `intake_*` redove; ovu verziju cleanup Worker-a postaviti tek kada je nova migracija primenjena. Proveriti mailbox/backup retention i stvarne response headere.
8. Tek posle odobrenja izvrsiti probno slanje na dogovorene adrese, pa odluciti o javnoj objavi.

## Provere

- 567 osnovnih i 92.160 AI kombinacija u izabranim dimenzijama; dodatno 12 slucajeva bez AI upotrebe / nepoznate upotrebe.
- Svih 251 opcija drzave/teritorije i 48 opcija uloge provereno je kroz validaciju kontakta.
- 11 DOM / live-client provera: prelazi, spajanje, kontakt, izvoz, uslovna pitanja, bezbedno odbijanje neaktiviranog slanja i simulirano slanje.
- 14 provera novog serverskog endpointa: Origin, JSON/velicina, Turnstile, enum vrednosti, kod/email, istek, pokusaji, limiti, paralelni zahtevi, replay, neuspesna dostava i injection.
- Postojeci testovi `/api/contact` su prosli.
- 21 HTML fajl je proveren za lokalne putanje; nema nedostajucih lokalnih ciljeva.
- Citati Nenada i Veljka na pocetnoj provereni su protiv punih tekstova u dostavljenoj biografiji.

Ovo nije ceo moguci Cartesian skup svih odgovora. Testovi provajdera su simulirani i nijedan email nije poslat. Stvarni Cloudflare build, nalog/binding postavke, Google dostava, primena HTTP headera i vizuelni prikaz u pravim pregledačima jos zahtevaju proveru u odobrenom okruzenju.

Za lokalne testove: Node 24+, instalirati razvojne zavisnosti iz `tests/package.json`, pa iz korena projekta pokrenuti `node tests/intake-flows.cjs`, `node tests/intake-ui.cjs`, `node tests/intake-api.mjs` i `node tests/contact.mjs`. Testovi i zavisnosti nisu deo publish direktorijuma `public`.
