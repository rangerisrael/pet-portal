/**
 * Utility function to test the users API endpoint
 * Call this from browser console to test: window.testUsersAPI()
 */
export const testUsersAPI = async () => {
  try {
    console.log("🧪 Testing /api/users endpoint...");

    const response = await fetch('/api/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log("📡 Response status:", response.status);
    console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log("📊 Response data:", data);

    if (response.ok && data.success) {
      console.log(`✅ SUCCESS: Found ${data.users.length} users`);
      console.table(data.users);
      return { success: true, users: data.users };
    } else {
      console.error("❌ API Error:", data.error);
      return { success: false, error: data.error };
    }

  } catch (error) {
    console.error("❌ Network/Parse Error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Test API with filters
 */
export const testUsersAPIWithFilters = async (filters = {}) => {
  try {
    console.log("🧪 Testing /api/users with filters:", filters);

    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filters })
    });

    const data = await response.json();
    console.log("📊 Filtered response:", data);

    if (response.ok && data.success) {
      console.log(`✅ SUCCESS: Found ${data.users.length} filtered users`);
      console.table(data.users);
      return { success: true, users: data.users };
    } else {
      console.error("❌ API Error:", data.error);
      return { success: false, error: data.error };
    }

  } catch (error) {
    console.error("❌ Network/Parse Error:", error);
    return { success: false, error: error.message };
  }
};

// Make functions available in browser console
if (typeof window !== 'undefined') {
  window.testUsersAPI = testUsersAPI;
  window.testUsersAPIWithFilters = testUsersAPIWithFilters;
}