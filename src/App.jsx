import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/organisms/Layout";
import RecordingsPage from "@/pages/RecordingsPage";
import RecordingDetailPage from "@/pages/RecordingDetailPage";
import SearchPage from "@/pages/SearchPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import SettingsPage from "@/pages/SettingsPage";
import NewRecordingPage from "@/pages/NewRecordingPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<RecordingsPage />} />
          <Route path="recordings/:id" element={<RecordingDetailPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="record" element={<NewRecordingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;