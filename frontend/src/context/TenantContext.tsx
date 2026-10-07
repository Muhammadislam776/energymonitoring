import React, { createContext, useContext, useState, useEffect } from 'react';
import { Building, Floor } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface TenantContextType {
  buildings: Building[];
  selectedBuildingId: string;
  selectedBuilding: Building | null;
  floors: Floor[];
  selectedFloorId: string | null;
  setSelectedBuildingId: (id: string) => void;
  setSelectedFloorId: (id: string | null) => void;
  refreshBuildings: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('bldg-ettower-01');
  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);

  const fetchBuildings = async () => {
    if (!user) return;
    try {
      const bList = await api.getBuildings();
      setBuildings(bList);
      if (bList.length > 0) {
        // If current selectedBuildingId is not in list, select the first
        if (!bList.some(b => b.id === selectedBuildingId)) {
          setSelectedBuildingId(bList[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load buildings', err);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, [user]);

  // Load floors when selected building changes
  useEffect(() => {
    async function loadFloors() {
      if (selectedBuildingId) {
        try {
          const fList = await api.getFloors(selectedBuildingId);
          setFloors(fList);
          if (fList.length > 0 && !selectedFloorId) {
            setSelectedFloorId(fList[0].id);
          }
        } catch (err) {
          console.error('Failed to load floors for building', err);
        }
      }
    }
    loadFloors();
  }, [selectedBuildingId]);

  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId) || null;

  return (
    <TenantContext.Provider value={{
      buildings,
      selectedBuildingId,
      selectedBuilding,
      floors,
      selectedFloorId,
      setSelectedBuildingId,
      setSelectedFloorId,
      refreshBuildings: fetchBuildings
    }}>
      {children}
    </TenantContext.Provider>
  );
};

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
