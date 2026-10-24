import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { smspool } from "@/lib/providers";
export async function GET(){try{if(!await isAdmin())return NextResponse.json({orders:[]});const {data,error}=await db().from("orders").select("*").order("created_at",{ascending:false}).limit(100);if(error)throw error;return NextResponse.json({orders:data||[]});}catch(e:any){return NextResponse.json({error:e.message,orders:[]},{status:500});}}
export async function POST(req:Request){try{const body=await req.json();if(!body.service||!body.country)return NextResponse.json({error:"Pilih layanan dan negara."},{status:400});
// Provider-specific purchase parameters vary by SMSPool service; fail safely until confirmed in provider docs.
const result=await smspool("sms/buy",{service:body.service,country:body.country},"POST");
const order={provider_order_id:String(result.order_id??result.id??""),service:String(body.service),phone_number:String(result.number??result.phone_number??""),status:String(result.status??"pending"),price:Number(result.price??result.cost??0),provider_response:result};
const {data,error}=await db().from("orders").insert(order).select().single();if(error)throw error;return NextResponse.json({order:{id:data.id,number:data.phone_number,status:data.status,service:data.service,price:data.price}});}catch(e:any){return NextResponse.json({error:e.message||"Order gagal dibuat."},{status:502});}}