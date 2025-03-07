'use server'
import {z} from 'zod';
import { supabase } from './supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '../utils/supabase/server'

const FormSchema = z.object({
id: z.string(),
customerId: z.string({invalid_type_error: 'Please select a customer.'}),
amount: z.coerce
.number()
.gt(0, {message: 'Please enter an amount greater than $0.'}),
status: z.enum(['pending', 'paid'],
{invalid_type_error: 'Please select an invoice status.'}),
date: z.string(),
})

const CreateInvoice = FormSchema.omit({id: true, date: true});

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) { 
// Validate form using Zod
    const validatedFields = CreateInvoice.safeParse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });
     // If form validation fails, return errors early. Otherwise, continue. 
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Create Invoice.',
      };
    }
    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];
 try {
    const {error} = await supabase
    .from('invoices')
    .insert({customer_id:customerId, amount:amountInCents, status:status, invoice_date:date})
    ;
    } catch (error) {
      return {
        message: 'Database Error: Failed to Create Invoice.',
      };
      }
        
  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath('/dashboard/invoices')
    redirect('/dashboard/invoices')
    
}


// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
 
// ...
 
export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }
 
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
 try {
  const {error} = await supabase
  .from('invoices')
  .update({customer_id: customerId, amount:amountInCents, status: status})
  .eq('id', id)
  } catch(error){
  return {message: 'Database Error: Failed to Update Invoice'}
  }
  
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {

try {
    const {error} = await supabase
    .from('invoices')
    .delete()
    .eq('id', id)
    console.log(error)
    
} catch (error){
return {message: 'Database Error: Failed to Delete Invoice'}
}
revalidatePath('/dashboard/invoices');    
  }
  
  
  
  export async function logIn(
    prevState: string | undefined,
    formData: FormData,
  ) {
    const supabase = createClient();
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }
    
    
    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
    console.log(error)
      // Return the error instead of redirecting
      
      return { isError: true };
    }
  
    revalidatePath('/', 'layout')
    redirect('/dashboard')
    
  }
  
  
  export async function register(
    // prevState: string | undefined,
    formData: FormData,
  ) {
    const supabase = createClient()
    const data = {
    name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }
  
    try {
     

      const { error } = await supabase.auth.signUp(data)
    } catch (error) {
     console.log('registration error: ', error)
   
     return {message: 'Please try agian with different credentials'}
        }
      
        revalidatePath('/', 'layout')
        redirect('/login')
  }
  
  export async function signOut (){
const { error } = await supabase.auth.signOut()
console.log('signOut called:YES ')
redirect('/')
}