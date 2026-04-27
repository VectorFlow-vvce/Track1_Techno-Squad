import { Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import Home from "./components/Home";
import DetectionTool from "./components/DetectionTool";
import About from "./components/About";
import Contact from "./components/Contact";
import DiseaseEncyclopedia from "./components/DiseaseEncyclopedia";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfService from "./components/TermsOfService";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="detect" element={<DetectionTool />} />
        <Route path="encyclopedia" element={<DiseaseEncyclopedia />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="terms-of-service" element={<TermsOfService />} />
      </Route>
    </Routes>
  );
}

export default App;