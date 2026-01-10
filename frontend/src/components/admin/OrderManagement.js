import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export const OrderManagement = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) setOrders(JSON.parse(savedOrders));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-2xl">Orders</CardTitle>
        <CardDescription>View customer orders</CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No orders yet.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">{order.id?.toString().slice(-8) || 'N/A'}</TableCell>
                  <TableCell className="font-medium">{order.customerName || order.email || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="max-w-[200px]">
                      {order.items?.map((item, i) => (
                        <div key={i} className="text-sm truncate">{item.name} x{item.quantity || 1}</div>
                      )) || '-'}
                    </div>
                  </TableCell>
                  <TableCell>${order.total?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === 'completed' ? 'default' : order.status === 'pending' ? 'secondary' : 'outline'}>
                      {order.status || 'pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.date ? new Date(order.date).toLocaleDateString() : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
