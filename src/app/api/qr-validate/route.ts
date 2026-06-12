import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { token, kiosk_id } = await request.json();

    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/qr-validate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ token, kiosk_id: kiosk_id || "kiosk-1" }),
      }
    );

    const data = await resp.json();
    
    if (!resp.ok) {
      return NextResponse.json(data, { status: resp.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
