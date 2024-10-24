import React, { useState, useEffect } from 'react';
import { format, addMonths } from 'date-fns';
import axios from 'axios';
import './Inbound.css';
import InboundUnit from './InboundUnit';
import EditSaleForm from './EditSaleForm';

const API_BASE_URL = 'https://bopchipboard-c66df77a754d.herokuapp.com/api';

const Inbound = () => {
  const [pendingSales, setPendingSales] = useState([]);
  const [months, setMonths] = useState([]);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null);

  useEffect(() => {
    const fetchPendingSales = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/pending-sales`);
        setPendingSales(response.data);
      } catch (error) {
        console.error('Error fetching pending sales:', error);
      }
    };

    const generateMonths = () => {
      const today = new Date();
      const nextFourMonths = Array.from({ length: 4 }, (_, i) => 
        format(addMonths(today, i + 1), 'MMMM yyyy')
      );
      setMonths(nextFourMonths);
    };

    fetchPendingSales();
    generateMonths();
  }, []);

  const groupSalesByAdvisor = (sales) => {
    return sales.reduce((acc, sale) => {
      if (!acc[sale.advisor]) {
        acc[sale.advisor] = [];
      }
      acc[sale.advisor].push(sale);
      return acc;
    }, {});
  };

  const groupedSales = groupSalesByAdvisor(pendingSales);

  const sortedAdvisors = Object.entries(groupedSales)
    .filter(([_, sales]) => sales.some(sale => months.includes(format(new Date(sale.deliveryDate), 'MMMM yyyy'))))
    .sort(([_, salesA], [__, salesB]) => salesB.length - salesA.length)
    .map(([advisor]) => advisor);

  // Add this function to handle editing a sale
  const onEdit = (sale) => {
    setEditingSale(sale);
    setIsEditFormOpen(true);
  };

  const handleEditSubmit = async (updatedSale) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/sales/${updatedSale.id}`, updatedSale);
      if (response.status === 200) {
        // Update the local state with the edited sale
        setPendingSales(prevSales => 
          prevSales.map(sale => sale.id === updatedSale.id ? updatedSale : sale)
        );
        setIsEditFormOpen(false);
        setEditingSale(null);
      }
    } catch (error) {
      console.error('Error updating sale:', error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  const handleEditCancel = () => {
    setIsEditFormOpen(false);
    setEditingSale(null);
  };

  return (
    <div className="inbound-container">
      <h1>Inbound</h1>
      <div className="inbound-grid">
        <div className="header-row">
          <div className="consultant-header">Consultant</div>
          {months.map(month => (
            <div key={month} className="month-header">{month}</div>
          ))}
        </div>
        {sortedAdvisors.map(advisor => (
          <div key={advisor} className="advisor-row">
            <div className="advisor-name">{advisor}</div>
            {months.map(month => (
              <div key={month} className="month-cell">
                {groupedSales[advisor]
                  .filter(sale => format(new Date(sale.deliveryDate), 'MMMM yyyy') === month)
                  .map(sale => (
                    <InboundUnit
                      key={sale.id}
                      sale={sale}
                      onEdit={onEdit}
                    />
                  ))
                }
              </div>
            ))}
          </div>
        ))}
      </div>
      {isEditFormOpen && (
        <EditSaleForm
          sale={editingSale}
          onSubmit={handleEditSubmit}
          onCancel={handleEditCancel}
        />
      )}
    </div>
  );
};

export default Inbound;
