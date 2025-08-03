'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';

interface BillItem {
  id: string;
  text: string;
  feet: number;
  inches: number;
  quantity?: number;
  defaultValue: number;
  calculatedValue: number;
}

interface BillFormProps {
  bill?: any | null;
  onSave: (bill: any) => void;
  onCancel: () => void;
}

export default function BillForm({ bill, onSave, onCancel }: BillFormProps) {
  const [customerName, setCustomerName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<BillItem[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (bill) {
      setCustomerName(bill.customerName);
      setDescription(bill.description || '');
      setDate(bill.date);
      setItems(bill.items);
    } else {
      // Initialize with empty items array for new bills
      setItems([]);
    }
  }, [bill]);

  useEffect(() => {
    // Calculate total whenever items change
    const newTotal = items.reduce((sum, item) => sum + item.calculatedValue, 0);
    setTotal(newTotal);
  }, [items]);

  const addItem = () => {
    const newItem: BillItem = {
      id: Math.random().toString(36).substring(2),
      text: '',
      feet: 0,
      inches: 0,
      quantity: undefined,
      defaultValue: 0,
      calculatedValue: 0
    };
    setItems(prev => [...prev, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof BillItem, value: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        
        // Recalculate if numeric fields changed
        if (['feet', 'inches', 'defaultValue', 'quantity'].includes(field)) {
          // Calculate based on the new logic
          if (updated.quantity && updated.quantity > 0) {
            // If quantity is given
            if ((updated.feet > 0 || updated.inches > 0) && updated.defaultValue > 0) {
              // Measurement + quantity + rate: calculate according to measurement and multiply by quantity
              const totalInches = updated.feet * 12 + updated.inches;
              updated.calculatedValue = totalInches * updated.defaultValue * updated.quantity;
            } else if (updated.defaultValue > 0) {
              // Only quantity + rate: multiply rate with quantity
              updated.calculatedValue = updated.defaultValue * updated.quantity;
            } else {
              updated.calculatedValue = 0;
            }
          } else {
            // No quantity given
            if ((updated.feet > 0 || updated.inches > 0) && updated.defaultValue > 0) {
              // Measurement + rate: consider quantity as 1 (default)
              const totalInches = updated.feet * 12 + updated.inches;
              updated.calculatedValue = totalInches * updated.defaultValue * 1;
            } else {
              updated.calculatedValue = 0;
            }
          }
        }
        
        return updated;
      }
      return item;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName.trim()) {
      alert('Please enter a customer name');
      return;
    }

    // Validate that each item has either measurements OR quantity with rate
    const invalidItems = items.filter(item => {
      const hasMeasurements = item.feet > 0 || item.inches > 0;
      const hasRate = item.defaultValue > 0;
      return !hasRate || (!hasMeasurements && (!item.quantity || item.quantity <= 0));
    });
    
    if (invalidItems.length > 0) {
      alert('Each item must have a rate and either measurements (feet/inches) or quantity');
      return;
    }

    onSave({
      customerName: customerName.trim(),
      description: description.trim(),
      date,
      items,
      total
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="mr-3 sm:mr-4 p-2 h-8 w-8 sm:h-9 sm:w-9"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            {bill ? 'Edit Bill' : 'Create New Bill'}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-5">
              <div>
                <Label htmlFor="customerName" className="text-sm sm:text-base font-medium">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  required
                  className="mt-1 h-10 sm:h-11"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-sm sm:text-base font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description or notes"
                  rows={4}
                  className="mt-1 text-sm sm:text-base"
                />
              </div>
              <div>
                <Label htmlFor="date" className="text-sm sm:text-base font-medium">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="mt-1 h-10 sm:h-11"
                />
              </div>
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4 text-sm sm:text-base">
                <p><strong>Customer:</strong> {customerName || 'Not specified'}</p>
                <p><strong>Date:</strong> {date}</p>
                <p><strong>Items:</strong> {bill ? items.length : 0}</p>
                <Separator />
                <div className="text-right">
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-600">
                    Total: ₹{total.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Items Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg sm:text-xl">Bill Items</CardTitle>
              <Button type="button" onClick={addItem} size="sm" className="flex items-center text-sm h-9 sm:h-10">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Add Item</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center py-8 sm:py-12 text-gray-500">
                <p className="mb-6 text-base sm:text-lg">No items added yet</p>
                <Button type="button" onClick={addItem} variant="outline" className="flex items-center mx-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Item
                </Button>
              </div>
            ) : (
            <div className="space-y-4 sm:space-y-6">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-8 gap-4 sm:gap-6 p-4 sm:p-6 border rounded-lg bg-gray-50 transition-all duration-200 hover:bg-gray-100"
                >
                  <div className="sm:col-span-2 lg:col-span-2">
                    <Label className="text-sm font-medium">Description (Optional)</Label>
                    <Input
                      value={item.text}
                      onChange={(e) => updateItem(item.id, 'text', e.target.value)}
                      placeholder="Enter description (optional)"
                      className="mt-1 h-9 sm:h-10"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Feet</Label>
                    <Input
                      type="number"
                      value={item.feet}
                      onChange={(e) => updateItem(item.id, 'feet', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.1"
                      placeholder="0"
                      className="mt-1 h-9 sm:h-10"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Inches</Label>
                    <Input
                      type="number"
                      value={item.inches}
                      onChange={(e) => updateItem(item.id, 'inches', parseFloat(e.target.value) || 0)}
                      min="0"
                      max="11"
                      step="0.1"
                      placeholder="0"
                      className="mt-1 h-9 sm:h-10"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Qty</Label>
                    <Input
                      type="number"
                      value={item.quantity || ''}
                      onChange={(e) => updateItem(item.id, 'quantity', e.target.value ? parseFloat(e.target.value) : 0)}
                      min="1"
                      step="1"
                      placeholder="1"
                      className="mt-1 h-9 sm:h-10"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Rate *</Label>
                    <Input
                      type="number"
                      value={item.defaultValue}
                      onChange={(e) => updateItem(item.id, 'defaultValue', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      required
                      className="mt-1 h-9 sm:h-10"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Total</Label>
                    <div className="h-9 sm:h-10 flex items-center px-3 bg-orange-50 border rounded-md mt-1">
                      <span className="font-medium text-orange-700 text-sm">
                        ₹{item.calculatedValue.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-end sm:col-span-2 lg:col-span-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                      className="w-full sm:w-auto h-9 sm:h-10 mt-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 sm:pt-8">
          <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto h-10 sm:h-11">
            Cancel
          </Button>
          <Button type="submit" className="w-full sm:w-auto sm:min-w-32 h-10 sm:h-11">
            {bill ? 'Update Bill' : 'Create Bill'}
          </Button>
        </div>
      </form>
    </div>
  );
}