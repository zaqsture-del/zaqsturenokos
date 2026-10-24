import { NextResponse } from "next/server";
import { smspool } from "@/lib/providers";
export async function GET(){try{return NextResponse.json(await smspool("request/balance"));}catch(e:any){return NextResponse.json({error:e.message},{status:502});}}