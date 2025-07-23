'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';
import { z } from 'zod';

const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: 'require',
});

const FormSchema = z.object({
  id: z.string().optional(),
  customerId: z.string({
    invalid_type_error: 'Customer ID is required',
  }),
  amount: z.coerce.number().gt(1, 'please enter an amount greater than $0'),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'please select a valid status',
  }),
  date: z.coerce.date(),
});

const CreateInvoice = FormSchema.omit({
  id: true,
  date: true,
});

export type FormState = {
  errors?: Partial<Record<keyof z.infer<typeof FormSchema>, string>>;
  success?: boolean;
};

// Function to create an invoice
export async function createInvoice(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const raw = {
    customerId: formData.get('customerId')?.toString(),
    amount: formData.get('amount'), // Convert to cents
    status: formData.get('status')?.toString(),
    date: new Date().toISOString().split('T')[0], // Use today's date
  };
  const parsed = FormSchema.safeParse(raw);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    return {
      errors: {
        customerId: errors.customerId?.[0],
        amount: errors.amount?.[0],
        status: errors.status?.[0],
      },
    };
  }

  // convert amount to cents
  parsed.data.amount = parsed.data.amount * 100;

  // Insert into database
  try {
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${parsed.data.customerId}, ${parsed.data.amount}, ${parsed.data.status}, ${parsed.data.date})`;

    console.log('Invoice created successfully:', parsed.data);
  } catch (error) {
    console.error('Database error:', error);
  }
  revalidatePath('/dashboard/invoices');

  redirect('/dashboard/invoices');
}
// Function to update an invoice
const UpdateFormSchema = FormSchema.omit({
  id: true,
  date: true,
});
export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateFormSchema.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  // convert amount to cents
  const amountInCents = amount * 100;
  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
    console.log('Invoice updated successfully:', {
      id,
      customerId,
      amountInCents,
      status,
    });
  } catch (error) {
    console.error('Database error:', error);
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

// Function to delete an invoice
export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    console.log('Invoice deleted successfully:', id);
  } catch (error) {
    console.error('Database error:', error);
  }
  revalidatePath('/dashboard/invoices');
}

// connect the auth logic with login form

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn('credentials', formData);
    console.log('User authenticated successfully');
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}
