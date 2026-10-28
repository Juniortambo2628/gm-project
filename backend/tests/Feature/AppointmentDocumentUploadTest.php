<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\AppointmentDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class AppointmentDocumentUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_valid_signed_link_accepts_documents_and_keeps_them_private(): void
    {
        Storage::fake('local');
        Storage::fake('public');
        $appointment = Appointment::factory()->create();
        $url = URL::temporarySignedRoute('appointments.documents.upload', now()->addDay(), [
            'appointment' => $appointment->id,
        ]);
        $file = UploadedFile::fake()->create('preparation.pdf', 20, 'application/pdf');

        $response = $this->post($url, ['documents' => [$file]]);

        $response->assertCreated()->assertJsonPath('data.0.name', 'preparation.pdf');
        $this->assertDatabaseHas('appointment_documents', [
            'appointment_id' => $appointment->id,
            'original_name' => 'preparation.pdf',
        ]);
        $document = AppointmentDocument::firstOrFail();
        Storage::disk('local')->assertExists($document->path);
        Storage::disk('public')->assertMissing($document->path);
    }

    public function test_unsigned_or_expired_link_cannot_upload_documents(): void
    {
        Storage::fake('local');
        $appointment = Appointment::factory()->create();
        $file = UploadedFile::fake()->create('preparation.pdf', 20, 'application/pdf');

        $this->postJson("/api/appointments/{$appointment->id}/documents", ['documents' => [$file]])
            ->assertForbidden();

        $expired = URL::temporarySignedRoute('appointments.documents.upload', now()->subMinute(), [
            'appointment' => $appointment->id,
        ]);
        $this->postJson($expired, ['documents' => [$file]])->assertForbidden();
        $this->assertDatabaseCount('appointment_documents', 0);
    }

    public function test_only_admins_can_download_uploaded_documents(): void
    {
        Storage::fake('local');
        $document = AppointmentDocument::create([
            'appointment_id' => Appointment::factory()->create()->id,
            'path' => 'appointment-documents/private.pdf',
            'original_name' => 'private.pdf',
            'mime_type' => 'application/pdf',
            'size_bytes' => 10,
        ]);
        Storage::disk('local')->put($document->path, 'private');

        $this->get("/api/cms/appointment-documents/{$document->id}/download")->assertUnauthorized();

        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin)
            ->get("/api/cms/appointment-documents/{$document->id}/download")
            ->assertOk();
    }
}
