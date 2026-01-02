import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "threat-analysis":
        systemPrompt = `You are a military drone swarm tactical AI. Analyze threat data and provide concise tactical assessments. 
        Format your response as:
        - THREAT LEVEL: [CRITICAL/HIGH/MEDIUM/LOW]
        - ASSESSMENT: [1-2 sentences]
        - RECOMMENDED ACTION: [1 sentence]
        Keep responses under 50 words total.`;
        userPrompt = `Analyze this threat situation: ${JSON.stringify(data)}`;
        break;

      case "natural-command":
        systemPrompt = `You are a drone swarm command interpreter. Convert natural language commands into structured actions.
        Valid actions: DEPLOY, RECALL, PATROL, INTERCEPT, EVADE, FORM_PERIMETER, CONCENTRATE
        Valid targets: all, scouts, relays, trackers, interceptors, or specific drone IDs
        Respond ONLY with JSON: {"action": "ACTION_NAME", "target": "target", "parameters": {}}`;
        userPrompt = `Interpret this command: "${data.command}"`;
        break;

      case "swarm-optimization":
        systemPrompt = `You are a swarm optimization AI. Analyze swarm state and suggest tactical improvements.
        Provide exactly 3 suggestions, each under 15 words. Format as JSON array:
        [{"priority": "HIGH/MEDIUM/LOW", "suggestion": "text", "impact": "text"}]`;
        userPrompt = `Optimize this swarm configuration: ${JSON.stringify(data)}`;
        break;

      default:
        throw new Error("Unknown request type");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ result: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ai-swarm function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
