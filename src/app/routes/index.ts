import express from 'express';
import { UserRoutes } from '../modules/user/user.routes';
import { authRoutes } from '../modules/auth/auth.routes';
import { adminRoutes } from '../modules/Admin/admin.routes';
import { SiteRoutes } from '../modules/construction site/site.route';
import { WorkAssignmentRoutes } from '../modules/workAssignment/workAssignment.routes';




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
    {
        path: '/site',
        route: SiteRoutes
    },
    {
        path: '/work-assignment',
        route: WorkAssignmentRoutes
    }
   
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;