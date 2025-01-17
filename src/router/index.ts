// Example of how to use Vue Router

import { createRouter, createWebHistory } from 'vue-router'

// 1. Define route components.
// These can be imported from other files
import Dashboard from '../pages/Dashboard.vue';
import Profile from '../pages/Profile.vue';
import UpdatePassword from '../pages/UpdatePassword.vue';
import UserHobbies from '../pages/UserHobbies.vue';

import Friends from '../pages/Friends.vue'
import SimilarUsers from '../pages/SimilarUsers.vue';

let base = (import.meta.env.MODE == 'development') ? import.meta.env.BASE_URL : ''

// 2. Define some routes
// Each route should map to a component.
// We'll talk about nested routes later.
const router = createRouter({
    history: createWebHistory(base),
    routes: [
        { path: '/dashboard', name: 'Dashboard', component: Dashboard },
        { path: '/profile/', name: 'profile', component: Profile },
        { path: '/updatepassword/', name: 'Update Password', component: UpdatePassword },
        { path: '/hobbies/', name: 'Hobbies', component: UserHobbies },
        { path: '/friends/', name: 'Friends', component: Friends },
        { path: '/similar-users/', name: 'Similar Users', component: SimilarUsers }
    ],
});

export default router
