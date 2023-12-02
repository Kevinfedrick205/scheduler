/* eslint-disable react/prop-types */
// client/src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './App.css';

const ItemTypes = {
  CUSTOMER: 'customer',
  SLOT: 'slot',
};

let formatLocal = new Intl.DateTimeFormat('en-GB', {year: 'numeric', month:'long', day:'2-digit'});

const DraggableCustomer = ({ customer }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CUSTOMER,
    item: { customerId: customer?._id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <tr>
    <td>
      {customer._id}
      </td>
      <td>
      <div ref={drag} className={`customer ${isDragging ? 'dragging' : ''}`}>
      {customer.customerName}
    </div>
      </td>
      <td>
        {customer.pickUpLocation}
      </td>
      <td>
        {customer.dropOffLocation}
      </td>
    </tr>
  );
};

const DraggableSlot = ({ slot, onDrop }) => {
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.CUSTOMER,
    drop: (item) => onDrop(item.customerId, slot),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div ref={drop} className={`slot ${isOver ? 'hovered' : ''}`}>
      {slot ? slot.customerName : 'Empty'}
    </div>
  );
};

const Info = () => {
  const [customers, setCustomers] = useState([]);
  const [planner, setPlanner] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/api/customers').then((response) => setCustomers(response.data));
    axios.get('http://localhost:3001/api/planner').then((response) => setPlanner(response.data));
  }, []);

  const handleDrop = (customerId, slot) => {
    axios.put(`http://localhost:3001/api/planner/${planner[0].date}/${slot}`, { customerId }).then((response) => {
      axios.get('http://localhost:3001/api/planner').then((response) => setPlanner(response.data));
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container">
        <div className="customers">
          <h2>Customers</h2>
          <div>
          <table>
            <tr>
              <th>Customer Id</th>
              <th>Customer Name</th>
              <th>Pick Up Location</th>
              <th>Drop Off Location</th>
            </tr>
            
              {customers.map((customer) => (
              <DraggableCustomer key={customer.customerId} customer={customer} />
            ))}
            
          </table> 
          </div>
        </div>

        <div className="planner">
          <h2>Planner</h2>
          <table>
            <tbody>
              {planner?.map((plannerItem) => (
                <tr key={formatLocal.format(new Date(plannerItem.date))}>
                  <td>{formatLocal.format(new Date(plannerItem.date).getTime()+(7*24*60*60*1000))}</td>
                  <DraggableSlot slot={plannerItem.slots.slot1} onDrop={(customerId) => handleDrop(customerId, 'slot1')} />
                  <DraggableSlot slot={plannerItem.slots.slot2} onDrop={(customerId) => handleDrop(customerId, 'slot2')} />
                  <DraggableSlot slot={plannerItem.slots.slot3} onDrop={(customerId) => handleDrop(customerId, 'slot3')} />
                  <DraggableSlot slot={plannerItem.slots.slot4} onDrop={(customerId) => handleDrop(customerId, 'slot4')} />
                  {/* ... repeat for other slots ... */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DndProvider>
  );
};

export default Info;
