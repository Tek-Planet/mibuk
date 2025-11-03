export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          business_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          business_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          business_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      business_documents: {
        Row: {
          business_id: string
          document_type: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          uploaded_at: string
          user_id: string
        }
        Insert: {
          business_id: string
          document_type: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          uploaded_at?: string
          user_id: string
        }
        Update: {
          business_id?: string
          document_type?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          uploaded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      businesses: {
        Row: {
          address: string | null
          business_name: string
          business_type: string | null
          created_at: string
          currency: string | null
          email: string | null
          id: string
          ngo_id: string | null
          owner_id: string
          phone: string | null
          tax_rate: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          business_name: string
          business_type?: string | null
          created_at?: string
          currency?: string | null
          email?: string | null
          id?: string
          ngo_id?: string | null
          owner_id: string
          phone?: string | null
          tax_rate?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          business_name?: string
          business_type?: string | null
          created_at?: string
          currency?: string | null
          email?: string | null
          id?: string
          ngo_id?: string | null
          owner_id?: string
          phone?: string | null
          tax_rate?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "businesses_ngo_id_fkey"
            columns: ["ngo_id"]
            isOneToOne: false
            referencedRelation: "ngos"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          amount: number
          business_id: string
          created_at: string
          customer_id: string
          description: string | null
          id: string
          reference_number: string | null
          transaction_date: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          business_id: string
          created_at?: string
          customer_id: string
          description?: string | null
          id?: string
          reference_number?: string | null
          transaction_date?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          business_id?: string
          created_at?: string
          customer_id?: string
          description?: string | null
          id?: string
          reference_number?: string | null
          transaction_date?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          birthday: string | null
          business_id: string
          business_type: string | null
          created_at: string
          credit_limit: number | null
          current_balance: number | null
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          birthday?: string | null
          business_id: string
          business_type?: string | null
          created_at?: string
          credit_limit?: number | null
          current_balance?: number | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          birthday?: string | null
          business_id?: string
          business_type?: string | null
          created_at?: string
          credit_limit?: number | null
          current_balance?: number | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          business_id: string
          category: string | null
          created_at: string
          description: string
          expense_date: string
          id: string
          notes: string | null
          payment_method: string | null
          supplier_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          business_id: string
          category?: string | null
          created_at?: string
          description: string
          expense_date?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          supplier_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          business_id?: string
          category?: string | null
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          supplier_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          barcode: string | null
          business_id: string
          category: string | null
          cost_price: number | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          location: string | null
          min_stock_level: number | null
          name: string
          sku: string | null
          stock_quantity: number
          supplier: string | null
          unit_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          barcode?: string | null
          business_id: string
          category?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          min_stock_level?: number | null
          name: string
          sku?: string | null
          stock_quantity?: number
          supplier?: string | null
          unit_price?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          barcode?: string | null
          business_id?: string
          category?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          min_stock_level?: number | null
          name?: string
          sku?: string | null
          stock_quantity?: number
          supplier?: string | null
          unit_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string
          id: string
          invoice_id: string
          product_id: string | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          invoice_id: string
          product_id?: string | null
          product_name: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          invoice_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          business_id: string
          created_at: string
          customer_id: string | null
          due_date: string | null
          id: string
          invoice_date: string
          invoice_number: string
          notes: string | null
          paid_amount: number | null
          status: string | null
          subtotal: number | null
          tax_amount: number | null
          total_amount: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          customer_id?: string | null
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number: string
          notes?: string | null
          paid_amount?: number | null
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          customer_id?: string | null
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          notes?: string | null
          paid_amount?: number | null
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_applications: {
        Row: {
          application_data: Json | null
          application_number: string
          approval_date: string | null
          approved_amount: number | null
          business_id: string
          created_at: string
          credit_score: number | null
          disbursement_date: string | null
          id: string
          interest_rate: number | null
          items_to_restock: Json | null
          loan_product_id: string
          repayment_start_date: string | null
          requested_amount: number
          risk_assessment: Json | null
          status: string
          supplier_id: string | null
          term_months: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          application_data?: Json | null
          application_number: string
          approval_date?: string | null
          approved_amount?: number | null
          business_id: string
          created_at?: string
          credit_score?: number | null
          disbursement_date?: string | null
          id?: string
          interest_rate?: number | null
          items_to_restock?: Json | null
          loan_product_id: string
          repayment_start_date?: string | null
          requested_amount: number
          risk_assessment?: Json | null
          status?: string
          supplier_id?: string | null
          term_months?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          application_data?: Json | null
          application_number?: string
          approval_date?: string | null
          approved_amount?: number | null
          business_id?: string
          created_at?: string
          credit_score?: number | null
          disbursement_date?: string | null
          id?: string
          interest_rate?: number | null
          items_to_restock?: Json | null
          loan_product_id?: string
          repayment_start_date?: string | null
          requested_amount?: number
          risk_assessment?: Json | null
          status?: string
          supplier_id?: string | null
          term_months?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_applications_loan_product_id_fkey"
            columns: ["loan_product_id"]
            isOneToOne: false
            referencedRelation: "loan_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_applications_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_disbursements: {
        Row: {
          amount: number
          business_id: string
          created_at: string
          disbursement_date: string | null
          disbursement_method: string
          id: string
          loan_application_id: string
          reference_number: string | null
          status: string
          supplier_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          business_id: string
          created_at?: string
          disbursement_date?: string | null
          disbursement_method?: string
          id?: string
          loan_application_id: string
          reference_number?: string | null
          status?: string
          supplier_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          business_id?: string
          created_at?: string
          disbursement_date?: string | null
          disbursement_method?: string
          id?: string
          loan_application_id?: string
          reference_number?: string | null
          status?: string
          supplier_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_disbursements_loan_application_id_fkey"
            columns: ["loan_application_id"]
            isOneToOne: false
            referencedRelation: "loan_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_disbursements_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_products: {
        Row: {
          created_at: string
          description: string | null
          id: string
          interest_rate: number
          is_active: boolean | null
          max_amount: number
          min_amount: number
          min_credit_score: number | null
          name: string
          product_type: string
          term_months: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          interest_rate?: number
          is_active?: boolean | null
          max_amount?: number
          min_amount?: number
          min_credit_score?: number | null
          name: string
          product_type?: string
          term_months?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          interest_rate?: number
          is_active?: boolean | null
          max_amount?: number
          min_amount?: number
          min_credit_score?: number | null
          name?: string
          product_type?: string
          term_months?: number
          updated_at?: string
        }
        Relationships: []
      }
      loan_repayments: {
        Row: {
          amount: number
          business_id: string
          created_at: string
          due_date: string
          id: string
          interest_amount: number
          loan_application_id: string
          payment_date: string | null
          payment_method: string | null
          principal_amount: number
          reference_number: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          business_id: string
          created_at?: string
          due_date: string
          id?: string
          interest_amount: number
          loan_application_id: string
          payment_date?: string | null
          payment_method?: string | null
          principal_amount: number
          reference_number?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          business_id?: string
          created_at?: string
          due_date?: string
          id?: string
          interest_amount?: number
          loan_application_id?: string
          payment_date?: string | null
          payment_method?: string | null
          principal_amount?: number
          reference_number?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_repayments_loan_application_id_fkey"
            columns: ["loan_application_id"]
            isOneToOne: false
            referencedRelation: "loan_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      ngo_members: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          ngo_id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          ngo_id: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          ngo_id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ngo_members_ngo_id_fkey"
            columns: ["ngo_id"]
            isOneToOne: false
            referencedRelation: "ngos"
            referencedColumns: ["id"]
          },
        ]
      }
      ngos: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      organization_invitations: {
        Row: {
          accessible_pages: string[]
          business_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invitation_token: string
          invited_by: string
          status: string
        }
        Insert: {
          accessible_pages?: string[]
          business_id: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by: string
          status?: string
        }
        Update: {
          accessible_pages?: string[]
          business_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          accessible_pages: string[]
          business_id: string
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          is_active: boolean | null
          joined_at: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accessible_pages?: string[]
          business_id: string
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accessible_pages?: string[]
          business_id?: string
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          business_id: string
          category: string | null
          cost_price: number | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          min_stock_level: number | null
          name: string
          sku: string | null
          stock_quantity: number | null
          unit_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          barcode?: string | null
          business_id: string
          category?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          min_stock_level?: number | null
          name: string
          sku?: string | null
          stock_quantity?: number | null
          unit_price?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          barcode?: string | null
          business_id?: string
          category?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          min_stock_level?: number | null
          name?: string
          sku?: string | null
          stock_quantity?: number | null
          unit_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_documents: {
        Row: {
          document_type: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          uploaded_at: string
          user_id: string
        }
        Insert: {
          document_type: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          uploaded_at?: string
          user_id: string
        }
        Update: {
          document_type?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          uploaded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          business_id: string
          created_at: string
          customer_id: string | null
          id: string
          invoice_id: string | null
          notes: string | null
          payment_method: string | null
          sale_date: string
          total_amount: number
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          customer_id?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_method?: string | null
          sale_date?: string
          total_amount?: number
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          customer_id?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_method?: string | null
          sale_date?: string
          total_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_payments: {
        Row: {
          amount: number
          business_id: string
          created_at: string
          id: string
          notes: string | null
          payment_date: string
          payment_method: string | null
          reference_number: string | null
          supplier_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          business_id: string
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          reference_number?: string | null
          supplier_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          business_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          reference_number?: string | null
          supplier_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          business_id: string
          created_at: string
          current_balance: number | null
          id: string
          location: string | null
          name: string
          notes: string | null
          phone: string | null
          product_category: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          current_balance?: number | null
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          product_category?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          current_balance?: number | null
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          product_category?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      authenticated_user_email: { Args: never; Returns: string }
      generate_application_number: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_business_member: {
        Args: { _business_id: string; _user_id: string }
        Returns: boolean
      }
      is_ngo_admin: {
        Args: { _ngo_id: string; _user_id: string }
        Returns: boolean
      }
      is_system_admin: { Args: { _user_id: string }; Returns: boolean }
      user_has_page_access: {
        Args: { _business_id: string; _page: string; _user_id: string }
        Returns: boolean
      }
      user_ngo_id: { Args: { _user_id: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "user" | "system_admin" | "ngo_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "system_admin", "ngo_admin"],
    },
  },
} as const
