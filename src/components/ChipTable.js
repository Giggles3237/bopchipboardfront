import React from 'react';
import Chip from './Chip';
import './ChipTable.css';

/**
 * ChipTable Component
 * 
 * Displays a table of sales chips grouped by advisors with totals for each sale type.
 * Totals at the top show Delivered cars followed by Pending in parentheses.
 * 
 * @param {Array} sales - Array of sale objects.
 * @param {Function} onEdit - Function to handle editing a sale.
 */
function ChipTable({ sales, onEdit }) {
  /**
   * Determines if a sale is delivered based on various possible values.
   * 
   * @param {any} delivered - The delivered status of the sale.
   * @returns {boolean} - Returns true if the sale is delivered, else false.
   */
  const isDelivered = (delivered) => {
    return (
      delivered === '1' ||
      delivered === 1 ||
      delivered === true ||
      delivered === 'Yes'
    );
  };

  /**
   * Calculates the totals for each sale type, divided into Delivered and Pending.
   * 
   * @returns {Object} An object containing totals for each sale type with Delivered and Pending counts.
   */
  const calculateTotals = () => {
    return sales.reduce(
      (acc, sale) => {
        // Determine the sale type and initialize if not present
        if (sale.type === 'New BMW') {
          acc.whiteBMW.delivered += isDelivered(sale.delivered) ? 1 : 0;
          acc.whiteBMW.pending += !isDelivered(sale.delivered) ? 1 : 0;
        } else if (sale.type === 'New MINI') {
          acc.greenMINI.delivered += isDelivered(sale.delivered) ? 1 : 0;
          acc.greenMINI.pending += !isDelivered(sale.delivered) ? 1 : 0;
        } else if (
          ['CPO BMW', 'CPO MINI', 'Used BMW', 'Used MINI'].includes(sale.type)
        ) {
          acc.blueUsed.delivered += isDelivered(sale.delivered) ? 1 : 0;
          acc.blueUsed.pending += !isDelivered(sale.delivered) ? 1 : 0;
        }
        return acc;
      },
      {
        whiteBMW: { delivered: 0, pending: 0 },
        greenMINI: { delivered: 0, pending: 0 },
        blueUsed: { delivered: 0, pending: 0 },
      }
    );
  };

  const totals = calculateTotals();

  /**
   * Groups sales by advisor and counts delivered and pending sales.
   * 
   * @type {Object}
   */
  const groupedSales = sales.reduce((acc, sale) => {
    if (!acc[sale.advisor]) {
      acc[sale.advisor] = { delivered: 0, pending: 0, sales: [] };
    }

    // Increment delivered or pending based on sale status
    if (isDelivered(sale.delivered)) {
      acc[sale.advisor].delivered++;
    } else {
      acc[sale.advisor].pending++;
    }

    acc[sale.advisor].sales.push(sale);
    return acc;
  }, {});

  /**
   * Sorts advisors first by the number of delivered sales, then by pending sales.
   * 
   * @type {Array}
   */
  const sortedAdvisors = Object.entries(groupedSales).sort((a, b) => {
    if (b[1].delivered !== a[1].delivered) {
      return b[1].delivered - a[1].delivered;
    } else {
      return b[1].pending - a[1].pending;
    }
  });

  /**
   * Formats the advisor's name to a shorter version, e.g., "John D."
   * 
   * @param {string} advisor - The full name of the advisor.
   * @returns {string} The formatted advisor name.
   */
  const formatAdvisorName = (advisor) => {
    const parts = advisor.trim().split(' ');
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[1].charAt(0)}.`;
  };

  return (
    <div className="chip-table">
      {/* Totals Container */}
      <div className="totals-container">
        <div className="total-item white-bmw">
          <span className="sale-type-label">New BMW:</span> {totals.whiteBMW.delivered} ({totals.whiteBMW.pending})
        </div>
        <div className="total-item green-mini">
          <span className="sale-type-label">New MINI:</span> {totals.greenMINI.delivered} ({totals.greenMINI.pending})
        </div>
        <div className="total-item blue-used">
          <span className="sale-type-label">Used:</span> {totals.blueUsed.delivered} ({totals.blueUsed.pending})
        </div>
      </div>

      {/* Advisor Groups */}
      {sortedAdvisors.map(([advisor, data]) => {
        // Sort sales within each advisor group
        const sortedSales = [...data.sales].sort((a, b) => {
          // Sort by delivered status: delivered first
          if (isDelivered(b.delivered) !== isDelivered(a.delivered)) {
            return isDelivered(b.delivered) - isDelivered(a.delivered);
          }
          // Then sort by deliveryDate: earlier dates first
          return new Date(a.deliveryDate) - new Date(b.deliveryDate);
        });

        return (
          <div key={advisor} className="advisor-group">
            <h2 className="advisor-name">
              {`${formatAdvisorName(advisor)} ${data.delivered} (${data.pending})`}
            </h2>
            <div className="chips-container">
              {sortedSales.map((sale) => (
                <Chip key={sale.id} sale={sale} onEdit={onEdit} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ChipTable;