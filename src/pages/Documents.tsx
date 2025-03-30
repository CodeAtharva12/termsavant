
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Download, Edit, FileText, MoreHorizontal, Search, Trash2, Upload } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data for documents
const mockDocuments = [
  {
    id: 'doc-001',
    name: 'Series A Term Sheet',
    type: 'PDF',
    status: 'validated',
    date: '2023-08-15',
    validationScore: 98,
  },
  {
    id: 'doc-002',
    name: 'Convertible Note Agreement',
    type: 'DOCX',
    status: 'needs review',
    date: '2023-08-12',
    validationScore: 72,
  },
  {
    id: 'doc-003',
    name: 'Investor Rights Agreement',
    type: 'PDF',
    status: 'validated',
    date: '2023-08-08',
    validationScore: 95,
  },
  {
    id: 'doc-004',
    name: 'Stock Purchase Agreement',
    type: 'PDF',
    status: 'processing',
    date: '2023-08-05',
    validationScore: null,
  },
  {
    id: 'doc-005',
    name: 'Seed Round Term Sheet',
    type: 'DOCX',
    status: 'validated',
    date: '2023-07-29',
    validationScore: 92,
  },
  {
    id: 'doc-006',
    name: 'Shareholder Agreement',
    type: 'PDF',
    status: 'validated',
    date: '2023-07-20',
    validationScore: 97,
  },
  {
    id: 'doc-007',
    name: 'Equity Incentive Plan',
    type: 'DOCX',
    status: 'needs review',
    date: '2023-07-15',
    validationScore: 68,
  },
  {
    id: 'doc-008',
    name: 'Option Grant Agreement',
    type: 'PDF',
    status: 'validated',
    date: '2023-07-08',
    validationScore: 94,
  },
];

const Documents: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();
  
  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Documents</h1>
        <Button onClick={() => navigate('/dashboard/upload')}>
          <Upload className="mr-2 h-4 w-4" />
          Upload New Document
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Documents</CardTitle>
          <CardDescription>View and manage all your term sheet documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full md:w-[180px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="validated">Validated</SelectItem>
                  <SelectItem value="needs review">Needs Review</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No documents found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{doc.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{doc.type}</TableCell>
                      <TableCell>
                        <Badge
                          variant={doc.status === 'validated' ? 'default' : 
                                doc.status === 'needs review' ? 'secondary' : 
                                'outline'}
                          className={
                            doc.status === 'validated' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 
                            doc.status === 'needs review' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 
                            'bg-blue-100 text-blue-800 animate-pulse-subtle'
                          }
                        >
                          {doc.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          {new Date(doc.date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {doc.validationScore !== null ? (
                          <span className={doc.validationScore > 90 ? 'text-green-600' : 
                                          doc.validationScore > 75 ? 'text-amber-600' : 
                                          'text-red-600'}>
                            {doc.validationScore}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigate(`/dashboard/edit/${doc.id}`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Documents;
