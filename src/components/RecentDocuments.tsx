
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Edit, FileText, MoreHorizontal } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock data for recent documents
const recentDocuments = [
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
];

export const RecentDocuments: React.FC = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Documents</CardTitle>
          <CardDescription>You have processed {recentDocuments.length} documents recently</CardDescription>
        </div>
        <Link to="/dashboard/documents">
          <Button variant="outline">View all</Button>
        </Link>
      </CardHeader>
      <CardContent>
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
            {recentDocuments.map((doc) => (
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
                <TableCell>{new Date(doc.date).toLocaleDateString()}</TableCell>
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
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
