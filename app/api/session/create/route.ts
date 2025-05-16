import { NextRequest, NextResponse } from "next/server";
import { F4SessionStorage } from "@/app/microstore/Session"; 

export async function POST(req: NextRequest) {

    const authHeader = req.headers.get('authorization')
    if (authHeader != process.env.SESSION_AUTH_TOKEN) {
        return NextResponse.json({ error: "Unauthorized access"}, { status: 403 }); 
    }

    const body = await req.json();
    const sessionFactory = new F4SessionStorage()

    if (!body.f4rmer_id || 
        !body.session_id || 
        !body.description || 
        !body.conversation|| 
        !body.user_id
    ) {
        return NextResponse.json({ error: "Error in post body."}, { status: 500 });    
    }

    try {
        let record = {
            "description": body.description, 
            "history": body.conversation, 
            "user_id": body.user_id
        }
        await sessionFactory.create(body.session_id, body.f4rmer_id, record)
        return NextResponse.json({ msg: "Session created successfully"}, { status: 200 });
    } catch(e:any) {
        console.error(e.message)
        return NextResponse.json({ error: e.message ?? "An error occured when creating session"}, { status: e.status ?? 500 });
    }
}
