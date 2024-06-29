// Modal.js
import React from 'react';

const Modal = ({ isOpen, closeModal, children }) => {
    return (
        <div className={`modal ${isOpen ? 'open' : ''}`}>
            <div className="modal-content">
                {children}
            </div>
        </div>
    );
};

export default Modal;
