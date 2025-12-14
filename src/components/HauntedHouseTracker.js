import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';
import { API_BASE_URL } from '../config';
import './HauntedHouseTracker.css';

function HauntedHouseTracker({ month }) {
  const { auth } = useContext(AuthContext);
  const [progress, setProgress] = useState({
    goal: 125,
    current: 0,
    remaining: 125,
    percentage: 0,
    isComplete: false
  });
  const [showCelebration, setShowCelebration] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const currentMonth = month || format(new Date(), 'yyyy-MM');
        const response = await axios.get(
          `${API_BASE_URL}/goals/team-progress/${currentMonth}`,
          {
            headers: { 
              'Authorization': `Bearer ${auth.token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        setProgress(response.data);
        
        // Show celebration when goal is reached
        if (response.data.isComplete && !showCelebration) {
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 5000);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching team progress:', error);
        setLoading(false);
      }
    };

    fetchProgress();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchProgress, 30000);
    
    return () => clearInterval(interval);
  }, [month, auth.token, showCelebration]);

  // Generate array of windows/pumpkins (125 total)
  const generateWindows = () => {
    const windows = [];
    const rows = 5;
    const cols = 25;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const index = row * cols + col;
        const isLit = index < progress.current;
        windows.push({
          id: index,
          x: col * 28 + 10,
          y: row * 50 + 120,
          isLit
        });
      }
    }
    
    return windows;
  };

  const windows = generateWindows();

  if (loading) {
    return <div className="haunted-house-loading">Loading haunted house...</div>;
  }

  return (
    <div className="haunted-house-tracker">
      <div className="tracker-header">
        <h2>🎃 Haunted House Progress Tracker 🎃</h2>
        <div className="progress-stats">
          <span className="stat-item">
            <strong>{progress.current}</strong> / {progress.goal} Sales
          </span>
          <span className="stat-item">
            <strong>{progress.remaining}</strong> Remaining
          </span>
          <span className="stat-item">
            <strong>{progress.percentage.toFixed(1)}%</strong> Complete
          </span>
        </div>
      </div>

      {showCelebration && (
        <div className="celebration-overlay">
          <div className="celebration-content">
            <h1>🎉 GOAL REACHED! 🎉</h1>
            <p>The haunted house is fully lit!</p>
            <div className="fireworks">
              <div className="firework"></div>
              <div className="firework"></div>
              <div className="firework"></div>
            </div>
          </div>
        </div>
      )}

      <div className="haunted-house-container">
        <svg 
          viewBox="0 0 750 500" 
          className={`haunted-house-svg ${progress.isComplete ? 'complete' : ''}`}
        >
          {/* Moon/Background */}
          <circle cx="650" cy="80" r="40" fill="#FDB813" opacity="0.3" />
          
          {/* Haunted House Structure */}
          <g className="house-structure">
            {/* Main house body */}
            <rect x="150" y="250" width="450" height="200" fill="#2C1810" stroke="#1a0f0a" strokeWidth="3" />
            
            {/* Roof */}
            <polygon 
              points="125,250 375,100 625,250" 
              fill="#1a0f0a" 
              stroke="#0a0503" 
              strokeWidth="3"
            />
            
            {/* Left tower */}
            <rect x="100" y="200" width="80" height="250" fill="#2C1810" stroke="#1a0f0a" strokeWidth="2" />
            <polygon 
              points="90,200 140,150 190,200" 
              fill="#1a0f0a" 
              stroke="#0a0503" 
              strokeWidth="2"
            />
            
            {/* Right tower */}
            <rect x="570" y="200" width="80" height="250" fill="#2C1810" stroke="#1a0f0a" strokeWidth="2" />
            <polygon 
              points="560,200 610,150 660,200" 
              fill="#1a0f0a" 
              stroke="#0a0503" 
              strokeWidth="2"
            />
            
            {/* Door */}
            <rect x="350" y="350" width="50" height="100" rx="5" fill="#0a0503" stroke="#1a0f0a" strokeWidth="2" />
            <circle cx="390" cy="400" r="3" fill="#8B7355" />
          </g>

          {/* Windows/Pumpkins Grid */}
          <g className="windows-grid">
            {windows.map((window) => (
              <g key={window.id} className={`window ${window.isLit ? 'lit' : 'dark'}`}>
                {/* Pumpkin shape */}
                <ellipse 
                  cx={window.x} 
                  cy={window.y} 
                  rx="10" 
                  ry="12" 
                  fill={window.isLit ? '#FF8C00' : '#2C1810'}
                  stroke={window.isLit ? '#FFA500' : '#1a0f0a'}
                  strokeWidth="1"
                  className={window.isLit ? 'pumpkin-lit' : 'pumpkin-dark'}
                />
                {/* Pumpkin eyes */}
                {window.isLit && (
                  <>
                    <polygon 
                      points={`${window.x-4},${window.y-3} ${window.x-2},${window.y-3} ${window.x-3},${window.y-1}`}
                      fill="#1a0f0a"
                    />
                    <polygon 
                      points={`${window.x+2},${window.y-3} ${window.x+4},${window.y-3} ${window.x+3},${window.y-1}`}
                      fill="#1a0f0a"
                    />
                    {/* Grin */}
                    <path 
                      d={`M ${window.x-4} ${window.y+2} Q ${window.x} ${window.y+4} ${window.x+4} ${window.y+2}`}
                      stroke="#1a0f0a"
                      strokeWidth="1"
                      fill="none"
                    />
                  </>
                )}
              </g>
            ))}
          </g>

          {/* Spooky text */}
          <text x="375" y="480" textAnchor="middle" fill="#8B7355" fontSize="20" fontFamily="serif" fontStyle="italic">
            {progress.isComplete ? "FULLY HAUNTED!" : `${progress.remaining} souls remaining...`}
          </text>
        </svg>

        {/* Progress bar underneath */}
        <div className="house-progress-bar">
          <div 
            className="house-progress-fill"
            style={{ width: `${Math.min(progress.percentage, 100)}%` }}
          >
            <span className="progress-text">
              {progress.current} / {progress.goal}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HauntedHouseTracker;


