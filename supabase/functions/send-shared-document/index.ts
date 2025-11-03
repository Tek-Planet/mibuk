import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ShareDocumentRequest {
  to: string;
  subject: string;
  documentType: 'sale' | 'invoice' | 'report';
  documentData: any;
  pdfBase64?: string;
  fileName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rely on Supabase gateway JWT verification (see supabase/config.toml)
    // We don't need to call supabase.auth.getUser() here.
    // Proceed to handle the request payload and send the email.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      // Should not happen when verify_jwt=true, but keep a graceful error
      throw new Error("Unauthorized");
    }

    const { to, subject, documentType, documentData, pdfBase64, fileName }: ShareDocumentRequest = await req.json();

    console.log("Sending document:", { to, subject, documentType, fileName });

    let htmlContent = "";
    
    // Generate email content based on document type
    if (documentType === 'sale') {
      htmlContent = `
        <h1>Sales Receipt</h1>
        <p>Thank you for your business!</p>
        <div style="margin: 20px 0;">
          <p><strong>Sale Date:</strong> ${documentData.date}</p>
          <p><strong>Customer:</strong> ${documentData.customer || 'Walk-in Customer'}</p>
          <p><strong>Total Amount:</strong> ${documentData.total}</p>
          <p><strong>Payment Method:</strong> ${documentData.paymentMethod}</p>
        </div>
        <p>Please find the attached receipt for your records.</p>
      `;
    } else if (documentType === 'invoice') {
      htmlContent = `
        <h1>Invoice</h1>
        <div style="margin: 20px 0;">
          <p><strong>Invoice Number:</strong> ${documentData.invoiceNumber}</p>
          <p><strong>Invoice Date:</strong> ${documentData.date}</p>
          <p><strong>Customer:</strong> ${documentData.customer}</p>
          <p><strong>Total Amount:</strong> ${documentData.total}</p>
          <p><strong>Status:</strong> ${documentData.status}</p>
          ${documentData.dueDate ? `<p><strong>Due Date:</strong> ${documentData.dueDate}</p>` : ''}
        </div>
        <p>Please find the attached invoice for your records.</p>
      `;
    } else if (documentType === 'report') {
      htmlContent = `
        <h1>Business Report</h1>
        <p>Please find your requested business report attached.</p>
        <div style="margin: 20px 0;">
          <p><strong>Report Type:</strong> ${documentData.reportType}</p>
          <p><strong>Period:</strong> ${documentData.period}</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
      `;
    }

    const emailData: any = {
      from: "Business Manager <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: htmlContent,
    };

    // Add PDF attachment if provided
    if (pdfBase64 && fileName) {
      emailData.attachments = [
        {
          filename: fileName,
          content: pdfBase64,
        },
      ];
    }

    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      console.error("Resend error:", error);
      throw error;
    }

    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-shared-document function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
