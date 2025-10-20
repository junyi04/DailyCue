import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  try {
    const supabase = createClient(
      Deno.env.get("SB_URL")!,
      Deno.env.get("SB_SERVICE_ROLE_KEY")!
    );

    const { idToken } = await req.json();

    if (!idToken) {
      return new Response(JSON.stringify({ error: "Missing accessToken" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ Kakao 토큰을 Supabase Auth로 전달
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "kakao",
      token: idToken,
    });

    if (error) {
      console.error("Supabase Auth Error:", error.message);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // data 안에는 user, session이 모두 들어있음
    // -> access_token, refresh_token을 프론트로 전달
    return new Response(JSON.stringify(data.session), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("서버 오류:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});