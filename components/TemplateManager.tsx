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
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={onBack} className="mr-4 p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Template Manager</h2>
            <p className="text-gray-600">Create and manage your invoice templates</p>
          </div>
        </div>
        
        <Button onClick={onCreateTemplate} className="flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Eye className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No templates yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first custom template to personalize your invoices.
            </p>
            <Button onClick={onCreateTemplate} className="flex items-center mx-auto">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Template
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <Card 
              key={template.id} 
              className={`transition-all duration-200 hover:shadow-md ${
                selectedTemplateId === template.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate mr-4">
                        {template.name}
                      </h3>
                      {selectedTemplateId === template.id && (
                        <Badge variant="default">Active</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <span>Company: {template.companyName || 'Not set'}</span>
                      <span>•</span>
                      <span>Created {formatDate(template.createdAt)}</span>
                      <span>•</span>
                      <span>Updated {formatDate(template.updatedAt)}</span>
                    </div>

                    <div className="flex items-center space-x-2">
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
                      <span className="text-xs text-gray-500 ml-2">
                        {template.headerStyle} • {template.fontSize} • {template.spacing}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectTemplate(template)}
                      className="flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {selectedTemplateId === template.id ? 'Selected' : 'Select'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditTemplate(template)}
                      className="flex items-center"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => duplicateTemplate(template)}
                      className="flex items-center"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteTemplate(template.id)}
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
      )}
    </div>
  );
}