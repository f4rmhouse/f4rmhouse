import { NextRequest, NextResponse } from "next/server";
import { F4SessionStorage } from "@/app/microstore/Session"; 

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('authorization')
    if (authHeader != process.env.SESSION_AUTH_TOKEN) {
        return NextResponse.json({ error: "Unauthorized access"}, { status: 403 }); 
    }
    // const body = await req.json();
    const url = req.nextUrl;
    const sessionFactory = new F4SessionStorage()

    let session_id = url.searchParams.get('uid') ?? ""
    if (!session_id) {
        return NextResponse.json({ error: "Please provide a session id"}, { status: 500 });    
    }

    try {
        let session = await sessionFactory.read(session_id)
        return NextResponse.json(session, { status: 200 });
    } catch(e:any) {
        console.error(e.message)
        return NextResponse.json({ error: e.message ?? "An error occured when creating session"}, { status: e.status ?? 500 });
    }
}
