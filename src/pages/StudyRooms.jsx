import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function StudyRooms() {
  const { currentUser } = useApp();
  
  const [rooms, setRooms] = useState([
    { id: 1, name: 'B2 English Conversation', topic: 'Speaking', host: 'Elena', participants: 3, max: 4, type: 'live' },
    { id: 2, name: 'Grammar Bootcamp (Past Tense)', topic: 'Grammar', host: 'Markus', participants: 5, max: 10, type: 'challenge' },
    { id: 3, name: 'IELTS Prep Room', topic: 'Mixed', host: 'Sarah', participants: 4, max: 4, type: 'live' },
    { id: 4, name: 'Beginner Spanish Basics', topic: 'Vocab', host: 'Diego', participants: 1, max: 5, type: 'challenge' }
  ]);

  const handleJoin = (roomId) => {
    alert(`Connecting to Room ${roomId}... (Microphone and audio access requested for live session)`);
  };

  const handleCreate = () => {
    alert('Opening Room Creator... You will be able to set topic, max participants, and room type.');
  };

  return (
    <div className="page active" id="page-study-rooms">
      <div className="section-header mb-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 className="section-title">Social Study Rooms</h3>
          <p className="section-subtitle">Join live voice sessions or multiplayer challenges with learners worldwide.</p>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          + Create Room
        </button>
      </div>

      <div className="rooms-grid">
        {rooms.map((room, index) => (
          <div key={room.id} className="card room-card animate-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="room-header">
              <span className={`room-type-badge ${room.type}`}>{room.type === 'live' ? '🎙️ Live Audio' : '⚔️ Challenge'}</span>
              <span className="room-topic">{room.topic}</span>
            </div>
            
            <h3 className="room-name">{room.name}</h3>
            
            <div className="room-details">
              <div className="host-info">
                <div className="host-avatar">{room.host.charAt(0)}</div>
                <span>Hosted by <strong>{room.host}</strong></span>
              </div>
              <div className="participants-info mt-2">
                <span className="participants-count">{room.participants} / {room.max} {room.participants >= room.max ? '(Full)' : ''}</span>
                <div className="participants-bar">
                  <div className={`participants-fill ${room.participants >= room.max ? 'full' : ''}`} style={{ width: `${(room.participants / room.max) * 100}%` }}></div>
                </div>
              </div>
            </div>
            
            <button 
              className={`btn-outline w-full mt-4 ${room.participants >= room.max ? 'btn-disabled' : ''}`}
              onClick={() => handleJoin(room.id)}
              disabled={room.participants >= room.max}
            >
              {room.participants >= room.max ? 'Room Full' : 'Join Room'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
