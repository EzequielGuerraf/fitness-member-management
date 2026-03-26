import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { CreateMemberPage } from "./pages/CreateMemberPage";
import { MembershipPlansPage } from "./pages/MembershipPlansPage";
import { MemberSummaryPage } from "./pages/MemberSummaryPage";
import { MembersListPage } from "./pages/MembersListPage";
import { NotFoundPage } from "./pages/NotFoundPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate replace to="/members" />} />
          <Route path="/members" element={<MembersListPage />} />
          <Route path="/members/new" element={<CreateMemberPage />} />
          <Route path="/members/:id" element={<MemberSummaryPage />} />
          <Route path="/plans" element={<MembershipPlansPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
