import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Bill } from '@/lib/services/billingService';
import billingService from '@/lib/services/billingService';

interface BillingHistoryTableProps {
  bills: Bill[];
}

const BillingHistoryTable: React.FC<BillingHistoryTableProps> = ({ bills }) => {
  const getBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bills.length > 0 ? (
            bills.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell className="font-medium">
                  {new Date(bill.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(bill.startPeriod).toLocaleDateString()} - {new Date(bill.endPeriod).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {billingService.formatCurrency(bill.amount, bill.currency)}
                </TableCell>
                <TableCell>
                  <Badge className={getBadgeVariant(bill.status)}>
                    {bill.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                No billing history yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default BillingHistoryTable; 