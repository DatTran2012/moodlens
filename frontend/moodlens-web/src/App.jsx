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
// import Music from "./pages/Music";


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

      {/* routes */}

      <Routes>
        <Route
          path="/register"
          element={<Register />}
        />
        {/* LOGIN KHÔNG SIDEBAR */}
        {/* <Route path="/" element={<Login />} /> */}
        <Route
          path="/"
          element={<Login />}
        />

        {/* SAU LOGIN → CÓ SIDEBAR */}
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
        <Route path="/journal/:id" element={
          <ProtectedRoute>
            <Layout>
              <Journaldetail />
            </Layout>
          </ProtectedRoute>
        }
        />
        <Route
          path="/welcome"
          element={<Welcome />}
        />
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

        {/* <Route path="/music" element={
          <ProtectedRoute>
            <Layout>
              <Music />
            </Layout>
          </ProtectedRoute>
        }
        /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;