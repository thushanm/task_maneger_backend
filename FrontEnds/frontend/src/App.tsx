import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage.tsx";
import ProjectsPage from "./pages/ProjectsPage.tsx";
import ProjectDetailPage from "./pages/ProjectDetailPage.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import { useAuth } from "./hooks/useAuth.ts";

function App() {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
            <Route path="/" element={<ProtectedRoute />}>
                <Route index element={<ProjectsPage />} />
                <Route path="projects/:id" element={<ProjectDetailPage />} />
            </Route>
        </Routes>
    );
}

export default App;
