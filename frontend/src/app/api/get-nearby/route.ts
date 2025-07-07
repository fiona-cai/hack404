import type { NextRequest } from "next/server";
import supabase from "../../../lib/database";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) {
        return new Response(JSON.stringify({ error: "User ID is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const { data: coordinates, error } = await supabase
        .from("coordinates")
        .select("user_id, latitude, longitude, users (avatar, name)");

    if (error) {
        return new Response(JSON.stringify({ error: "Error fetching coordinates" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }

    if (!coordinates || coordinates.length === 0) {
        return new Response(JSON.stringify({ error: "No coordinates found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
        });
    }

    const nearbyCoordinates = coordinates.filter(coord => coord.user_id.toString() !== userId.toString());
    if (nearbyCoordinates.length === 0) {
        return new Response(JSON.stringify({ error: "No nearby coordinates found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
        });
    }

    const userCoordinate = coordinates.find(coord => coord.user_id.toString() === userId.toString());
    if (!userCoordinate) {
        return new Response(JSON.stringify({ error: "User coordinate not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
        });
    }

    function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371000;
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
        return distance <= 200;
    });

    if (nearby.length === 0) {
        return new Response(JSON.stringify({ error: "No nearby coordinates found within 200 metres" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify(nearby), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    });
}