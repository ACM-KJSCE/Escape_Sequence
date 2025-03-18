import { createBrowserRouter } from "react-router-dom";
import DashBoard from "../pages/DashBoard";
import SignIn from "../pages/signIn";
import AdminPanel from "../pages/AdminPanel";


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