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
      await generatePDF(bill, false, activeTemplate || undefined); // ✅ safe fallback
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
        await shareOnWhatsApp(bill); // ✅ fallback without template
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
      <div className="p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <Eye className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No bills yet</h3>
          <p className="text-gray-600 mb-6">
            Get started by creating your first bill. Click the "New Bill" button to begin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid gap-4">
        {bills.map((bill) => (
          <Card 
            key={bill.id} 
            className={`transition-all duration-200 hover:shadow-md ${
              deletingId === bill.id ? 'opacity-50 scale-95' : ''
            }`}
          >
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate mr-4">
                      {bill.customerName}
                    </h3>
                    <Badge variant="outline" className="flex items-center">
                      ₹
                      {bill.total.toFixed(2)}
                    </Badge>
                  </div>
                  
                  {bill.description && (
                    <p className="text-gray-600 mb-2 line-clamp-2">{bill.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(bill.date)}
                    </div>
                    <span>•</span>
                    <span>{bill.items.length} items</span>
                    <span>•</span>
                    <span>Updated {formatDate(bill.updatedAt)}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(bill)}
                    className="flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(bill)}
                    className="flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(bill)}
                    className="flex items-center"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    PDF
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare(bill)}
                    className="flex items-center text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(bill)}
                    disabled={deletingId === bill.id}
                    className="flex items-center text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}