import React from 'react';
import Chip from './Chip';
import './ChipTable.css';

function ChipTable({ sales, onEdit }) {
  const calculateTotals = () => {
    return sales.reduce((acc, sale) => {
      if (sale.type === 'New BMW') {
        acc.whiteBMW++;
      } else if (sale.type === 'New MINI') {
        acc.greenMINI++;
      } else if (['CPO BMW', 'CPO MINI', 'Used BMW', 'Used MINI'].includes(sale.type)) {
        acc.blueUsed++;
      }
      return acc;
    }, { whiteBMW: 0, greenMINI: 0, blueUsed: 0 });
  };

  const totals = calculateTotals();

  const groupedSales = sales.reduce((acc, sale) => {
    if (!acc[sale.advisor]) {
      acc[sale.advisor] = { delivered: 0, pending: 0, sales: [] };
    }
    acc[sale.advisor][sale.delivered === 'yes' ? 'delivered' : 'pending']++;
    acc[sale.advisor].sales.push(sale);
    return acc;
  }, {});

  const sortedAdvisors = Object.entries(groupedSales).sort((a, b) => 
    b[1].delivered - a[1].delivered
  );

  const formatAdvisorName = (advisor) => {
    const parts = advisor.split(' ');
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[1].charAt(0)}.`;
  };

  return (
    <div className="chip-table">
      <div className="totals-container">
        <div className="total-item white-bmw">New BMW: {totals.whiteBMW}</div>
        <div className="total-item green-mini">New MINI: {totals.greenMINI}</div>
        <div className="total-item blue-used">CPO & Used: {totals.blueUsed}</div>
      </div>
      {sortedAdvisors.map(([advisor, data]) => (
        <div key={advisor} className="advisor-group">
          <h2 className="advisor-name">
            {`${formatAdvisorName(advisor)} ${data.delivered} (${data.pending})`}
          </h2>
          <div className="chips-container">
            {data.sales.map(sale => (
              <Chip key={sale.id} sale={sale} onEdit={onEdit} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ChipTable;