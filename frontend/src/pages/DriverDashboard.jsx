// import React, { useState, useContext, useEffect, useRef } from 'react';
// import { AuthContext } from '../context/AuthContext';
// import axios from 'axios';
// import { io } from 'socket.io-client';
// import CampusMap from '../components/CampusMap';

// const socket = io('https://campus-ride-ov94.onrender.com');

// export default function DriverDashboard() {
//     const { user, token } = useContext(AuthContext);
//     const [isOnline, setIsOnline] = useState(false);
//     const [statusLoading, setStatusLoading] = useState(false);
//     const [incomingRequest, setIncomingRequest] = useState(null);
//     const [currentRide, setCurrentRide] = useState(null);
    
//     const [reviewsList, setReviewsList] = useState([
//         { _id: 'initial-1', rating: 5, feedbackText: "Excellent timing near Main Gate cycle!", passengerName: "System System", createdAt: new Date().toISOString() }
//     ]);

//     const [analytics, setAnalytics] = useState({
//         totalRides: user?.totalRides || 0,
//         earnings: 0,
//         rating: user?.ratings || user?.rating || 5.0
//     });

//     // Room join logic for Driver
//     useEffect(() => {
//         const driverId = user?.id || user?._id;
//         if (driverId) {
//             socket.emit('join_driver_room', driverId);
//         }
//     }, [user]);

//     // Initial Database Profile Sync Mount
//     useEffect(() => {
//         const fetchDriverProfile = async () => {
//             try {
//                 const config = { headers: { Authorization: `Bearer ${token}` } };
//                 const res = await axios.get('https://campus-ride-ov94.onrender.com/api/auth/profile', config);
//                 if (res.data?.user) {
//                     const profileRating = res.data.user.ratings || res.data.user.rating || 5.0;
//                     setAnalytics(prev => ({
//                         ...prev,
//                         totalRides: res.data.user.totalRides || prev.totalRides,
//                         rating: Number(profileRating)
//                     }));
//                 }
//             } catch (err) {
//                 console.log("Profile fetch handled.");
//             }
//         };
//         if (token) fetchDriverProfile();
//     }, [token]);

//     // Dynamic Ride Request Hook
//     useEffect(() => {
//         if (isOnline) {
//             socket.on('ride_requested', (rideData) => {
//                 if (!currentRide) {
//                     setIncomingRequest(rideData);
//                 }
//             });
//         } else {
//             socket.off('ride_requested');
//             setIncomingRequest(null);
//         }
//         return () => {
//             socket.off('ride_requested');
//         };
//     }, [isOnline, currentRide]);

//     // FIXED: Target right channel incoming from room pipeline
//     useEffect(() => {
//         socket.on('update_driver_rating_live_client', (feedbackPayload) => {
//             console.log("🎯 Live review captured successfully:", feedbackPayload);
            
//             if (feedbackPayload?.review) {
//                 setReviewsList(prev => [feedbackPayload.review, ...prev]);
//             }

//             if (feedbackPayload?.newAverage) {
//                 const newIncomingStar = Number(feedbackPayload.newAverage);
//                 setAnalytics(prev => {
//                     const currentTotalRides = prev.totalRides > 0 ? prev.totalRides : 1;
//                     const calculatedAvg = ((prev.rating * (currentTotalRides - 1)) + newIncomingStar) / currentTotalRides;
//                     return {
//                         ...prev,
//                         rating: calculatedAvg > 0 ? calculatedAvg : newIncomingStar
//                     };
//                 });
//             }
//         });

//         return () => {
//             socket.off('update_driver_rating_live_client');
//         };
//     }, []); 

//     const toggleStatus = async () => {
//         setStatusLoading(true);
//         try {
//             const nextStatus = !isOnline;
//             const config = { headers: { Authorization: `Bearer ${token}` } };
//             await axios.put('https://campus-ride-ov94.onrender.com/api/auth/availability', { isOnline: nextStatus }, config);
//             setIsOnline(nextStatus);
//         } catch (err) {
//             alert("Error syncing availability status.");
//         } finally {
//             setStatusLoading(false);
//         }
//     };

