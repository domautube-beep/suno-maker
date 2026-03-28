import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const REQUEST_FILE = path.join(DATA_DIR, "request.json");
const OUTPUT_FILE = path.join(DATA_DIR, "output.json");

// POST: 생성 요청 저장
export async function POST(req: NextRequest) {
  const body = await req.json();
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(REQUEST_FILE, JSON.stringify(body, null, 2), "utf-8");
  return NextResponse.json({ status: "saved", file: REQUEST_FILE });
}

// GET: 생성 결과 읽기
export async function GET() {
  try {
    const data = await fs.readFile(OUTPUT_FILE, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json({ status: "waiting" }, { status: 202 });
  }
}
