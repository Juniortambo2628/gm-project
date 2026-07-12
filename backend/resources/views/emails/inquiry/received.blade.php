<x-mail::message>
# New Client Inquiry

A new client has reached out via the website contact form.

**Name:** {{ $inquiryMessage->name }}  
**Email:** {{ $inquiryMessage->email }}  
**Subject:** {{ $inquiryMessage->subject ?: 'General Coaching Inquiry' }}  

**Message:**
<x-mail::panel>
{{ $inquiryMessage->content }}
</x-mail::panel>

<x-mail::button :url="config('app.frontend_url', 'http://localhost:3000') . '/admin'">
Log into Admin Dashboard
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
