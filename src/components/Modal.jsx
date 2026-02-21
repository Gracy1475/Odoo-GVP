import { X } from 'lucide-react';

export default function Modal({ title, onClose, children, footer, wide }) {
    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-box" style={wide ? { maxWidth: 720 } : {}}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={16} /></button>
                </div>
                <div className="modal-body">{children}</div>
                {footer && <div className="modal-footer">{footer}</div>}
            </div>
        </div>
    );
}
