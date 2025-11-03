import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddCustomerModal } from "@/components/AddCustomerModal";
import { EditCustomerModal } from "@/components/EditCustomerModal";
import { Users, Search, Phone, Mail, MapPin, Building, CreditCard, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  business_type?: string;
  credit_limit: number;
  current_balance: number;
  created_at: string;
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const { toast } = useToast();

  const fetchCustomers = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to view customers",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false });

      if (error) throw error;

      setCustomers(data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();

    // Set up real-time subscription for customers
    const channel = supabase
      .channel("customers-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "customers",
        },
        () => {
          fetchCustomers(); // Refresh data when changes occur
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getBusinessTypeLabel = (type?: string) => {
    const types: { [key: string]: string } = {
      retail_store: "Retail Store",
      provision_shop: "Provision Shop",
      restaurant: "Restaurant",
      market_vendor: "Market Vendor",
      supermarket: "Supermarket",
      other: "Other",
    };
    return types[type || ""] || type || "N/A";
  };

  const deleteCustomer = async (customerId: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;

    try {
      const { error } = await supabase.from("customers").delete().eq("id", customerId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });

      fetchCustomers(); // Refresh the list
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Customers</h1>
            <p className="text-muted-foreground">Manage your customer database</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-pulse">Loading customers...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Customers</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your customer database</p>
        </div>
        <AddCustomerModal onCustomerAdded={fetchCustomers} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card className="professional-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>

        <Card className="professional-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credit Extended</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Le {customers.reduce((sum, customer) => sum + customer.current_balance, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="professional-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Limit Available</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Le {customers.reduce((sum, customer) => sum + customer.credit_limit, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="professional-card p-4">
       
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
      
      </Card>

      {/* Customers Table */}
      <Card className="professional-card">
        <CardHeader>
          <CardTitle>Customer List ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No customers found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "Try adjusting your search criteria" : "Start by adding your first customer"}
              </p>
              {!searchQuery && <AddCustomerModal onCustomerAdded={fetchCustomers} />}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Customer</TableHead>
                    <TableHead className="hidden sm:table-cell min-w-[150px]">Contact</TableHead>
                    <TableHead className="hidden md:table-cell min-w-[120px]">Business Type</TableHead>
                    <TableHead className="hidden lg:table-cell min-w-[120px]">Credit Info</TableHead>
                    <TableHead className="hidden lg:table-cell min-w-[100px]">Balance</TableHead>
                    <TableHead className="text-right min-w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          {customer.address && (
                            <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {customer.address.substring(0, 30)}...
                            </div>
                          )}
                          {/* Show contact info on mobile */}
                          <div className="sm:hidden mt-1 space-y-1">
                            {customer.phone && (
                              <div className="text-xs flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {customer.phone}
                              </div>
                            )}
                            {customer.email && (
                              <div className="text-xs flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {customer.email}
                              </div>
                            )}
                          </div>
                          {/* Show balance on mobile */}
                          <div className="lg:hidden mt-1">
                            <div
                              className={`text-xs font-medium ${customer.current_balance > 0 ? "text-warning" : "text-success"}`}
                            >
                              Balance: Le {customer.current_balance.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="space-y-1">
                          {customer.phone && (
                            <div className="text-sm flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {customer.phone}
                            </div>
                          )}
                          {customer.email && (
                            <div className="text-sm flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="secondary" className="text-xs">
                          {getBusinessTypeLabel(customer.business_type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="text-sm">
                          <div>Limit: Le {customer.credit_limit.toLocaleString()}</div>
                          <div className="text-muted-foreground">
                            Available: Le {(customer.credit_limit - customer.current_balance).toLocaleString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div
                          className={`font-medium ${customer.current_balance > 0 ? "text-warning" : "text-success"}`}
                        >
                          Le {customer.current_balance.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingCustomer(customer)}
                            className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteCustomer(customer.id)}
                            className="text-destructive hover:text-destructive h-8 w-8 p-0 sm:h-9 sm:w-9"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <EditCustomerModal
          customer={editingCustomer}
          open={!!editingCustomer}
          onOpenChange={(open) => !open && setEditingCustomer(null)}
          onCustomerUpdated={fetchCustomers}
        />
      )}
    </div>
  );
};

export default Customers;
