import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { BarChart3, FileText, TrendingUp, Calendar as CalendarIcon, Download, Package, Mail, MessageCircle, FileDown } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { useSales } from '@/hooks/useSales'
import { useInvoices } from '@/hooks/useInvoices'
import { useInventory } from '@/hooks/useInventory'
import { useCustomers } from '@/hooks/useCustomers'
import { useBusinessInfo } from '@/hooks/useBusinessInfo'
import { useMemo, useState } from 'react'
import { format, subMonths, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { ShareButton } from '@/components/ShareButton'

const Reports = () => {
  const { sales, loading: salesLoading } = useSales()
  const { invoices, loading: invoicesLoading } = useInvoices()
  const { inventory, loading: inventoryLoading } = useInventory()
  const { customers, loading: customersLoading } = useCustomers()
  const { businessInfo } = useBusinessInfo()
  
  // Date range state
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 6),
    to: new Date()
  })

  const reportData = useMemo(() => {
    if (salesLoading || invoicesLoading || inventoryLoading || customersLoading) {
      return {
        salesData: [],
        productData: [],
        topCustomers: [],
        summary: { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, activeCustomers: 0 },
        filteredSales: [],
        filteredInvoices: []
      }
    }

    const currency = businessInfo?.currency || 'SLL'
    const formatCurrency = (amount: number) => {
      if (currency === 'SLL') {
        return `Le ${amount.toLocaleString()}`
      }
      return `${currency} ${amount.toLocaleString()}`
    }

    // Filter data by date range
    const startDate = dateRange?.from ? startOfDay(dateRange.from) : subMonths(new Date(), 6)
    const endDate = dateRange?.to ? endOfDay(dateRange.to) : new Date()

    const filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.sale_date)
      return isAfter(saleDate, startDate) && isBefore(saleDate, endDate)
    })

    const filteredInvoices = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.invoice_date)
      return isAfter(invoiceDate, startDate) && isBefore(invoiceDate, endDate)
    })

    // Generate sales data for the date range
    const salesData = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const monthSales = filteredSales.filter(sale => {
        const saleDate = new Date(sale.sale_date)
        return saleDate >= monthStart && saleDate <= monthEnd
      })

      const monthInvoices = filteredInvoices.filter(invoice => {
        const invoiceDate = new Date(invoice.invoice_date)
        return invoiceDate >= monthStart && invoiceDate <= monthEnd && invoice.status === 'paid'
      })

      const salesRevenue = monthSales.reduce((sum, sale) => sum + Number(sale.total_amount), 0)
      const invoiceRevenue = monthInvoices.reduce((sum, invoice) => sum + Number(invoice.total_amount), 0)
      const totalRevenue = salesRevenue + invoiceRevenue
      const totalOrders = monthSales.length + monthInvoices.length

      salesData.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        sales: totalRevenue,
        orders: totalOrders
      })
    }

    // Generate product distribution data from inventory
    const totalInventoryValue = inventory.reduce((sum, item) => 
      sum + (Number(item.unit_price) * item.stock_quantity), 0
    )

    const categoryData: { [key: string]: number } = {}
    inventory.forEach(item => {
      const category = item.category || 'Other'
      const value = Number(item.unit_price) * item.stock_quantity
      categoryData[category] = (categoryData[category] || 0) + value
    })

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']
    const productData = Object.entries(categoryData)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 7) // Top 7 categories
      .map(([name, value], index) => ({
        name,
        value: totalInventoryValue > 0 ? Number(((value / totalInventoryValue) * 100).toFixed(1)) : 0,
        color: colors[index] || colors[colors.length - 1]
      }))

    // Generate top customers data from filtered data
    const customerRevenue: { [key: string]: { name: string; revenue: number; orders: number } } = {}
    
    filteredSales.forEach(sale => {
      if (sale.customer?.name) {
        const customerId = sale.customer.id
        if (!customerRevenue[customerId]) {
          customerRevenue[customerId] = {
            name: sale.customer.name,
            revenue: 0,
            orders: 0
          }
        }
        customerRevenue[customerId].revenue += Number(sale.total_amount)
        customerRevenue[customerId].orders += 1
      }
    })

    filteredInvoices.forEach(invoice => {
      if (invoice.customer?.name && invoice.status === 'paid') {
        const customerId = invoice.customer.id
        if (!customerRevenue[customerId]) {
          customerRevenue[customerId] = {
            name: invoice.customer.name,
            revenue: 0,
            orders: 0
          }
        }
        customerRevenue[customerId].revenue += Number(invoice.total_amount)
        customerRevenue[customerId].orders += 1
      }
    })

    const topCustomers = Object.values(customerRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Calculate summary statistics from filtered data
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + Number(sale.total_amount), 0) +
                         filteredInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + Number(inv.total_amount), 0)
    const totalOrders = filteredSales.length + filteredInvoices.filter(inv => inv.status === 'paid').length
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const activeCustomers = customers.length

    return {
      salesData,
      productData,
      topCustomers,
      summary: { totalRevenue, totalOrders, avgOrderValue, activeCustomers },
      formatCurrency,
      filteredSales,
      filteredInvoices
    }
  }, [sales, invoices, inventory, customers, businessInfo, salesLoading, invoicesLoading, inventoryLoading, customersLoading, dateRange])

  const isLoading = salesLoading || invoicesLoading || inventoryLoading || customersLoading

  // Export functions
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast({
        title: "No data to export",
        description: "There is no data available for the selected date range.",
        variant: "destructive"
      })
      return
    }

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export successful",
      description: `${filename} has been downloaded as CSV.`
    })
  }

  const generateSalesReportPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    
    // Add header
    doc.setFontSize(18)
    doc.text('Sales Report', pageWidth / 2, 15, { align: 'center' })
    doc.setFontSize(10)
    doc.text(`Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, pageWidth / 2, 22, { align: 'center' })
    doc.text(`Period: ${format(dateRange?.from || subMonths(new Date(), 6), 'yyyy-MM-dd')} to ${format(dateRange?.to || new Date(), 'yyyy-MM-dd')}`, pageWidth / 2, 28, { align: 'center' })
    
    // Add business info if available
    if (businessInfo?.business_name) {
      doc.setFontSize(12)
      doc.text(businessInfo.business_name, pageWidth / 2, 35, { align: 'center' })
    }

    const tableData = reportData.filteredSales.map(sale => [
      format(new Date(sale.sale_date), 'yyyy-MM-dd'),
      sale.customer?.name || 'Walk-in Customer',
      sale.total_amount.toString(),
      sale.payment_method,
      sale.notes || ''
    ])

    autoTable(doc, {
      head: [['Sale Date', 'Customer', 'Total Amount', 'Payment Method', 'Notes']],
      body: tableData,
      startY: businessInfo?.business_name ? 40 : 35,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    })

    return doc
  }

  const exportSalesReportPDF = () => {
    const doc = generateSalesReportPDF()
    doc.save(`Sales-Report-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
    toast({
      title: "Export successful",
      description: "Sales report has been downloaded as PDF."
    })
  }

  const generateInventoryReportPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    
    doc.setFontSize(18)
    doc.text('Inventory Report', pageWidth / 2, 15, { align: 'center' })
    doc.setFontSize(10)
    doc.text(`Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, pageWidth / 2, 22, { align: 'center' })
    
    if (businessInfo?.business_name) {
      doc.setFontSize(12)
      doc.text(businessInfo.business_name, pageWidth / 2, 28, { align: 'center' })
    }

    const tableData = inventory.map(item => [
      item.name,
      item.category || 'Uncategorized',
      item.sku || '',
      item.stock_quantity.toString(),
      item.unit_price.toString(),
      (Number(item.unit_price) * item.stock_quantity).toFixed(2),
      item.is_active ? 'Active' : 'Inactive'
    ])

    autoTable(doc, {
      head: [['Product', 'Category', 'SKU', 'Stock', 'Unit Price', 'Total Value', 'Status']],
      body: tableData,
      startY: businessInfo?.business_name ? 33 : 27,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    })

    return doc
  }

  const exportInventoryReportPDF = () => {
    const doc = generateInventoryReportPDF()
    doc.save(`Inventory-Report-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
    toast({
      title: "Export successful",
      description: "Inventory report has been downloaded as PDF."
    })
  }

  const generateCustomerReportPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    
    doc.setFontSize(18)
    doc.text('Customer Report', pageWidth / 2, 15, { align: 'center' })
    doc.setFontSize(10)
    doc.text(`Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, pageWidth / 2, 22, { align: 'center' })
    
    if (businessInfo?.business_name) {
      doc.setFontSize(12)
      doc.text(businessInfo.business_name, pageWidth / 2, 28, { align: 'center' })
    }

    const tableData = customers.map(customer => [
      customer.name,
      customer.phone || '',
      customer.email || '',
      customer.business_type || '',
      (customer.credit_limit || 0).toString(),
      (customer.current_balance || 0).toString()
    ])

    autoTable(doc, {
      head: [['Name', 'Phone', 'Email', 'Business Type', 'Credit Limit', 'Balance']],
      body: tableData,
      startY: businessInfo?.business_name ? 33 : 27,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    })

    return doc
  }

  const exportCustomerReportPDF = () => {
    const doc = generateCustomerReportPDF()
    doc.save(`Customer-Report-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
    toast({
      title: "Export successful",
      description: "Customer report has been downloaded as PDF."
    })
  }

  const generateMonthlySummaryPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    
    doc.setFontSize(18)
    doc.text('Monthly Summary Report', pageWidth / 2, 15, { align: 'center' })
    doc.setFontSize(10)
    doc.text(`Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, pageWidth / 2, 22, { align: 'center' })
    
    if (businessInfo?.business_name) {
      doc.setFontSize(12)
      doc.text(businessInfo.business_name, pageWidth / 2, 28, { align: 'center' })
    }

    const tableData = [[
      `${format(dateRange?.from || subMonths(new Date(), 6), 'yyyy-MM-dd')} to ${format(dateRange?.to || new Date(), 'yyyy-MM-dd')}`,
      reportData.summary.totalRevenue.toString(),
      reportData.summary.totalOrders.toString(),
      Math.round(reportData.summary.avgOrderValue).toString(),
      reportData.summary.activeCustomers.toString()
    ]]

    autoTable(doc, {
      head: [['Period', 'Total Revenue', 'Total Orders', 'Avg Order Value', 'Active Customers']],
      body: tableData,
      startY: businessInfo?.business_name ? 33 : 27,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    })

    return doc
  }

  const exportMonthlySummaryPDF = () => {
    const doc = generateMonthlySummaryPDF()
    doc.save(`Monthly-Summary-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
    toast({
      title: "Export successful",
      description: "Monthly summary has been downloaded as PDF."
    })
  }

  const exportSalesReport = () => {
    const salesData = reportData.filteredSales.map(sale => ({
      'Sale Date': format(new Date(sale.sale_date), 'yyyy-MM-dd'),
      'Customer': sale.customer?.name || 'Walk-in Customer',
      'Total Amount': sale.total_amount,
      'Payment Method': sale.payment_method,
      'Notes': sale.notes || ''
    }))
    exportToCSV(salesData, 'Sales-Report')
  }

  const exportInventoryReport = () => {
    const inventoryData = inventory.map(item => ({
      'Product Name': item.name,
      'Category': item.category || 'Uncategorized',
      'SKU': item.sku || '',
      'Stock Quantity': item.stock_quantity,
      'Unit Price': item.unit_price,
      'Cost Price': item.cost_price || 0,
      'Total Value': (Number(item.unit_price) * item.stock_quantity).toFixed(2),
      'Min Stock Level': item.min_stock_level || 0,
      'Status': item.is_active ? 'Active' : 'Inactive'
    }))
    exportToCSV(inventoryData, 'Inventory-Report')
  }

  const exportCustomerReport = () => {
    const customerData = customers.map(customer => ({
      'Customer Name': customer.name,
      'Phone': customer.phone || '',
      'Email': customer.email || '',
      'Address': customer.address || '',
      'Business Type': customer.business_type || '',
      'Credit Limit': customer.credit_limit || 0,
      'Current Balance': customer.current_balance || 0
    }))
    exportToCSV(customerData, 'Customer-Report')
  }

  const exportMonthlySummary = () => {
    const summaryData = [{
      'Report Period': `${format(dateRange?.from || subMonths(new Date(), 6), 'yyyy-MM-dd')} to ${format(dateRange?.to || new Date(), 'yyyy-MM-dd')}`,
      'Total Revenue': reportData.summary.totalRevenue,
      'Total Orders': reportData.summary.totalOrders,
      'Average Order Value': Math.round(reportData.summary.avgOrderValue),
      'Active Customers': reportData.summary.activeCustomers,
      'Generated On': format(new Date(), 'yyyy-MM-dd HH:mm:ss')
    }]
    exportToCSV(summaryData, 'Monthly-Summary')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Business Reports</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Analyze your provision shop performance with real-time data</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full sm:w-[260px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild> 
                <Button variant="gradient" className="w-full sm:w-auto">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 bg-background border shadow-lg z-[60]" align="end" side="bottom" sideOffset={8}>
                <div className="space-y-4">
                  <p className="text-sm font-semibold">Export Reports</p>
                  
                  {/* Sales Report */}
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm font-medium">Sales Report</span>
                    <div className="flex gap-2">
                      <ShareButton
                        documentType="report"
                        documentData={{
                          reportType: 'Sales Report',
                          period: `${format(dateRange?.from || subMonths(new Date(), 6), 'yyyy-MM-dd')} to ${format(dateRange?.to || new Date(), 'yyyy-MM-dd')}`
                        }}
                        generatePDF={generateSalesReportPDF}
                        subject={`Sales Report - ${format(new Date(), 'yyyy-MM-dd')}`}
                        fileName={`Sales-Report-${format(new Date(), 'yyyy-MM-dd')}.pdf`}
                        iconOnly
                      />
                      <Button variant="ghost" size="icon" onClick={exportSalesReportPDF} className="h-8 w-8">
                        <FileDown className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={exportSalesReport} className="h-8 w-8">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Inventory Report */}
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm font-medium">Inventory Report</span>
                    <div className="flex gap-2">
                      <ShareButton
                        documentType="report"
                        documentData={{
                          reportType: 'Inventory Report',
                          period: `${format(new Date(), 'yyyy-MM-dd')}`
                        }}
                        generatePDF={generateInventoryReportPDF}
                        subject={`Inventory Report - ${format(new Date(), 'yyyy-MM-dd')}`}
                        fileName={`Inventory-Report-${format(new Date(), 'yyyy-MM-dd')}.pdf`}
                        iconOnly
                      />
                      <Button variant="ghost" size="icon" onClick={exportInventoryReportPDF} className="h-8 w-8">
                        <FileDown className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={exportInventoryReport} className="h-8 w-8">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Customer Report */}
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm font-medium">Customer Report</span>
                    <div className="flex gap-2">
                      <ShareButton
                        documentType="report"
                        documentData={{
                          reportType: 'Customer Report',
                          period: `${format(new Date(), 'yyyy-MM-dd')}`
                        }}
                        generatePDF={generateCustomerReportPDF}
                        subject={`Customer Report - ${format(new Date(), 'yyyy-MM-dd')}`}
                        fileName={`Customer-Report-${format(new Date(), 'yyyy-MM-dd')}.pdf`}
                        iconOnly
                      />
                      <Button variant="ghost" size="icon" onClick={exportCustomerReportPDF} className="h-8 w-8">
                        <FileDown className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={exportCustomerReport} className="h-8 w-8">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Monthly Summary */}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium">Monthly Summary</span>
                    <div className="flex gap-2">
                      <ShareButton
                        documentType="report"
                        documentData={{
                          reportType: 'Monthly Summary',
                          period: `${format(dateRange?.from || subMonths(new Date(), 6), 'yyyy-MM-dd')} to ${format(dateRange?.to || new Date(), 'yyyy-MM-dd')}`
                        }}
                        generatePDF={generateMonthlySummaryPDF}
                        subject={`Monthly Summary - ${format(new Date(), 'yyyy-MM-dd')}`}
                        fileName={`Monthly-Summary-${format(new Date(), 'yyyy-MM-dd')}.pdf`}
                        iconOnly
                      />
                      <Button variant="ghost" size="icon" onClick={exportMonthlySummaryPDF} className="h-8 w-8">
                        <FileDown className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={exportMonthlySummary} className="h-8 w-8">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="professional-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-prosperity-green" />
                <span className="text-sm font-medium">Total Revenue</span>
              </div>
              <div className="text-2xl font-bold mt-2">
                {reportData.formatCurrency ? reportData.formatCurrency(reportData.summary.totalRevenue) : reportData.summary.totalRevenue}
              </div>
              <p className="text-xs text-prosperity-green mt-1">Live data from sales & invoices</p>
            </CardContent>
          </Card>
          
          <Card className="professional-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Total Orders</span>
              </div>
              <div className="text-2xl font-bold mt-2">{reportData.summary.totalOrders.toLocaleString()}</div>
              <p className="text-xs text-primary mt-1">Sales + Paid Invoices</p>
            </CardContent>
          </Card>

          <Card className="professional-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-fintech-blue" />
                <span className="text-sm font-medium">Avg Order Value</span>
              </div>
              <div className="text-2xl font-bold mt-2">
                {reportData.formatCurrency ? reportData.formatCurrency(Math.round(reportData.summary.avgOrderValue)) : Math.round(reportData.summary.avgOrderValue)}
              </div>
              <p className="text-xs text-fintech-blue mt-1">Average per transaction</p>
            </CardContent>
          </Card>

          <Card className="professional-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                {/* <Calendar className="h-5 w-5 text-warning" /> */}
                <span className="text-sm font-medium">Active Customers</span>
              </div>
              <div className="text-2xl font-bold mt-2">{reportData.summary.activeCustomers}</div>
              <p className="text-xs text-warning mt-1">Total registered customers</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Trend */}
          <Card className="professional-card">
            <CardHeader>
              <CardTitle>Sales Trend (6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {reportData.salesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={reportData.salesData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => {
                        const currency = businessInfo?.currency || 'SLL'
                        const prefix = currency === 'SLL' ? 'Le' : currency
                        return `${prefix} ${(value / 1000).toFixed(0)}K`
                      }} />
                      <Line 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No sales data available</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Product Distribution */}
          <Card className="professional-card">
            <CardHeader>
              <CardTitle>Inventory Value Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {reportData.productData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData.productData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={(entry) => `${entry.name}: ${entry.value}%`}
                      >
                        {reportData.productData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No inventory data available</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Orders */}
          <Card className="professional-card">
            <CardHeader>
              <CardTitle>Monthly Order Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {reportData.salesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.salesData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Bar dataKey="orders" fill="hsl(var(--prosperity-green))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No order data available</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Customers */}
          <Card className="professional-card">
            <CardHeader>
              <CardTitle>Top Customers by Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.topCustomers.length > 0 ? (
                  reportData.topCustomers.map((customer, index) => (
                    <div key={customer.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">{customer.orders} orders</p>
                        </div>
                      </div>
                      <p className="font-semibold text-prosperity-green">
                        {reportData.formatCurrency ? reportData.formatCurrency(customer.revenue) : customer.revenue}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    <div className="text-center">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No customer revenue data</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Options */}
        <Card className="professional-card">
          <CardHeader>
            <CardTitle>Export Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" onClick={exportSalesReport} className="h-16 flex flex-col gap-2">
                <FileText className="h-5 w-5" />
                Sales Report
              </Button>
              <Button variant="outline" onClick={exportInventoryReport} className="h-16 flex flex-col gap-2">
                <BarChart3 className="h-5 w-5" />
                Inventory Report
              </Button>
              <Button variant="outline" onClick={exportCustomerReport} className="h-16 flex flex-col gap-2">
                <TrendingUp className="h-5 w-5" />
                Customer Report
              </Button>
              <Button variant="outline" onClick={exportMonthlySummary} className="h-16 flex flex-col gap-2">
                <CalendarIcon className="h-5 w-5" />
                Monthly Summary
              </Button>
            </div>
          </CardContent>
        </Card>
    </div>
  );
};

export default Reports;