import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const emailService = {
  credentials: {
    service: 'gmail',
    auth: {
      user: 'fastfoodfast0@gmail.com',
      pass: process.env.PASS,
    },
  },
};

emailService.transporter = nodemailer.createTransport(emailService.credentials);

export default emailService;
