import { CloudClient } from "chromadb";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    // Get interest query param
    const { searchParams } = new URL(request.url);
    const interest = searchParams.get("interest");

    if (!interest) {
        return new Response("Interest is required", { status: 400 });
    }

    // Fetch 3 most similar interests from ChromaDB
    const chromaClient = new CloudClient();
    const collection = await chromaClient.getOrCreateCollection({
        name: "interests",
    });
    const results = await collection.query({
        queryTexts: [interest],
        nResults: 3,
    });

    console.log(results);

    return new Response(JSON.stringify(results), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    });
}