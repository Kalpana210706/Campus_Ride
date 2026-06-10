// import React, { useState, useContext, useEffect } from 'react';
// import { AuthContext } from '../context/AuthContext';
// import { io } from 'socket.io-client';
// import axios from 'axios';
// import CampusMap from '../components/CampusMap';

// const socket = io('http://localhost:5000');

// export default function PassengerDashboard() {
//     const { user, token } = useContext(AuthContext);
//     const [pickup, setPickup] = useState('');
//     const [drop, setDrop] = useState('');
//     const [rideStatus, setRideStatus] = useState('idle'); 
//     const [driverDetails, setDriverDetails] = useState(null);
    
//     const [showReviewModal, setShowReviewModal] = useState(false);
//     const [completedRideData, setCompletedRideData] = useState(null);
//     const [givenRating, setGivenRating] = useState(5);
//     const [writtenFeedback, setWrittenFeedback] = useState('');

//     const campusHotspots = ["Main Gate", "Academic Block 1", "Central Library", "Boys Hostel Block A", "Girls Hostel Block B", "Campus Cafeteria", "Sports Complex"];

//     useEffect(() => {
//         socket.on('ride_accepted_passenger', (driverData) => {
//             setDriverDetails(driverData);
//             setRideStatus('accepted');
//         });

//         socket.on('ride_finished', (statusPayload) => {
//             console.log("Passenger received completion data bundle:", statusPayload);
//             setCompletedRideData(statusPayload); // Yahan driverId humare paas save ho jayegi
//             setRideStatus('idle');
//             setDriverDetails(null);
//             setShowReviewModal(true);
//         });

//         return () => {
//             socket.off('ride_accepted_passenger');
//             socket.off('ride_finished');
//         };
//     }, []);

//     const handleRequestRide = async (e) => {
//         e.preventDefault();
//         if (!pickup || !drop || pickup === drop) return alert("Invalid location parameters.");

//         try {
//             const activeToken = token || localStorage.getItem('token');
//             const config = { headers: { Authorization: `Bearer ${activeToken}` } };
//             const res = await axios.post('http://localhost:5000/api/rides/request', { pickup, drop, fare: "₹20" }, config);

//             setRideStatus('searching');
//             const requestPayload = {
//                 rideId: res.data?.ride?._id || res.data?.rideId || "MOCK_RIDE_ID_" + Math.random(), 
//                 passengerName: user?.name || "Student Passenger",
//                 pickup,
//                 drop,
//                 fare: "₹20"
//             };
//             socket.emit('request_ride', requestPayload);
//         } catch (err) {
//             setRideStatus('searching');
//             socket.emit('request_ride', { passengerName: user?.name || "Student Passenger", pickup, drop, fare: "₹20" });
//         }
//     };

//     // FIXED: Form submit payload sends directly to target driverId room
//     const handleReviewSubmit = async () => {
//         const targetRideId = completedRideData?.rideId || "MOCK_RIDE_ID_77";
//         const associatedDriverId = completedRideData?.driverId; // Driver matching check

//         if (!associatedDriverId) {
//             console.log("Error: Driver ID context missing from lifecycle packet.");
//         }
        
//         try {
//             const activeToken = token || localStorage.getItem('token');
//             const config = { headers: { Authorization: `Bearer ${activeToken}` } };
            
//             const reviewPayload = {
//                 rating: givenRating,
//                 feedbackText: writtenFeedback || "Clean travel ride experience.",
//                 passengerName: user?.name || "Passenger"
//             };

//             await axios.put(`http://localhost:5000/api/rides/rate/${targetRideId}`, reviewPayload, config).catch(e => console.log('DB log bypassed.'));

//             // Core live communication emission event targeting the specific room
//             socket.emit('update_driver_rating_live', {
//                 driverId: associatedDriverId, // Targeted pipeline
//                 newAverage: givenRating,
//                 review: {
//                     rating: givenRating,
//                     feedbackText: writtenFeedback || "Clean travel ride experience.",
//                     passengerName: user?.name || "Anonymous Student",
//                     createdAt: new Date().toISOString()
//                 }
//             });

