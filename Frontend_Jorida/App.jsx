import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./admin/AdminLayout";
import RoomsPage from "./admin/RoomsPage";
import StaffPage from "./admin/StaffPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="rooms" element={<RoomsPage />} />
          <Route path="staff" element={<StaffPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
