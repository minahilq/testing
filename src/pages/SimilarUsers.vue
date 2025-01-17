<template>
    <div class="similarUsers-list container bg-def2f1 p-4 rounded position-relative">
        <h1 class="text-center text-3aafa9 mb-4">Users with Similar Hobbies</h1>
        
        <div class="filters mb-4 d-flex justify-content-center">
            <input type="number" class="form-control mx-2 border-2b7a78" v-model="minAge" placeholder="Choose minimum age" style="max-width:fit-content;"/>
            <input type="number" class="form-control mx-2 border-2b7a78" v-model="maxAge" placeholder="Choose maximum age" style="max-width: fit-content;"/>
            <button class="btn btn-3aafa9 text-feffff" @click="applyFilter">Apply filter</button>
        </div>

        <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

        <table class="table custom-table">
            <thead>
                <tr>
                <th scope="col" class="custom-header">Username</th>
                <th scope="col" class="custom-header">Shared Hobbies</th>
                </tr>
            </thead>
            <tbody v-if="users.length">
                <tr v-for="(user) in users" :key="user.id">
                    <td class="custom-row">{{ user.name }}</td>
                    <td class="custom-row">{{ user.shared_hobbies }}</td>
                </tr>
            </tbody>
            <tbody v-else>
                <tr>
                    <td colspan="2" class="text-center text-muted">No similar users found.</td>
                </tr>
            </tbody>
        </table>
        <nav class="pagination-nav">
            <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <button class="btn btn-link" @click="changePage(currentPage - 1)">
                        Previous
                    </button>
                </li>
                <li class="page-item">
                    <span class="page-link">Page {{ currentPage }} of {{ totalPages }}</span>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                    <button class="btn btn-link" @click="changePage(currentPage + 1)">
                        Next
                    </button>
                </li>
            </ul>
        </nav>
    </div>
</template>  

<script lang="ts">
    import { defineComponent, ref, onMounted } from 'vue';

    interface User {
        id: number;
        name: string;
        shared_hobbies: number;
    }

    interface PaginatedResponse {
        users: User[];
        page: number;
        number_of_pages: number;
        total_users: number;
    }

    export default defineComponent({
        name: "SimilarUsers",
        setup() {
            const users = ref<User[]>([]);
            const currentPage = ref(1);
            const totalPages = ref(1);
            const totalUsers = ref(0);
            const errorMessage = ref<string | null>(null)

            const minAge = ref<number | null>(null);
            const maxAge = ref<number | null>(null);

            const fetchUsers = async (page: number, minimumValue: number | null, maximumValue: number | null) => {
                try{
                    errorMessage.value = null
                    let url = `/api/similar-hobbies/?page=${page}`;

                    if (minimumValue != null){
                        url += `&min_age=${minimumValue}`;
                    }
                    if(maximumValue != null){
                        url += `&max_age=${maximumValue}`;
                    }

                    console.log("Request URL:", url);
                    const response = await fetch(url);

                    if(!response.ok){
                        throw new Error("Failed to fetch similar users");
                    }

                    const data: PaginatedResponse = await response.json();
                    users.value = data.users;
                    currentPage.value = data.page;
                    totalPages.value = data.number_of_pages;
                    totalUsers.value = data.total_users;

                } catch (error) {
                    console.error("Error fetching users: ", error);
                }
            };

            const changePage = (page: number) => {
                if (page >=1 && page<= totalPages.value){
                    fetchUsers(page, minAge.value, maxAge.value);
                }
            };

            const applyFilter = () => {
                errorMessage.value = null;

                if (minAge.value !== null && minAge.value < 0) {
                    errorMessage.value = "Minimum age cannot be negative";
                    return;
                }
                if (maxAge.value !== null && maxAge.value < 0) {
                    errorMessage.value = "Maximum age cannot be negative";
                    return;
                }
                if (minAge.value !== null && maxAge.value !== null && minAge.value > maxAge.value) {
                    errorMessage.value = "Minimum age cannot be greater than maximum age";
                    return;
                }

                fetchUsers(1, minAge.value, maxAge.value);
            }

            onMounted(() => {
                fetchUsers(currentPage.value, minAge.value, maxAge.value);
            });

            return{
                users, 
                currentPage, 
                totalPages, 
                totalUsers,
                minAge,
                maxAge,
                changePage,
                applyFilter, 
                errorMessage,
            };
        },
    });
</script>

<style scoped>
    .similarUsers-list {
      background-color: #def2f1;
      color: #17252a;
      min-height: 600px;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
  
    .text-feffff {
      color: #feffff;
    }
  
    .text-2b7a78 {
      color: #2b7a78;
    }
  
    .btn-3aafa9 {
      background-color: #3aafa9;
      border-color: #3aafa9;
      color: #feffff;
      transition: background-color 0.3s, border-color 0.3s;
    }
  
    .btn-3aafa9:hover {
      background-color: #2b7a78;
      border-color: #2b7a78;
    }
  
    .border-2b7a78 {
      border-color: #2b7a78;
    }
  
    .pagination-nav {
        position: absolute;
        bottom: 20px;
        left: 0;
        right: 0;
    }
  
    .custom-table {
        border: 1px solid #ccc; /* Custom border for the table */
    }

    .custom-header {
        background-color: #3aafa9; /* Custom header background color */
        color: #fff; /* Header text color */
        text-align: center;
    }

    .custom-row {
        background-color: #def2f1; /* Custom row background color */
        color: #17252a; /* Custom row text color */
    }

    .custom-row:nth-child(even) {
        background-color: #e8f6f5; /* Alternate row color */
    }
</style>
