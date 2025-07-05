'use client';

import React, { useState } from "react";
import MapComponent from "./map";
import LoginPage from "./login";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <LoginPage onComplete={() => setIsLoggedIn(true)} />;
  }
  return <MapComponent />;
}
