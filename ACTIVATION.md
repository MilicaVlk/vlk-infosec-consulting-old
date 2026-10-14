# Contact service activation — after review approval

This repository remains a static Cloudflare Pages site with an additional Pages Functions endpoint. Do not deploy the local `preview` folder. Publish output is `public`; `functions` must be in the repository root. Production activation is not completed by copying HTML alone.

## Dependencies and configuration

Create a D1 database; bind it as `DB` and apply `migrations/0001_verification.sql`. Run migrations on a test database before production. The parameterized queries require SQLite RETURNING support, available in D1.

Set these server-side variables/secrets in the appropriate Pages environment:

- APP_ORIGIN: exact approved origin, such as https://vlk-infosec.com (no trailing slash). Redirect other hostnames to this origin, or configure and test each environment separately.
- TURNSTILE_SITE_KEY and TURNSTILE_SECRET: a site-specific Turnstile widget, limited to the correct hostname. The API verifies success, hostname and action `enquiry`.
- RATE_SECRET: randomly generated secret with at least 32 bytes of entropy.
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN: OAuth credentials for the designated Google Workspace mailbox with gmail.send scope. Configure an appropriate production/internal OAuth application and authorized callback rather than leaving an expiring testing setup. Keep all credentials out of source control and browser code.
- MAIL_FROM: the authorized Workspace sender (or configured send-as alias).
- MAIL_TO: the monitored VLK enquiry mailbox.

No connection or real sending has been authorized/performed during local preparation. Google Workspace/Cloudflare settings must be connected in the account UI. Review quotas and sender abuse handling before exposure.

Verification records: 10-minute validity, 5 attempts, one-time atomic claim. Per-hour caps: 3 code requests per normalized email and 30 requests per connecting IP. These are initial operational values, not a promise of DDoS protection; complement with Cloudflare rules and review shared-office-IP behavior.

The application erases used challenges after its delivery attempt and lazily cleans expired rows. Configure a daily cleanup Worker/job for `DELETE FROM challenges WHERE expires < unixepoch(); DELETE FROM rate_limits WHERE expires < unixepoch();` and document D1 backup retention. Do not claim hard 10-minute erasure: expiry is an access control, not physical erasure. Define mailbox deletion/retention, including verification messages in Sent.

## Required live checks

1. Confirm registered business identity and update Privacy, Website Terms and Terms & Policies overview; approve actual legal bases, retention and provider terms.
2. Check DNS SPF, DKIM and DMARC, sender authorization and reply-to behavior. Mailbox verification is separate from domain authentication.
3. Confirm Pages Functions routing and D1 binding, rate limits and Turnstile allowed hostnames in an isolated preview environment.
4. Test actual code receipt, wrong/expired/reused codes, changing the email, delivery failure and spam handling. No success message should be shown on a failed delivery response. A provider timeout has ambiguous delivery status: the UI asks users to contact VLK instead of blindly retrying.
5. Check CSP/Turnstile loading, HTTPS redirects, actual response headers, browser storage and Cloudflare overrides. `_headers` affects static Pages responses; API responses carry their own no-store and basic security headers.
6. Review mobile/desktop layout, keyboard navigation, form accessibility and public policy text before merge/deploy.

## Source references

- https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- https://developers.cloudflare.com/pages/functions/bindings/
- https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/send

These references informed integration code; production provider behavior and account configuration have not been exercised.

## Fit for Milica's existing subscriptions (checked 21 September 2026)

The architecture can start within Cloudflare Free service limits and the existing Workspace mailbox, subject to actual volume and account eligibility. A paid Cloudflare zone plan does not itself buy extra Workers/D1 quotas. Turnstile has a Free plan; Pages Functions use Workers quotas; D1 has a Workers Free allowance. Free is not unlimited and Google mailbox sending limits still apply.

Use a Google Cloud project owned by the Workspace organization. Enable Gmail API. Where eligible, configure the OAuth application as Internal for the organization and authorize only the designated sending account with `https://www.googleapis.com/auth/gmail.send`. Store the client secret and refresh token only as Pages secrets. External/public OAuth applications can require Google's verification process; do not bypass it. Visitors never sign into Google and never grant mailbox access: they only type the emailed code. This permission is for VLK's sending account and does not include reading its inbox.

The chosen sender must be an existing mailbox or properly configured send-as alias. A Google Group or Cloudflare forwarding address alone is not an authenticated Gmail API sender. No extra mailbox purchase is assumed; review the existing setup first.

Code requests are ten-minute, single-use challenges. Successful code submission sends the enquiry to the configured VLK mailbox, with the verified visitor address as Reply-To. SMTP passwords are not exposed in the browser. SPF/DKIM/DMARC are separate domain authentication controls, not substitutes for visitor mailbox verification.

Sources:
- https://developers.cloudflare.com/turnstile/plans/
- https://developers.cloudflare.com/pages/platform/limits/
- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/d1/platform/pricing/
- https://developers.google.com/workspace/gmail/api/auth/scopes
- https://developers.google.com/identity/protocols/oauth2/production-readiness/policy-compliance
