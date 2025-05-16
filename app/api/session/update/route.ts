import { NextRequest, NextResponse } from "next/server";
import { F4SessionStorage } from "@/app/microstore/Session"; 

export async function PATCH(req: NextRequest) {

    const authHeader = req.headers.get('authorization')
    if (authHeader != process.env.SESSION_AUTH_TOKEN) {
        return NextResponse.json({ error: "Unauthorized access"}, { status: 403 }); 
    }

    const body = await req.json();
    const sessionFactory = new F4SessionStorage()

    if (
        !body.session_id || 
        !body.col || 
        !body.value
    ) {
        return NextResponse.json({ error: "Error in post body."}, { status: 500 });    
    }

    try {

        const record: Record<string, any> = {} 
        record[body.col] = body.value

        await sessionFactory.update(body.session_id, record)
        return NextResponse.json({ msg: "Session updated successfully"}, { status: 200 });
    } catch(e:any) {
        console.error(e.message)
        return NextResponse.json({ error: e.message ?? "An error occured when creating session"}, { status: e.status ?? 500 });
    }
}
