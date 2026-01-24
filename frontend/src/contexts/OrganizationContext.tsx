import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useOrganizations } from '@/hooks/useOrganizations';
import { OrganizationWithStats } from '@/types';

interface OrganizationContextValue {
  currentOrganization: OrganizationWithStats | null;
  setCurrentOrganization: (org: OrganizationWithStats | null) => void;
  organizations: OrganizationWithStats[];
  isLoading: boolean;
}

const OrganizationContext = createContext<OrganizationContextValue | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { data: organizations = [], isLoading } = useOrganizations();
  const [currentOrganization, setCurrentOrganization] = useState<OrganizationWithStats | null>(null);
  
  // Set first organization as default when loaded
  useEffect(() => {
    if (!isLoading && organizations.length > 0 && !currentOrganization) {
      // Try to get from localStorage first
      const savedOrgId = localStorage.getItem('currentOrganizationId');
      const savedOrg = savedOrgId 
        ? organizations.find(o => o.id === savedOrgId)
        : organizations[0];
      
      if (savedOrg) {
        setCurrentOrganization(savedOrg);
      }
    }
  }, [organizations, isLoading, currentOrganization]);
  
  // Save to localStorage when organization changes
  useEffect(() => {
    if (currentOrganization) {
      localStorage.setItem('currentOrganizationId', currentOrganization.id);
    }
  }, [currentOrganization]);
  
  return (
    <OrganizationContext.Provider
      value={{
        currentOrganization,
        setCurrentOrganization,
        organizations,
        isLoading,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within OrganizationProvider');
  }
  return context;
}
