import { getDatabase } from '@/lib/mongodb';
import { brevoMailer } from '@/lib/bravo-mailer';
import { OTPManager } from '@/lib/otp-manager';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if user exists
    const db = await getDatabase();
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate OTP
    const otp = OTPManager.generateOTP();

    // Save OTP to database
    const otpSaved = await OTPManager.saveOTP(email, otp);
    if (!otpSaved) {
      return new Response(JSON.stringify({ error: 'Failed to generate OTP' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Send OTP via email
    const emailSent = await brevoMailer.sendOTPEmail(email, otp, user.name);
    if (!emailSent) {
      return new Response(JSON.stringify({ error: 'Failed to send OTP email' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Clean up expired OTPs
    OTPManager.cleanupExpiredOTPs();

    return new Response(JSON.stringify({
      message: 'OTP sent successfully to your email',
      email
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
