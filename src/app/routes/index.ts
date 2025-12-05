import express from 'express';
import { UserRoutes } from '../modules/user/user.routes';
import { authRoutes } from '../modules/auth/auth.routes';
import { adminRoutes } from '../modules/Admin/admin.routes';
import { SiteRoutes } from '../modules/construction site/site.route';
import { WorkAssignmentRoutes } from '../modules/workAssignment/workAssignment.routes';

import { WorkerRoutes } from '../modules/worker/worker.route';
import { attendanceRouter } from '../modules/attendance/attendance.route';
import { paymentRoutes } from '../modules/payment/payment.route';
import { aiRoutes } from '../modules/AI/ai.route';




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
    },
    {
        path: '/attendance',
        route: attendanceRouter
    },
    {
        path: '/worker',
        route: WorkerRoutes
        
    },
{
    path: "/pay",
    route: paymentRoutes
},
{
    path: "/ai",
    route: aiRoutes
}
   
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;