// // Example integration in your map.tsx component

// import React, { useState } from 'react';
// import CatchUserModal from './CatchUserModal';
// // ... other imports

// export default function MapComponent({ avatar, myUserId }: { avatar: string, myUserId: number }) {
//   // ... existing state
  
//   // Add new state for gesture catch modal
//   const [showGestureCatch, setShowGestureCatch] = useState<{
//     targetUser: {
//       id: number;
//       name: string;
//       avatar: string;
//       distance: number;
//     };
//   } | null>(null);

//   // Replace the existing catch button click handler with this:
//   const handleShowGestureCatch = (user: User) => {
//     if (!coords) return;
    
//     const dist = getDistanceMeters(
//       coords.latitude, coords.longitude,
//       user.latitude, user.longitude
//     );

//     setShowGestureCatch({
//       targetUser: {
//         id: user.user_id,
//         name: user.users.name || `User ${user.user_id}`,
//         avatar: `images/${user.users.avatar}.png`,
//         distance: Math.round(dist)
//       }
//     });
//   };

//   const handleGestureCatch = async (userId: number) => {
//     if (!coords) return;
    
//     setCatching(userId);
//     setCatchSuccess(null);
    
//     try {
//       // Broadcast catch animation to target user for immediate feedback
//       await broadcastCatchAnimation(
//         myUserId,
//         userId,
//         {
//           name: showGestureCatch?.targetUser.name || 'Unknown',
//           avatar: showGestureCatch?.targetUser.avatar || ''
//         }
//       );

//       // Generate card and log event
//       const cardRes = await fetch('/api/generate-card', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ 
//           userAId: myUserId, 
//           userBId: userId,
//           location: { lat: coords.latitude, lng: coords.longitude },
//           preferStatic: false
//         })
//       });
      
//       if (cardRes.ok) {
//         const cardData = await cardRes.json();
//         setCatchSuccess(showGestureCatch?.targetUser.name || 'Unknown');
        
//         // The real-time system will handle showing the card
//         setTimeout(() => {
//           setShowCard({
//             card: cardData.card,
//             userA: cardData.users.userA,
//             userB: cardData.users.userB,
//             eventId: cardData.event.id
//           });
//         }, 2000);
//       }
//     } catch (error) {
//       console.error('Gesture catch failed:', error);
//     }
    
//     setCatching(null);
//     setShowGestureCatch(null);
//   };

//   return (
//     <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
//       {/* Your existing map content */}
      
//       {/* Replace the old catch button with this: */}
//       {nearbyUsers.map(user => {
//         // ... existing user rendering logic
        
//         return (
//           <div key={user.user_id}>
//             {/* ... existing user info */}
            
//             {dist <= 10 ? (
//               <motion.button
//                 style={{
//                   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                   color: '#fff',
//                   border: 'none',
//                   borderRadius: 12,
//                   padding: '8px 16px',
//                   fontWeight: 600,
//                   cursor: 'pointer',
//                   boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
//                   transition: 'all 0.2s ease',
//                 }}
//                 disabled={catching === user.user_id}
//                 onClick={() => handleShowGestureCatch(user)}
//                 whileHover={{ scale: 1.05, y: -2 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 {catching === user.user_id ? '🎯 Catching...' : '🎮 Gesture Catch'}
//               </motion.button>
//             ) : (
//               <span style={{ fontSize: 12, color: '#aaa' }}>
//                 {dist < 1000 ? `${dist.toFixed(1)}m` : `${(dist / 1000).toFixed(2)}km`}
//               </span>
//             )}
//           </div>
//         );
//       })}

//       {/* Gesture Catch Modal */}
//       {showGestureCatch && (
//         <CatchUserModal
//           targetUser={showGestureCatch.targetUser}
//           onCatch={handleGestureCatch}
//           onClose={() => setShowGestureCatch(null)}
//         />
//       )}

//       {/* Your existing modals and components */}
//     </div>
//   );
// }
