import type { Router } from "framework7/types";
import HomePage from "../pages/home.vue";
import DebugPage from "../pages/debug.vue";

var routes: Router.RouteParameters[] = [
    {
        path: '/',
        component: HomePage
    },
    {
        path: '/debug/',
        component: DebugPage
    }
];

export default routes;
