import MapComponent from "./map";
import LoginPage from "./login";

export default function Home() {
  // TODO: Replace with real auth logic
  const isLoggedIn = false;
  if (!isLoggedIn) {
    return <LoginPage />;
  }
  return (
    <MapComponent />
  );
}
