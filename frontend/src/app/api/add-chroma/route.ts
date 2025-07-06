import { NextRequest, NextResponse } from "next/server";
import { CloudClient, Collection, Metadata } from "chromadb";

interface AddDataRequest {
    ids: string[];
    documents: string[];
    metadatas: Metadata[];
}

const chromaClient = new CloudClient();

let interests: Collection | null = null;

const getInterests = async () => {
    if (!interests) {
        interests = await chromaClient.getOrCreateCollection({
            name: "interests",
        });
    }
    return interests;
};

export async function POST(request: NextRequest) {
    try {
        const data: AddDataRequest = await request.json();
        const collection = await getInterests();

        await collection.add({
            ids: data.ids,
            documents: data.documents,
            metadatas: data.metadatas,
        });

        return NextResponse.json({
            success: true,
            message: "Data added successfully",
            data,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { success: false, message: "Failed to add data" },
            { status: 500 },
        );
    }
}

