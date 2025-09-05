import nodemailer from 'nodemailer';

// Create transporter for nodemailer
const createTransporter = () => {
  // Check if we have email credentials in environment
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Mock transporter for development (logs emails to console)
    return {
      sendMail: async (mailOptions) => {
        console.log('📧 Mock Email Sent:');
        console.log('   To:', mailOptions.to);
        console.log('   Subject:', mailOptions.subject);
        console.log('   Content:', mailOptions.html);
        console.log('   OTP:', mailOptions.text);
        return { messageId: 'mock-' + Date.now() };
      },
      verify: async () => true,
    };
  }
};

// Send OTP email
export const sendOTP = async (email, otp) => {
  try {
    const transporter = createTransporter();
    
    // Verify transporter connection
    await transporter.verify();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@erp.com',
      to: email,
      subject: 'Your OTP for Student ERP Admin Login',
      text: `Your OTP is: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Student ERP System</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; text-align: center; margin-bottom: 30px;">🔐 Admin Login OTP</h2>
            
            <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
                Hello! You have requested an OTP for admin login to the Student ERP System.
              </p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <p style="color: #333; font-size: 14px; margin-bottom: 10px;">Your OTP for admin login is:</p>
                <div style="background: #667eea; color: white; font-size: 32px; font-weight: bold; padding: 15px; border-radius: 8px; letter-spacing: 5px; font-family: 'Courier New', monospace;">
                  ${otp}
                </div>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
                <strong>⚠️ Important:</strong> This OTP will expire in 10 minutes for security reasons.
              </p>
              
              <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
                If you didn't request this OTP, please ignore this email and contact system administrator immediately.
              </p>
              
              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #999; font-size: 12px;">
                  This is an automated message. Please do not reply to this email.
                </p>
              </div>
            </div>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} Student ERP System. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('📧 OTP email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

// Verify OTP (this function can be extended for additional verification logic)
export const verifyOTP = async (email, otp) => {
  // This function can be used for additional OTP verification logic
  // For now, it just returns true as verification is handled in the route
  return true;
};

// Send general notification email
export const sendNotification = async (email, subject, message) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@erp.com',
      to: email,
      subject: subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Student ERP System</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-bottom: 20px;">${subject}</h2>
              <div style="color: #666; font-size: 16px; line-height: 1.6;">
                ${message}
              </div>
            </div>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} Student ERP System. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('📧 Notification email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Error sending notification email:', error);
    throw new Error('Failed to send notification email');
  }
};

// Send bulk emails (for announcements, circulars)
export const sendBulkEmail = async (emails, subject, message) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@erp.com',
      bcc: emails, // Use BCC for bulk emails
      subject: subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Student ERP System</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-bottom: 20px;">${subject}</h2>
              <div style="color: #666; font-size: 16px; line-height: 1.6;">
                ${message}
              </div>
            </div>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} Student ERP System. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`📧 Bulk email sent successfully to ${emails.length} recipients:`, result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Error sending bulk email:', error);
    throw new Error('Failed to send bulk email');
  }
}; 