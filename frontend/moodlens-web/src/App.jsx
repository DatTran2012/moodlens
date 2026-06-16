import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Journal from "./pages/Journal";
import Layout from "./components/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";
import JournalHistory from "./pages/JournalHistory";
import GlobalLoading from "./components/GlobalLoading";
import Journaldetail from "./pages/JournalDetail";
import { Toaster } from "react-hot-toast";
import Register from "./pages/Register";
import Welcome from "./pages/Welcome";
import AiCoach from "./pages/AiCoach";
import Music from "./pages/music";
import { MusicProvider } from "./pages/MusicContext";


function App() {
  return (
    <BrowserRouter>
      <GlobalLoading />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000
        }}
      />

      {/* BỌC MusicProvider tại đây: Toàn bộ ứng dụng sẽ sử dụng chung hệ thống nhạc ngầm */}
      <MusicProvider>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Login />} />
          <Route path="/welcome" element={<Welcome />} />

          {/* DASHBOARD */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* NHẬT KÝ */}
          <Route
            path="/journal"
            element={
              <ProtectedRoute>
                <Layout>
                  <Journal />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* LỊCH SỬ NHẬT KÝ */}
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <Layout>
                  <JournalHistory />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* CHI TIẾT NHẬT KÝ */}
          <Route
            path="/journal/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <Journaldetail />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* AI COACH */}
          <Route
            path="/coach"
            element={
              <ProtectedRoute>
                <Layout>
                  <AiCoach />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* TRANG ÂM NHẠC CHUẨN: Bây giờ đã là một Route độc lập, không còn bị dính lẹo khi cuộn trang khác nữa */}
          <Route
            path="/music"
            element={
              <ProtectedRoute>
                <Layout>
                  <Music />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MusicProvider>
    </BrowserRouter>
  );
}

export default App;