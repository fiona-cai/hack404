import MapComponent from "./map";
import LoginPage from "./login";

export default function Home() {
  // TODO: Replace with real auth logic
  const isLoggedIn = true;
  if (!isLoggedIn) {
    return <LoginPage />;
  }
  return (
    <MapComponent />
  );
}
