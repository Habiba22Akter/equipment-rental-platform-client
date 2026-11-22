import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

type ImgbbResponse = {
  success?: boolean;
  data?: {
    url?: string;
    display_url?: string;
  };
  error?: {
    message?: string;
  };
};

/**
 * Small server-side proxy for ImgBB so the API key stays on the server instead
 * of being shipped to every browser with a NEXT_PUBLIC_ variable.
 */
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in before uploading an image." }, { status: 401 });
  }

  const apiKey = process.env.IMGBB_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error: "ImgBB is not configured. Add IMGBB_API_KEY to equipment-rental-platform-client/.env and restart Next.js.",
      },
      { status: 503 },
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed." }, { status: 415 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Keep the image under 5 MB." }, { status: 413 });
  }

  const uploadBody = new FormData();
  uploadBody.append("image", file);

  try {
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        body: uploadBody,
        cache: "no-store",
      },
    );

    const payload = (await response.json()) as ImgbbResponse;
    const url = payload.data?.url ?? payload.data?.display_url;

    if (!response.ok || !payload.success || !url) {
      return NextResponse.json(
        { error: payload.error?.message || "ImgBB rejected the upload." },
        { status: 502 },
      );
    }

    return NextResponse.json({ url });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the image host. Please try again." },
      { status: 502 },
    );
  }
}
