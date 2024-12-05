import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config';
import TeamGoal from './TeamGoal';
import Totals from './Totals';
import MonthlyGoal from './MonthlyGoal';
import Chip from './Chip';
import EditSaleForm from './EditSaleForm';
import './ChipTable.css';

/**
 * ChipTable Component
 */
function ChipTable({ sales = [], onEdit }) {
  const { auth } = useAuth();
  const [goals, setGoals] = useState({});
  const [editingSale, setEditingSale] = useState(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

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

      setGoals(goalsMap);
      
    } catch (error) {
      console.error('Error fetching goals:', error);
      setGoals({});
    }
  }, [sales, auth.token]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  return (
    <div className="chip-table">
      <TeamGoal 
        month={format(new Date(), 'yyyy-MM')}
        sales={sales}
        individualGoals={goals}
      />
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
                  onEdit={() => {
                    setEditingSale(sale);
                    setIsEditFormOpen(true);
                  }}
                  isEditable={true}
                />
              ))}
          </div>
        </div>
      ))}

      {isEditFormOpen && editingSale && (
        <EditSaleForm
          sale={editingSale}
          onSubmit={async (updatedSale) => {
            try {
              console.log('ChipTable: Attempting to save update:', updatedSale);
              await onEdit(updatedSale);
              console.log('ChipTable: Update successful');
              setIsEditFormOpen(false);
              setEditingSale(null);
              
              // Force a refresh of the parent component's data
              window.location.reload();
            } catch (error) {
              console.error('ChipTable: Error updating sale:', error);
              alert(`Error saving changes: ${error.message}`);
            }
          }}
          onCancel={() => {
            setIsEditFormOpen(false);
            setEditingSale(null);
          }}
        />
      )}
    </div>
  );
}

export default ChipTable;