import type { NextRequest } from "next/server";
import supabase from "../../../lib/database";

export async function GET(request: NextRequest) {
    // Get user id query param
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) {
        return new Response("User ID is required", { status: 400 });
    }

    const { data: coordinates, error } = await supabase
        .from("coordinates")
        .select("user_id, latitude, longitude, users (avatar, name)");

    if (error) {
        return new Response("Error fetching coordinates", { status: 500 });
    }

    if (!coordinates || coordinates.length === 0) {
        return new Response("No coordinates found", { status: 404 });
    }

    // Filter coordinates based on userId
    const nearbyCoordinates = coordinates.filter(coord => coord.user_id.toString() !== userId.toString());
    if (nearbyCoordinates.length === 0) {
        return new Response("No nearby coordinates found", { status: 404 });
    }

    // Get everything in a 200-metre radius
    const userCoordinate = coordinates.find(coord => coord.user_id.toString() === userId.toString());
    if (!userCoordinate) {
        return new Response("User coordinate not found", { status: 404 });
    }

    const nearby = nearbyCoordinates.filter(coord => {
        const distance = Math.sqrt(Math.pow(coord.latitude! - userCoordinate.latitude!, 2) + Math.pow(coord.longitude!- userCoordinate.longitude!, 2));

        // Print distance in meters
        console.log("Distance in metres:", distance * 111139); // Approx. conversion from degrees to metres

        return distance <= 0.002; // Approx. 200 metres
    });

    if (nearby.length === 0) {
        return new Response("No nearby coordinates found within 200 metres", { status: 404 });
    }

    return new Response(JSON.stringify(nearby), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    });
}