
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Calendar, CalendarIcon, Clock, FileText, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from '@/lib/utils';
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

// Mock activity data
const mockActivities = [
  {
    id: 'act-001',
    documentId: 'doc-001',
    documentName: 'Series A Term Sheet',
    action: 'edited',
    date: '2023-08-17T14:32:00',
    user: 'John Doe',
  },
  {
    id: 'act-002',
    documentId: 'doc-001',
    documentName: 'Series A Term Sheet',
    action: 'validated',
    date: '2023-08-16T09:45:00',
    user: 'John Doe',
  },
  {
    id: 'act-003',
    documentId: 'doc-002',
    documentName: 'Convertible Note Agreement',
    action: 'uploaded',
    date: '2023-08-12T11:20:00',
    user: 'John Doe',
  },
  {
    id: 'act-004',
    documentId: 'doc-003',
    documentName: 'Investor Rights Agreement',
    action: 'downloaded',
    date: '2023-08-10T16:05:00',
    user: 'Jane Smith',
  },
  {
    id: 'act-005',
    documentId: 'doc-003',
    documentName: 'Investor Rights Agreement',
    action: 'validated',
    date: '2023-08-09T10:30:00',
    user: 'John Doe',
  },
  {
    id: 'act-006',
    documentId: 'doc-003',
    documentName: 'Investor Rights Agreement',
    action: 'uploaded',
    date: '2023-08-08T14:15:00',
    user: 'John Doe',
  },
  {
    id: 'act-007',
    documentId: 'doc-004',
    documentName: 'Stock Purchase Agreement',
    action: 'uploaded',
    date: '2023-08-05T09:10:00',
    user: 'John Doe',
  },
];

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return {
    date: format(date, 'MMM d, yyyy'),
    time: format(date, 'h:mm a')
  };
};

const getActionColor = (action: string) => {
  switch (action) {
    case 'uploaded':
      return 'bg-blue-100 text-blue-800';
    case 'edited':
      return 'bg-amber-100 text-amber-800';
    case 'validated':
      return 'bg-green-100 text-green-800';
    case 'downloaded':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const History: React.FC = () => {
  const [search, setSearch] = useState('');
  const [date, setDate] = React.useState<Date | undefined>(undefined);

  const filteredActivities = mockActivities.filter(activity => {
    const matchesSearch = activity.documentName.toLowerCase().includes(search.toLowerCase());
    
    // Filter by date if selected
    if (date) {
      const activityDate = new Date(activity.date);
      if (activityDate.toDateString() !== date.toDateString()) {
        return false;
      }
    }
    
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Activity History</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Document Activities</CardTitle>
          <CardDescription>
            Track all activities related to your term sheet documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by document name..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full md:w-[240px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Filter by date"}
                  {date && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto h-4 w-4 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDate(undefined);
                      }}
                    >
                      <span className="sr-only">Clear date</span>
                      ×
                    </Button>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-4">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No activities found.</p>
              </div>
            ) : (
              filteredActivities.map((activity) => {
                const { date: formattedDate, time } = formatDateTime(activity.date);
                
                return (
                  <div key={activity.id} className="flex items-start border-b border-border pb-4">
                    <div className="mr-4">
                      <div className={`${getActionColor(activity.action)} h-10 w-10 rounded-full flex items-center justify-center`}>
                        {activity.action === 'uploaded' && <FileText className="h-5 w-5" />}
                        {activity.action === 'edited' && <FileText className="h-5 w-5" />}
                        {activity.action === 'validated' && <FileText className="h-5 w-5" />}
                        {activity.action === 'downloaded' && <FileText className="h-5 w-5" />}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium">
                        <span className="capitalize">{activity.action}</span>
                        {' '}
                        <span className="font-semibold">{activity.documentName}</span>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        By {activity.user}
                      </p>
                    </div>
                    
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center justify-end gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formattedDate}</span>
                      </div>
                      <div className="flex items-center justify-end gap-2 mt-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{time}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default History;
