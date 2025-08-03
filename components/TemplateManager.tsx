'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TemplateSettings } from '@/types/template';
import { User } from '@/types/auth';
import { Plus, Edit, Trash2, Copy, Eye, ArrowLeft } from 'lucide-react';

interface TemplateManagerProps {
  user: User;
  onBack: () => void;
  onCreateTemplate: () => void;
  onEditTemplate: (template: TemplateSettings) => void;
  onSelectTemplate: (template: TemplateSettings) => void;
  selectedTemplateId?: string;
}

export default function TemplateManager({ 
  user, 
  onBack, 
  onCreateTemplate, 
  onEditTemplate, 
  onSelectTemplate,
  selectedTemplateId 
}: TemplateManagerProps) {
  const [templates, setTemplates] = useState<TemplateSettings[]>([]);

  useEffect(() => {
    loadTemplates();
  }, [user.id]);

  const loadTemplates = () => {
    const allTemplates = JSON.parse(localStorage.getItem('ap1700_templates') || '[]');
    const userTemplates = allTemplates.filter((template: TemplateSettings) => template.userId === user.id);
    setTemplates(userTemplates);
  };

  const deleteTemplate = (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      const allTemplates = JSON.parse(localStorage.getItem('ap1700_templates') || '[]');
      const filteredTemplates = allTemplates.filter((template: TemplateSettings) => template.id !== templateId);
      localStorage.setItem('ap1700_templates', JSON.stringify(filteredTemplates));
      loadTemplates();
    }
  };

  const duplicateTemplate = (template: TemplateSettings) => {
    const newTemplate: TemplateSettings = {
      ...template,
      id: Math.random().toString(36).substring(2),
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const allTemplates = JSON.parse(localStorage.getItem('ap1700_templates') || '[]');
    allTemplates.push(newTemplate);
    localStorage.setItem('ap1700_templates', JSON.stringify(allTemplates));
    loadTemplates();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="flex items-center min-w-0">
          <Button variant="ghost" onClick={onBack} className="mr-3 sm:mr-4 p-2 h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Template Manager</h2>
            <p className="text-sm sm:text-base text-gray-600 hidden sm:block">Create and manage your invoice templates</p>
          </div>
        </div>
        
        <Button onClick={onCreateTemplate} className="flex items-center text-sm sm:text-base h-9 sm:h-10 flex-shrink-0">
          <Plus className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="hidden sm:inline">New Template</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-8 sm:py-12 px-4">
          <div className="max-w-md mx-auto">
            <div className="bg-gray-100 rounded-full p-4 sm:p-6 w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
              <Eye className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No templates yet</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Create your first custom template to personalize your invoices.
            </p>
            <Button onClick={onCreateTemplate} className="flex items-center mx-auto text-sm sm:text-base h-9 sm:h-10">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Template
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {templates.map((template) => (
            <Card 
              key={template.id} 
              className={`transition-all duration-200 hover:shadow-md ${
                selectedTemplateId === template.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate mr-4 flex-1">
                        {template.name}
                      </h3>
                      {selectedTemplateId === template.id && (
                        <Badge variant="default" className="text-xs sm:text-sm flex-shrink-0">Active</Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs sm:text-sm text-gray-500 mb-3">
                      <span className="truncate">Company: {template.companyName || 'Not set'}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>Created {formatDate(template.createdAt)}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>Updated {formatDate(template.updatedAt)}</span>
                    </div>

                    <div className="flex items-center space-x-2 mb-4 sm:mb-0">
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: template.primaryColor }}
                        title="Primary Color"
                      ></div>
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: template.secondaryColor }}
                        title="Secondary Color"
                      ></div>
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: template.accentColor }}
                        title="Accent Color"
                      ></div>
                      <span className="text-xs text-gray-500 ml-2 truncate">
                        {template.headerStyle} • {template.fontSize} • {template.spacing}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectTemplate(template)}
                      className="flex items-center text-xs sm:text-sm h-8 sm:h-9 flex-1 sm:flex-none justify-center"
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      {selectedTemplateId === template.id ? 'Selected' : 'Select'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditTemplate(template)}
                      className="flex items-center text-xs sm:text-sm h-8 sm:h-9 flex-1 sm:flex-none justify-center"
                    >
                      <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span className="hidden sm:inline">Edit</span>
                      <span className="sm:hidden">Edit</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => duplicateTemplate(template)}
                      className="flex items-center text-xs sm:text-sm h-8 sm:h-9 flex-1 sm:flex-none justify-center"
                    >
                      <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span className="hidden sm:inline">Copy</span>
                      <span className="sm:hidden">Copy</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteTemplate(template.id)}
                      className="flex items-center text-red-600 border-red-200 hover:bg-red-50 text-xs sm:text-sm h-8 sm:h-9 w-8 sm:w-auto justify-center"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}