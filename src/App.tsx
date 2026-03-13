import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import SermonsPage from "./pages/sermons/SermonsPage";
import CategoriesPage from "./pages/sermons/CategoriesPage";
import BooksPage from "./pages/books/BooksPage";
import EventsPage from "./pages/events/EventsPage";
import TestimoniesPage from "./pages/testimonies/TestimoniesPage";
import SubscriptionPlansPage from "./pages/sermons/subscriptions/SubscriptionPlansPage";
import UsersPage from "./pages/users/UsersPage";
import PaymentsPage from "./pages/payments/PaymentsPage";
import LiveSessionPage from "./pages/live/LiveSessionPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/sermons" element={<SermonsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/testimonies" element={<TestimoniesPage />} />
            <Route path="/subscriptions" element={<SubscriptionPlansPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/live" element={<LiveSessionPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
