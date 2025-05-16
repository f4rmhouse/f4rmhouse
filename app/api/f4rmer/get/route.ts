import { NextRequest, NextResponse } from "next/server";
import { F4SessionStorage } from "@/app/microstore/Session"; 

export async function GET(req: NextRequest) {
    const url = req.nextUrl;
    const sessionFactory = new F4SessionStorage()

    let f4rmer_title = url.searchParams.get('title') ?? ""
    if (!f4rmer_title) {
        return NextResponse.json({ error: "Please provide a title"}, { status: 500 });    
    }

    try {
        let f4rmer = await sessionFactory.readF4rmer(f4rmer_title) ?? []
        if(f4rmer.length == 0) {
            return NextResponse.json(null, { status: 200 });
        }
        else {
            return NextResponse.json(f4rmer[0], { status: 200 });
        }
    } catch(e:any) {
        console.error(e.message)
        return NextResponse.json({ error: e.message ?? "An error occured when creating session"}, { status: e.status ?? 500 });
    }
}
