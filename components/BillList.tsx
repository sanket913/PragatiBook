'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bill } from '@/types/bill';
import { TemplateSettings } from '@/types/template';
import { User } from '@/types/auth';
import { Eye, Edit, Trash2, Download, Share2, Calendar, DollarSign } from 'lucide-react';
import { generatePDF } from '@/utils/pdfGenerator';
import { shareOnWhatsApp, shareViaWebShare } from '@/utils/whatsappShare';

interface BillListProps {
  user: User;
  bills: Bill[];
  onView: (bill: Bill) => void;
  onEdit: (bill: Bill) => void;
  onDelete: (billId: string) => void;
  loading: boolean;
}

export default function BillList({ user, bills, onView, onEdit, onDelete }: BillListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getActiveTemplate = (): TemplateSettings | undefined => {
    const activeTemplateId = localStorage.getItem(`ap1700_active_template_${user.id}`);
    if (!activeTemplateId) return undefined;
    
    const allTemplates = JSON.parse(localStorage.getItem('ap1700_templates') || '[]');
    return allTemplates.find((t: TemplateSettings) => t.id === activeTemplateId);
  };

  const handleDelete = async (bill: Bill) => {
    if (window.confirm(`Are you sure you want to delete the bill for ${bill.customerName}?`)) {
      setDeletingId(bill.id);
      setTimeout(() => {
        onDelete(bill.id);
        setDeletingId(null);
      }, 500);
    }
  };

  const handleDownload = async (bill: Bill) => {
    try {
      const activeTemplate = getActiveTemplate();
      await generatePDF(bill, false, activeTemplate || undefined);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleShare = async (bill: Bill) => {
    try {
      const activeTemplate = getActiveTemplate();
      if (activeTemplate) {
        await shareViaWebShare(bill, activeTemplate);
      } else {
        await shareOnWhatsApp(bill);
      }
    } catch (error) {
      console.error('Error sharing bill:', error);
      await shareOnWhatsApp(bill);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (bills.length === 0) {
    return (
      <div className="p-6 sm:p-8 lg:p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-100 rounded-full p-4 sm:p-6 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
            <Eye className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No bills yet</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">
            Get started by creating your first bill. Click the "New Bill" button to begin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <div className="space-y-3 sm:space-y-4">
        {bills.map((bill) => (
          <Card 
            key={bill.id} 
            className={`transition-all duration-200 hover:shadow-md ${
              deletingId === bill.id ? 'opacity-50 scale-95' : ''
            }`}
          >
            <CardContent className="p-4 sm:p-5 lg:p-6">
              {/* Responsive Layout */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                {/* Bill Information */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate mr-4 flex-1">
                      {bill.customerName}
                    </h3>
                    <Badge variant="outline" className="flex items-center text-sm px-3 py-1 flex-shrink-0">
                      <DollarSign className="w-3 h-3 mr-1" />
                      ₹{bill.total.toFixed(2)}
                    </Badge>
                  </div>
                  
                  {bill.description && (
                    <p className="text-sm sm:text-base text-gray-600 mb-3 line-clamp-2">{bill.description}</p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span>{formatDate(bill.date)}</span>
                    </div>
                    <span className="hidden sm:inline">•</span>
                    <span className="whitespace-nowrap">{bill.items.length} items</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden md:inline whitespace-nowrap">Updated {formatDate(bill.updatedAt)}</span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row lg:flex-row gap-2 sm:gap-3 lg:ml-6 lg:flex-shrink-0">
                  {/* Primary Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(bill)}
                      className="flex items-center justify-center flex-1 sm:flex-none h-9 text-sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(bill)}
                      className="flex items-center justify-center flex-1 sm:flex-none h-9 text-sm"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                  
                  {/* Secondary Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(bill)}
                      className="flex items-center justify-center flex-1 sm:flex-none h-9 text-sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare(bill)}
                      className="flex items-center justify-center flex-1 sm:flex-none text-green-600 border-green-200 hover:bg-green-50 h-9 text-sm"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(bill)}
                      disabled={deletingId === bill.id}
                      className="flex items-center justify-center text-red-600 border-red-200 hover:bg-red-50 h-9 w-9 sm:w-auto"
                    >
                      <Trash2 className="w-4 h-4 sm:mr-0" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}