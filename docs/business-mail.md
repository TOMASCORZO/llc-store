# Business mail step

The fourth checkout step collects either a physical business address or a virtual-mailbox request. The own-address option can reuse contact details or collect a separate international address. US addresses require a region and ZIP; PO boxes are rejected as physical addresses in both the client flow and API.

Orders store the normalized selection in `contact_details.businessMail` and include it in the idempotency hash. Virtual selections are saved as `status: requested`, never activated or billed. The displayed first-month promotion and $29/month require availability confirmation and a separate activation flow; there is no mailbox provider integration yet.

Warnings use the formation state, not the address's region. `addressWarning` has scoped wording for Louisiana and Florida and a neutral physical-address input requirement for other states. Do not generalize registered-office restrictions to mailing addresses.

Sources checked September 26, 2026:
- Florida LLC instructions, principal office and mailing address (PO boxes allowed for mailing): https://dos.fl.gov/sunbiz/start-business/efile/fl-llc/instructions/
- Louisiana Secretary of State sample articles, municipal registered-agent and registered-office address, not a PO box only: https://coraweb.sos.la.gov/Student/CertificateArticlesOfOrganization.aspx

The two phone previews are native HTML/CSS illustrations, not screenshots of an existing customer mailbox application.
