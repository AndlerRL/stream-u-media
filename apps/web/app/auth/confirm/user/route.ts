import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.admin.getUserById(id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ data, error }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { data: null, error: (error as Error).message },
      { status: 500 }
    );
  }
}
