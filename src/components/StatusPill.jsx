export default function StatusPill({ status }) {
    if (!status) return null;
    const map = {
        'Available': 'available',
        'On Trip': 'on-trip',
        'In Shop': 'in-shop',
        'Retired': 'retired',
        'On Duty': 'on-duty',
        'Off Duty': 'off-duty',
        'Suspended': 'suspended',
        'Draft': 'draft',
        'Dispatched': 'dispatched',
        'Completed': 'completed',
        'Cancelled': 'cancelled',
        'In Progress': 'dispatched',
    };
    return <span className={`pill ${map[status] || 'draft'}`}>{status}</span>;
}
