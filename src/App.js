import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SummaryPage from "./SummaryPage";
import ObservationPage from "./ObservationPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ObservationPage />} />
        <Route path="/summary" element={<SummaryPage />} />
      </Routes>
    </Router>
  );
}

export default App;