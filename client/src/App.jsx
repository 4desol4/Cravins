import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import PaymentSuccess from "./components/payment/PaymentSuccess";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Practice from "./pages/Practice";
import Videos from "./pages/Videos";
import Materials from "./pages/Materials";
import Chatbot from "./pages/Chatbot";
import News from "./pages/News";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Payment from "./pages/Payment";

// Layout Components
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <div className="min-h-screen bg-black text-white">
            <Header />
            <main className="min-h-screen  ">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/news" element={<News />} />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/practice"
                  element={
                    <ProtectedRoute>
                      <Practice />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/videos"
                  element={
                    <ProtectedRoute>
                      <Videos />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/materials"
                  element={
                    <ProtectedRoute>
                      <Materials />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/chatbot"
                  element={
                    <ProtectedRoute>
                      <Chatbot />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payments"
                  element={
                    <ProtectedRoute>
                      <Payment />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payments/success"
                  element={
                    <ProtectedRoute>
                      <PaymentSuccess />
                    </ProtectedRoute>
                  }
                />
                {/* 404 Page */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
           
          </div>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;