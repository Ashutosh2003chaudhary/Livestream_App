import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Draggable from 'react-draggable';
import Hls from 'hls.js';
import { Modal, Button, Form, ListGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
 import './LiveStream.css'
const Livestream = () => {
    const [rtspUrl, setRtspUrl] = useState('');
    const [streamUrl, setStreamUrl] = useState('');
    const [overlays, setOverlays] = useState([]);
    const [overlayText, setOverlayText] = useState('');
    const [selectedOverlays, setSelectedOverlays] = useState([]); // Track which overlays are visible
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
    const [currentOverlay, setCurrentOverlay] = useState(null);
    const [modalText, setModalText] = useState('');
    const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
    const [modalSize, setModalSize] = useState({ width: 200, height: 50 });

    const videoRef = useRef(null);

    useEffect(() => {
        fetchOverlays();
    }, []);

    useEffect(() => {
        if (streamUrl && videoRef.current) {
            const isHls = streamUrl.endsWith('.m3u8');
            const isVideoFile = streamUrl.match(/\.(mp4|webm|ogg)$/i);

            if (isHls && Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(streamUrl);
                hls.attachMedia(videoRef.current);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    videoRef.current.play();
                });
            } else if (isVideoFile) {
                videoRef.current.src = streamUrl;
                videoRef.current.play();
            } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
                videoRef.current.src = streamUrl;
                videoRef.current.addEventListener('loadedmetadata', () => {
                    videoRef.current.play();
                });
            } else {
                console.error('Unsupported stream type');
            }
        }
    }, [streamUrl]);

    const fetchOverlays = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/overlays');
            console.log('Fetched overlays:', response.data); // Debug log
            setOverlays(response.data); // Update state with fetched overlays
            setSelectedOverlays(response.data.map(overlay => overlay._id)); // By default, show all overlays
        } catch (error) {
            console.error('Error fetching overlays:', error);
        }
    };

    const handleAddOverlay = () => {
        if (!overlayText.trim()) {
            alert("Overlay text cannot be empty.");
            return;
        }

        const newOverlay = {
            text: overlayText,
            position: { x: 100, y: 100 },
            size: { width: 200, height: 50 }
        };

        axios.post('http://localhost:5000/api/overlays', newOverlay)
            .then(response => {
                console.log('Overlay added:', response.data.overlay); // Debug log
                setOverlays([...overlays, response.data.overlay]); // Update state with new overlay
                setSelectedOverlays([...selectedOverlays, response.data.overlay._id]); // Show the new overlay
                setOverlayText('');
                setIsSettingsModalOpen(false); // Close settings modal after adding
            })
            .catch(err => console.error('Error adding overlay:', err));
    };

    const handleDrag = (e, data, overlay) => {
        const updatedOverlay = { ...overlay, position: { x: data.x, y: data.y } };
        axios.put(`http://localhost:5000/api/overlays/${overlay._id}`, updatedOverlay)
            .then(() => {
                console.log(`Overlay ${overlay._id} updated position to (${data.x}, ${data.y})`); // Debug log
                // Update the overlay position in state
                setOverlays(overlays.map(o => o._id === overlay._id ? updatedOverlay : o));
            })
            .catch(err => console.error('Error updating overlay position:', err));
    };

    const handleDeleteOverlay = (overlayId) => {
        if (window.confirm("Are you sure you want to delete this overlay?")) {
            console.log(`Deleting overlay with ID: ${overlayId}`); // Debug log

            axios.delete(`http://localhost:5000/api/overlays/${overlayId}`)
                .then(response => {
                    console.log(response.data.message); // Log response from backend
                    setOverlays(overlays.filter(overlay => overlay._id !== overlayId)); // Update state
                    setSelectedOverlays(selectedOverlays.filter(id => id !== overlayId)); // Remove from visible overlays
                })
                .catch(err => console.error('Error deleting overlay:', err));
        }
    };

    const handlePlayLivestream = () => {
        if (!rtspUrl.trim()) {
            alert("Please enter a valid RTSP or HTTP URL.");
            return;
        }

        // Determine if input URL is RTSP or HTTP
        const isRTSP = rtspUrl.startsWith('rtsp://');
        const isHTTP = rtspUrl.startsWith('http://') || rtspUrl.startsWith('https://');

        if (isRTSP) {
            // Start streaming via backend (transcoding RTSP to HLS)
            axios.get(`http://localhost:5000/api/stream?url=${encodeURIComponent(rtspUrl)}`)
                .then(response => {
                    console.log(response.data.message);
                    setStreamUrl('http://localhost:5000/static/stream.m3u8');  // Adjust based on your setup
                })
                .catch(err => {
                    console.error('Error starting stream:', err);
                    alert("Failed to start streaming.");
                });
        } else if (isHTTP) {
            // Directly use HTTP URL in frontend
            setStreamUrl(rtspUrl);
        } else {
            alert("Please enter a valid RTSP or HTTP URL.");
        }
    };

    const toggleOverlayVisibility = (overlayId) => {
        if (selectedOverlays.includes(overlayId)) {
            setSelectedOverlays(selectedOverlays.filter(id => id !== overlayId));
        } else {
            setSelectedOverlays([...selectedOverlays, overlayId]);
        }
    };

    const openModifyModal = (overlay) => {
        setCurrentOverlay(overlay);
        setModalText(overlay.text);
        setModalPosition(overlay.position);
        setModalSize(overlay.size);
        setIsModifyModalOpen(true);
    };

    const closeModifyModal = () => {
        setIsModifyModalOpen(false);
        setCurrentOverlay(null);
    };

    const handleModalSave = () => {
        if (!modalText.trim()) {
            alert("Overlay text cannot be empty.");
            return;
        }

        const updatedOverlay = {
            ...currentOverlay,
            text: modalText,
            position: modalPosition,
            size: modalSize
        };

        axios.put(`http://localhost:5000/api/overlays/${currentOverlay._id}`, updatedOverlay)
            .then(() => {
                console.log(`Overlay ${currentOverlay._id} updated.`);
                setOverlays(overlays.map(o => o._id === currentOverlay._id ? updatedOverlay : o));
                closeModifyModal();
            })
            .catch(err => console.error('Error updating overlay:', err));
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1 className="text-center mb-4">Livestream Application</h1>

            {/* Controls */}
            <div className="d-flex justify-content-center mb-4">
                <input 
                    type="text" 
                    value={rtspUrl} 
                    onChange={e => setRtspUrl(e.target.value)} 
                    placeholder="RTSP or HTTP URL" 
                    className="form-control w-50 mr-2"
                />
                <Button variant="primary" onClick={handlePlayLivestream}>
                    Play Livestream
                </Button>

                {/* Settings Button */}
                <Button variant="secondary" className="ml-2" onClick={() => setIsSettingsModalOpen(true)}>
                    Settings
                </Button>
            </div>

            {/* Video and Overlays */}
            <div style={{ 
                position: 'relative', 
                width: '640px', 
                height: '480px', 
                border: '1px solid black', 
                margin: '0 auto',
                backgroundColor: '#000'
            }}>
                {streamUrl && (
                    <video 
                        ref={videoRef} 
                        controls 
                        style={{ width: '100%', height: '100%', backgroundColor: '#000' }} 
                    />
                )}
                {overlays.map((overlay) => (
                    selectedOverlays.includes(overlay._id) && (
                        <Draggable 
                            key={overlay._id} 
                            onStop={(e, data) => handleDrag(e, data, overlay)} 
                            position={overlay.position}
                            bounds="parent"
                        >
                            <div 
                                style={{
                                    position: 'absolute', 
                                    width: overlay.size.width, 
                                    height: overlay.size.height, 
                                    backgroundColor: 'rgba(255, 255, 255, 0.7)', 
                                    border: '1px solid black',
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    padding: '5px',
                                    boxSizing: 'border-box',
                                    cursor: 'move',
                                    borderRadius: '4px'
                                }}
                            >
                                <span>{overlay.text}</span>
                            </div>
                        </Draggable>
                    )
                ))}
            </div>

            {/* Settings Modal */}
            <Modal show={isSettingsModalOpen} onHide={() => setIsSettingsModalOpen(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Overlay Settings</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h5>Manage Overlays</h5>
                    <ListGroup variant="flush">
                        {overlays.map(overlay => (
                            <ListGroup.Item key={overlay._id} className="d-flex justify-content-between align-items-center">
                                <div>
                                    <Form.Check 
                                        type="checkbox" 
                                        id={`overlay-${overlay._id}`}
                                        label={overlay.text}
                                        checked={selectedOverlays.includes(overlay._id)}
                                        onChange={() => toggleOverlayVisibility(overlay._id)}
                                    />
                                </div>
                                <div>
                                    <Button variant="outline-secondary" size="sm" className="mr-2" onClick={() => openModifyModal(overlay)}>
                                        Modify
                                    </Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => handleDeleteOverlay(overlay._id)}>
                                        Delete
                                    </Button>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>

                    {/* Add Overlay Form */}
                    <hr />
                    <h5>Add New Overlay</h5>
                    <Form>
                        <Form.Group controlId="formOverlayText">
                            <Form.Label>Overlay Text</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Enter overlay text" 
                                value={overlayText} 
                                onChange={e => setOverlayText(e.target.value)} 
                            />
                        </Form.Group>
                        <Button variant="primary" onClick={handleAddOverlay}>
                            Add Overlay
                        </Button>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setIsSettingsModalOpen(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modify Overlay Modal */}
            <Modal show={isModifyModalOpen} onHide={closeModifyModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Modify Overlay</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {currentOverlay && (
                        <Form>
                            <Form.Group controlId="formModalOverlayText">
                                <Form.Label>Overlay Text</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    value={modalText} 
                                    onChange={e => setModalText(e.target.value)} 
                                    placeholder="Enter overlay text" 
                                />
                            </Form.Group>
                            <Form.Group controlId="formModalPositionX">
                                <Form.Label>Position X</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    value={modalPosition.x} 
                                    onChange={e => setModalPosition({ ...modalPosition, x: parseInt(e.target.value) || 0 })} 
                                    placeholder="Enter X position" 
                                />
                            </Form.Group>
                            <Form.Group controlId="formModalPositionY">
                                <Form.Label>Position Y</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    value={modalPosition.y} 
                                    onChange={e => setModalPosition({ ...modalPosition, y: parseInt(e.target.value) || 0 })} 
                                    placeholder="Enter Y position" 
                                />
                            </Form.Group>
                            <Form.Group controlId="formModalWidth">
                                <Form.Label>Width</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    value={modalSize.width} 
                                    onChange={e => setModalSize({ ...modalSize, width: parseInt(e.target.value) || 0 })} 
                                    placeholder="Enter width" 
                                />
                            </Form.Group>
                            <Form.Group controlId="formModalHeight">
                                <Form.Label>Height</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    value={modalSize.height} 
                                    onChange={e => setModalSize({ ...modalSize, height: parseInt(e.target.value) || 0 })} 
                                    placeholder="Enter height" 
                                />
                            </Form.Group>
                            <Button variant="primary" onClick={handleModalSave}>
                                Save Changes
                            </Button>
                        </Form>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );

};

export default Livestream;
