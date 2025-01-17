<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Search, UserPlus, Check, X } from 'lucide-vue-next';


interface User {
  id: number;
  username: string;
  name: string;
}

interface FriendRequest {
  id: number;
  from_user: User;
  created_at: string;
}

const searchQuery = ref('');
const searchResults = ref<User[]>([]);
const friendRequests = ref<FriendRequest[]>([]);
const friends = ref<User[]>([]);
const searchTimeout = ref<ReturnType<typeof setTimeout> | null>(null);
const errorMessage = ref('');
const csrfToken = ref('');

// Type-safe fetch configuration
const createFetchConfig = (method: string, body?: any): RequestInit => ({
  method,
  headers: {
    'X-Csrftoken': csrfToken.value,
    'X-Requested-With': 'XMLHttpRequest',
    ...(body ? { 'Content-Type': 'application/json' } : {})
  },
  credentials: 'include' as RequestCredentials,
  ...(body ? { body: JSON.stringify(body) } : {})
});

const fetchCSRFToken = async () => {
  try {
    const response = await fetch('/api/csrf-token/', {
      method: 'GET',
      credentials: 'include' as RequestCredentials
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    csrfToken.value = data.csrfToken;
    
    if (!csrfToken.value || csrfToken.value.length !== 64) {
      throw new Error('Invalid CSRF token received');
    }
    
    console.log('CSRF token fetched successfully');
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    errorMessage.value = 'Failed to initialize security token. Please refresh the page.';
  }
};

const searchUsers = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }

  try {
    const params = new URLSearchParams({
      query: searchQuery.value.trim()
    });
    
    const response = await fetch(`/api/users/search/?${params.toString()}`, 
      createFetchConfig('GET')
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    searchResults.value = data;
    errorMessage.value = '';
  } catch (error) {
    console.error('Error searching users:', error);
    errorMessage.value = 'Failed to search users. Please try again.';
    searchResults.value = [];
  }
};

const handleSearchInput = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
  searchTimeout.value = setTimeout(searchUsers, 300);
};

const sendFriendRequest = async (userId: number) => {
  if (!csrfToken.value) {
    console.error('No CSRF token available');
    errorMessage.value = 'Security token not available. Please refresh the page.';
    return;
  }

  try {
    console.log('Sending friend request with token:', csrfToken.value ? 'Present' : 'Missing');
    
    const response = await fetch('/api/friend-requests/send/', 
      createFetchConfig('POST', { to_user_id: userId })
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    // Remove user from search results after sending request
    searchResults.value = searchResults.value.filter(user => user.id !== userId);
    errorMessage.value = '';
  } catch (error) {
    console.error('Error sending friend request:', error);
    errorMessage.value = 'Failed to send friend request. Please try again.';
  }
};

const handleFriendRequest = async (requestId: number, action: 'accept' | 'reject') => {
  if (!csrfToken.value) {
    errorMessage.value = 'Security token not available. Please refresh the page.';
    return;
  }

  try {
    const response = await fetch(`/api/friend-requests/${requestId}/`,
      createFetchConfig('POST', { action })
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Remove the request from the list
    friendRequests.value = friendRequests.value.filter(req => req.id !== requestId);
    
    // If accepted, refresh friends list
    if (action === 'accept') {
      fetchFriends();
    }
    errorMessage.value = '';
  } catch (error) {
    console.error('Error handling friend request:', error);
    errorMessage.value = 'Failed to handle friend request. Please try again.';
  }
};

const fetchFriendRequests = async () => {
  try {
    const response = await fetch('/api/friend-requests/', 
      createFetchConfig('GET')
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    friendRequests.value = data;
    errorMessage.value = '';
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    errorMessage.value = 'Failed to load friend requests.';
    friendRequests.value = [];
  }
};

const fetchFriends = async () => {
  try {
    const response = await fetch('/api/friends/', 
      createFetchConfig('GET')
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    friends.value = data;
    errorMessage.value = '';
  } catch (error) {
    console.error('Error fetching friends:', error);
    errorMessage.value = 'Failed to load friends list.';
    friends.value = [];
  }
};

onMounted(async () => {
  // Fetch CSRF token first
  await fetchCSRFToken();
  
  // Only proceed if we have a CSRF token
  if (csrfToken.value) {
    await Promise.all([
      fetchFriendRequests(),
      fetchFriends()
    ]);
  }
});

</script>

<template>
  <div class="max-w-4xl mx-auto p-4">
    <div class="mb-8">
      <h2 class="text-2xl font-bold mb-4">Find Friends</h2>
      <div class="flex gap-2 mb-4">
        <input
          v-model="searchQuery"
          @input="handleSearchInput"
          type="text"
          placeholder="Search users..."
          class="flex-1 p-2 border rounded"
        />
        <Search class="w-6 h-6 text-gray-500" />
      </div>
      <div v-if="searchResults.length" class="space-y-2">
        <div v-for="user in searchResults" :key="user.id" class="flex items-center justify-between p-3 border rounded">
          <div>
            <span class="font-medium">{{ user.name }}</span>
            <span class="text-gray-500 ml-2">@{{ user.username }}</span>
          </div>
          <button
            @click="sendFriendRequest(user.id)"
            class="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <UserPlus class="w-4 h-4" />
            Add Friend
          </button>
        </div>
      </div>
    </div>

    <div class="mb-8">
      <h2 class="text-2xl font-bold mb-4">Friend Requests</h2>
      <div v-if="friendRequests.length" class="space-y-2">
        <div v-for="request in friendRequests" :key="request.id" class="flex items-center justify-between p-3 border rounded">
          <div>
            <span class="font-medium">{{ request.from_user.name }}</span>
            <span class="text-gray-500 ml-2">@{{ request.from_user.username }}</span>
          </div>
          <div class="flex gap-2">
            <button
              @click="handleFriendRequest(request.id, 'accept')"
              class="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              <Check class="w-4 h-4" />
              Accept
            </button>
            <button
              @click="handleFriendRequest(request.id, 'reject')"
              class="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              <X class="w-4 h-4" />
              Reject
            </button>
          </div>
        </div>
      </div>
      <div v-else class="text-gray-500">No pending friend requests</div>
    </div>

    <div>
      <h2 class="text-2xl font-bold mb-4">Friends</h2>
      <div v-if="friends.length" class="space-y-2">
        <div v-for="friend in friends" :key="friend.id" class="flex items-center justify-between p-3 border rounded">
          <div>
            <span class="font-medium">{{ friend.name }}</span>
            <span class="text-gray-500 ml-2">@{{ friend.username }}</span>
          </div>
        </div>
      </div>
      <div v-else class="text-gray-500">No friends yet</div>
    </div>
  </div>
</template>