//             alert("Feedback posted successfully!");
//         } catch (err) {
//             console.error(err);
//         } {
//             setShowReviewModal(false);
//             setWrittenFeedback('');
//             setGivenRating(5);
//             setCompletedRideData(null);
//             setPickup('');
//             setDrop('');
//         }
//     };

//     return (
//         <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' }}>
//             <nav style={{ backgroundColor: '#1e3a8a', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
//                 <h2 style={{ margin: 0, fontSize: '20px' }}>🎓 CampusRide Passenger</h2>
//                 <div>Welcome, <strong>{user?.name || 'Passenger'}</strong></div>
//             </nav>

//             <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px', display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
//                 <div style={{ flex: 1, minWidth: '350px', backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
//                     <h3>Book a Campus Ride</h3>
//                     {rideStatus === 'idle' && (
//                         <form onSubmit={handleRequestRide}>
//                             <select value={pickup} onChange={(e) => setPickup(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '15px' }}>
//                                 <option value="">-- Select Pickup Point --</option>
//                                 {campusHotspots.map((loc, idx) => <option key={idx} value={loc}>{loc}</option>)}
//                             </select>
//                             <select value={drop} onChange={(e) => setDrop(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '20px' }}>
//                                 <option value="">-- Select Drop Point --</option>
//                                 {campusHotspots.map((loc, idx) => <option key={idx} value={loc}>{loc}</option>)}
//                             </select>
//                             <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
//                                 Request Nearby Driver 🛺
//                             </button>
//                         </form>
//                     )}
//                     {rideStatus === 'searching' && <p style={{ textAlign: 'center', color: '#1e3a8a', padding: '20px 0' }}>Searching for active E-Rickshaws...</p>}
//                     {rideStatus === 'accepted' && driverDetails && (
//                         <div style={{ backgroundColor: '#ecfdf5', padding: '15px', borderRadius: '6px', border: '1px solid #10b981' }}>
//                             <h4 style={{ color: '#065f46', margin: '0 0 10px 0' }}>✅ Driver Confirmed!</h4>
//                             <p><strong>Name:</strong> {driverDetails.name}</p>
//                             <p><strong>Vehicle:</strong> {driverDetails.vehicleType || '🛺'} ({driverDetails.vehicleNumber})</p>
//                         </div>
//                     )}
//                 </div>

//                 <div style={{ flex: 1.5, minWidth: '350px', backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
//                     <h3>Live Fleet Map</h3>
//                     <CampusMap pickup={pickup} drop={drop} rideStatus={rideStatus} />
//                 </div>
//             </div>

//             {showReviewModal && (
//                 <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
//                     <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
//                         <h3>🏁 Trip Completed!</h3>
//                         <p style={{ color: '#6b7280' }}>Rate your E-Rickshaw driver operator:</p>
                        
//                         <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
//                             {[1, 2, 3, 4, 5].map((star) => (
//                                 <span key={star} onClick={() => setGivenRating(star)} style={{ fontSize: '36px', cursor: 'pointer', color: star <= givenRating ? '#f59e0b' : '#e5e7eb' }}>★</span>
//                             ))}
//                         </div>
                        
//                         <textarea value={writtenFeedback} onChange={(e) => setWrittenFeedback(e.target.value)} placeholder="Provide performance comments (optional)..." style={{ width: '100%', height: '80px', padding: '10px', marginBottom: '20px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
//                         <button onClick={handleReviewSubmit} style={{ width: '100%', padding: '12px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Submit Feedback</button>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';
import axios from 'axios';
import CampusMap from '../components/CampusMap';

const socket = io('http://localhost:5000');