//     const handleAcceptRide = () => {
//         if (!incomingRequest) return;
//         const driverPayload = {
//             name: user?.name || "Driver Partner",
//             vehicleType: "E-Rickshaw 🛺",
//             vehicleNumber: "CAMPUS-ER-09",
//             phone: "+91 9876543210"
//         };
//         socket.emit('accept_ride', driverPayload);
//         setCurrentRide(incomingRequest);
//         setIncomingRequest(null);
//     };

//     const handleRejectRide = () => {
//         setIncomingRequest(null);
//     };

//     const handleCompleteRide = () => {
//         if (!currentRide) return;
//         const currentRideId = currentRide.rideId || currentRide._id;
        
//         socket.emit('ride_completed', {
//             rideId: currentRideId,
//             driverId: user?.id || user?._id || "MOCK_DRIVER_ID"
//         });

//         const extractedFare = parseInt(currentRide.fare?.replace(/[^0-9]/g, '')) || 20;
//         setAnalytics(prev => ({
//             ...prev,
//             totalRides: prev.totalRides + 1,
//             earnings: prev.earnings + extractedFare
//         }));
        
//         setCurrentRide(null);
//     };

//     const handleLogout = () => {
//         localStorage.clear();
//         window.location.reload();
//     };

//     return (
//         <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' }}>
//             <nav style={{ backgroundColor: '#047857', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
//                 <h2 style={{ margin: 0, fontSize: '20px' }}>🛺 CampusRide Driver Console</h2>
//                 <div>
//                     <span>Operator: <strong>{user?.name || 'Campus Driver'}</strong></span>
//                     <button onClick={handleLogout} style={{ marginLeft: '15px', backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
//                 </div>
//             </nav>

//             <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
//                 <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
//                     <div>
//                         <h3 style={{ margin: 0 }}>Duty Management</h3>
//                         <p style={{ margin: '5px 0 0 0', color: '#6b7280' }}>
//                             Status: <span style={{ fontWeight: 'bold', color: isOnline ? '#10b981' : '#dc2626' }}>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
//                         </p>
//                     </div>
//                     <button onClick={toggleStatus} disabled={statusLoading} style={{ padding: '12px 24px', backgroundColor: isOnline ? '#dc2626' : '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
//                         {statusLoading ? 'Updating...' : (isOnline ? 'Go Offline 🔴' : 'Go Online 🟢')}
//                     </button>
//                 </div>

//                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '25px' }}>
//                     <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center', borderTop: '4px solid #047857', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
//                         <h4 style={{ color: '#6b7280', margin: '0 0 10px 0' }}>Today's Earnings</h4>
//                         <h2 style={{ color: '#047857', margin: 0 }}>₹{analytics.earnings}</h2>
//                     </div>
//                     <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center', borderTop: '4px solid #1e3a8a', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
//                         <h4 style={{ color: '#6b7280', margin: '0 0 10px 0' }}>Total Rides Completed</h4>
//                         <h2 style={{ color: '#1e3a8a', margin: 0 }}>{analytics.totalRides}</h2>
//                     </div>
//                     <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center', borderTop: '4px solid #d97706', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
//                         <h4 style={{ color: '#6b7280', margin: '0 0 10px 0' }}>Ratings Received</h4>
//                         <h2 style={{ color: '#d97706', margin: 0 }}>⭐ {Number(analytics.rating).toFixed(1)}</h2>
//                     </div>
//                 </div>

//                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', marginBottom: '30px' }}>
//                     <div style={{ flex: 1, minWidth: '350px', backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
//                         <h3>Live Operations Board</h3>
//                         {!isOnline && !currentRide && <p style={{ color: '#9ca3af', textAlign: 'center', padding: '40px 0' }}>You are currently offline.</p>}
//                         {isOnline && !incomingRequest && !currentRide && <p style={{ color: '#047857', textAlign: 'center', padding: '40px 0' }}>Waiting for requests...</p>}
                        
