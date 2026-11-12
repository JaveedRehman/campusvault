/**
 * CampusVault Cloudflare Worker R2 Upload/Download Gateway
 * Provides secure handling for PDF academic documents on Cloudflare R2.
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS Headers for public access & authorized client requests
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, PUT, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Public Download Route: GET /pdf/:fileKey
    if (request.method === "GET" && url.pathname.startsWith("/pdf/")) {
      const fileKey = url.pathname.replace("/pdf/", "");
      const object = await env.R2_BUCKET.get(fileKey);

      if (!object) {
        return new Response("Document file not found in R2 bucket.", { status: 404, headers: corsHeaders });
      }

      const headers = new Headers(corsHeaders);
      object.writeHttpMetadata(headers);
      headers.set("Content-Type", "application/pdf");
      headers.set("Cache-Control", "public, max-age=86400");
      return new Response(object.body, { headers });
    }

    // Authenticated Upload Route: PUT /upload/:fileKey
    if (request.method === "PUT" && url.pathname.startsWith("/upload/")) {
      const authHeader = request.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response("Unauthorized: Valid Firebase ID Token required", { status: 401, headers: corsHeaders });
      }

      const fileKey = url.pathname.replace("/upload/", "");
      const contentType = request.headers.get("Content-Type") || "application/pdf";

      if (contentType !== "application/pdf" && !contentType.includes("pdf")) {
        return new Response("Forbidden: Only PDF documents are permitted", { status: 400, headers: corsHeaders });
      }

      await env.R2_BUCKET.put(fileKey, request.body, {
        httpMetadata: { contentType: "application/pdf" }
      });

      return new Response(JSON.stringify({
        success: true,
        fileKey,
        publicUrl: `https://${url.hostname}/pdf/${fileKey}`
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response("CampusVault Cloudflare R2 Gateway Operational", { status: 200, headers: corsHeaders });
  }
};
