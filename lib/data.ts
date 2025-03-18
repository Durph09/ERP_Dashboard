import { SupabaseClient } from '@supabase/supabase-js';
import { formatCurrency } from './utils';
import { unstable_noStore as noStore } from 'next/cache';

export async function fetchRevenue() {
noStore()
  try {
    console.log('Fetching revenue data...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const { data, error } = await supabase.from('revenue').select().limit(12);
   

    console.log('Data fetch completed after 3 seconds.');

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

//////////////////////////////////////////////////////////////////
export async function fetchLatestInvoices() {
  noStore();
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`id,amount, customers(name, email, image_url)`)
      .limit(5)
      .order('invoice_date', { ascending: false });
   

    if (data === null) {
      // Handle the case where 'data' is null, e.g., return an empty array or throw an error
     
      return [];
    }

    const latestInvoices = data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

///////////////////////////////////////////////////////////////////
async function getInvoiceAmountTotals() {
  noStore();
  try {
    const { data, error } = await supabase.rpc('invoiceamounttotals');

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching invoice amount totals:', error);
    return null;
  }
}

////////////////////////////////////////////////////////////////////////
export async function fetchCardData() {
noStore();
  try {
    const { count: invoiceCountPromise, error: invoiceError } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true });

    // Fetch customers count
    const { count: customerCountPromise, error: customerError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });

    //Fetch totals of paid & pending invoices

    let invoiceStatusPromise = getInvoiceAmountTotals();

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);
    
    const numberOfInvoices = Number(data[0]);
    const numberOfCustomers = Number(data[1]);
    const totalPaidInvoices = formatCurrency(data[2][0].paid ?? '0');
    const totalPendingInvoices = formatCurrency(data[2][0].pending ?? '0');

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

//////////////////////////////////////////////////////////////////////
const ITEMS_PER_PAGE = 6;

export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset1 = (currentPage - 1) * ITEMS_PER_PAGE;
  const searchQuery = `%${query}%`;

  try {
    const { data: invoices, error } = await supabase.rpc('fetch_filtered_invoices5', {
      query: searchQuery,
      items_per_page: ITEMS_PER_PAGE,
      offset1: offset1
    });
     

    if (error) {
      console.error('Database Error:', error);
     ;
    }

    return invoices;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}


////////////////////////////////////////////////////////////////////////
export async function fetchInvoicesPages(query: string) {
noStore();
try {
const {data:count, error} = await supabase.rpc('fetch_filtered_invoices_count', {query: query})
console.log("count: ", count)


 const totalPages = Math.ceil(Number(count) / ITEMS_PER_PAGE);
 console.log(`totalPages from fetchInvoicesPages: ${totalPages}`)
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
 }
  }

/////////////////////////////////////////////////////////////////////////
 export async function fetchInvoiceById(id: string) {
 noStore();
   try {
     const {data, error} = await supabase
     .from("invoices")
     .select('id, customer_id, amount, status')
     .eq(`id`, id)
     console.log('fetchInvoiceById: ',data)
   
//     const data = await sql<InvoiceForm>`
//       SELECT
//         invoices.id,
//         invoices.customer_id,
//         invoices.amount,
//         invoices.status
//       FROM invoices
//       WHERE invoices.id = ${id};
//     `;

     const invoice = data.map((invoice) => ({
      ...invoice,
       // Convert amount from cents to dollars
       amount: invoice.amount / 100,
     }));

     return invoice[0];
  } catch (error) {
     console.error('Database Error:', error);
     throw new Error('Failed to fetch invoice.');
   }
 }

///////////////////////////////////////////////////////////////
export async function fetchCustomers() {
  noStore();
  try {
    const {data, error} = await supabase
.from('customers')
.select('id, name')
.order('name', {ascending:true})


    const customers = data;
    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

/////////////////////////////////////////////////////////////////
// export async function fetchFilteredCustomers(query: string) {
//   noStore();
//   try {
//     const data = await sql<CustomersTableType>`
// 		SELECT
// 		  customers.id,
// 		  customers.name,
// 		  customers.email,
// 		  customers.image_url,
// 		  COUNT(invoices.id) AS total_invoices,
// 		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
// 		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
// 		FROM customers
// 		LEFT JOIN invoices ON customers.id = invoices.customer_id
// 		WHERE
// 		  customers.name ILIKE ${`%${query}%`} OR
//         customers.email ILIKE ${`%${query}%`}
// 		GROUP BY customers.id, customers.name, customers.email, customers.image_url
// 		ORDER BY customers.name ASC
// 	  `;

//     const customers = data.rows.map((customer) => ({
//       ...customer,
//       total_pending: formatCurrency(customer.total_pending),
//       total_paid: formatCurrency(customer.total_paid),
//     }));

//     return customers;
//   } catch (err) {
//     console.error('Database Error:', err);
//     throw new Error('Failed to fetch customer table.');
//   }
// }

//////////////////////////////////////////////////////////////////////
// export async function getUser(email: string) {
//   noStore();
//   try {
//     const user = await sql`SELECT * FROM users WHERE email=${email}`;
//     return user.rows[0] as User;
//   } catch (error) {
//     console.error('Failed to fetch user:', error);
//     throw new Error('Failed to fetch user.');
//   }
// }