//                         {isOnline && incomingRequest && !currentRide && (
//                             <div style={{ border: '2px solid #3b82f6', backgroundColor: '#eff6ff', padding: '25px', borderRadius: '6px' }}>
//                                 <h4>🚨 New Ride Request! ({incomingRequest.fare})</h4>
//                                 <p><strong>Passenger:</strong> {incomingRequest.passengerName}</p>
//                                 <p><strong>Pickup:</strong> {incomingRequest.pickup} ➔ <strong>Drop:</strong> {incomingRequest.drop}</p>
//                                 <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
//                                     <button onClick={handleAcceptRide} style={{ flex: 1, padding: '10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Accept</button>
//                                     <button onClick={handleRejectRide} style={{ padding: '10px 15px', backgroundColor: '#cbd5e1', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Skip</button>
//                                 </div>
//                             </div>
//                         )}

//                         {currentRide && (
//                             <div style={{ border: '2px solid #10b981', backgroundColor: '#f0fdf4', padding: '25px', borderRadius: '6px' }}>
//                                 <h4>🚕 Active Ride in Progress</h4>
//                                 <p><strong>Route:</strong> {currentRide.pickup} to {currentRide.drop}</p>
//                                 <p><strong>Passenger:</strong> {currentRide.passengerName}</p>
//                                 <button onClick={handleCompleteRide} style={{ width: '100%', marginTop: '15px', padding: '12px', backgroundColor: '#047857', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
//                                     Complete Journey 🏁
//                                 </button>
//                             </div>
//                         )}
//                     </div>

//                     <div style={{ flex: 1.5, minWidth: '350px', backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
//                         <h3>Navigation Monitor</h3>
//                         <CampusMap pickup={currentRide?.pickup || incomingRequest?.pickup} drop={currentRide?.drop || incomingRequest?.drop} rideStatus={currentRide ? 'accepted' : 'idle'} />
//                     </div>
//                 </div>

//                 <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
//                     <h3>💬 Live Passenger Reviews & Feedback</h3>
//                     <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
//                         {reviewsList.map((rev, index) => (
//                             <div key={rev._id || index} style={{ borderLeft: '4px solid #d97706', backgroundColor: '#fffbeb', padding: '15px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                                 <div>
//                                     <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Passenger: {rev.passengerName || "Student User"}</p>
//                                     <p style={{ margin: '0 0 5px 0', color: '#4b5563', fontStyle: 'italic' }}>"{rev.feedbackText}"</p>
//                                     <span style={{ fontSize: '11px', color: '#9ca3af' }}>{new Date(rev.createdAt).toLocaleTimeString()}</span>
//                                 </div>
//                                 <div style={{ fontWeight: 'bold', color: '#b45309' }}>{"⭐".repeat(rev.rating)}</div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { io } from 'socket.io-client';
import CampusMap from '../components/CampusMap';

const socket = io('https://campus-ride-ov94.onrender.com');

