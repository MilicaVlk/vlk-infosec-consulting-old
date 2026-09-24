# Priprema za GitHub i Cloudflare

Status: lokalni pregled odobren uz doradu kartica; verifikacija još nije završena. Nije izvršen push/deploy.

1. Uporediti najnoviji GitHub branch sa lokalnim izmenama pre integracije, da se ne prepišu novije izmene.
2. U repozitorijum preneti public/, functions/, migrations/ i maintenance/ uz pregled diff-a. Functions ostaje pored public/. Ne prenositi preview/, OTVORI-PREVIEW.html, ZIP ni lokalne tajne.
3. Potvrditi Pages repo, production branch i output directory public. Push na production branch može automatski objaviti sajt; ne raditi pre potvrde.
4. D1: tabele potvrđene slikom; proveriti oba indeksa i DB binding.
5. Završiti Gmail OAuth refresh token, Send-as test, Turnstile i promenljive prema konfiguracionom uputstvu. Tajne samo u Cloudflare Secrets.
6. Izolovani preview: zasebna baza, odgovarajući APP_ORIGIN i Turnstile hostname. Proveriti stvarni kod, pogrešan/istekao kod, ponovnu upotrebu, prijem upita i neuspeh slanja.
7. Proveriti privacy rokove/obradu, redovno čišćenje baze, HTTPS i sigurnosne headere.
8. Posle odobrenja objaviti produkciju; proveriti formu, favicon, canonical, sitemap, robots i odsustvo noindex. Sačuvati prethodni deployment za rollback.

Kartice preporuka koriste jednake visine unutar svake mreže na desktopu; na mobilnom prirodnu visinu bez nepotrebnih praznina. Tekst nije skraćen.
