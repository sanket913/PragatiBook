'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Bill } from '@/types/bill';
import { TemplateSettings } from '@/types/template';
import { User } from '@/types/auth';
import { ArrowLeft, Edit, Download, Share2, Calendar, Building2 } from 'lucide-react';
import { generatePDF } from '@/utils/pdfGenerator';
import { shareOnWhatsApp, shareViaWebShare } from '@/utils/whatsappShare';

interface BillViewProps {
  user: User;
  bill: Bill;
  onEdit: () => void;
  onBack: () => void;
}

export default function BillView({ user, bill, onEdit, onBack }: BillViewProps) {
  const getActiveTemplate = (): TemplateSettings | undefined => {
    const activeTemplateId = localStorage.getItem(`ap1700_active_template_${user.id}`);
    if (!activeTemplateId) return undefined;
    
    const allTemplates = JSON.parse(localStorage.getItem('ap1700_templates') || '[]');
    return allTemplates.find((t: TemplateSettings) => t.id === activeTemplateId);
  };

  const handleDownload = async () => {
    try {
      const activeTemplate = getActiveTemplate();
      await generatePDF(bill, false, activeTemplate);
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
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mr-4 p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bill Details</h2>
            <p className="text-gray-600">View and manage this bill</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline"  onClick={() => handleDownload()} className="flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={() => handleShare(bill)} className="flex items-center text-green-600 border-green-200 hover:bg-green-50">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button onClick={onEdit} className="flex items-center">
            <Edit className="w-4 h-4 mr-2" />
            Edit Bill
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bill Header */}
        <Card className="lg:col-span-3">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-sm text-gray-600">Bill ID</p>
                <p className="font-mono text-sm">{bill.id}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Customer Name</p>
              <p className="text-lg font-semibold">{bill.customerName}</p>
            </div>
            
            {bill.description && (
              <div>
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="text-gray-900">{bill.description}</p>
              </div>
            )}
            
            <div>
              <p className="text-sm font-medium text-gray-500 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Date
              </p>
              <p className="text-gray-900">{formatDate(bill.date)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Bill Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Bill Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Items</span>
              <Badge variant="secondary">{bill.items.length}</Badge>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total Amount</span>
              <span className="text-green-600">₹{bill.total.toFixed(2)}</span>
            </div>
            
  
          </CardContent>
        </Card>

        
      </div>

      {/* Items Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Bill Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">#</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Description</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Feet</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Inches</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Qty</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Rate</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody>
                {bill.items.map((item, index) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-600">{index + 1}</td>
                    <td className="py-3 px-4 font-medium">{item.text || '-'}</td>
                    <td className="py-3 px-4 text-right">{item.feet}</td>
                    <td className="py-3 px-4 text-right">{item.inches}</td>
                    <td className="py-3 px-4 text-right">{item.quantity || '-'}</td>
                    <td className="py-3 px-4 text-right">₹{item.defaultValue.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-semibold">₹{item.calculatedValue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 bg-gray-50">
                  <td colSpan={6} className="py-4 px-4 text-right font-semibold text-lg">
                    Total Amount:
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-lg text-green-600">
                    ₹{bill.total.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}