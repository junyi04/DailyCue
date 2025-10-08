import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Supabase 서버 클라이언트
const supabase = createClient(
  Deno.env.get("SB_URL")!,
  Deno.env.get("SB_SERVICE_ROLE_KEY")!
);

serve(async (req: Request) => {
  try {
    const { accessToken } = await req.json();

    if (!accessToken) {
      return new Response(JSON.stringify({ error: "Missing accessToken" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // kakao 사용자 정보 요청
    const kakaoRes = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    });

    if (!kakaoRes.ok) {
      const errText = await kakaoRes.text();
      console.error("Kakao API Error:", errText);
      return new Response(JSON.stringify({ error: "Invalid Kakao token" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const kakaoUser = await kakaoRes.json();
    const kakaoId = kakaoUser.id.toString();
    const email = kakaoUser.kakao_account?.email || `${kakaoId}@kakao.user`;
    const nickname = kakaoUser.kakao_account?.profile?.nickname || "Kakao User";

    console.log("Kakao user:", email, nickname);

    // Supabase 유저 리스트 조회 후 필터링
    const { data: userList, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const existingUser = userList?.users?.find((u: any) => u.email === email);

    if (existingUser) {
      console.log("🔹 Existing user found:", email);

      const { data: tokenData, error: tokenError } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email,
      });
      if (tokenError) throw tokenError;

      return new Response(
        JSON.stringify({
          message: "다시 만나서 반가워요! 로그인되었습니다.",
          data: tokenData,
          status: "login",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 새 유저는 회원가입 후 로그인
    console.log("Creating new user:", email);
    const { error: createError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { kakao_id: kakaoId, nickname },
    });
    if (createError) throw createError;

    const { data: tokenData, error: tokenError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    if (tokenError) throw tokenError;

    console.log("Signup + Login complete:", email);

    return new Response(
      JSON.stringify({
        message: "가입해주셔서 감사합니다! 🎉",
        data: tokenData,
        status: "signup",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("서버 오류:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
