import axios from "axios";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { accessToken, content } = await req.json();

  try {
    const response = await axios.post(`https://graph.facebook.com/me/feed`, {
      message: content,
      access_token: accessToken,
    });
    return NextResponse.json({ success: true, data: response.data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
