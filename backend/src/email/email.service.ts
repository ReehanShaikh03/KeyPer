import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly apiKey: string;
  private readonly senderEmail: string;
  private readonly senderName: string;

  constructor(private readonly configService: ConfigService) {
    const key = this.configService.get<string>('BREVO_API_KEY');
    if (!key) {
      throw new Error('BREVO_API_KEY is not defined in environment variables');
    }
    this.apiKey = key;
    this.senderEmail = this.configService.get<string>('BREVO_SENDER_EMAIL', 'noreply@keyper.local');
    this.senderName = this.configService.get<string>('BREVO_SENDER_NAME', 'KeyPer Security');
  }

  private async sendEmail(payload: { subject: string; to: string; htmlContent: string }) {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': this.apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: this.senderName, email: this.senderEmail },
        to: [{ email: payload.to }],
        subject: payload.subject,
        htmlContent: payload.htmlContent,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      this.logger.error('Brevo API Error:', errData);
      throw new InternalServerErrorException('Failed to send email via Brevo');
    }
  }

  async sendOtpEmail(toEmail: string, otpCode: string): Promise<void> {
    await this.sendEmail({
      to: toEmail,
      subject: 'Your KeyPer Verification Code',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0F1115; color: #FFFFFF;">
          <h2 style="color: #6366F1;">KeyPer Security Verification</h2>
          <p>Your one-time login verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #14B8A6; padding: 15px 0;">
            ${otpCode}
          </div>
          <p style="color: #9CA3AF;">This code expires in 10 minutes. If you did not request this, please secure your account.</p>
        </div>
      `,
    });
  }

  async sendRecoveryEmail(toEmail: string, resetLink: string): Promise<void> {
    await this.sendEmail({
      to: toEmail,
      subject: 'KeyPer Password Recovery Request',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Password Recovery</h2>
          <p>Click below to reset your master password (valid for 15 minutes):</p>
          <a href="${resetLink}" style="display:inline-block;padding:10px 20px;background:#6366F1;color:#fff;text-decoration:none;border-radius:5px;">Reset Master Password</a>
        </div>
      `,
    });
  }
}