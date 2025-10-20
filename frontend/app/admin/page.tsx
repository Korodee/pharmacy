export default function AdminPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-medium text-gray-800 mb-4">
          Admin Dashboard
        </h2>
        <p className="text-gray-600 mb-6">
          Manage orders and pharmacy operations from this dashboard.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Orders</h3>
            <p className="text-blue-700 text-sm">
              View and manage customer orders
            </p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-medium text-green-900 mb-2">Inventory</h3>
            <p className="text-green-700 text-sm">
              Track medication stock levels
            </p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-medium text-purple-900 mb-2">Customers</h3>
            <p className="text-purple-700 text-sm">
              Manage customer information
            </p>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
          <p className="text-yellow-800 text-sm">
            <strong>Note:</strong> This is a placeholder admin interface. 
            The full admin functionality will be implemented in the next phase.
          </p>
        </div>
      </div>
    </div>
  )
}
