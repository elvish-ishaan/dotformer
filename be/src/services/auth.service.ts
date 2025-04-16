import nodemailer from 'nodemailer';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import bcrypt from 'bcrypt';
import prisma from '../lib/prisma';

const readFile = promisify(fs.readFile);

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  // secure: true, fix it later
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export class AuthService {
  async requestPasswordReset(email: string) {
    try {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP in database with expiration
      await prisma.passwordReset.create({
        data: {
          email,
          otp,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        },
      });

      // Read email template
      const templatePath = path.join(__dirname, '../../templates/emails/forgot-password.html');
      const template = await readFile(templatePath, 'utf8');
      const html = template.replace('{{otp}}', otp);

     try {
       // Send email
       await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'Password Reset OTP',
        html,
      });
      console.log('Email sent successfully')
     } catch (error) {
      console.log(error,'error in sending email........')
      return {success:false,message:'Failed to send email'}
     }

      return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Rate limit exceeded')) {
          throw new Error('Too many requests. Please try again later.');
        }
        throw error;
      }
      throw new Error('Failed to process password reset request');
    }
  }

  async verifyOtpAndResetPassword(email: string, otp: string, newPassword: string) {
    try {

      // Find valid OTP
      const resetRequest = await prisma.passwordReset.findFirst({
        where: {
          email,
          otp,
          expiresAt: {
            gt: new Date(),
          },
          used: false,
        },
      });

      if (!resetRequest) {
        throw new Error('Invalid or expired OTP');
      }

      try {
        // Update password
        //hash the password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { email: resetRequest.email },
        data: { password: hashedPassword },
      });
      console.log('password updated successfully')
      } catch (error) {
        console.log(error,'error in updating password........')
      }

      // Mark OTP as used
      await prisma.passwordReset.update({
        where: { id: resetRequest.id },
        data: { used: true },
      });
      console.log('password reset successfully')

      return { success: true, message: 'Password reset successful' };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Rate limit exceeded')) {
          throw new Error('Too many attempts. Please try again later.');
        }
        throw error;
      }
      throw new Error('Failed to reset password');
    }
  }
} 