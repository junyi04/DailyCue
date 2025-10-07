import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ✅ Supabase 서버 클라이언트 생성
const supabase = createClient(
  Deno.env.get("SB_URL")!,
  Deno.env.get("SB_SERVICE_ROLE_KEY")!
);

serve(async (req: any) => {
  try {
    // ✅ 앱에서 전달된 accessToken 받기
    const { accessToken } = await req.json();

    if (!accessToken) {
      return new Response(JSON.stringify({ error: "Missing accessToken" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ Kakao API로 사용자 정보 조회
    const kakaoRes = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    });

    if (!kakaoRes.ok) {
      const err = await kakaoRes.text();
      console.error("❌ Kakao API Error:", err);
      return new Response(JSON.stringify({ error: "Invalid Kakao token" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const kakaoUser = await kakaoRes.json();
    const kakaoId = kakaoUser.id.toString();
    const email = kakaoUser.kakao_account?.email || `${kakaoId}@kakao.user`;

    console.log("✅ Kakao user:", kakaoUser);

    // ✅ Supabase에 해당 유저 있는지 확인
    const { data: existingUser } = await supabase
      .from("auth.users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    // ✅ 없으면 새 유저 생성
    if (!existingUser) {
      const { error: signupError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          kakao_id: kakaoId,
          nickname: kakaoUser.kakao_account?.profile?.nickname,
        },
      });
      if (signupError) throw signupError;
      console.log("✅ New user created:", email);
    }

    // ✅ 세션(Access Token) 직접 발급
    const { data: tokenData, error: tokenError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

    if (tokenError) throw tokenError;

    console.log("✅ Supabase session link generated");

    return new Response(JSON.stringify({ data: tokenData }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("❌ 서버 오류:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});