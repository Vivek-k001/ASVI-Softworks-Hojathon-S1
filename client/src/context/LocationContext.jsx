import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [locations, setLocations] = useState([
    { _id: 'perinthalmanna', name: 'Perinthalmanna', slug: 'perinthalmanna' },
    { _id: 'angadipuram', name: 'Angadipuram', slug: 'angadipuram' },
  ]);
  const [selectedLocation, setSelectedLocation] = useState(() => {
    return localStorage.getItem('pmna_selected_location') || 'all';
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await api.get('/locations');
        if (res.data?.success && res.data.data.length > 0) {
          setLocations(res.data.data);
        }
      } catch (err) {
        console.warn('Using default locations list', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  const changeLocation = (locId) => {
    setSelectedLocation(locId);
    localStorage.setItem('pmna_selected_location', locId);
  };

  const getSelectedLocationName = () => {
    if (selectedLocation === 'all') return 'All Locations';
    const match = locations.find((l) => l._id === selectedLocation || l.slug === selectedLocation || l.name === selectedLocation);
    return match ? match.name : 'All Locations';
  };

  return (
    <LocationContext.Provider
      value={{
        locations,
        selectedLocation,
        changeLocation,
        getSelectedLocationName,
        loading,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
