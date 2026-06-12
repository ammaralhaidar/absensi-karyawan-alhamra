import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { token, kiosk_id } = await request.json();

    const supabase = await createClient();

    const { data, error } = await supabase.functions.invoke("qr-validate", {
      body: { token, kiosk_id },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
