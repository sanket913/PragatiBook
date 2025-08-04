import { getDatabase } from './mongodb';

interface OTPRecord {
  email: string;
  otp: string;
  expiresAt: Date;
  createdAt: Date;
  verified: boolean;
}

export class OTPManager {
  private static readonly COLLECTION_NAME = 'password_reset_otps';
  private static readonly OTP_EXPIRY_MINUTES = 10;

  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async saveOTP(email: string, otp: string): Promise<boolean> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.COLLECTION_NAME);

      // Remove any existing OTPs for this email
      await collection.deleteMany({ email });

      const otpRecord: OTPRecord = {
        email,
        otp,
        expiresAt: new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000),
        createdAt: new Date(),
        verified: false,
      };

      await collection.insertOne(otpRecord);
      return true;
    } catch (error) {
      console.error('Error saving OTP:', error);
      return false;
    }
  }

  static async verifyOTP(email: string, otp: string): Promise<boolean> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.COLLECTION_NAME);

      const otpRecord = await collection.findOne({
        email,
        otp,
        expiresAt: { $gt: new Date() },
        verified: false,
      });

      if (!otpRecord) {
        return false;
      }

      // Mark OTP as verified
      await collection.updateOne(
        { _id: otpRecord._id },
        { $set: { verified: true } }
      );

      return true;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return false;
    }
  }

  static async cleanupExpiredOTPs(): Promise<void> {
    try {
      const db  = await getDatabase();
      const collection = db.collection(this.COLLECTION_NAME);

      await collection.deleteMany({
        expiresAt: { $lt: new Date() },
      });
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
    }
  }

  static async isOTPVerified(email: string): Promise<boolean> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.COLLECTION_NAME);

      const otpRecord = await collection.findOne({
        email,
        verified: true,
        expiresAt: { $gt: new Date() },
      });

      return !!otpRecord;
    } catch (error) {
      console.error('Error checking OTP verification:', error);
      return false;
    }
  }

  static async deleteVerifiedOTP(email: string): Promise<void> {
    try {
      const db  = await getDatabase();
      const collection = db.collection(this.COLLECTION_NAME);

      await collection.deleteMany({ email, verified: true });
    } catch (error) {
      console.error('Error deleting verified OTP:', error);
    }
  }
}