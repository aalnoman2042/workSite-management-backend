import express from 'express';
import { UserRoutes } from '../modules/user/user.routes';
import { authRoutes } from '../modules/auth/auth.routes';
import { adminRoutes } from '../modules/Admin/admin.routes';




const router = express.Router();

const moduleRoutes = [

       {
        path: '/user',
        route: UserRoutes
    },
       {
        path: '/auth',
            route: authRoutes   
    },

       {
        path: '/admin',
            route: adminRoutes   
    },
   
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;