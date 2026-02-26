import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ObservationPage from "./Observationpage";
import SummeryPage from "./summerypage";


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