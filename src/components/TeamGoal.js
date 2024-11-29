import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import './TeamGoal.css';
import './ProgressBar.css';

function TeamGoal({ month, sales, individualGoals }) {
  const [teamGoal, setTeamGoal] = useState(0);
  const { auth } = useContext(AuthContext);

  const fetchTeamGoal = useCallback(async () => {
    try {
      const url = `${process.env.REACT_APP_API_BASE_URL}/api/goals/team/${month}`;
      console.log('Fetching team goal from:', url);
      
      const response = await axios.get(url, {
        headers: { 
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data === null || response.data === undefined) {
        console.warn('No data received from team goal endpoint');
        setTeamGoal(0);
        return;
      }
      
      setTeamGoal(response.data.goal_count || 0);
    } catch (error) {
      console.error('Error fetching team goal:', {
        status: error.response?.status,
        message: error.message,
        url: `${process.env.REACT_APP_API_BASE_URL}/api/goals/team/${month}`,
        month: month
      });
      setTeamGoal(0);
    }
  }, [month, auth.token]);

  useEffect(() => {
    fetchTeamGoal();
  }, [fetchTeamGoal]);

  // Calculate totals
  const totalIndividualGoals = Object.values(individualGoals).reduce((sum, goal) => sum + goal, 0);
  const deliveredCount = sales.filter(sale => sale.delivered).length;
  const pendingCount = sales.filter(sale => !sale.delivered).length;
  
  useEffect(() => {
    console.log('TeamGoal Component Debug:', {
      teamGoal,
      totalIndividualGoals,
      deliveredCount,
      pendingCount,
      month
    });
  }, [teamGoal, totalIndividualGoals, deliveredCount, pendingCount, month]);
  
  useEffect(() => {
    console.log('TeamGoal Component State Update:', {
        teamGoal,
        month,
        url: `${process.env.REACT_APP_API_BASE_URL}/goals/team/${month}`,
        timestamp: new Date().toISOString()
    });
  }, [teamGoal, month]);
  
  return (
    <div className="team-goal">
      <div className="goal-header">
        <h3>Team Goal: {teamGoal}</h3>
        <div className="goal-stats">
          <span>Individual Goals: {totalIndividualGoals}</span>
          <span>Delivered: {deliveredCount} ({deliveredCount + pendingCount})</span>
        </div>
      </div>
      <div className="progress-container">
        <div 
          className="goal-marker"
          style={{ 
            left: `${Math.min(totalIndividualGoals / teamGoal * 100, 100)}%` 
          }}
        />
        <div className="progress-bar">
          <div 
            className="progress delivered"
            style={{ 
              width: `${Math.min(deliveredCount / teamGoal * 100, 100)}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default TeamGoal;
