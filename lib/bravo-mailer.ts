interface BrevoMailerConfig {
  apiKey: string;
  senderEmail: string;
  senderName: string;
}

interface EmailData {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

class BrevoMailer {
  private apiKey: string;
  private senderEmail: string;
  private senderName: string;
  private baseUrl = 'https://api.brevo.com/v3';

  constructor(config: BrevoMailerConfig) {
    this.apiKey = config.apiKey;
    this.senderEmail = config.senderEmail;
    this.senderName = config.senderName;
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/smtp/email`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
        },
        body: JSON.stringify({
          sender: {
            name: this.senderName,
            email: this.senderEmail,
          },
          to: [
            {
              email: emailData.to,
            },
          ],
          subject: emailData.subject,
          htmlContent: emailData.htmlContent,
          textContent: emailData.textContent || emailData.htmlContent.replace(/<[^>]*>/g, ''),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Brevo API Error:', errorData);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Email sending error:', error);
      return false;
    }
  }

  async sendOTPEmail(email: string, otp: string, userName: string): Promise<boolean> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset OTP</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316, #dc2626); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px solid #f97316; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
          .otp-code { font-size: 32px; font-weight: bold; color: #f97316; letter-spacing: 5px; margin: 10px 0; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 5px; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>PragatiBook - Password Reset</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>We received a request to reset your password for your PragatiBook account. Use the OTP code below to proceed with resetting your password.</p>
            
            <div class="otp-box">
              <p><strong>Your OTP Code:</strong></p>
              <div class="otp-code">${otp}</div>
              <p><small>This code will expire in 10 minutes</small></p>
            </div>
            
            <div class="warning">
              <p><strong>Security Notice:</strong></p>
              <ul>
                <li>This OTP is valid for 10 minutes only</li>
                <li>Do not share this code with anyone</li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>
            </div>
            
            <p>If you have any questions or need assistance, please contact our support team.</p>
            
            <div class="footer">
              <p>Best regards,<br>The AP1700 Team</p>
              <p><small>This is an automated email. Please do not reply to this message.</small></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'PragatiBook - Password Reset OTP',
      htmlContent,
    });
  }
}

// Initialize Brevo Mailer
export const brevoMailer = new BrevoMailer({
  apiKey: process.env.BREVO_API_KEY || '',
  senderEmail: process.env.BREVO_SENDER_EMAIL || 'noreply@ap1700.com',
  senderName: process.env.BREVO_SENDER_NAME || 'AP1700 Support',
});