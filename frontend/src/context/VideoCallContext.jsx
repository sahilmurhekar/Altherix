import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

const VideoCallContext = createContext();

export const useVideoCall = () => useContext(VideoCallContext);

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export const VideoCallProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [currentCall, setCurrentCall] = useState(null);

  // Log user changes
  useEffect(() => {
    console.log('[VideoCallContext] User changed:', user ? { _id: user._id, role: user.role } : null);
  }, [user]);

  // Initialize socket connection when user is logged in
  useEffect(() => {
    console.log('[VideoCallContext] useEffect triggered, user._id:', user ? user._id : 'null/undefined', 'socket exists:', !!socket, 'timestamp:', Date.now());
    console.log('[VideoCallContext] useEffect running, user:', user ? user._id : null, 'socket:', socket ? 'exists' : 'null');
    if (user && (!socket || !socket.connected)) {
      console.log('[VideoCallContext] Connecting to socket server:', SERVER_URL);
      const newSocket = io(SERVER_URL, {
        withCredentials: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 5000
      });
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('[VideoCallContext] Socket connected:', newSocket.id);
        // Register user with socket
        if (user && user._id) {
          newSocket.emit('register-user', user._id);
          console.log('[VideoCallContext] Registered user:', user._id);
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('[VideoCallContext] Socket connection error:', error);
      });

      newSocket.on('reconnect_attempt', (attempt) => {
        console.log('[VideoCallContext] Socket reconnect attempt:', attempt);
      });

      newSocket.on('reconnect_failed', () => {
        console.error('[VideoCallContext] Socket reconnection failed');
      });

      newSocket.on('disconnect', (reason) => {
        console.log('[VideoCallContext] Socket disconnected:', reason, 'user:', user ? user._id : null);
      });

      // Listen for incoming calls
      newSocket.on('call-made', (data) => {
        console.log('[VideoCallContext] Received call-made:', data, 'currentCall:', currentCall ? {appointmentId: currentCall.appointmentId, isInitiator: currentCall.isInitiator, hasOffer: !!currentCall.offer} : 'null', 'user:', user ? user._id : 'null');
        // Only show incoming call if not already in a call
        if (!currentCall) {
          console.log('[VideoCallContext] Setting incoming call for appointment:', data.appointmentId || 'unknown');
          setIncomingCall({
            appointmentId: data.appointmentId,
            offer: data.offer,
            callerSocketId: data.socket
          });
        } else if (currentCall && !currentCall.isInitiator && !currentCall.offer && currentCall.appointmentId === data.appointmentId) {
          // If we're waiting for a call as non-initiator, set the offer
          console.log('[VideoCallContext] Setting offer for existing call');
          setCurrentCall(prev => ({
            ...prev,
            offer: data.offer
          }));
        } else {
          console.log('[VideoCallContext] Ignoring call-made - already in call with offer or different appointment');
        }
      });

      // No cleanup to allow socket to persist and auto-reconnect
    }
  }, [user]); // Depend on user to initialize socket when user logs in

  // Separate effect to disconnect socket when user logs out
  useEffect(() => {
    if (!user && socket) {
      console.log('[VideoCallContext] User logged out, disconnecting socket');
      socket.disconnect();
      setSocket(null);
    }
  }, [user]);

  const acceptCall = (appointmentId) => {
    if (socket && socket.connected) {
      console.log('[VideoCallContext] Accepting call for appointment:', appointmentId);
      // Join the appointment room first
      socket.emit('join-appointment', appointmentId);

      if (incomingCall && incomingCall.offer) {
        console.log('[VideoCallContext] Accepting call with existing offer');
        setCurrentCall({
          appointmentId,
          isInitiator: false,
          offer: incomingCall.offer
        });
        setIncomingCall(null);
      } else {
        console.log('[VideoCallContext] Accepting call, waiting for offer');
        // If no incoming call yet or no offer, set current call and wait for call-made
        setCurrentCall({
          appointmentId,
          isInitiator: false,
          offer: incomingCall?.offer || null
        });
        // Don't clear incomingCall yet if it exists but has no offer
        if (incomingCall && !incomingCall.offer) {
          // Keep incomingCall until we get the offer
        } else {
          setIncomingCall(null);
        }
      }
    } else {
      console.error('[VideoCallContext] Cannot accept call - socket not connected');
    }
  };

  const rejectCall = () => {
    setIncomingCall(null);
  };

  const startCall = (appointmentId) => {
    console.log('[VideoCallContext] Starting call for appointment:', appointmentId);
    console.log('[VideoCallContext] startCall: socket exists:', !!socket, 'connected:', socket?.connected);
    if (socket && socket.connected) {
      console.log('[VideoCallContext] Emitting join-appointment');
      socket.emit('join-appointment', appointmentId);
      setCurrentCall({
        appointmentId,
        isInitiator: true
      });
    } else {
      console.error('[VideoCallContext] Cannot start call - socket not connected or exists but disconnected');
    }
  };

  const endCall = () => {
    console.log('[VideoCallContext] Ending call');
    setCurrentCall(null);
    setIncomingCall(null);
  };

  return (
    <VideoCallContext.Provider
      value={{
        socket,
        incomingCall,
        currentCall,
        acceptCall,
        rejectCall,
        startCall,
        endCall
      }}
    >
      {children}
    </VideoCallContext.Provider>
  );
};