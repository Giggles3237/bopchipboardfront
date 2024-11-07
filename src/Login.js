import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const onSubmit = async (data) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, data);
        // ... rest of the code ...
    } catch (error) {
        // ... error handling ...
    }
};

// ... existing code ... 