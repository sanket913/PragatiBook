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
import { billsApi, ApiError } from '@/lib/api';

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
        id: bill.id || bill._id,
      }));

      setBills(formattedBills);
      setError('');
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
        if (error.status === 401) {
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
        await billsApi.update(selectedBill.id, billData);
      } else {
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
    setSelectedCustomer('all');
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
            onBack={() => setCurrentView('list')}
          />
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
            <div className="p-6 sm:p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm sm:text-base">Loading bills...</p>
            </div>
          );
        }
        
        if (error) {
          return (
            <div className="p-6 sm:p-12 text-center">
              <div className="text-red-600 mb-4">
                <p className="text-base sm:text-lg font-semibold">Error loading bills</p>
                <p className="text-sm sm:text-base">{error}</p>
              </div>
              <Button onClick={loadBills} variant="outline" size="sm">
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 relative">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-orange-100 sticky top-0 z-40">
        <div className="w-full px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-18">
            {/* Logo Section */}
            <div className="flex items-center flex-shrink-0">
              <div className="w-12 h-10 sm:w-16 sm:h-12 md:w-20 md:h-14 lg:w-24 lg:h-16 flex-shrink-0">
                <img 
                  src="/PG1.png"
                  alt="PragatiBook Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            
            {/* Center Section - User Info (Hidden on mobile) */}
            <div className="hidden md:flex flex-1 justify-center px-4">
              <div className="text-center">
                <p className="text-sm lg:text-base text-gray-600 font-medium">
                  Welcome, {user.name}
                </p>
              </div>
            </div>
            
            {/* Right Section - Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Templates Button - Hidden on mobile when in list view */}
              {currentView === 'list' && (
                <Button 
                  variant="outline" 
                  onClick={handleTemplateManager} 
                  className="hidden sm:flex items-center h-8 sm:h-9 lg:h-10 px-2 sm:px-3 lg:px-4 text-xs sm:text-sm border-orange-200 text-orange-700 hover:bg-orange-50"
                  size="sm"
                >
                  <Palette className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                  <span className="ml-1 sm:ml-2">Templates</span>
                </Button>
              )}
              
              {/* New Bill Button - Hidden on mobile when in list view (will be floating) */}
              {currentView === 'list' && (
                <Button 
                  onClick={handleCreateBill} 
                  className="hidden sm:flex items-center h-8 sm:h-9 lg:h-10 px-2 sm:px-3 lg:px-4 text-xs sm:text-sm bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600" 
                  size="sm"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                  <span className="ml-1 sm:ml-2">New Bill</span>
                </Button>
              )}
              
              {/* Logout Button */}
              <Button 
                variant="outline" 
                onClick={onLogout} 
                className="flex items-center h-8 sm:h-9 lg:h-10 px-2 sm:px-3 lg:px-4 text-xs sm:text-sm border-orange-200 text-orange-700 hover:bg-orange-50" 
                size="sm"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                <span className="ml-1 sm:ml-2">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Action Bar - Only visible on mobile for list view */}
      {currentView === 'list' && (
        <div className="sm:hidden bg-white/95 backdrop-blur-sm border-b border-orange-100 px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                Welcome, {user.name}
              </p>
              <p className="text-xs text-gray-600">
                {filteredBills.length} of {bills.length} Bills
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleTemplateManager} 
              className="flex items-center h-8 px-3 text-xs border-orange-200 text-orange-700 hover:bg-orange-50"
              size="sm"
            >
              <Palette className="w-3 h-3 mr-1" />
              Templates
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="w-full px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 pb-20 sm:pb-8">
        {currentView === 'list' ? (
          <div className="mb-4 sm:mb-6 lg:mb-8">
            {/* Welcome Section - Desktop Only */}
            <div className="hidden sm:flex items-center justify-between mb-6 lg:mb-8">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900">
                  Your Bills
                </h2>
              </div>
              
              {/* Bills Counter */}
              <div className="flex items-center bg-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg shadow-sm border flex-shrink-0">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 mr-2" />
                <span className="text-sm sm:text-base font-medium text-gray-700 whitespace-nowrap">
                  {filteredBills.length} of {bills.length} Bills
                </span>
              </div>
            </div>
            
            {/* Search and Filter Section */}
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-orange-100 p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 lg:mb-8">
              <div className="space-y-3 sm:space-y-4 lg:space-y-0 lg:flex lg:gap-4 xl:gap-6">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-4 h-4" />
                  <Input
                    placeholder="Search by customer name or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 h-9 sm:h-10 lg:h-11 text-sm sm:text-base border-2 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                  />
                </div>
                
                {/* Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:flex-shrink-0">
                  {/* Customer Filter */}
                  <div className="w-full sm:w-48 lg:w-56">
                    <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                      <SelectTrigger className="w-full h-9 sm:h-10 lg:h-11 border-2 border-orange-200 focus:border-orange-400 focus:ring-orange-400">
                        <div className="flex items-center min-w-0">
                          <Filter className="w-4 h-4 mr-2 text-orange-400 flex-shrink-0" />
                          <SelectValue placeholder="Filter by customer" className="text-sm sm:text-base truncate" />
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
                  {(searchQuery || selectedCustomer !== 'all') && (
                    <Button
                      variant="outline" 
                      onClick={clearFilters}
                      className="flex items-center justify-center whitespace-nowrap h-9 sm:h-10 lg:h-11 px-3 sm:px-4 border-orange-200 text-orange-700 hover:bg-orange-50 w-full sm:w-auto"
                      size="sm"
                    >
                      <X className="w-4 h-4 mr-2 flex-shrink-0" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Results Summary */}
              {(searchQuery || selectedCustomer !== 'all') && (
                <div className="mt-3 sm:mt-4 lg:mt-6 pt-3 sm:pt-4 lg:pt-6 border-t text-xs sm:text-sm lg:text-base text-gray-600">
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

      {/* Floating New Bill Button - Mobile Only */}
      {currentView === 'list' && (
        <div className="sm:hidden fixed bottom-6 right-4 z-50">
          <Button 
            onClick={handleCreateBill} 
            className="w-14 h-14 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
            size="sm"
          >
            <Plus className="w-6 h-6 text-white" />
          </Button>
        </div>
      )}
    </div>
  );
}