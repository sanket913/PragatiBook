'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bill } from '@/types/bill';
import { TemplateSettings } from '@/types/template';
import BillForm from './BillForm';
import BillList from './BillList';
import BillView from './BillView';
import TemplateManager from './TemplateManager';
import TemplateCustomizer from './TemplateCustomizer';
import { LogOut, Plus, FileText, Palette, Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { billsApi, ApiError } from '@/lib/api'; // ✅ Correct import

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

type ViewState = 'list' | 'create' | 'edit' | 'view' | 'templates' | 'template-create' | 'template-edit';

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [templates, setTemplates] = useState<TemplateSettings[]>([]);
  const [currentView, setCurrentView] = useState<ViewState>('list');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateSettings | null>(null);
  const [activeTemplateId, setActiveTemplateId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('all');
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);


  useEffect(() => {
    loadBills();
    loadTemplates();
    loadActiveTemplate();
  }, [user.id]);

  useEffect(() => {
    // Filter bills based on search query and selected customer
    let filtered = bills;
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(bill =>
        bill.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (bill.description && bill.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    if (selectedCustomer && selectedCustomer !== 'all') {
      filtered = filtered.filter(bill => bill.customerName === selectedCustomer);
    }
    
    setFilteredBills(filtered);
  }, [bills, searchQuery, selectedCustomer]);

  const loadBills = async () => {
    try {
      setLoading(true);
      const userBills = await billsApi.getAll();
      const formattedBills = userBills.map((bill: any) => ({
      ...bill,
      id: bill.id || bill._id, // map _id to id if needed
    }));

      setBills(formattedBills);
      setError('');
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
        if (error.status === 401) {
          // Token expired, logout user
          onLogout();
          return;
        }
      } else {
        setError('Failed to load bills');
      }
    } finally {
      setLoading(false);
    }
  };

  const saveBill = async (billData: any) => {
    try {
      setLoading(true);
      
      if (selectedBill) {
        // Update existing bill
        await billsApi.update(selectedBill.id, billData);
      } else {
        // Create new bill
        await billsApi.create(billData);
      }
      
      await loadBills();
      setCurrentView('list');
      setSelectedBill(null);
    } catch (error) {
      if (error instanceof ApiError) {
        alert(`Error: ${error.message}`);
      } else {
        alert('Failed to save bill. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteBill = async (billId: string) => {
    try {
      setLoading(true);
      await billsApi.delete(billId);
      await loadBills();
    } catch (error) {
      if (error instanceof ApiError) {
        alert(`Error: ${error.message}`);
      } else {
        alert('Failed to delete bill. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  const loadTemplates = () => {
  const storedTemplates = JSON.parse(localStorage.getItem('ap1700_templates') || '[]');
  setTemplates(storedTemplates);
  };

const loadActiveTemplate = () => {
  const activeTemplate = localStorage.getItem(`ap1700_active_template_${user.id}`);
  if (activeTemplate) {
    setActiveTemplateId(activeTemplate);
  }
};
  const handleCreateBill = () => {
    setSelectedBill(null);
    setCurrentView('create');
  };

  const handleEditBill = (bill: any) => {
    setSelectedBill(bill);
    setCurrentView('edit');
  };

  const handleViewBill = (bill: any) => {
    setSelectedBill(bill);
    setCurrentView('view');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCustomer('all'); // ✅ Correct reset
  };
  const saveTemplate = (templateData: TemplateSettings) => {
    const allTemplates = JSON.parse(localStorage.getItem('ap1700_templates') || '[]');
    
    const existingIndex = allTemplates.findIndex((t: TemplateSettings) => t.id === templateData.id);
    if (existingIndex >= 0) {
      allTemplates[existingIndex] = templateData;
    } else {
      allTemplates.push(templateData);
    }
    
    localStorage.setItem('ap1700_templates', JSON.stringify(allTemplates));
    loadTemplates();
    setCurrentView('templates');
    setSelectedTemplate(null);
  };

  const selectTemplate = (template: TemplateSettings) => {
    setActiveTemplateId(template.id);
    localStorage.setItem(`ap1700_active_template_${user.id}`, template.id);
  };

  const handleTemplateManager = () => {
    setCurrentView('templates');
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setCurrentView('template-create');
  };

  const handleEditTemplate = (template: TemplateSettings) => {
    setSelectedTemplate(template);
    setCurrentView('template-edit');
  };
  // Get unique customer names for filter dropdown
  const uniqueCustomers = Array.from(new Set(bills.map(bill => bill.customerName))).sort();

  const renderContent = () => {
    switch (currentView) {
      case 'create':
      case 'edit':
        return (
          <BillForm
            bill={selectedBill}
            onSave={saveBill}
            onCancel={() => {
              setCurrentView('list');
              setSelectedBill(null);
            }}
          />
        );
      case 'view':
        return selectedBill ? (
          <BillView
            user={user}
            bill={selectedBill}
            onEdit={() => handleEditBill(selectedBill)}
            onBack={() => setCurrentView('list')}/>
        ) : null;
        case 'templates':
        return (
          <TemplateManager
            user={user}
            onBack={() => setCurrentView('list')}
            onCreateTemplate={handleCreateTemplate}
            onEditTemplate={handleEditTemplate}
            onSelectTemplate={selectTemplate}
            selectedTemplateId={activeTemplateId}
          />
        );
      case 'template-create':
      case 'template-edit':
        return (
          <TemplateCustomizer
            user={user}
            onBack={() => setCurrentView('templates')}
            onSave={saveTemplate}
            existingTemplate={selectedTemplate}
          />
        );
      default:
        if (loading) {
          return (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading bills...</p>
            </div>
          );
        }
        
        if (error) {
          return (
            <div className="p-12 text-center">
              <div className="text-red-600 mb-4">
                <p className="text-lg font-semibold">Error loading bills</p>
                <p>{error}</p>
              </div>
              <Button onClick={loadBills} variant="outline">
                Try Again
              </Button>
            </div>
          );
        }
        
        return (
          <BillList
            user={user}
            bills={filteredBills}
            onView={handleViewBill}
            onEdit={handleEditBill}
            onDelete={deleteBill}
            loading={loading}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16 lg:h-18">
            <div className="flex items-center flex-shrink-0">
              <div className="w-32 h-12 sm:w-20 sm:h-12 md:w-24 md:h-14 lg:w-32 lg:h-16 mr-3 sm:mr-4 flex-shrink-0 p-1 sm:p-2">
                <img 
                  src="/PG1.png"
                  alt="PragatiBook Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              {currentView === 'list' && (
                <>
                <Button variant="outline" onClick={handleTemplateManager} className="flex items-center">
                   <Palette className="w-4 h-4 mr-2" />
                   Templates
                 </Button>
                <Button onClick={handleCreateBill} className="flex items-center text-xs sm:text-sm h-8 sm:h-9 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600" size="sm">
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="hidden sm:inline">New Bill</span>
                  <span className="sm:hidden">New</span>
                </Button>
                </>
              )}
              <Button variant="outline" onClick={onLogout} className="flex items-center text-xs sm:text-sm h-8 sm:h-9 border-orange-200 text-orange-700 hover:bg-orange-50" size="sm">
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
        {currentView === 'list' ? (
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm md:text-base text-black font-bold truncate">Welcome, {user.name}</p>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Your Bills</h2>
                
              </div>
              <div className="flex items-center bg-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg shadow-sm border flex-shrink-0">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 mr-2 flex-shrink-0" />
                <span className="text-sm sm:text-base font-medium text-gray-700 whitespace-nowrap">
                  {filteredBills.length} of {bills.length} Bills
                </span>
              </div>
            </div>
            
            {/* Search and Filter Section */}
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-orange-100 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <Input
                    placeholder="Search by customer name or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 sm:pl-12 pr-4 h-10 sm:h-11 text-sm sm:text-base border-2 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                  />
                </div>
                
                {/* Customer Filter */}
                <div className="w-full sm:w-64 lg:w-72">
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                    <SelectTrigger className="w-full h-10 sm:h-11 border-2 border-orange-200 focus:border-orange-400 focus:ring-orange-400">
                      <div className="flex items-center">
                        <Filter className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-orange-400 flex-shrink-0" />
                        <SelectValue placeholder="Filter by customer" className="text-sm sm:text-base" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Customers</SelectItem>
                      {uniqueCustomers.map((customer) => (
                        <SelectItem key={customer} value={customer}>
                          {customer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Clear Filters */}
                {(searchQuery || selectedCustomer) && (
                  <Button
                    variant="outline" 
                    onClick={clearFilters}
                    className="flex items-center whitespace-nowrap h-10 sm:h-11 px-3 sm:px-4 border-orange-200 text-orange-700 hover:bg-orange-50"
                    size="sm"
                  >
                    <X className="w-4 h-4 mr-1 sm:mr-2 flex-shrink-0" />
                    <span className="hidden sm:inline">Clear</span>
                    <span className="sm:hidden">Clear</span>
                  </Button>
                )}
              </div>
              
              {/* Results Summary */}
              {(searchQuery || selectedCustomer) && (
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t text-sm sm:text-base text-gray-600">
                  <p>
                    Showing {filteredBills.length} of {bills.length} bills
                    {searchQuery && (
                      <span> matching "{searchQuery}"</span>
                    )}
                    {selectedCustomer && selectedCustomer !== 'all' && (
                      <span> for customer "{selectedCustomer}"</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : null}
        
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-orange-100 overflow-hidden">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}