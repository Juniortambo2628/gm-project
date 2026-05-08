<x-mail::message>
# New Client Inquiry

A new client has reached out via the website contact form.

**Name:** {{ $inquiryMessage->name }}  
**Email:** {{ $inquiryMessage->email }}  
**Interested In:** {{ $inquiryMessage->service_interest }}  

**Message:**
<x-mail::panel>
{{ $inquiryMessage->message }}
</x-mail::panel>

<x-mail::button :url="config('app.frontend_url', 'http://localhost:3000') . '/admin'">
Log into Admin Dashboard
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
