<template>
  <div class="container py-5">
    <!-- Profile Form -->
    <div class="box p-5 rounded-lg shadow-lg">
      <form @submit.prevent="updateProfile">
        <!-- Username Field -->
        <div class="mb-4">
          <label for="username" class="form-label fw-bold text-main">Username:</label>
          <input 
            id="username" 
            type="text" 
            class="form-control" 
            v-model="profile.username" 
            :disabled="true"
          />
        </div>

        <!-- Name Field -->
        <div class="mb-4">
          <label for="name" class="form-label fw-bold text-main">Name:</label>
          <input 
            id="name" 
            type="text" 
            class="form-control" 
            v-model="profile.name" 
          />
        </div>

        <!-- Email Field -->
        <div class="mb-4">
          <label for="email" class="form-label fw-bold text-main">Email:</label>
          <input 
            id="email" 
            type="email" 
            class="form-control" 
            v-model="profile.email" 
          />
        </div>

        <!-- Date of Birth Field -->
        <div class="mb-4">
          <label for="date_of_birth" class="form-label fw-bold text-main">Date of Birth:</label>
          <input 
            id="date_of_birth" 
            type="date" 
            class="form-control" 
            v-model="profile.date_of_birth" 
          />
        </div>

        <!-- Submit Button -->
        <div class="text-center">
          <button type="submit" class="btn btn-info text-white fw-bold">Update Profile</button>
        </div>
      </form>

      <div class="mt-4 d-flex justify-content-center gap-3">
        <!-- Change Password Button (Triggers Modal)-->
        <button @click="showPasswordModal = true" class="btn btn-outline-danger fw-bold">Change Password</button>

        <!-- Update Hobbies Button -->
        <router-link to="/hobbies" class="btn btn-outline-primary fw-bold">Update Hobbies</router-link>
      </div>
    </div>

    <!-- Password Update Modal -->
    <div v-if="showPasswordModal" class="modal-overlay" @click="closePasswordModal">
      <div class="modal-content" @click.stop>
        <update-password @close="closePasswordModal"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue';
import UpdatePassword from './UpdatePassword.vue';

function getCsrfToken(): string {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : '';
}

interface Profile {
  username: string;
  name: string;
  email: string;
  date_of_birth: string;
}

export default defineComponent({
  name: 'Profile',

  components: {
    UpdatePassword
  },

  setup() {
    const profile = reactive<Profile>({
      username: '',
      name: '',
      email: '',
      date_of_birth: ''
    });

    const showPasswordModal = ref<boolean>(false);

    const closePasswordModal = (): void => {
      showPasswordModal.value = false;
    };

    const fetchProfile = async (): Promise<void> => {
      try {
        const response = await fetch('/api/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data: Profile = await response.json();
          Object.assign(profile, data);
        } else {
          console.error('Failed to fetch profile data');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    const updateProfile = async (): Promise<void>  => {
      try {
        const response = await fetch('/api/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken(),
          },
          body: JSON.stringify(profile),
        });
        if (!response.ok) {
          console.error('Failed to update profile');
        } else {
          alert('Profile updated successfully');
        }
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    };

    fetchProfile();

    return {
      profile,
      updateProfile,
      showPasswordModal,
      closePasswordModal,
    };
  }
});
</script>

<style scoped>
input {
  background-color: #def2f1;
  min-height: 50px;
}

label {
  font-size: large;
}

.bg-main {
  background-color: #2b7a78 !important;
}

.text-main {
  color: #2b7a78 !important;
}

.btn-info {
  background-color: #3aafa9;
  border-color: #3aafa9;
}

.btn-info:hover {
  background-color: #2b7a78;
  border-color: #2b7a78;
}

.btn-outline-danger {
  color: #dc3545;
  border-color: #dc3545;
}

.btn-outline-danger:hover {
  background-color: #dc3545;
  color: #fff;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.shadow-lg {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
}
</style>
