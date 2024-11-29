import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import './MonthlyGoal.css';

function MonthlyGoal({ advisor, month, onUpdate, deliveredCount }) {
  const [goal, setGoal] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [tempGoal, setTempGoal] = useState(0);
  const { auth } = useContext(AuthContext);
  
  const canViewGoal = auth?.user?.role === 'Admin' || 
                      auth?.user?.role === 'Manager' || 
                      auth?.user?.name === advisor;

  const canEditGoal = auth?.user?.name === advisor;

  const progressPercentage = goal > 0 ? Math.min((deliveredCount / goal) * 100, 100) : 0;

  const handleClick = () => {
    if (canEditGoal) {
      setIsEditing(true);
    }
  };

  const fetchGoal = useCallback(async () => {
    try {
      console.log('Fetching goal for:', advisor, month);
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/goals/${advisor}/${month}`,
        {
          headers: { 
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Goal fetch response:', response.data);
      setGoal(response.data.goal_count || 0);
      setTempGoal(response.data.goal_count || 0);
    } catch (error) {
      console.error('Error fetching goal:', error.response || error);
    }
  }, [advisor, month, auth.token]);

  useEffect(() => {
    if (canViewGoal) {
      fetchGoal();
    }
  }, [advisor, month, canViewGoal, fetchGoal]);

  const handleSave = async () => {
    const url = `${process.env.REACT_APP_API_BASE_URL}/api/goals`;
    try {
      console.log('Attempting to save goal to:', url);
      console.log('Goal data:', { 
        advisor, 
        month, 
        goal_count: tempGoal
      });

      const response = await axios.post(
        url,
        {
          advisor,
          month,
          goal_count: tempGoal
        },
        {
          headers: { 
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Goal save response:', response.data);
      setGoal(tempGoal);
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error saving goal:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        url: url
      });
      alert(`Failed to save goal: ${error.response?.data?.message || error.message}`);
    }
  };

  if (!canViewGoal) {
    return null;
  }

  return (
    <div className="monthly-goal">
      {isEditing ? (
        <div className="goal-edit">
          <input
            type="number"
            value={tempGoal}
            onChange={(e) => setTempGoal(Number(e.target.value))}
            min="0"
          />
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      ) : (
        <>
          <div className="goal-display" onClick={handleClick}>
            {goal}
          </div>
          <div className="advisor-progress-wrapper">
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress"
                  style={{ 
                    width: `${progressPercentage}%`,
                    backgroundColor: progressPercentage >= 100 ? 'var(--mini-green)' : 'var(--bmw-blue)'
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default MonthlyGoal;
