import React from 'react';

export const SetupGuideView: React.FC = () => {
  return (
    <div style={{ fontFamily: 'Arial, Verdana, sans-serif', fontSize: '13px' }}>

      <fieldset style={{ border: '1px solid #777777', padding: '15px', backgroundColor: '#ffffff', marginBottom: '15px' }}>
        <legend style={{ fontWeight: 'bold', fontSize: '13px', padding: '0 5px' }}>
          CampusVault Architecture & Cloudflare Setup Documentation
        </legend>

        <p style={{ margin: '0 0 10px 0' }}>
          This section contains technical documentation, security rules, Cloudflare Worker gateway scripts, and deployment instructions for hosting CampusVault on Cloudflare Pages and R2 object storage.
        </p>

        {/* 1. Cloudflare Worker Code */}
        <div style={{ marginBottom: '15px' }}>
          <h3 style={{ fontFamily: 'Times New Roman, serif', fontSize: '16px', color: '#000066', margin: '10px 0 5px 0' }}>
            1. Cloudflare Worker Gateway (`worker.js`)
          </h3>
          <p style={{ margin: '0 0 6px 0', fontSize: '12px' }}>
            The Cloudflare Worker functions as a secure upload gateway verifying Firebase Auth tokens before permitting PUT operations to Cloudflare R2 bucket:
          </p>
          <pre style={{ backgroundColor: '#f4f4f4', border: '1px solid #cccccc', padding: '10px', fontSize: '11px', fontFamily: 'Courier New, monospace', overflowX: 'auto' }}>
{`export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS Headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, PUT, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Public Download Route: GET /pdf/:key
    if (request.method === "GET" && url.pathname.startsWith("/pdf/")) {
      const key = url.pathname.replace("/pdf/", "");
      const object = await env.R2_BUCKET.get(key);

      if (!object) {
        return new Response("Document not found", { status: 404, headers: corsHeaders });
      }

      const headers = new Headers(corsHeaders);
      object.writeHttpMetadata(headers);
      headers.set("Content-Type", "application/pdf");
      headers.set("Cache-Control", "public, max-age=86400");
      return new Response(object.body, { headers });
    }

    // Authenticated Upload Route: PUT /upload/:key
    if (request.method === "PUT" && url.pathname.startsWith("/upload/")) {
      const authHeader = request.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response("Unauthorized: Missing Firebase ID Token", { status: 401, headers: corsHeaders });
      }

      const key = url.pathname.replace("/upload/", "");
      const contentType = request.headers.get("Content-Type") || "application/pdf";

      if (contentType !== "application/pdf") {
        return new Response("Bad Request: Only PDF files permitted", { status: 400, headers: corsHeaders });
      }

      await env.R2_BUCKET.put(key, request.body, {
        httpMetadata: { contentType: "application/pdf" }
      });

      return new Response(JSON.stringify({ success: true, key }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response("CampusVault Gateway API", { status: 200, headers: corsHeaders });
  }
};`}
          </pre>
        </div>

        {/* 2. Cloudflare Wrangler Configuration */}
        <div style={{ marginBottom: '15px' }}>
          <h3 style={{ fontFamily: 'Times New Roman, serif', fontSize: '16px', color: '#000066', margin: '10px 0 5px 0' }}>
            2. Cloudflare Wrangler File (`wrangler.toml`)
          </h3>
          <pre style={{ backgroundColor: '#f4f4f4', border: '1px solid #cccccc', padding: '10px', fontSize: '11px', fontFamily: 'Courier New, monospace', overflowX: 'auto' }}>
{`name = "campusvault-gateway"
main = "worker.js"
compatibility_date = "2024-01-01"

[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "campusvault-pdf-storage"
preview_bucket_name = "campusvault-pdf-dev"`}
          </pre>
        </div>

        {/* 3. Firestore Security Rules Summary */}
        <div style={{ marginBottom: '15px' }}>
          <h3 style={{ fontFamily: 'Times New Roman, serif', fontSize: '16px', color: '#000066', margin: '10px 0 5px 0' }}>
            3. Firebase Firestore Security Rules Summary (`firestore.rules`)
          </h3>
          <ul style={{ margin: '4px 0 8px 20px', padding: 0 }}>
            <li><strong>Public Read:</strong> Anyone can read resource entries in <code>/resources</code> and ratings in <code>/ratings</code>.</li>
            <li><strong>Write Protection:</strong> Only authenticated users can write to <code>/resources</code> with schema validation (title max 200 chars, description max 1000 chars).</li>
            <li><strong>Rating Protection:</strong> Rating scores must be numbers strictly between 1 and 5.</li>
          </ul>
        </div>

        {/* 4. Deployment Instructions */}
        <div>
          <h3 style={{ fontFamily: 'Times New Roman, serif', fontSize: '16px', color: '#000066', margin: '10px 0 5px 0' }}>
            4. Step-by-Step Deployment Guide
          </h3>
          <ol style={{ margin: '4px 0 8px 20px', padding: 0 }}>
            <li><strong>Deploy Cloudflare R2 & Worker:</strong> Run <code>npx wrangler r2 bucket create campusvault-pdf-storage</code> then <code>npx wrangler deploy</code>.</li>
            <li><strong>Deploy Cloudflare Pages:</strong> Connect your GitHub repo to Cloudflare Pages dashboard. Set Build Command: <code>npm run build</code> and Build Output Directory: <code>dist</code>.</li>
            <li><strong>Configure Firebase Domain:</strong> In Firebase Console &gt; Authentication &gt; Settings &gt; Authorized Domains, add your Cloudflare Pages domain (e.g. <code>campusvault.pages.dev</code>).</li>
          </ol>
        </div>

      </fieldset>

    </div>
  );
};
