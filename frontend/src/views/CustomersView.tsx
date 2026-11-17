import { Users } from 'lucide-react'
import CustomerModal from '../components/CustomerModal'
import CustomersTable from '../components/CustomersTable'
import DeleteCustomerModal from '../components/DeleteCustomerModal'
import Footer from '../components/Footer'
import Header from '../components/Header'
import SearchFilters from '../components/SearchFilters'
import { useCustomersView } from './Hooks/CustomersViewHook'

export default function CustomersView() {
  const {
    search,
    setSearch,
    clearSearch,
    openNewCustomer,
    customers,
    loading,
    error,
    editCustomer,
    deleteCustomer,
    isModalOpen,
    editingCustomer,
    closeModal,
    handleSaved,
    deletingCustomer,
    closeDeleteModal,
    handleDeleted,
  } = useCustomersView()

  return (
    <div className="flex min-h-screen flex-col bg-primary">
      <Header />

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-6 py-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary">
            <Users size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Clientes</h1>
            <p className="text-sm text-white/70">
              Consulta, crea y administra los clientes de Test Aval.
            </p>
          </div>
        </div>

        <SearchFilters
          search={search}
          onSearchChange={setSearch}
          onClear={clearSearch}
          onNew={openNewCustomer}
        />

        <CustomersTable
          customers={customers}
          loading={loading}
          error={error}
          onEdit={editCustomer}
          onDelete={deleteCustomer}
        />
      </main>

      <Footer />

      {isModalOpen && (
        <CustomerModal
          key={editingCustomer?.id ?? 'new'}
          customer={editingCustomer}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}

      {deletingCustomer && (
        <DeleteCustomerModal
          key={deletingCustomer.id}
          customer={deletingCustomer}
          onClose={closeDeleteModal}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  )
}