// Email service utilities for sending notifications
// Uses SendGrid API for email delivery

interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text: string;
}

interface SendGridEmail {
  personalizations: Array<{
    to: Array<{ email: string; name?: string }>;
    subject: string;
  }>;
  from: {
    email: string;
    name: string;
  };
  content: Array<{
    type: string;
    value: string;
  }>;
}

export class EmailService {
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;
  private baseUrl: string;

  constructor(apiKey: string, fromEmail: string = 'noreply@company.com', fromName: string = 'Prekių užsakymų sistema') {
    this.apiKey = apiKey;
    this.fromEmail = fromEmail;
    this.fromName = fromName;
    this.baseUrl = 'https://api.sendgrid.com/v3/mail/send';
  }

  async sendEmail(template: EmailTemplate): Promise<boolean> {
    try {
      const emailData: SendGridEmail = {
        personalizations: [{
          to: [{ email: template.to }],
          subject: template.subject
        }],
        from: {
          email: this.fromEmail,
          name: this.fromName
        },
        content: [
          {
            type: 'text/plain',
            value: template.text
          },
          {
            type: 'text/html', 
            value: template.html
          }
        ]
      };

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      return response.ok;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  // Request status change notifications
  async sendRequestStatusNotification(
    userEmail: string, 
    userName: string,
    requestId: number, 
    status: string, 
    comment?: string,
    appUrl: string = 'https://your-app.pages.dev'
  ): Promise<boolean> {
    const statusLabels = {
      'submitted': 'pateiktas peržiūrai',
      'under_review': 'peržiūrimas',
      'pending_approval': 'laukia patvirtinimo',
      'approved': 'patvirtintas',
      'rejected': 'atmestas',
      'ordered': 'užsakytas',
      'delivered': 'pristatytas',
      'completed': 'užbaigtas'
    };

    const statusLabel = statusLabels[status as keyof typeof statusLabels] || status;
    const requestUrl = `${appUrl}#/requests/${requestId}`;

    const subject = `Prašymo #${requestId} būsena pasikeitė`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .status { padding: 10px; border-radius: 5px; margin: 15px 0; }
          .status.approved { background: #D1FAE5; color: #065F46; }
          .status.rejected { background: #FEE2E2; color: #991B1B; }
          .status.default { background: #DBEAFE; color: #1E40AF; }
          .button { display: inline-block; padding: 12px 24px; background: #3B82F6; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #6B7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Prekių užsakymų sistema</h1>
          </div>
          <div class="content">
            <h2>Sveiki, ${userName}!</h2>
            <p>Jūsų prašymo būsena pasikeitė:</p>
            
            <div class="status ${status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'default'}">
              <strong>Prašymas #${requestId}</strong> dabar yra <strong>${statusLabel}</strong>
            </div>
            
            ${comment ? `
            <div style="margin: 15px 0; padding: 15px; background: white; border-left: 4px solid #3B82F6;">
              <strong>Komentaras:</strong><br>
              ${comment}
            </div>
            ` : ''}
            
            <a href="${requestUrl}" class="button">Peržiūrėti prašymą</a>
            
            <p>Dėkojame, kad naudojatės mūsų sistema!</p>
          </div>
          <div class="footer">
            <p>Šis pranešimas išsiųstas automatiškai. Neatsakykite į šį laišką.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Sveiki, ${userName}!

Jūsų prašymo būsena pasikeitė:
Prašymas #${requestId} dabar yra ${statusLabel}

${comment ? `Komentaras: ${comment}` : ''}

Peržiūrėkite prašymą: ${requestUrl}

Dėkojame, kad naudojatės mūsų sistema!
    `;

    return this.sendEmail({
      to: userEmail,
      subject,
      html,
      text
    });
  }

  // Order status change notifications
  async sendOrderStatusNotification(
    userEmail: string,
    userName: string,
    orderId: number,
    status: string,
    comment?: string,
    appUrl: string = 'https://your-app.pages.dev'
  ): Promise<boolean> {
    const statusLabels = {
      'pending': 'laukia apdorojimo',
      'sent': 'išsiųstas tiekėjui',
      'confirmed': 'patvirtintas',
      'delivered': 'pristatytas',
      'completed': 'užbaigtas'
    };

    const statusLabel = statusLabels[status as keyof typeof statusLabels] || status;
    const orderUrl = `${appUrl}#/orders/${orderId}`;

    const subject = `Užsakymo #${orderId} būsena pasikeitė`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .status { padding: 10px; border-radius: 5px; margin: 15px 0; background: #D1FAE5; color: #065F46; }
          .button { display: inline-block; padding: 12px 24px; background: #059669; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #6B7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Prekių užsakymų sistema</h1>
          </div>
          <div class="content">
            <h2>Sveiki, ${userName}!</h2>
            <p>Užsakymo būsena pasikeitė:</p>
            
            <div class="status">
              <strong>Užsakymas #${orderId}</strong> dabar yra <strong>${statusLabel}</strong>
            </div>
            
            ${comment ? `
            <div style="margin: 15px 0; padding: 15px; background: white; border-left: 4px solid #059669;">
              <strong>Komentaras:</strong><br>
              ${comment}
            </div>
            ` : ''}
            
            <a href="${orderUrl}" class="button">Peržiūrėti užsakymą</a>
            
            <p>Dėkojame už kantrybę!</p>
          </div>
          <div class="footer">
            <p>Šis pranešimas išsiųstas automatiškai. Neatsakykite į šį laišką.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Sveiki, ${userName}!

Užsakymo būsena pasikeitė:
Užsakymas #${orderId} dabar yra ${statusLabel}

${comment ? `Komentaras: ${comment}` : ''}

Peržiūrėkite užsakymą: ${orderUrl}

Dėkojame už kantrybę!
    `;

    return this.sendEmail({
      to: userEmail,
      subject,
      html,
      text
    });
  }

  // Invoice payment notifications
  async sendInvoicePaymentNotification(
    userEmail: string,
    userName: string,
    invoiceNumber: string,
    amount: number,
    type: 'payment_received' | 'payment_reminder' | 'payment_overdue',
    appUrl: string = 'https://your-app.pages.dev'
  ): Promise<boolean> {
    let subject: string;
    let statusColor: string;
    let message: string;

    switch (type) {
      case 'payment_received':
        subject = `Mokėjimas gautas - Sąskaita ${invoiceNumber}`;
        statusColor = '#059669';
        message = 'Jūsų mokėjimas sėkmingai gautas ir apdorotas.';
        break;
      case 'payment_reminder':
        subject = `Mokėjimo priminimas - Sąskaita ${invoiceNumber}`;
        statusColor = '#D97706';
        message = 'Primename apie neapmokėtą sąskaitą faktūrą.';
        break;
      case 'payment_overdue':
        subject = `SKUBU: Mokėjimo terminas praėjęs - Sąskaita ${invoiceNumber}`;
        statusColor = '#DC2626';
        message = 'DĖMESIO: Mokėjimo terminas jau praėjęs.';
        break;
    }

    const invoiceUrl = `${appUrl}#/invoices`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${statusColor}; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .invoice-details { padding: 15px; background: white; border-radius: 5px; margin: 15px 0; }
          .amount { font-size: 24px; font-weight: bold; color: ${statusColor}; }
          .button { display: inline-block; padding: 12px 24px; background: ${statusColor}; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #6B7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🧾 Prekių užsakymų sistema</h1>
          </div>
          <div class="content">
            <h2>Sveiki, ${userName}!</h2>
            <p>${message}</p>
            
            <div class="invoice-details">
              <strong>Sąskaitos numeris:</strong> ${invoiceNumber}<br>
              <strong>Suma:</strong> <span class="amount">€${amount.toFixed(2)}</span>
            </div>
            
            <a href="${invoiceUrl}" class="button">Peržiūrėti sąskaitą</a>
            
            ${type === 'payment_received' ? 
              '<p>Dėkojame už mokėjimą!</p>' : 
              '<p>Prašome apmokėti šią sąskaitą arba susisiekti su mumis dėl klausimų.</p>'
            }
          </div>
          <div class="footer">
            <p>Šis pranešimas išsiųstas automatiškai. Neatsakykite į šį laišką.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Sveiki, ${userName}!

${message}

Sąskaitos numeris: ${invoiceNumber}
Suma: €${amount.toFixed(2)}

Peržiūrėkite sąskaitą: ${invoiceUrl}

${type === 'payment_received' ? 
  'Dėkojame už mokėjimą!' : 
  'Prašome apmokėti šią sąskaitą arba susisiekti su mumis dėl klausimų.'
}
    `;

    return this.sendEmail({
      to: userEmail,
      subject,
      html,
      text
    });
  }

  // Welcome email for new users
  async sendWelcomeEmail(
    userEmail: string,
    userName: string,
    temporaryPassword: string,
    appUrl: string = 'https://your-app.pages.dev'
  ): Promise<boolean> {
    const subject = 'Sveiki atvykę į prekių užsakymų sistemą';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .credentials { padding: 15px; background: #FEF3C7; border-left: 4px solid #D97706; margin: 15px 0; }
          .button { display: inline-block; padding: 12px 24px; background: #3B82F6; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #6B7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Prekių užsakymų sistema</h1>
          </div>
          <div class="content">
            <h2>Sveiki, ${userName}!</h2>
            <p>Jums buvo sukurta paskyra prekių užsakymų valdymo sistemoje.</p>
            
            <div class="credentials">
              <strong>Jūsų prisijungimo duomenys:</strong><br>
              El. paštas: <strong>${userEmail}</strong><br>
              Laikinas slaptažodis: <strong>${temporaryPassword}</strong>
            </div>
            
            <p><strong>SVARBU:</strong> Pirmą kartą prisijungę, prašome pakeisti slaptažodį.</p>
            
            <a href="${appUrl}" class="button">Prisijungti į sistemą</a>
            
            <p>Jei turite klausimų, susisiekite su administratoriumi.</p>
          </div>
          <div class="footer">
            <p>Šis pranešimas išsiųstas automatiškai. Neatsakykite į šį laišką.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Sveiki, ${userName}!

Jums buvo sukurta paskyra prekių užsakymų valdymo sistemoje.

Jūsų prisijungimo duomenys:
El. paštas: ${userEmail}
Laikinas slaptažodis: ${temporaryPassword}

SVARBU: Pirmą kartą prisijungę, prašome pakeisti slaptažodį.

Prisijungti į sistemą: ${appUrl}

Jei turite klausimų, susisiekite su administratoriumi.
    `;

    return this.sendEmail({
      to: userEmail,
      subject,
      html,
      text
    });
  }
}

// Helper function to create email service instance
export function createEmailService(env: any): EmailService | null {
  const apiKey = env.SENDGRID_API_KEY;
  const fromEmail = env.FROM_EMAIL || 'noreply@company.com';
  const fromName = env.FROM_NAME || 'Prekių užsakymų sistema';
  
  if (!apiKey) {
    console.warn('SendGrid API key not configured. Email notifications will be disabled.');
    return null;
  }
  
  return new EmailService(apiKey, fromEmail, fromName);
}