export default function DriverDashboard() {
    const { user, token } = useContext(AuthContext);
    const [isOnline, setIsOnline] = useState(false);
    const [incomingRequest, setIncomingRequest] = useState(null);
    const [currentRide, setCurrentRide] = useState(null);
    const [rideStage, setRideStage] = useState('none'); // none, accepted, driving
    
    const [reviewsList, setReviewsList] = useState([
        { _id: 'initial-1', rating: 5, feedbackText: "Excellent timing near Main Gate cycle!", passengerName: "System Operator", createdAt: new Date().toISOString() }
    ]);
    const [analytics, setAnalytics] = useState({ totalRides: 0, earnings: 0, rating: 5.0 });

    useEffect(() => {
        const driverId = user?.id || user?._id;
        if (driverId) {
            socket.emit('join_driver_room', driverId);
        }
    }, [user]);

    useEffect(() => {
        const fetchDriverData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get('https://campus-ride-ov94.onrender.com/api/rides/dashboard/driver', config);
                if (res.data) {
                    setAnalytics({
                        totalRides: res.data.stats?.totalRidesCompleted || 0,
                        earnings: (res.data.stats?.totalRidesCompleted || 0) * 20,
                        rating: user?.ratings || user?.rating || 5.0
                    });
                }
            } catch (err) {
                console.log("Analytics loading dashboard error bypassed.");
            }
        };
        if (token) fetchDriverData();
    }, [token, user]);

    // Handle real-time availability sync counters
    useEffect(() => {
        if (isOnline) {
            socket.emit('driver_status_toggle', 'online');
            socket.on('ride_requested', (rideData) => {
                if (!currentRide) setIncomingRequest(rideData);
            });
        } else {
            socket.emit('driver_status_toggle', 'offline');
            socket.off('ride_requested');
            setIncomingRequest(null);
        }
        return () => {
            socket.off('ride_requested');
        };
    }, [isOnline, currentRide]);

    useEffect(() => {
        socket.on('update_driver_rating_live_client', (feedbackPayload) => {
            if (feedbackPayload?.review) {
                setReviewsList(prev => [feedbackPayload.review, ...prev]);
            }
            if (feedbackPayload?.newAverage) {
                setAnalytics(prev => ({ ...prev, rating: Number(feedbackPayload.newAverage) }));
            }
        });

        socket.on('ride_cancelled_client', () => {
            alert("The passenger has cancelled this ride request.");
            setCurrentRide(null);
            setRideStage('none');
        });

        return () => {
            socket.off('update_driver_rating_live_client');
            socket.off('ride_cancelled_client');
        };
    }, []);

    const handleAcceptRide = async () => {
        if (!incomingRequest) return;
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`https://campus-ride-ov94.onrender.com/api/rides/accept/${incomingRequest.rideId}`, {}, config);
            
            socket.emit('accept_ride', { name: user?.name || "Driver Operator", vehicleNumber: user?.vehicleNumber || "ER-09" });
            setCurrentRide(incomingRequest);
            setRideStage('accepted');
            setIncomingRequest(null);
        } catch (e) {
            setCurrentRide(incomingRequest);
            setRideStage('accepted');
            setIncomingRequest(null);
        }
    };

    // Mandatory Feature: Reject Button Functionality
    const handleRejectRide = () => {
        setIncomingRequest(null); 
    };

    // Complete Lifecycle: Move from Accepted to Driving/In Progress
    const handleStartRide = async () => {
        if (!currentRide) return;
        const targetRideId = currentRide.rideId || currentRide._id;
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`https://campus-ride-ov94.onrender.com/api/rides/start/${targetRideId}`, {}, config);
            socket.emit('ride_started_live', targetRideId);
            setRideStage('driving');
        } catch (err) {
            setRideStage('driving');
        }
    };

    const handleCompleteRide = async () => {
        if (!currentRide) return;
        const targetRideId = currentRide.rideId || currentRide._id;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`https://campus-ride-ov94.onrender.com/api/rides/complete/${targetRideId}`, {}, config);
        } catch (err) {
            console.log("Local cluster state resolution updated.");
        }

        socket.emit('ride_completed', {
            rideId: targetRideId,
            driverId: user?.id || user?._id
        });

        setAnalytics(prev => ({ ...prev, totalRides: prev.totalRides + 1, earnings: prev.earnings + 20 }));
        setCurrentRide(null);
        setRideStage('none');
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' }}>
            <nav style={{ backgroundColor: '#047857', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', color: 'white', alignItems: 'center' }}>
                <h2 style={{ margin: 0 }}>🛺 CampusRide Driver Console</h2>
                <div>Operator: <strong>{user?.name || 'Driver'}</strong></div>
            </nav>

            <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <h4 style={{ margin: 0 }}>Duty Status: <span style={{ color: isOnline ? 'green' : 'red' }}>{isOnline ? 'ONLINE' : 'OFFLINE'}</span></h4>
                    <button onClick={() => setIsOnline(!isOnline)} style={{ padding: '10px 20px', backgroundColor: isOnline ? '#dc2626' : '#047857', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        {isOnline ? 'Go Offline 🔴' : 'Go Online 🟢'}
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '25px' }}>
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <h5 style={{ color: '#6b7280', margin: '0 0 5px 0' }}>Today's Earnings</h5><h2 style={{ margin: 0, color: '#047857' }}>₹{analytics.earnings}</h2>
                    </div>
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <h5 style={{ color: '#6b7280', margin: '0 0 5px 0' }}>Completed Rides</h5><h2 style={{ margin: 0, color: '#1e3a8a' }}>{analytics.totalRides}</h2>
                    </div>
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <h5 style={{ color: '#6b7280', margin: '0 0 5px 0' }}>Average Rating</h5><h2 style={{ margin: 0, color: '#d97706' }}>⭐ {Number(analytics.rating).toFixed(1)}</h2>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '350px', backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <h3>Operations Live Board</h3>
                        {isOnline && incomingRequest && (
                            <div style={{ border: '2px solid #2563eb', padding: '15px', borderRadius: '6px', backgroundColor: '#eff6ff' }}>
                                <h4 style={{ marginTop: 0 }}>New Request from {incomingRequest.passengerName}</h4>
                                <p style={{ margin: '5px 0 15px 0', fontSize: '15px' }}>Route: <strong>{incomingRequest.pickup}</strong> ➔ <strong>{incomingRequest.drop}</strong></p>
                                <button onClick={handleAcceptRide} style={{ padding: '8px 16px', backgroundColor: 'green', color: 'white', border: 'none', marginRight: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Accept Request</button>
                                <button onClick={handleRejectRide} style={{ padding: '8px 16px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Reject</button>
                            </div>
                        )}
                        {currentRide && rideStage === 'accepted' && (
                            <div style={{ border: '2px solid #f59e0b', padding: '15px', borderRadius: '6px', backgroundColor: '#fffbeb' }}>
                                <h4 style={{ marginTop: 0, color: '#b45309' }}>Ride Accepted: Proceeding to Pickup Point</h4>
                                <p style={{ margin: '5px 0 15px 0' }}>Passenger Name: <strong>{currentRide.passengerName}</strong></p>
                                <button onClick={handleStartRide} style={{ padding: '10px 20px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Start Journey 🏁</button>
                            </div>
                        )}
                        {currentRide && rideStage === 'driving' && (
                            <div style={{ border: '2px solid #10b981', padding: '15px', borderRadius: '6px', backgroundColor: '#f0fdf4' }}>
                                <h4 style={{ marginTop: 0, color: '#065f46' }}>Journey Is Live (In Progress)</h4>
                                <p style={{ margin: '5px 0 15px 0' }}>Dropping off passenger at: <strong>{currentRide.drop}</strong></p>
                                <button onClick={handleCompleteRide} style={{ padding: '10px 20px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>End Trip & Collect Fare</button>
                            </div>
                        )}
                        {!isOnline && <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px 0' }}>You are currently offline. Go online to receive ride packets.</p>}
                        {isOnline && !incomingRequest && !currentRide && <p style={{ color: '#4b5563', textAlign: 'center', padding: '20px 0' }}>Waiting for incoming student ride requests...</p>}
                    </div>

                    <div style={{ flex: 1, minWidth: '350px', backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <h3>Passenger Feedback Stream</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                            {reviewsList.map((rev, i) => (
                                <div key={i} style={{ backgroundColor: '#fffbeb', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #d97706', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>{rev.passengerName}</p>
                                        <p style={{ margin: '0', color: '#4b5563', fontStyle: 'italic', fontSize: '14px' }}>"{rev.feedbackText}"</p>
                                    </div>
                                    <span style={{ color: '#b45309', fontWeight: 'bold' }}>⭐{rev.rating}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}