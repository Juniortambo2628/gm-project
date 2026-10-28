# Systemwide UX Improvement Phase

## Plan

1. **Make client records the organizing layer.** Aggregate accounts, payments, inquiries, appointments, uploaded documents, and email delivery history by normalized email address. Let administrators search the combined directory and open one client timeline.
2. **Clarify operational state and next actions.** Show payment, booking, email, and integration status together; surface pending payments, failed email, integration health, and near-term appointments on the dashboard. Make payment reconciliation an explicit admin action.
3. **Make admin lists usable at scale.** Add shared server-side search, relevant status/date/document filters, result counts, and pagination to accounts, inquiries, payments, appointments, and mail logs.
4. **Improve appointment document handling.** Provide a signed status view, account-based fresh-link recovery, upload count and file limits, progress and success feedback, metadata, private admin downloads, and explicit deletion.
5. **Standardize form and access feedback.** Use visible inline success/error states, labels, busy state, keyboard focus indicators, and screen-reader announcements on customer forms and account screens.
6. **Add accountability and privacy controls.** Record successful admin changes and private document downloads without request payloads or file contents. Keep documents private and expose a manual per-document delete action. Preserve linked business records when an account is deactivated.
7. **Verify the integrated change.** Run backend and frontend CI checks, address failures, open a pull request, and merge only after required CI is green.

## Implemented in this phase

- Combined client directory and history view.
- Dashboard action summaries and clearer booking/payment status.
- Search, filters, date ranges, and pagination for the primary admin lists.
- Explicit payment reconciliation action.
- Improved appointment document upload and recovery flow, plus admin download/delete controls.
- Consistent form feedback and accessible labels/status announcements.
- Admin audit trail for successful mutations and private document downloads.
- Retention policy documentation; current deletion remains manual and item-level.

## Deferred pending a business-approved policy

Automatic scheduled deletion of documents, email logs, or audit records is not included. Retention periods and purge scope require an explicit business decision. See [data-retention.md](data-retention.md).

## Remaining systemwide improvement backlog

- Add explicit lifecycle states and recovery actions for external integrations and booking synchronization failures.
- Review mobile layouts and accessibility across all admin and customer screens.
- Add audit retention/export controls once retention periods are approved.
- Add user-facing privacy/export/deletion request workflows where applicable.
- Add broader telemetry and alerting for payment, mail, and integration failures.
