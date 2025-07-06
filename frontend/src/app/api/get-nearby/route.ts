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

    // console.log("Fetched coordinates:", coordinates);

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

    // Helper function for accurate distance calculation using Haversine formula
    function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371000; // Earth's radius in meters
        const toRad = (deg: number) => deg * Math.PI / 180;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    const nearby = nearbyCoordinates.filter(coord => {
        const distance = getDistanceMeters(
            userCoordinate.latitude!,
            userCoordinate.longitude!,
            coord.latitude!,
            coord.longitude!
        );

        console.log(`Distance from user ${userCoordinate.user_id} to user ${coord.user_id}: ${distance.toFixed(2)}m`);

        return distance <= 200; // 200 meters radius
    });

    if (nearby.length === 0) {
        return new Response("No nearby coordinates found within 200 metres", { status: 404 });
    }

    // console.log("Nearby coordinates for user ID", userId, ":", nearby);

    return new Response(JSON.stringify(nearby), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    });
}