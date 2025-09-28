import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const DatabaseDebug = () => {
  const [debugInfo, setDebugInfo] = useState({
    connection: 'testing...',
    pets: 'checking...',
    users: 'checking...',
    error: null
  });

  useEffect(() => {
    const testDatabase = async () => {
      try {
        // Test 1: Basic connection
        setDebugInfo(prev => ({ ...prev, connection: 'Testing connection...' }));

        // Test 2: Check pets table
        const { data: petsData, error: petsError } = await supabase
          .from('pets')
          .select('*')
          .limit(5);

        if (petsError) {
          setDebugInfo(prev => ({
            ...prev,
            pets: `ERROR: ${petsError.message}`,
            error: petsError
          }));
        } else {
          setDebugInfo(prev => ({
            ...prev,
            pets: `SUCCESS: Found ${petsData.length} pets`
          }));
          console.log('🐾 Pets data:', petsData);
        }

        // Test 3: Check API users endpoint
        let apiUsers = [];
        try {
          const response = await fetch('/api/users');
          if (response.ok) {
            const userData = await response.json();
            if (userData.success && userData.data) {
              apiUsers = userData.data;
              setDebugInfo(prev => ({
                ...prev,
                users: `API SUCCESS: Found ${apiUsers.length} users via API`
              }));
              console.log('👥 API users data:', apiUsers);
            } else {
              throw new Error('API returned no users');
            }
          } else {
            throw new Error(`API responded with ${response.status}`);
          }
        } catch (apiError) {
          setDebugInfo(prev => ({
            ...prev,
            users: `API ERROR: ${apiError.message}`
          }));
          console.log('❌ API users failed:', apiError);
        }

        // Test 4: Test pets data with owner IDs
        const { data: petsWithOwners, error: petsOwnerError } = await supabase
          .from('pets')
          .select('id, name, owner_id')
          .limit(3);

        if (petsOwnerError) {
          console.log('❌ Pets with owners query failed:', petsOwnerError);
          setDebugInfo(prev => ({
            ...prev,
            connection: 'Pets query with owners failed'
          }));
        } else {
          console.log('✅ Pets with owner IDs:', petsWithOwners);

          // Try to match pets with API users
          if (apiUsers.length > 0 && petsWithOwners) {
            const matchedPets = petsWithOwners.map(pet => {
              const owner = apiUsers.find(user => user.id === pet.owner_id);
              return {
                pet_name: pet.name,
                owner_id: pet.owner_id,
                owner_email: owner?.email || 'No registered user found'
              };
            });
            console.log('🔗 Pets matched with API users:', matchedPets);
          }

          setDebugInfo(prev => ({
            ...prev,
            connection: 'All queries successful! API users can be matched with pets.'
          }));
        }

      } catch (error) {
        console.error('❌ Database test failed:', error);
        setDebugInfo(prev => ({
          ...prev,
          connection: `FAILED: ${error.message}`,
          error
        }));
      }
    };

    testDatabase();
  }, []);

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h4 className="font-semibold text-yellow-800 mb-3">🔍 Database Debug Info</h4>
      <div className="space-y-2 text-sm">
        <div>
          <strong>Connection:</strong> <span className="font-mono">{debugInfo.connection}</span>
        </div>
        <div>
          <strong>Pets Table:</strong> <span className="font-mono">{debugInfo.pets}</span>
        </div>
        <div>
          <strong>API Users:</strong> <span className="font-mono">{debugInfo.users}</span>
        </div>
        {debugInfo.error && (
          <div className="bg-red-50 border border-red-200 rounded p-2 mt-3">
            <strong className="text-red-800">Error Details:</strong>
            <pre className="text-xs text-red-700 mt-1 overflow-auto">
              {JSON.stringify(debugInfo.error, null, 2)}
            </pre>
          </div>
        )}
      </div>
      <div className="mt-3 text-xs text-yellow-700">
        ℹ️ Check browser console (F12) for detailed logs
      </div>
    </div>
  );
};

export default DatabaseDebug;