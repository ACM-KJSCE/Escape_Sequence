import { createBrowserRouter } from "react-router-dom";
import DashBoard from "../pages/DashBoard.jsx";
import SignIn from "../pages/SignIn.jsx";
import AdminPanel from "../pages/AdminPanel.jsx";


const routes=createBrowserRouter([
    {
        path: '/',
        element: <SignIn />
    },
    {
        path: '/dashboard',
        element: <DashBoard />
    },
    {
        path: '/admin',
        element: <AdminPanel />
    }
])

export default routes;