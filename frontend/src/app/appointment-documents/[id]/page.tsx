import AppointmentDocumentUpload from "@/components/AppointmentDocumentUpload";

export default async function AppointmentDocumentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ expires?: string; signature?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);

  return <AppointmentDocumentUpload appointmentId={id} expires={query.expires ?? ""} signature={query.signature ?? ""} />;
}
