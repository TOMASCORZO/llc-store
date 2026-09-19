# Creem review preparation

## Official requirements checked

Source: [Creem Account Reviews](https://docs.creem.io/merchant-of-record/account-reviews/account-reviews).

Creem explicitly requires accessible terms and privacy pages, clear product and prices, a live functional product, accurate claims and reachable branded support. The website and application support addresses must match. Services require additional due diligence and an established processing history; banking/financing services are prohibited. Describe the actual formation and bank-application assistance to Creem and obtain an eligibility determination before selling. Do not represent this assisted service as software or a digital download.

## Pages implemented

- `/terms`: service scope, price structure, responsibilities, third-party decisions and remedies.
- `/privacy`: actual form fields, database/hosting, third-party filing recipients, browser storage, external Google Fonts, retention and rights.
- `/refunds`: cancellation and refunds before/after authorized work, incurred charges and renewals.
- `/contact`: visible branded email and support process.
- `/about`: business description, deliverables, electronic delivery and timing.

Terms and privacy are expressly required pages. Contact information, service delivery and refund/cancellation information are organized into additional pages to make the customer experience clear; Creem does not require a separate page for every topic in its account-review checklist. No fake approval badge, testimonial, customer count or processor relationship has been added.

The policies are in English, marked with `lang="en"`; navigation labels remain localized in six languages. No country or business address is published, as requested by the owner. Just My LLC is identified as the brand, not as a verified legal entity. Refund and response timelines in these pages are operating commitments to implement when launching paid services.

## Still needed before review

1. Activate and verify inbound support at `support@justmyllc.com`. The owner confirmed it currently does not receive mail and intends to configure it with Resend. Outbound email delivery alone does not establish a working inbound support workflow. Test receiving, routing and replying; no external test email has been sent by this task.
2. Confirm service eligibility directly with Creem and provide any required processor history, refund/chargeback data and accurate onboarding identity. No application has been submitted.
3. Supply required legal/controller information to Creem privately; determine any legally required public disclosures before launch. Omission here must not be represented as proof of legal or merchant-review completeness.
4. Deploy the actual production URL and make it publicly accessible. A GitHub push or localhost preview is not itself proof of a working public deployment.
5. Configure the existing database and apply the formation migration. Verify that real requests are saved, reviewed and fulfilled; current missing credentials yield 503.
6. After approval, implement and test payment collection, verified webhooks, receipts and refunds. The current request form does not take payment. It does not waive withdrawal rights or authorize immediate paid performance.
7. For future subscriptions, implement accessible cancellation before enabling recurring charges.

Approval is not guaranteed and these pages do not resolve the service-eligibility, identity, mailbox or production-readiness requirements.
