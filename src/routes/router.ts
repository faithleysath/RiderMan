import type { Router } from "framework7/types";
import HomePage from "../pages/home.vue";

var routes: Router.RouteParameters[] = [
    {
        path: '/',
        component: HomePage
    }
];

export default routes;