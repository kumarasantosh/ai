import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch("http://16.171.31.174:3000/voices");
  const data = await res.json();
  console.log(data);
  return NextResponse.json(data);
}
