import React from "react";
import Link from "next/link";

export default function NotFound() {
    return (
        <div style={{ textAlign: "center", marginTop: "10vh" }}>
            <h1>404 - Page Not Found</h1>
            <Link href="/" style={{ color: "#0070f3", textDecoration: "underline" }}>
                Go back home
            </Link>
        </div>
    );
}