import { Routes, Route } from "react-router-dom";
import IndexPage from "./pages/IndexPage.jsx";
import StationsPage from "../StationsPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<IndexPage />} />
      <Route path="/stations" element={<StationsPage />} />
    </Routes>
  );
}
