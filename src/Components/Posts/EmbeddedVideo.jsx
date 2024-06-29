import React from 'react';
import fire from '../../config/Fire';

class EmbeddedVideo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      videoId: this.extractVideoId(this.props.videoUrl),
    };
  }

  extractVideoId(url) {
    // Extract video ID from Dropbox URL
    // Misalnya, dari 'https://www.dropbox.com/s/abcd1234/video.mp4', kita dapatkan 'abcd1234'
    const match = url.match(/\/s\/([a-zA-Z0-9]+)/);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  }

  render() {
    const { videoId } = this.state;

    if (!videoId) {
      return <p>Video tidak valid</p>;
    }

    // URL embed video Dropbox
    const embedUrl = `https://www.dropbox.com/s/${videoId}/video.mp4?raw=1`;

    const postId = this.props.post.id;
    const { newVideoSrc } = this.state;
    if (newVideoSrc) {
        fire.firestore().collection('posts').doc(postId).update({ video: embedUrl})
        .then(() => {
            alert("New video URL saved to Storages", embedUrl);
            window.location.reload();
            this.setState({ isEditVideoModalOpen: false }); // Tutup modal setelah penyimpanan berhasil
        })
        .catch((error) => {
            alert("Error saving new video URL to Storage", error);
        });
    }

    return (
      <div>
        <video width="750" height="500" controls>
          <source src={embedUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }
}

export default EmbeddedVideo;