import React, { useMemo, useCallback, useEffect } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config';
import Totals from './Totals';
import MonthlyGoal from './MonthlyGoal';
import Chip from './Chip';
import './ChipTable.css';

/**
 * ChipTable Component
 */
function ChipTable({ sales = [], onEdit }) {
  const { auth } = useAuth();

  const isManagerOrAdmin = auth?.user?.role === 'Admin' || auth?.user?.role === 'Manager';

  console.log('ChipTable Debug:', {
    isManagerOrAdmin,
    userRole: auth?.user?.role,
    hasAuth: !!auth,
    hasSales: sales.length
  });

  const sortedAdvisors = useMemo(() => {
    const advisorStats = sales.reduce((acc, sale) => {
      if (!acc[sale.advisor]) {
        acc[sale.advisor] = { name: sale.advisor, delivered: 0, pending: 0 };
      }
      if (sale.delivered) {
        acc[sale.advisor].delivered++;
      } else {
        acc[sale.advisor].pending++;
      }
      return acc;
    }, {});

    return Object.values(advisorStats).sort((a, b) => 
      (b.delivered + b.pending) - (a.delivered + a.pending)
    );
  }, [sales]);

  const fetchGoals = useCallback(async () => {
    try {
      const currentMonth = format(new Date(), 'yyyy-MM');
      
      // Get all unique advisors from sales
      const advisors = [...new Set(sales.map(sale => sale.advisor))];
      
      // Fetch goals for each advisor
      const goalsMap = {};
      await Promise.all(
        advisors.map(async (advisor) => {
          try {
            const response = await axios.get(
              `${API_BASE_URL}/goals/${advisor}/${currentMonth}`,
              {
                headers: { 
                  'Authorization': `Bearer ${auth.token}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            if (response.data?.goal_count) {
              goalsMap[advisor] = response.data.goal_count;
            }
          } catch (error) {
            console.error(`Error fetching goal for ${advisor}:`, error);
          }
        })
      );

      console.log('Goals Debug:', {
        processedGoals: goalsMap,
        currentMonth,
        advisors
      });

    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  }, [sales, auth.token]);

  useEffect(() => {
    fetchGoals();
  }, [sales, fetchGoals]);

  return (
    <div className="chip-table">
      {isManagerOrAdmin && (
        <Totals sales={sales} />
      )}
      
      {sortedAdvisors.map(({ name, delivered, pending }) => (
        <div key={name} className="advisor-section">
          <div className="advisor-name">
            <h3>
              {name}
              <div className="advisor-stats">
                <span className="delivered">{delivered}</span>
                <span className="pending">({pending})</span>
                <MonthlyGoal 
                  advisor={name} 
                  month={format(new Date(), 'yyyy-MM')} 
                  onUpdate={fetchGoals}
                  deliveredCount={delivered}
                />
              </div>
            </h3>
          </div>
          <div className="chips">
            {sales
              .filter(sale => sale.advisor === name)
              .sort((a, b) => {
                if (a.delivered === b.delivered) {
                  return new Date(b.deliveryDate) - new Date(a.deliveryDate);
                }
                return a.delivered ? -1 : 1;
              })
              .map(sale => (
                <Chip
                  key={sale.id}
                  sale={sale}
                  onEdit={() => onEdit(sale)}
                  isEditable={true}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ChipTable;