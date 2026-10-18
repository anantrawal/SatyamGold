// Plot status definitions
export const PLOT_STATUS = {
  AVAILABLE: 'available',
  BOOKED:    'booked',
  SOLD:      'sold',
  HOLD:      'hold',
};

// Status display config
export const STATUS_CONFIG = {
  available: { label: 'Available', color: '#22c55e', bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-300'  },
  booked:    { label: 'Booked',    color: '#f59e0b', bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  sold:      { label: 'Sold',      color: '#ef4444', bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-300'    },
  hold:      { label: 'On Hold',   color: '#3b82f6', bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-300'   },
};

// Plot facing directions
export const FACING_OPTIONS = ['East', 'West', 'North', 'South', 'North-East', 'North-West', 'South-East', 'South-West'];

// Plot size options (update based on your actual layout)
export const PLOT_SIZES = ['3 Marla', '5 Marla', '7 Marla', '10 Marla', '1 Kanal'];

// User roles
export const ROLES = { OWNER: 'owner', OFFICE: 'office' };

// Format price in PKR
export const formatPrice = (amount) => {
  if (!amount) return 'N/A';
  return new Intl.NumberFormat('en-PK', {
    style: 'currency', currency: 'PKR', maximumFractionDigits: 0
  }).format(amount);
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// Validate email
export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Validate phone (Pakistani format)
export const isValidPhone = (phone) => /^(\+92|0)?[0-9]{10,11}$/.test(phone.replace(/\s/g, ''));
