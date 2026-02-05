/**
 * Generates a mailto URL with pre-filled recipient, subject, and body
 * @param formData - The form data to include in the email
 * @param type - The type of form submission (e.g., 'contact', 'discovery-call', 'clarity-call')
 * @returns A mailto URL string
 */
export function generateMailtoUrl(
    formData: {
        name: string;
        email: string;
        phone?: string;
        message?: string;
        background?: string;
        purpose?: string;
    },
    type: 'contact' | 'discovery-call' | 'clarity-call'
): string {
    const recipient = 'claryntia@gmail.com';
    const subject = `New Lead: ${formData.name} (${type})`;

    // Format the email body
    let body = `New Lead Captured\n\n`;
    body += `Type: ${type}\n`;
    body += `Name: ${formData.name}\n`;
    body += `Email: ${formData.email}\n`;
    body += `Phone: ${formData.phone || 'N/A'}\n`;

    if (formData.background) {
        body += `\nBackground:\n${formData.background}\n`;
    }

    if (formData.purpose) {
        body += `\nPurpose:\n${formData.purpose}\n`;
    }

    if (formData.message) {
        body += `\nMessage:\n${formData.message}\n`;
    }

    body += `\nTimestamp: ${new Date().toLocaleString()}\n`;

    // Encode the subject and body for URL
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);

    return `mailto:${recipient}?subject=${encodedSubject}&body=${encodedBody}`;
}
