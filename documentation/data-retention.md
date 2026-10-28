# Data retention and deletion

This document describes the retention behavior currently enforced by the application. No automatic purge is scheduled. Set time-based retention periods only after the business owner has reviewed accounting, contractual, and privacy requirements.

| Data | Current rule | Deletion behavior |
| --- | --- | --- |
| Appointment documents | Retain while needed for the appointment and follow-up | An administrator can permanently delete an individual file from the appointment view. Deleting an appointment also removes its stored files. |
| Client accounts | Retain while the account is active | Admin deletion soft-deletes the account and removes it from normal account lists. The client history and related business records remain available to admins. |
| Inquiries | Retain while they are useful for responding to or following up with the client | Admin deletion soft-deletes the inquiry. Its client-history record remains available to admins. |
| Payment transactions | Preserve for payment reconciliation, refunds, and disputes | No permanent-delete action is provided in the admin interface. |
| Email delivery logs | Retain for operational troubleshooting | No automatic purge or delete action is currently provided. |
| Admin audit events | Retain for security and accountability | Events are visible to admins and currently have no automatic purge. They record successful admin mutations and private document downloads, not request bodies or document contents. |

Appointment documents are stored on the private local disk. Before setting time-based expiry for documents, email logs, or audit events, choose and document the approved retention period, then add a reviewed purge process. Soft deletion is not permanent erasure; a permanent client-data erasure request needs a separate controlled process so payment and audit history can be handled safely.
