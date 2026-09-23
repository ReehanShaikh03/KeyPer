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
      this.logger.error(`Brevo API Error [${response.status} ${response.statusText}]:`, errData);
      throw new InternalServerErrorException('Failed to send email via Brevo');
    }
  }

  async sendOtpEmail(toEmail: string, otpCode: string): Promise<void> {
    await this.sendEmail({
      to: toEmail,
      subject: 'Your KeyPer Verification Code',
      htmlContent: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 32px 20px; background-color: #0F1115; color: #FFFFFF; text-align: center;">
          <div style="max-width: 480px; margin: 0 auto; background-color: #1A1D24; border-radius: 8px; padding: 32px; border: 1px solid #2D333F; text-align: left;">
            <h2 style="color: #6366F1; margin-top: 0;">KeyPer Verification</h2>
            <p style="color: #9CA3AF; font-size: 15px; line-height: 1.5;">Your one-time login verification code is:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #14B8A6; padding: 20px 0; text-align: center; font-family: monospace;">
              ${otpCode}
            </div>
            <p style="color: #6B7280; font-size: 13px; line-height: 1.4; margin-bottom: 0;">
              This code expires in 10 minutes. If you did not request this code, no action is needed.
            </p>
          </div>
        </div>
      `,
    });
  }

  async sendRecoveryEmail(toEmail: string, resetLink: string, clientIp: string = 'Unknown'): Promise<void> {
    await this.sendEmail({
      to: toEmail,
      subject: 'KeyPer: Master Password Recovery Request',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0F1115; color: #E5E7EB; padding: 32px 20px; margin: 0;">
          <div style="max-width: 520px; margin: 0 auto; background-color: #1A1D24; border-radius: 8px; padding: 32px; border: 1px solid #2D333F;">
            <h2 style="color: #FFFFFF; margin-top: 0; font-size: 20px;">Reset Your Master Password</h2>
            <p style="color: #9CA3AF; font-size: 14px; line-height: 1.6;">
              A request was received to reset the master password for your KeyPer account.
            </p>
            
            <div style="margin: 28px 0; text-align: center;">
              <a href="${resetLink}" style="background-color: #6366F1; color: #FFFFFF; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; font-size: 14px;">
                Reset Master Password
              </a>
            </div>

            <p style="color: #9CA3AF; font-size: 13px; line-height: 1.5;">
              This link is single-use and expires in <strong>15 minutes</strong>. If the button does not work, copy and paste this link:
            </p>
            
            <p style="word-break: break-all; color: #818CF8; font-size: 12px; background-color: #13161C; padding: 10px; border-radius: 4px; border: 1px solid #252A36;">
              ${resetLink}
            </p>

            <div style="background-color: #2D1A1A; border-left: 4px solid #EF4444; padding: 12px; margin: 24px 0; border-radius: 2px;">
              <p style="color: #FCA5A5; font-size: 12px; margin: 0; line-height: 1.4;">
                <strong>Zero-Knowledge Notice:</strong> Resetting your master password without your offline recovery kit permanently invalidates access to previously encrypted vault items.
              </p>
            </div>

            <p style="color: #6B7280; font-size: 12px; margin: 24px 0 0 0; line-height: 1.5; border-top: 1px solid #252A36; padding-top: 16px;">
              Requested from IP: <code>${clientIp}</code><br/>
              If you did not initiate this request, you can safely ignore this email. Your master password has not changed.
            </p>
          </div>
        </body>
        </html>
      `,
    });
  }
}