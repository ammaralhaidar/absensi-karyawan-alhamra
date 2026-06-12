import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { employee_id, type } = await request.json();

    if (!employee_id) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/qr-generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ employee_id, type: type || "check_in" }),
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
