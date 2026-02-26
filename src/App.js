import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ObservationPage from "./compoents/ObservationPage";
import SummaryPage from "./compoents/SummaryPage";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ObservationPage/>} />
        <Route path="/summary" element={<SummaryPage />} />
      </Routes>
    </Router>
  );
}

export default App;