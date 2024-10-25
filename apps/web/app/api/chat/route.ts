import { createOpenAI } from "@ai-sdk/openai";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { streamText } from "ai";
import { type NextRequest, NextResponse } from "next/server";

const initializeOpenAi = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  compatibility: "strict",
});

export async function POST(req: NextRequest) {
  const { prompt, videoBlob } = await req.json();

  try {
    // Analyze video blob (this is a placeholder, replace with actual implementation)
    const blob = new Blob([videoBlob], { type: "video/webm" });

    const videoAnalysis = `data:image/png;base64,${Buffer.from(await blob.arrayBuffer()).toString("base64")}`;
    console.log("videoAnalysis", videoAnalysis);
    const openAiModel = initializeOpenAi("gpt-4o-mini");
    // Generate response using OpenAI
    const response = await streamText({
      model: openAiModel,
      temperature: 0.9,
      messages: [
        {
          role: "system",
          content:
            // biome-ignore lint/style/useTemplate: <explanation>
            "Analyze the Blob video text below and provide a response based on the given prompt up to 280 characters. " +
            `Focus on analyzing the video content and providing a response based on the prompt:
            ` +
            videoAnalysis,
        },
        { role: "user", content: prompt },
      ],
    });
    const responseStream = response.toDataStreamResponse()
      .body as ReadableStream;

    return new Response(responseStream, {
      headers: { "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

async function analyzeVideoBlob(videoBlob: Blob): Promise<string> {
  const ffmpeg = new FFmpeg();
  await ffmpeg.load();

  // Convert Blob to ArrayBuffer
  const arrayBuffer = await videoBlob.arrayBuffer();
  const videoFile = new Uint8Array(arrayBuffer);

  // Write the video file to FFmpeg's virtual file system
  ffmpeg.writeFile("input.webm", videoFile);

  // Extract frames from the video
  await ffmpeg.exec(["-i", "input.webm", "-vf", "fps=1", "frame_%04d.png"]);

  // Read the extracted frames
  const files = await ffmpeg.listDir(".");
  const frames = files.filter(
    (file) => !file.isDir && file.name.endsWith(".png")
  );

  // Convert frames to base64 strings
  const frameDataPromises = frames.map(async (frame) => {
    const frameFile = await ffmpeg.readFile(frame.name);
    const base64String = Buffer.from(frameFile).toString("base64");
    return `data:image/png;base64,${base64String}`;
  });

  const frameData = await Promise.all(frameDataPromises);

  // Clean up the virtual file system
  for (const frame of frames) {
    if (frame.isDir) continue;
    ffmpeg.deleteFile(frame.name);
  }
  ffmpeg.deleteFile("input.webm");

  // Return the frame data as a JSON string
  return JSON.stringify(frameData);
}
