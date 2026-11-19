const nodemailer = require('nodemailer');

// Transport config: support console/smtp/ethereal; lazily initialize transporter to avoid race conditions
const EMAIL_DRIVER = process.env.EMAIL_DRIVER || 'smtp';
let transporter = null;

const getTransporter = async () => {
  if (EMAIL_DRIVER === 'console') return null;
  if (transporter) return transporter;

  if (EMAIL_DRIVER === 'ethereal') {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass }
    });
    console.log('[Email] Ethereal test account created:', testAccount.user);
    return transporter;
  }

  const debugOpts = (process.env.EMAIL_DEBUG === 'true') ? { logger: true, debug: true } : {};
  transporter = nodemailer.createTransport(
    process.env.EMAIL_SERVICE === 'gmail'
      ? {
          service: 'gmail',
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
          ...debugOpts
        }
      : {
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: Number(process.env.EMAIL_PORT || 587),
          secure: String(process.env.EMAIL_PORT || '587') === '465',
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
          ...debugOpts
        }
  );
  return transporter;
};

const sendOTP = async (email, otp) => {
  try {
    // Dev driver: log to console and succeed
    if (EMAIL_DRIVER === 'console') {
      console.log('[DEV EMAIL] OTP for', email, '=>', otp);
      return true;
    }
    const tx = await getTransporter();
    const fromAddress = EMAIL_DRIVER === 'smtp'
      ? (process.env.EMAIL_USER)
      : (process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@alumpoint.local');
    const mailOptions = {
      from: fromAddress,
      to: email,
      subject: 'AlumPoint - Email Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">AlumPoint Email Verification</h2>
          <p>Your OTP for email verification is:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #2563eb; font-size: 32px; margin: 0;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    };

    const info = await tx.sendMail(mailOptions);
    if (EMAIL_DRIVER === 'ethereal') {
      console.log('[DEV EMAIL] Ethereal preview URL:', nodemailer.getTestMessageUrl(info));
    }
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
};

const sendAlumniInvite = async (email, username, password) => {
  try {
    if (EMAIL_DRIVER === 'console') {
      console.log('[DEV EMAIL] Alumni invite for', email, '=>', { username, password });
      return true;
    }
    const tx = await getTransporter();
    const fromAddress = EMAIL_DRIVER === 'smtp'
      ? (process.env.EMAIL_USER)
      : (process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@alumpoint.local');
    const mailOptions = {
      from: fromAddress,
      to: email,
      subject: 'Welcome to AlumPoint - Your Alumni Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to AlumPoint!</h2>
          <p>You've been invited to join our alumni community platform.</p>
          <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0;">
            <h3>Your Login Credentials:</h3>
            <p><strong>Username:</strong> ${username}</p>
            <p><strong>Password:</strong> ${password}</p>
          </div>
          <p>Please log in and complete your profile by uploading your resume.</p>
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/alumni/login" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Login to AlumPoint
          </a>
        </div>
      `
    };

    const info = await tx.sendMail(mailOptions);
    if (EMAIL_DRIVER === 'ethereal') {
      console.log('[DEV EMAIL] Ethereal preview URL:', nodemailer.getTestMessageUrl(info));
    }
    return true;
  } catch (error) {
    console.error('Error sending alumni invite:', error);
    return false;
  }
};

module.exports = { sendOTP, sendAlumniInvite };