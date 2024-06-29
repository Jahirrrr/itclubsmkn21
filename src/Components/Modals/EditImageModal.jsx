// EditImageModal.js
import React, { useState } from 'react';

const EditImageModal = ({ imageSrc, onImageChange, onSaveImage }) => {
    const [newImageSrc, setNewImageSrc] = useState(imageSrc);

    const handleSaveImage = () => {
        onSaveImage(newImageSrc);
    };

    return (
        <div className="edit-image-modal" >
            <br></br><br></br><br></br>
            <div className="edit-image-modal" 
        style = {
            {
             border: '6px solid #9c805b'
            }
          }>
            <br></br>
            <h4 style={{ color: '#9c805b' }}>Edit Image</h4>
            <br></br>
            <input type="file" accept="image/*" onChange={(e) => { setNewImageSrc(URL.createObjectURL(e.target.files[0])); onImageChange(e); }} />
            <br></br><br></br>
            <button onClick={handleSaveImage}>Save</button>
            <br></br><br></br>
            </div>
            <br></br>
        </div>
    );
};

export default EditImageModal;
