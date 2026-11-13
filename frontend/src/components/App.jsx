import { Routes, Route } from "react-router-dom";
import NavBar from "./NavBar.jsx";
import IndexPage from "./pages/IndexPage.jsx";
import StationsPage from "./pages/StationsPage.jsx";

export default function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/stations" element={<StationsPage />} />
      </Routes>
    </>
  );
}
