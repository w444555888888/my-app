import Home from "./pages/Home";
import "./app.scss"
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import HotelsList from "./pages/HotelsList";
import Hotel from "./pages/Hotel";
import SignUp from "./pages/SignUp";

function App() {

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signUp" element={<SignUp />} />
          <Route path="/hotelsList" element={<HotelsList />} />
          <Route path="/hotels/:id" element={<Hotel />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
