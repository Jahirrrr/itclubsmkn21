// EditImageModal.js
import React, { useState } from 'react';

const EditVideoModal = ({ videoSrc, onVideoChange, onSaveVideo }) => {
    const [newVideoSrc, setNewVideoSrc] = useState(videoSrc);

    const handleSaveVideo = () => {
        onSaveVideo(newVideoSrc);
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
            <h4 style={{ color: '#9c805b' }}>Edit Video</h4>
            <br></br>
            <input type="file" accept="video/mp4,video/x-m4v,video/*" onChange={(e) => { setNewVideoSrc(URL.createObjectURL(e.target.files[0])); onVideoChange(e); }} />
            <br></br><br></br>
            <button onClick={handleSaveVideo}>Save</button>
            <br></br><br></br>
            </div>
            <br></br>
        </div>
    );
};

export default EditVideoModal;
