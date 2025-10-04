import { Response } from 'App/Utils/ApiUtil';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Complaint from 'App/Models/Complaint';
import ComplaintValidator from 'App/Validators/ComplaintValidator';
import Mail from '@ioc:Adonis/Addons/Mail';

export default class ComplaintsController {
    public async store({ request, response }: HttpContextContract) {
        try {
            const complaintData = await request.validate(ComplaintValidator)
            // Set default status to 'pending' if not provided
            const complaint = await Complaint.create({
                ...complaintData,
                status: 'pending'
            })

            // Send confirmation email to customer
            try {
                const { name, email, phone, description } = complaint
                const complaintId = complaint.id
                const formattedDate = complaint.createdAt.toFormat('MMM dd, yyyy')
                const formattedTime = complaint.createdAt.toFormat('hh:mm a')
                
                await Mail.send((message) => {
                    message
                        .to(email)
                        .from('support@udaricrafts.com', 'Udari Crafts Support')
                        .subject(`✅ Complaint Received - Reference #${complaintId} - Udari Crafts`)
                        .html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Complaint Received</title>
    <!--[if mso]>
    <style type="text/css">
        body, table, td {font-family: Arial, sans-serif !important;}
    </style>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
    
    <!-- Preheader Text (Hidden) -->
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">
        Your complaint has been received! Reference #${complaintId}. We'll respond within 24-48 hours.
    </div>
    
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);">
        <tr>
            <td align="center" style="padding: 50px 20px;">
                
                <!-- Main Container -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); overflow: hidden;">
                    
                    <!-- Header with Gradient -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 0; text-align: center;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 50px 40px; text-align: center;">
                                        <h1 style="margin: 0 0 10px 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: 2px;">UDARI CRAFTS</h1>
                                        <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 14px; letter-spacing: 1px;">HANDCRAFTED WITH LOVE</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Success Badge -->
                    <tr>
                        <td align="center" style="padding: 40px 40px 20px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td align="center" style="width: 90px; height: 90px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3); vertical-align: middle; line-height: 90px;">
                                        <span style="font-size: 48px; line-height: 90px;">✅</span>
                                    </td>
                                </tr>
                            </table>
                            <h2 style="margin: 24px 0 12px 0; color: #111827; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;">Complaint Received! 📝</h2>
                            <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 17px; line-height: 1.6;">
                                Hi <strong style="color: #667eea;">${name}</strong>,<br>
                                Thank you for contacting us. We've received your complaint and our support team will review it shortly.
                            </p>
                            
                            <!-- Prominent Reference Number -->
                            <div style="display: inline-block; padding: 16px 24px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; border: 2px solid #f59e0b; margin-top: 8px;">
                                <p style="margin: 0 0 4px 0; color: #92400e; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Your Reference Number</p>
                                <p style="margin: 0; color: #78350f; font-size: 24px; font-weight: 800; font-family: 'Courier New', monospace; letter-spacing: 0.5px;">#${complaintId}</p>
                                <p style="margin: 6px 0 0 0; color: #d97706; font-size: 11px; font-weight: 600;">📋 Please save this number for future reference</p>
                            </div>
                        </td>
                    </tr>

                    <!-- Complaint Details Card -->
                    <tr>
                        <td style="padding: 0 40px 35px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); border-radius: 16px; border: 2px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                                <tr>
                                    <td style="padding: 30px;">
                                        <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 18px; font-weight: 700;">Complaint Details</h3>
                                        
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                                    <p style="margin: 0; color: #9ca3af; font-size: 13px; font-weight: 600;">Reference Number</p>
                                                    <p style="margin: 4px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 700; font-family: 'Courier New', monospace;">#${complaintId}</p>
                                                </td>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                                                    <p style="margin: 0; color: #9ca3af; font-size: 13px; font-weight: 600;">Status</p>
                                                    <p style="margin: 4px 0 0 0;">
                                                        <span style="display: inline-block; padding: 4px 12px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); color: #92400e; border-radius: 20px; font-size: 12px; font-weight: 700;">⏳ Pending Review</span>
                                                    </p>
                                                </td>
                                            </tr>
                                            
                                            <tr>
                                                <td colspan="2" style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                                    <p style="margin: 0; color: #9ca3af; font-size: 13px; font-weight: 600;">Date & Time Submitted</p>
                                                    <p style="margin: 4px 0 0 0; color: #1f2937; font-size: 15px; font-weight: 600;">📅 ${formattedDate} at ${formattedTime}</p>
                                                </td>
                                            </tr>
                                            
                                            <tr>
                                                <td colspan="2" style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                                    <p style="margin: 0; color: #9ca3af; font-size: 13px; font-weight: 600;">Contact Information</p>
                                                    <p style="margin: 4px 0 0 0; color: #1f2937; font-size: 15px; font-weight: 600;">📧 ${email}</p>
                                                    <p style="margin: 4px 0 0 0; color: #1f2937; font-size: 15px; font-weight: 600;">📱 ${phone}</p>
                                                </td>
                                            </tr>
                                            
                                            <tr>
                                                <td colspan="2" style="padding: 12px 0;">
                                                    <p style="margin: 0 0 8px 0; color: #9ca3af; font-size: 13px; font-weight: 600;">Your Message</p>
                                                    <div style="background: #ffffff; padding: 16px; border-radius: 8px; border-left: 4px solid #667eea;">
                                                        <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${description}</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- What Happens Next Timeline -->
                    <tr>
                        <td style="padding: 0 40px 35px;">
                            <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px; font-weight: 700; text-align: center;">What Happens Next? 🔄</h3>
                            
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="width: 50px; vertical-align: top; text-align: center; padding-right: 15px;">
                                        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 20px; line-height: 40px;">1️⃣</div>
                                    </td>
                                    <td style="padding: 8px 0 20px 0;">
                                        <h4 style="margin: 0 0 4px 0; color: #1f2937; font-size: 16px; font-weight: 700;">Review (Within 24-48 Hours)</h4>
                                        <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">Our support team will carefully review your complaint and assess the situation.</p>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td style="width: 50px; vertical-align: top; text-align: center; padding-right: 15px;">
                                        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 20px; line-height: 40px;">2️⃣</div>
                                    </td>
                                    <td style="padding: 8px 0 20px 0;">
                                        <h4 style="margin: 0 0 4px 0; color: #1f2937; font-size: 16px; font-weight: 700;">Investigation & Analysis</h4>
                                        <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">We'll investigate the issue thoroughly and gather all necessary information.</p>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td style="width: 50px; vertical-align: top; text-align: center; padding-right: 15px;">
                                        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 20px; line-height: 40px;">3️⃣</div>
                                    </td>
                                    <td style="padding: 8px 0;">
                                        <h4 style="margin: 0 0 4px 0; color: #1f2937; font-size: 16px; font-weight: 700;">Resolution & Response</h4>
                                        <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">We'll contact you via email or phone with our findings and proposed solution.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Important Notice Banner -->
                    <tr>
                        <td style="padding: 0 40px 35px;">
                            <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-left: 4px solid #3b82f6; border-radius: 12px; padding: 20px;">
                                <h4 style="margin: 0 0 8px 0; color: #1e40af; font-size: 16px; font-weight: 700;">💡 Important Information</h4>
                                <ul style="margin: 0; padding-left: 20px; color: #1e3a8a; font-size: 14px; line-height: 1.6;">
                                    <li style="margin-bottom: 6px;">Keep reference number <strong>#${complaintId}</strong> for tracking</li>
                                    <li style="margin-bottom: 6px;">Response time: <strong>24-48 business hours</strong></li>
                                    <li style="margin-bottom: 6px;">Check your email regularly for updates</li>
                                    <li>For urgent matters, call our support line</li>
                                </ul>
                            </div>
                        </td>
                    </tr>

                    <!-- Contact Support Button -->
                    <tr>
                        <td align="center" style="padding: 0 40px 40px;">
                            <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 14px;">Need to add more details or have questions?</p>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td style="border-radius: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                                        <a href="mailto:support@udaricrafts.com?subject=Complaint%20%23${complaintId}" style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 16px; letter-spacing: 0.5px;">
                                            📧 Contact Support
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); padding: 40px; text-align: center;">
                            <h3 style="margin: 0 0 15px 0; color: #ffffff; font-size: 20px; font-weight: 700;">Thank You for Your Patience! 🙏</h3>
                            <p style="margin: 0 0 20px 0; color: #d1d5db; font-size: 14px; line-height: 1.6;">
                                We take all complaints seriously and are committed to resolving your issue.<br>
                                Your satisfaction is our priority.
                            </p>
                            
                            <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; margin-top: 20px;">
                                <p style="margin: 0 0 8px 0; color: #9ca3af; font-size: 13px;">
                                    📧 support@udaricrafts.com | 📱 +92 XXX XXXXXXX
                                </p>
                                <p style="margin: 0; color: #6b7280; font-size: 12px;">
                                    © ${new Date().getFullYear()} Udari Crafts. All rights reserved.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                </table>
                
            </td>
        </tr>
    </table>
    
</body>
</html>
                        `)
                })
                console.log(`✅ Complaint confirmation email sent to ${email}`)
            } catch (emailError) {
                console.error('Failed to send complaint confirmation email:', emailError)
                // Don't fail the request if email fails, just log it
            }

            return response.send(Response('Complaint Submitted Successfully', complaint))
        } catch (error) {
            console.log(error);
            return response.status(400).send(error)
        }
    }

    public async update({ request, params, response }: HttpContextContract) {
        try {
            const complaint = await Complaint.findOrFail(params.id)
            const status = await request.input('status')
            await complaint.merge({ status: status }).save()
            return response.send(Response('Complaint Updated Successfully', complaint))
        } catch (error) {
            console.log(error);
            return response.status(400).send(error)
        }
    }

    public async sendEmail({ request, response }: HttpContextContract) {
        const { to, from, subject, text } = request.only(['to', 'from', 'subject', 'text'])

        try {
            // Extract complaint reference from subject if present
            const refMatch = subject.match(/#(\d+)/)
            const complaintRef = refMatch ? refMatch[1] : 'N/A'
            
            await Mail.send((message) => {
                message
                    .to(to)
                    .from(from || 'support@udaricrafts.com', 'Udari Crafts Support')
                    .subject(subject)
                    .html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Response to Your Complaint</title>
    <!--[if mso]>
    <style type="text/css">
        body, table, td {font-family: Arial, sans-serif !important;}
    </style>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
    
    <!-- Preheader Text (Hidden) -->
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">
        Response to your complaint - Udari Crafts Support Team
    </div>
    
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);">
        <tr>
            <td align="center" style="padding: 50px 20px;">
                
                <!-- Main Container -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); overflow: hidden;">
                    
                    <!-- Header with Gradient -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 0; text-align: center;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 50px 40px; text-align: center;">
                                        <h1 style="margin: 0 0 10px 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: 2px;">UDARI CRAFTS</h1>
                                        <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 14px; letter-spacing: 1px;">CUSTOMER SUPPORT</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Icon Badge -->
                    <tr>
                        <td align="center" style="padding: 40px 40px 20px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td align="center" style="width: 90px; height: 90px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 50%; box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3); vertical-align: middle; line-height: 90px;">
                                        <span style="font-size: 48px; line-height: 90px;">💬</span>
                                    </td>
                                </tr>
                            </table>
                            <h2 style="margin: 24px 0 12px 0; color: #111827; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Response to Your Complaint</h2>
                            ${complaintRef !== 'N/A' ? `
                            <div style="display: inline-block; padding: 8px 16px; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 8px; margin-top: 8px;">
                                <p style="margin: 0; color: #1e40af; font-size: 13px; font-weight: 700;">Reference: #${complaintRef}</p>
                            </div>
                            ` : ''}
                        </td>
                    </tr>

                    <!-- Message Content -->
                    <tr>
                        <td style="padding: 0 40px 35px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); border-radius: 16px; border: 2px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                                <tr>
                                    <td style="padding: 30px;">
                                        <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                                            📩 Message from Support Team
                                        </h3>
                                        <div style="background: #ffffff; padding: 20px; border-radius: 12px; border-left: 4px solid #667eea;">
                                            <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${text}</p>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Action Section -->
                    <tr>
                        <td style="padding: 0 40px 35px;">
                            <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 12px; padding: 24px; text-align: center; border: 2px solid #93c5fd;">
                                <p style="margin: 0 0 16px 0; color: #1e40af; font-size: 15px; font-weight: 600; line-height: 1.6;">
                                    💡 Need further assistance? We're here to help!
                                </p>
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                                    <tr>
                                        <td style="border-radius: 10px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                                            <a href="mailto:support@udaricrafts.com" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 15px; letter-spacing: 0.5px;">
                                                📧 Reply to This Email
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </td>
                    </tr>

                    <!-- Contact Information -->
                    <tr>
                        <td style="padding: 0 40px 40px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 20px; background: #f9fafb; border-radius: 12px; text-align: center;">
                                        <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px; font-weight: 600;">📞 Contact Support</p>
                                        <p style="margin: 0 0 4px 0; color: #374151; font-size: 13px;">
                                            Email: <a href="mailto:support@udaricrafts.com" style="color: #667eea; text-decoration: none; font-weight: 600;">support@udaricrafts.com</a>
                                        </p>
                                        <p style="margin: 0; color: #374151; font-size: 13px;">
                                            Phone: <span style="font-weight: 600;">+92 XXX XXXXXXX</span>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); padding: 40px; text-align: center;">
                            <h3 style="margin: 0 0 12px 0; color: #ffffff; font-size: 18px; font-weight: 700;">Thank You for Your Patience! 🙏</h3>
                            <p style="margin: 0 0 20px 0; color: #d1d5db; font-size: 13px; line-height: 1.6;">
                                We value your feedback and strive to provide the best service possible.<br>
                                Your satisfaction is our priority.
                            </p>
                            
                            <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; margin-top: 20px;">
                                <p style="margin: 0 0 8px 0; color: #9ca3af; font-size: 12px;">
                                    © ${new Date().getFullYear()} Udari Crafts. All rights reserved.
                                </p>
                                <p style="margin: 0; color: #6b7280; font-size: 11px;">
                                    Handcrafted with love ❤️
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                </table>
                
            </td>
        </tr>
    </table>
    
</body>
</html>
                    `)
            })

            return response.send(Response('Email Send Successfully', { to, from, subject, text }))
        } catch (error) {
            console.error(error)
            return response.status(500).send({ message: 'Failed to send email', error: error.message })
        }
    }

    public async index({ request, response }: HttpContextContract) {
        try {
            const { date, name, status } = request.qs()
            let query = Complaint.query()
            if (date) {
                query = query.where('created_at', date)
            }
            if (name) {
                query = query.where('name', 'like', `%${name}%`)
            }
            if (status) {
                query = query.where('status', status)
            }
            const page = request.input('page', 1)
            const limit = request.input('limit', 10)
            const results = await query.paginate(page, limit)

            return response.send(Response('Get All Complaints with Pagination', results))
        } catch (error) {
            return response.status(500).send(Response('internal server error', error))
        }
    }

    public async destroy({ params, response }: HttpContextContract) {
        try {
            const complaint = await Complaint.findOrFail(params.id)
            await complaint.delete()
            return response.send(Response('Complaint Deleted Successfully', complaint))
        } catch (error) {
            console.log(error);
            return response.status(404).send(Response('Complaint not found', error))
        }
    }
}

