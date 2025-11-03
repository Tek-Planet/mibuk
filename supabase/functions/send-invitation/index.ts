import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const body = await req.json().catch(() => ({}));
    const { invitationId, redirectTo: redirectToFromClient } = body;

    // Build a safe redirect URL for invite acceptance
    const originHeader = req.headers.get("origin") || "";
    const defaultBase = originHeader || (Deno.env.get("SITE_URL") ?? "");
    const base = defaultBase.replace(/\/$/, "");
    const redirectTo = redirectToFromClient || (base ? `${base}/auth?type=invite` : undefined);

    // Fetch the invitation details
    const { data: invitation, error: inviteError } = await supabaseAdmin
      .from("organization_invitations")
      .select("*, businesses(business_name)")
      .eq("id", invitationId)
      .single();

    if (inviteError || !invitation) {
      throw new Error("Invitation not found");
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUser?.users.some(u => u.email === invitation.email);

    let data;
    let error;

    if (userExists) {
      // User already exists, they just need to log in to see the invitation
      console.log("User already exists, skipping invitation email:", invitation.email);
      data = { message: "User already exists, invitation created" };
    } else {
      // New user, send invitation email
      const result = await supabaseAdmin.auth.admin.inviteUserByEmail(
        invitation.email,
        {
          redirectTo,
          data: {
            business_name: invitation.businesses?.business_name,
            business_id: invitation.business_id,
          },
        }
      );
      
      if (result.error) {
        console.error("Error sending invitation:", result.error);
        throw result.error;
      }
      
      data = result.data;
      console.log("Invitation sent successfully to:", invitation.email);
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in send-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
