export interface Customer {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  roles: string[]
  phone: string
  document_number: string | null
  address: string
  city: string
  created_at: string
}

export interface CustomerForm {
  first_name: string
  last_name: string
  email: string
  password: string
  document_number: string
  phone: string
  city: string
  address: string
}