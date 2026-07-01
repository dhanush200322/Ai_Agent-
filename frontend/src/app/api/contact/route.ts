import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const inquiryType = formData.get("inquiryType") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;
    
    const attachmentFiles = formData.getAll("attachments") as File[];
    
    const attachments = await Promise.all(
      attachmentFiles.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return {
          filename: file.name,
          content: buffer,
        };
      })
    );

    const { data, error } = await resend.emails.send({
      from: "Nexora AI <onboarding@resend.dev>", // Using Resend's default test domain
      to: ["ro224313@gmail.com"], // Fixed to the requested email
      subject: `New Inquiry from ${firstName} ${lastName}: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Inquiry Type:</strong> ${inquiryType}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <br/>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br/>')}</p>
      `,
      attachments,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Contact Form Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while sending the message." },
      { status: 500 }
    );
  }
}