export default function PassengerDashboard() {
    const { user, token } = useContext(AuthContext);
    const [pickup, setPickup] = useState('');
    const [drop, setDrop] = useState('');
    const [rideStatus, setRideStatus] = useState('idle'); // idle, searching, accepted, in_progress
    const [driverDetails, setDriverDetails] = useState(null);
    const [onlineDrivers, setOnlineDrivers] = useState(0);
    
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [activeRideId, setActiveRideId] = useState(null);
    const [associatedDriverId, setAssociatedDriverId] = useState(null);
    
    const [givenRating, setGivenRating] = useState(5);
    const [writtenFeedback, setWrittenFeedback] = useState('');

    const campusHotspots = ["Main Gate", "Academic Block 1", "Central Library", "Boys Hostel Block A", "Girls Hostel Block B", "Campus Cafeteria", "Sports Complex"];

    useEffect(() => {
        // Live counter event for online drivers update
        socket.on('update_online_drivers_count', (count) => {
            setOnlineDrivers(count);
        });

        socket.on('ride_accepted_passenger', (driverPayload) => {
            setDriverDetails(driverPayload);
            setRideStatus('accepted');
        });

        // Trigger when driver hits "Start Ride"
        socket.on('ride_started_passenger', () => {
            setRideStatus('in_progress');
        });

        socket.on('ride_finished', (statusPayload) => {
            const incomingRideId = typeof statusPayload === 'object' ? statusPayload.rideId : statusPayload;
            const incomingDriverId = statusPayload?.driverId || null;

            setActiveRideId(incomingRideId);
            setAssociatedDriverId(incomingDriverId);
            
            setRideStatus('idle');
            setDriverDetails(null);
            setShowReviewModal(true);
        });

        socket.on('ride_cancelled_client', () => {
            alert("The ride request was cancelled successfully.");
            setRideStatus('idle');
            setActiveRideId(null);
        });

        return () => {
            socket.off('update_online_drivers_count');
            socket.off('ride_accepted_passenger');
            socket.off('ride_started_passenger');
            socket.off('ride_finished');
            socket.off('ride_cancelled_client');
        };
    }, []);

    const handleRequestRide = async (e) => {
        e.preventDefault();
        if (!pickup || !drop || pickup === drop) return alert("Select distinct locations.");

        try {
            const config = { headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` } };
            const payload = {
                pickupLocation: { name: pickup, coordinates: [77.20, 28.61] },
                destination: { name: drop, coordinates: [77.25, 28.65] },
                fare: 20
            };

            const res = await axios.post('http://localhost:5000/api/rides/request', payload, config);
            const serverSavedRideId = res.data?.ride?._id;
            setActiveRideId(serverSavedRideId);

            setRideStatus('searching');
            socket.emit('request_ride', {
                rideId: serverSavedRideId,
                passengerName: user?.name || "Student User",
                pickup,
                drop,
                fare: "₹20"
            });
        } catch (err) {
            console.error("Failed to request ride route mapping", err);
        }
    };

    // Cancellation Workflow Support
    const handleCancelRide = async () => {
        if (!activeRideId) return;
        try {
            const config = { headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` } };
            await axios.put(`http://localhost:5000/api/rides/cancel/${activeRideId}`, {}, config);
            socket.emit('ride_cancelled_live', activeRideId);
            setRideStatus('idle');
            setActiveRideId(null);
        } catch (err) {
            console.error("Cancellation execution error context", err);
        }
    };

    const handleReviewSubmit = async () => {
        if (!activeRideId || activeRideId === "[object Object]") {
            alert("Error: Active Ride Tracker code mapping mismatch.");
            setShowReviewModal(false);
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` } };
            const reviewBody = { rating: givenRating, feedback: writtenFeedback || "Smooth campus journey loop." };

            await axios.put(`http://localhost:5000/api/rides/rate/${activeRideId}`, reviewBody, config);

            if (associatedDriverId) {
                socket.emit('update_driver_rating_live', {
                    driverId: associatedDriverId,
                    newAverage: givenRating,
                    review: {
                        rating: givenRating,
                        feedbackText: writtenFeedback || "Smooth campus journey loop.",
                        passengerName: user?.name || "Student User",
                        createdAt: new Date().toISOString()
                    }
                });
            }
            alert("Feedback locked in MongoDB Atlas successfully!");
        } catch (err) {
            console.error("Database registration crash intercept", err);
        } finally {
            setShowReviewModal(false);
            setWrittenFeedback('');
            setGivenRating(5);
            setPickup('');
            setDrop('');
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' }}>
            <nav style={{ backgroundColor: '#1e3a8a', padding: '15px 30px', display: 'flex', color: 'white', alignItems: 'center' }}>
                <h2 style={{ margin: 0 }}>🎓 CampusRide Passenger</h2>
                <div style={{ marginLeft: '25px', backgroundColor: '#2563eb', padding: '6px 12px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold' }}>
                    🛺 Active E-Rickshaws Online: {onlineDrivers}
                </div>
                <div style={{ marginLeft: 'auto' }}>Welcome, <strong>{user?.name || 'Passenger'}</strong></div>
            </nav>

            <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px', display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
                <div style={{ flex: 1, minWidth: '350px', backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <h3>Book a Campus Ride</h3>
                    {rideStatus === 'idle' && (
                        <form onSubmit={handleRequestRide}>
                            <select value={pickup} onChange={(e) => setPickup(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '15px' }}>
                                <option value="">-- Select Pickup Point --</option>
                                {campusHotspots.map((loc, idx) => <option key={idx} value={loc}>{loc}</option>)}
                            </select>
                            <select value={drop} onChange={(e) => setDrop(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '20px' }}>
                                <option value="">-- Select Drop Point --</option>
                                {campusHotspots.map((loc, idx) => <option key={idx} value={loc}>{loc}</option>)}
                            </select>
                            <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                                Request Nearby Driver 🛺
                            </button>
                        </form>
                    )}
                    {rideStatus === 'searching' && (
                        <div style={{ textAlign: 'center', padding: '10px 0' }}>
                            <p style={{ color: '#1e3a8a', marginBottom: '15px' }}>Searching for active E-Rickshaws...</p>
                            <button onClick={handleCancelRide} style={{ padding: '8px 16px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel Request</button>
                        </div>
                    )}
                    {rideStatus === 'accepted' && (
                        <div style={{ backgroundColor: '#ecfdf5', padding: '15px', borderRadius: '6px', border: '1px solid #10b981' }}>
                            <h4 style={{ color: '#065f46', margin: '0' }}>✅ Driver Confirmed: {driverDetails?.name || 'Operator'} ({driverDetails?.vehicleNumber || 'ER-09'})</h4>
                            <p style={{ margin: '5px 0 12px 0', fontSize: '14px', color: '#047857' }}>Driver is reaching your location point...</p>
                            <button onClick={handleCancelRide} style={{ padding: '6px 12px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel Ride</button>
                        </div>
                    )}
                    {rideStatus === 'in_progress' && (
                        <div style={{ backgroundColor: '#eff6ff', padding: '15px', borderRadius: '6px', border: '1px solid #3b82f6' }}>
                            <h4 style={{ color: '#1e3a8a', margin: '0' }}>🛺 Journey In Progress...</h4>
                            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#2563eb' }}>Traveling safely across campus loop tracking routes.</p>
                        </div>
                    )}
                </div>

                <div style={{ flex: 1.5, minWidth: '350px', backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <h3>Live Fleet Map</h3>
                    <CampusMap pickup={pickup} drop={drop} rideStatus={rideStatus} />
                </div>
            </div>

            {showReviewModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '400px', textAlign: 'center' }}>
                        <h3>🏁 Trip Completed!</h3>
                        <p style={{ color: '#6b7280', marginTop: '0' }}>Rate your E-Rickshaw driver operator:</p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star} onClick={() => setGivenRating(star)} style={{ fontSize: '36px', cursor: 'pointer', color: star <= givenRating ? '#f59e0b' : '#e5e7eb' }}>★</span>
                            ))}
                        </div>
                        <textarea value={writtenFeedback} onChange={(e) => setWrittenFeedback(e.target.value)} placeholder="Provide performance comments..." style={{ width: '100%', height: '80px', padding: '10px', marginBottom: '20px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                        <button onClick={handleReviewSubmit} style={{ width: '100%', padding: '12px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Submit Feedback</button>
                    </div>
                </div>
            )}
        </div>
    );
}