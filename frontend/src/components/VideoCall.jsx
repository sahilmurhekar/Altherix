import React, { useRef, useEffect, useState, useCallback, memo } from 'react';
import Peer from 'simple-peer';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff } from 'lucide-react';
import { useVideoCall } from '../context/VideoCallContext';

const VideoCall = ({ appointmentId, onClose, isInitiator = true, incomingOffer = null }) => {
  const appointmentIdStr = appointmentId._id || appointmentId;
  const componentId = useRef(Math.random().toString(36).substr(2, 9));
  console.log(`[VideoCall:${componentId.current}] Component mounted, appointmentId:`, appointmentIdStr, 'isInitiator:', isInitiator, 'hasIncomingOffer:', !!incomingOffer);

  useEffect(() => {
    console.log(`[VideoCall:${componentId.current}] Component did mount`);
    return () => {
      console.log(`[VideoCall:${componentId.current}] Component will unmount`);
    };
  }, []);
  const { socket } = useVideoCall();
  const [remoteStream, setRemoteStream] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isCalling, setIsCalling] = useState(false);
  const [remoteVideoAvailable, setRemoteVideoAvailable] = useState(true);
  const [remoteAudioAvailable, setRemoteAudioAvailable] = useState(true);
  const [playFailed, setPlayFailed] = useState(false);

  const myVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerRef = useRef(null);
  const streamRef = useRef(null);
  const offerSignaledRef = useRef(false); // true if signaled, or the offer object if pending
  const answerSignaledRef = useRef(false);
  const initializedRef = useRef(false);

  // Memoize event handlers to prevent unnecessary re-renders
  const handleCallMade = useCallback((data) => {
    console.log('[VideoCall] Received call-made:', data);
    setIsCalling(true);
    if (peerRef.current && !isInitiator && offerSignaledRef.current !== true) {
      console.log('[VideoCall] Signaling offer to peer');
      peerRef.current.signal(data.offer);
      offerSignaledRef.current = true;
    } else if (!peerRef.current && offerSignaledRef.current !== true) {
      console.log('[VideoCall] Peer not ready yet, will signal when ready');
      offerSignaledRef.current = data.offer;
    } else if (!isInitiator) {
      console.log('[VideoCall] Offer already signaled');
    } else {
      console.warn('[VideoCall] Cannot signal offer - is initiator');
    }
  }, [isInitiator]);

  const handleAnswerMade = useCallback((data) => {
    console.log('[VideoCall] Received answer-made:', data);
    if (peerRef.current && isInitiator && !answerSignaledRef.current) {
      console.log('[VideoCall] Signaling answer to peer');
      peerRef.current.signal(data.answer);
      answerSignaledRef.current = true;
    } else {
      console.warn('[VideoCall] Cannot signal answer - peer not ready or not initiator or already signaled');
    }
  }, [isInitiator]);

  useEffect(() => {
    if (!socket || !socket.connected) {
      console.log('[VideoCall] Socket not available or not connected yet');
      return;
    }

    if (initializedRef.current) {
      console.log('[VideoCall] Already initialized, skipping');
      return;
    }

    console.log('[VideoCall] Initializing call setup');
    initializedRef.current = true;

    // Clean up previous peer and stream
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setRemoteStream(null);
    setIsConnected(false);
    setIsCalling(false);
    setRemoteVideoAvailable(true);
    setRemoteAudioAvailable(true);
    offerSignaledRef.current = false;

    // Get user media
    navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30 }
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100
      }
    })
      .then((mediaStream) => {
        console.log('[VideoCall] Media access granted');
        console.log('[VideoCall] Local media stream tracks:', mediaStream.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled, id: t.id })));
        console.log('[VideoCall] Local video settings:', mediaStream.getVideoTracks()[0]?.getSettings());
        console.log('[VideoCall] Local audio settings:', mediaStream.getAudioTracks()[0]?.getSettings());
        streamRef.current = mediaStream;
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = mediaStream;
        }

        // Initialize peer connection
        console.log('[VideoCall] Creating peer connection, initiator:', isInitiator);
        const newPeer = new Peer({
          initiator: isInitiator,
          trickle: false,
          stream: mediaStream,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              { urls: 'stun:stun2.l.google.com:19302' },
              { urls: 'stun:stun3.l.google.com:19302' },
              { urls: 'stun:stun4.l.google.com:19302' },
              {
                urls: 'turn:numb.viagenie.ca',
                credential: 'muazkh',
                username: 'webrtc@live.com'
              }
            ]
          }
        });

        // Add ICE and signaling state logging for debugging
        newPeer._pc.oniceconnectionstatechange = () => {
          console.log('[VideoCall] ICE connection state:', newPeer._pc.iceConnectionState);
        };
        newPeer._pc.onicegatheringstatechange = () => {
          console.log('[VideoCall] ICE gathering state:', newPeer._pc.iceGatheringState);
        };
        newPeer._pc.onsignalingstatechange = () => {
          console.log('[VideoCall] Signaling state:', newPeer._pc.signalingState);
        };

        // Handle signaling
        newPeer.on('signal', (signal) => {
          console.log('[VideoCall] Peer signal generated:', signal.type);
          if (socket && socket.connected) {
            if (isInitiator) {
              console.log('[VideoCall] Emitting call-user');
              socket.emit('call-user', {
                offer: signal,
                appointmentId: appointmentIdStr
              });
            } else {
              console.log('[VideoCall] Emitting make-answer');
              socket.emit('make-answer', {
                answer: signal,
                appointmentId: appointmentIdStr
              });
            }
          } else {
            console.error('[VideoCall] Cannot emit signal - socket not connected');
          }
        });

        // Handle remote stream
        newPeer.on('stream', (remoteStream) => {
          console.log('[VideoCall] Remote stream received');
          console.log('[VideoCall] Remote stream tracks:', remoteStream.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled, id: t.id })));
          console.log('[VideoCall] Remote video settings:', remoteStream.getVideoTracks()[0]?.getSettings());
          console.log('[VideoCall] Remote audio settings:', remoteStream.getAudioTracks()[0]?.getSettings());
          setRemoteStream(remoteStream);
          setRemoteVideoAvailable(remoteStream.getVideoTracks().some(track => track.enabled));
          setRemoteAudioAvailable(remoteStream.getAudioTracks().some(track => track.enabled));
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.addEventListener('loadeddata', () => {
              console.log('[VideoCall] Remote video loadeddata event');
            });
            remoteVideoRef.current.addEventListener('canplay', () => {
              console.log('[VideoCall] Remote video canplay event');
            });
            remoteVideoRef.current.play().then(() => {
              setPlayFailed(false);
            }).catch(e => {
              console.error('[VideoCall] Play failed:', e);
              setPlayFailed(true);
            });
          }
          setIsConnected(true);
          setIsCalling(false);
        });

        // Handle connection
        newPeer.on('connect', () => {
          console.log('[VideoCall] Peer connection established');
          setIsConnected(true);
          setIsCalling(false);
        });

        newPeer.on('error', (err) => {
          console.error('[VideoCall] Peer error:', err);
        });

        newPeer.on('close', () => {
          console.log('[VideoCall] Peer connection closed');
        });

        peerRef.current = newPeer;

        if (offerSignaledRef.current && typeof offerSignaledRef.current === 'object') {
          console.log('[VideoCall] Signaling initial offer to peer');
          newPeer.signal(offerSignaledRef.current);
          offerSignaledRef.current = true;
        }

        // Signal any stored offer from handleCallMade
        if (offerSignaledRef.current && typeof offerSignaledRef.current === 'object' && !isInitiator) {
          console.log('[VideoCall] Signaling stored offer to peer');
          newPeer.signal(offerSignaledRef.current);
          offerSignaledRef.current = true;
        }
      })
      .catch((error) => {
        console.error('Error accessing media devices:', error);
        alert('Unable to access camera and microphone. Please check permissions.');
      });

    // Set up socket event listeners
    socket.on('call-made', handleCallMade);
    socket.on('answer-made', handleAnswerMade);

    return () => {
      console.log('[VideoCall] Cleaning up call resources');
      initializedRef.current = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
      if (socket) {
        socket.off('call-made', handleCallMade);
        socket.off('answer-made', handleAnswerMade);
      }
    };
  }, [socket, appointmentIdStr, isInitiator, handleCallMade, handleAnswerMade]);


  const startCall = () => {
    if (!streamRef.current || !socket) return;
    setIsCalling(true);
    // The peer is already initialized in useEffect
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOn(videoTrack.enabled);
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioOn(audioTrack.enabled);
    }
  };

  const endCall = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    if (socket) {
      socket.disconnect();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Video Container */}
      <div className="absolute inset-0 bg-zinc-900">
        {/* Remote Video */}
        {remoteVideoAvailable ? (
          <div className="relative w-full h-full">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              style={{ display: isConnected ? 'block' : 'none' }}
            />
            {playFailed && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <button
                  onClick={() => {
                    if (remoteVideoRef.current) {
                      remoteVideoRef.current.play().then(() => setPlayFailed(false)).catch(console.error);
                    }
                  }}
                  className="bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Click to Play Video
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-800">
            <div className="text-center">
              <VideoOff className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
              <p className="text-zinc-400">Remote video not available</p>
            </div>
          </div>
        )}

        {!remoteAudioAvailable && (
          <div className="absolute bottom-20 left-4 bg-zinc-800 bg-opacity-75 text-zinc-400 px-4 py-2 rounded-lg">
            <MicOff className="w-5 h-5 inline mr-2" />
            Remote audio not available
          </div>
        )}

        {/* Local Video (Picture-in-Picture) */}
        <video
          ref={myVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute top-4 right-4 w-48 h-36 object-cover border-2 border-white rounded-lg"
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* Call Status */}
        {!isConnected && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {isCalling ? 'Connecting...' : 'Ready to start call'}
              </h3>
              <p className="text-zinc-400">
                {isCalling ? 'Waiting for the other participant...' : 'Click the call button to start'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-zinc-800/90 backdrop-blur-sm p-6 flex items-center justify-center gap-4">
        <button
          onClick={toggleVideo}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            isVideoOn ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {isVideoOn ? <Video className="w-6 h-6 text-white" /> : <VideoOff className="w-6 h-6 text-white" />}
        </button>

        <button
          onClick={toggleAudio}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            isAudioOn ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {isAudioOn ? <Mic className="w-6 h-6 text-white" /> : <MicOff className="w-6 h-6 text-white" />}
        </button>

        {!isCalling && !isConnected && (
          <button
            onClick={startCall}
            className="w-12 h-12 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center transition-colors"
          >
            <Phone className="w-6 h-6 text-white" />
          </button>
        )}

        <button
          onClick={endCall}
          className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors"
        >
          <PhoneOff className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
};

export default memo(VideoCall);