import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { patientsAPI, investigationsAPI, treatmentsAPI } from '../services/api';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // State for patients and related data
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Services for billing
  const [services] = useState([
    { id: '1', name: 'Consultation', price: 50 },
    { id: '2', name: 'Follow-up Visit', price: 30 },
    { id: '3', name: 'Lab Test - Basic', price: 25 },
    { id: '4', name: 'Lab Test - Comprehensive', price: 75 },
    { id: '5', name: 'X-Ray', price: 100 },
    { id: '6', name: 'Ultrasound', price: 120 },
    { id: '7', name: 'Vaccination', price: 45 },
    { id: '8', name: 'Prescription', price: 15 },
  ]);
  
  // User related data
  const [currentUser] = useState({
    id: '1',
    name: 'Dr. John Doe',
    role: 'doctor',
  });
  
  // Doctor data
  const [doctors] = useState([
    { id: '1', name: 'Dr. John Doe', specialty: 'General Medicine' },
    { id: '2', name: 'Dr. Jane Smith', specialty: 'Pediatrics' },
    { id: '3', name: 'Dr. Robert Johnson', specialty: 'Orthopedics' },
  ]);  // Get authentication state from AuthContext
  const { isAuthenticated } = useAuth();
  
  // Load patients data from API only if user is authenticated
  useEffect(() => {
    // Skip fetching if not authenticated
    if (!isAuthenticated) {
      return;
    }
    
    const fetchPatients = async () => {
      setIsLoading(true);
      try {
        const response = await patientsAPI.getAllPatients();
        setPatients(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch patients:", err);
        // Only set error if it's not a 401 (unauthorized) error
        if (err.response?.status !== 401) {
          setError(typeof err === 'object' ? (err.message || "Failed to fetch patients") : err);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPatients();
  }, [isAuthenticated]); // Re-fetch when authentication state changes
  // Add a new patient
  const addPatient = async (patientData) => {
    setIsLoading(true);
    try {
      // Make sure we're sending the right format to the API
      const response = await patientsAPI.createPatient(patientData);
      
      // Add the new patient to the state
      const newPatient = response.data;
      setPatients(prevPatients => [...prevPatients, newPatient]);
      setError(null);
      return newPatient;
    } catch (err) {
      console.error("Failed to add patient:", err);
      // Extract the error message from the response if available
      const errorMessage = err.response?.data?.detail || 
                          err.message || 
                          "Failed to add patient";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
    // Delete a patient
  const deletePatient = async (patientId) => {
    setIsLoading(true);
    try {
      await patientsAPI.deletePatient(patientId);
      
      // Remove the patient from the state
      setPatients(patients.filter(patient => patient.id !== patientId));
      setError(null);
    } catch (err) {
      console.error("Failed to delete patient:", err);
      setError(typeof err === 'object' ? (err.message || "Failed to delete patient") : err); // Ensure error is a string
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update patient information
  const updatePatient = async (patientId, patientData) => {
    setIsLoading(true);
    try {
      const response = await patientsAPI.updatePatient(patientId, patientData);
      
      // Update the patient in the state
      const updatedPatient = response.data;
      setPatients(prevPatients => prevPatients.map(patient => 
        patient.id === patientId ? updatedPatient : patient
      ));
      
      setError(null);
      return updatedPatient;
    } catch (err) {
      console.error("Failed to update patient:", err);
      const errorMessage = err.response?.data?.detail || 
                           err.message || 
                           "Failed to update patient";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add a new invoice
  const addInvoice = (patientId, invoiceData) => {
    const updatedPatients = patients.map(patient => {
      if (patient.id === patientId) {
        const invoices = patient.invoices || [];
        return {
          ...patient,
          invoices: [...invoices, { id: uuidv4(), ...invoiceData }]
        };
      }
      return patient;
    });
    
    setPatients(updatedPatients);
    return updatedPatients.find(p => p.id === patientId)?.invoices.slice(-1)[0];
  };
  
  // Update an existing invoice
  const updateInvoice = (patientId, invoiceId, invoiceData) => {
    const updatedPatients = patients.map(patient => {
      if (patient.id === patientId) {
        const invoices = patient.invoices || [];
        return {
          ...patient,
          invoices: invoices.map(invoice => 
            invoice.id === invoiceId 
              ? { ...invoice, ...invoiceData, updatedAt: new Date().toISOString() }
              : invoice
          )
        };
      }
      return patient;
    });
    
    setPatients(updatedPatients);
    return updatedPatients
      .find(p => p.id === patientId)
      ?.invoices.find(inv => inv.id === invoiceId);
  };
  
  // Add a new investigation
  const addInvestigation = async (investigationData) => {
    setIsLoading(true);
    try {
      const response = await investigationsAPI.createInvestigation(investigationData);
      
      // Update patient with the new investigation
      const newInvestigation = response.data;
      setPatients(prevPatients => {
        return prevPatients.map(patient => {
          if (patient.id === investigationData.patientId) {
            const investigations = patient.investigations || [];
            return {
              ...patient,
              investigations: [...investigations, newInvestigation]
            };
          }
          return patient;
        });
      });
      
      setError(null);
      return newInvestigation;
    } catch (err) {
      console.error("Failed to add investigation:", err);
      const errorMessage = err.response?.data?.detail || 
                           err.message || 
                           "Failed to add investigation";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update an investigation
  const updateInvestigation = async (investigationId, patientId, investigationData) => {
    setIsLoading(true);
    try {
      // In a full implementation, this would call the API
      // const response = await investigationsAPI.updateInvestigation(investigationId, investigationData);
      
      // For now, we're updating the state directly
      const updatedInvestigation = { id: investigationId, ...investigationData };
      
      setPatients(prevPatients => {
        return prevPatients.map(patient => {
          if (patient.id === patientId) {
            const investigations = patient.investigations || [];
            return {
              ...patient,
              investigations: investigations.map(inv => 
                inv.id === investigationId ? updatedInvestigation : inv
              )
            };
          }
          return patient;
        });
      });
      
      setError(null);
      return updatedInvestigation;
    } catch (err) {
      console.error("Failed to update investigation:", err);
      const errorMessage = typeof err === 'object' ? (err.message || "Failed to update investigation") : err;
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add a new treatment
  const addTreatment = async (treatmentData) => {
    setIsLoading(true);
    try {
      const response = await treatmentsAPI.createTreatment(treatmentData);
      
      // Update patient with the new treatment
      const newTreatment = response.data;
      setPatients(prevPatients => {
        return prevPatients.map(patient => {
          if (patient.id === treatmentData.patientId) {
            const treatments = patient.treatments || [];
            return {
              ...patient,
              treatments: [...treatments, newTreatment]
            };
          }
          return patient;
        });
      });
      
      setError(null);
      return newTreatment;
    } catch (err) {
      console.error("Failed to add treatment:", err);
      const errorMessage = err.response?.data?.detail || 
                           err.message || 
                           "Failed to add treatment";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update a treatment
  const updateTreatment = async (treatmentId, patientId, treatmentData) => {
    setIsLoading(true);
    try {
      // In a full implementation, this would call the API
      // const response = await treatmentsAPI.updateTreatment(treatmentId, treatmentData);
      
      // For now, we're updating the state directly
      const updatedTreatment = { id: treatmentId, ...treatmentData };
      
      setPatients(prevPatients => {
        return prevPatients.map(patient => {
          if (patient.id === patientId) {
            const treatments = patient.treatments || [];
            return {
              ...patient,
              treatments: treatments.map(tr => 
                tr.id === treatmentId ? updatedTreatment : tr
              )
            };
          }
          return patient;
        });
      });
      
      setError(null);
      return updatedTreatment;
    } catch (err) {
      console.error("Failed to update treatment:", err);
      const errorMessage = typeof err === 'object' ? (err.message || "Failed to update treatment") : err;
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  const value = {
    patients,
    isLoading,
    error,
    addPatient,
    updatePatient,
    deletePatient,
    services,
    doctors,
    currentUser,
    addInvoice,
    updateInvoice,
    addInvestigation,
    updateInvestigation,
    addTreatment,
    updateTreatment,
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
