import { createReadStream, statSync } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';

export async function GET(request: NextRequest) {
  const videoPath = join(process.cwd(), 'public', 'sample-video.mp4');
  const stat = statSync(videoPath);
  const fileSize = stat.size;
  const range = request.headers.get('range');

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = createReadStream(videoPath, { start, end });
    const headers = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize.toString(),
      'Content-Type': 'video/mp4',
    };
    return new NextResponse(file as any, { status: 206, headers });
  } else {
    const headers = {
      'Content-Length': fileSize.toString(),
      'Content-Type': 'video/mp4',
    };
    const file = createReadStream(videoPath);
    return new NextResponse(file as any, { status: 200, headers });
  }
}