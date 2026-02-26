import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SummeryPage from "./Summerypage";
import ObservationPage from "./Observationpage";

function App() {
  return (
   <Router>
      <Routes>
        <Route path="/" element={<ObservationPage />} />
        <Route path="/summary" element={<SummeryPage/>} />
      </Routes>
    </Router>
  );
}

export default App;