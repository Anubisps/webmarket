import { redirect } from 'next/navigation'

/** Limited events UI is disabled until API routes are connected. Product limited dates use product edit instead. */
export default function AdminLimitedEventsDisabled() {
  redirect('/accessadmin/products')
}
