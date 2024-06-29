import React from 'react';
import DeletePostButton from './DeletePostButton';
import { Link, withRouter } from 'react-router-dom';
import fire from '../../config/Fire';
import EditPostButton from './EditPostButton';
import EditLinkPost from '../Modals/EditLinkPost';
import 'line-awesome/dist/line-awesome/css/line-awesome.min.css';
import VoteButton from '../VoteButton';
import { formatDistanceToNowStrict } from 'date-fns';
import axios from 'axios';
import { Dropbox } from 'dropbox'; // Import Dropbox SDK

// Import modals
import Modal from '../Modals/Modal.jsx';
import EditImageModal from '../Modals/EditImageModal.jsx';
import EditVideoModal from '../Modals/EditVideoModal.jsx'; // Import modal untuk mengedit video
import { faWindowRestore } from '@fortawesome/free-solid-svg-icons';

function createEmbed(file_path_display) {
    const accessToken = 'sl.BlwOiNawd3-n2fP6fGu5ydiyf8ML-UG9DgEnJXNBPM3LcYm3690y4c8KPSBZn-7k6DALXi6IR0hN4lKdosh141p8DlBhJncjoyUMFRWiTvmHFi_OWvK6G-890adqeHMFIRA9F9ybvdftZCvO4FPvGLo';
    const apiEndpoint = 'https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings';
    const headers = {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
    };
    
    const requestData = {
        path: file_path_display
    };
    
    axios.post(apiEndpoint, requestData, { headers })
    .then(response => {
        const embedLink = response.data.url.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
        console.log("Tautan Embed: ", embedLink);
    })
    .catch(error => {
        console.error("Terjadi kesalahan:", error);
    });
}


class PostTemplate extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editPost: false,
            isAdmin: false,
            location: this.props.location,
            editedTitle: '',
            editedLink: '',
            isEditImageModalOpen: false,
            isEditVideoModalOpen: false, // Menambahkan state untuk mengontrol modal pengeditan video
            newImageSrc: null,
            newVideoSrc: null, // Menyimpan tautan video yang akan diunggah
        };
    }

    componentDidMount() {
        if (this.props.user) {
            fire.firestore().collection('users').doc(this.props.user.uid).get().then(userRef => userRef.data())
                .then(data => {
                    if (data) {
                        if (data.admin) {
                            this.setState({ isAdmin: true });
                        }
                    }
                });
        }
    }

    editPost = (editType) => {
        this.setState({ editPost: editType });
    }

    markAsEdited = () => {
        fire.firestore().collection('posts').doc(this.props.post.id).update({ edited: true }).then();
    }

    getId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);

        return (match && match[2].length === 11)
            ? match[2]
            : null;
    }

    // Handle Image Upload
    handleImageUpload = async (e) => {
        const imageFile = e.target.files[0];
        const formData = new FormData();
        formData.append("image", imageFile);

        try {
            const response = await axios.post("https://api.imgbb.com/1/upload?key=85126d0a02bb0a7461c7c3e5ef545aac", formData);
            const imageUrl = response.data.data.url;

            // Simpan URL gambar yang baru diunggah
            this.setState({ newImageSrc: imageUrl });
        } catch (error) {
            console.error("Error uploading image:", error);
        }
    };

    // Handle Video Upload
    handleVideoUpload = async (e) => {
        const videoFile = e.target.files[0];
        const dbx = new Dropbox({ accessToken: "sl.BlwOiNawd3-n2fP6fGu5ydiyf8ML-UG9DgEnJXNBPM3LcYm3690y4c8KPSBZn-7k6DALXi6IR0hN4lKdosh141p8DlBhJncjoyUMFRWiTvmHFi_OWvK6G-890adqeHMFIRA9F9ybvdftZCvO4FPvGLo" }); // Gantilah dengan akses token Dropbox Anda
        const path = `/videos/${Date.now()}_${videoFile.name}`;
        const accessToken = 'sl.BlwOiNawd3-n2fP6fGu5ydiyf8ML-UG9DgEnJXNBPM3LcYm3690y4c8KPSBZn-7k6DALXi6IR0hN4lKdosh141p8DlBhJncjoyUMFRWiTvmHFi_OWvK6G-890adqeHMFIRA9F9ybvdftZCvO4FPvGLo';
        const apiEndpoint = 'https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings';
        const headers = {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
        };


        try {
            const response = await dbx.filesUpload({ path, contents: videoFile });
            const resp = response.result
            const videoUrl = response.result.path_display;
            const requestData = {
                path: videoUrl
            };

            axios.post(apiEndpoint, requestData, { headers })
            .then(responses => {
                const embedLink = responses.data.url.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
                console.log(embedLink);
                this.setState({ newVideoSrc: embedLink });
                console.log("Tautan Embed: " + embedLink);
            })

        } catch (error) {
            console.error("Error uploading video:", error);
        }
    };

    // Simpan URL gambar yang baru diunggah ke Firestore
    saveNewImageToFirestore = () => {
        const currentUser = fire.auth().currentUser;
        const postId = this.props.post.id;
        const { newImageSrc } = this.state;

        fire.firestore().collection('posts').doc(postId).get().then(docRef => {
            if (docRef.data().type === 'image') {
                fire.storage().ref(`users/${currentUser.uid}/${postId}/${docRef.data().imageName}`).delete();
                console.log(fire.storage().ref(`users/${currentUser.uid}/${postId}/${docRef.data().imageName}`))
                console.log("Gambar Telah Terhapus dan digantikan dengan Yang Baru !")
            }
        })

        if (newImageSrc) {
            fire.firestore().collection('posts').doc(postId).update({ image: newImageSrc })
                .then(() => {
                    alert("New image URL saved to Storage", newImageSrc);
                    window.location.reload();
                    this.setState({ isEditImageModalOpen: false }); // Tutup modal setelah penyimpanan berhasil
                })
                .catch((error) => {
                    alert("Error saving new image URL to Storage", error);
                });
        }
    };

    // Simpan URL video yang baru diunggah ke Firestore
    saveNewVideoToFirestore = () => {
        const currentUser = fire.auth().currentUser;
        const postId = this.props.post.id;
        const { newVideoSrc } = this.state;

        fire.firestore().collection('posts').doc(postId).get().then(docRef => {
            if (docRef.data().type === 'video') {
                fire.storage().ref(`users/${currentUser.uid}/${postId}/${docRef.data().videoName}`).delete();
                console.log(fire.storage().ref(`users/${currentUser.uid}/${postId}/${docRef.data().videoName}`))
                console.log("Gambar Telah Terhapus dan digantikan dengan Yang Baru !")
            }
        })

        if (newVideoSrc) {
            fire.firestore().collection('posts').doc(postId).update({ video: newVideoSrc })
                .then(() => {
                    console.log("EMBED = " + newVideoSrc);
                    alert("New video URL saved to Storage", newVideoSrc);
                    window.location.reload();
                    this.setState({ isEditVideoModalOpen: false }); // Tutup modal setelah penyimpanan berhasil
                })
                .catch((error) => {
                    alert("Error saving new video URL to Storage", error);
                });
        }
    };


    // Tampilkan modal edit foto
    openEditImageModal = () => {
        this.setState({ isEditImageModalOpen: true });
    };

    // Tampilkan modal edit video
    openEditVideoModal = () => {
        this.setState({ isEditVideoModalOpen: true });
    };

    // Tutup modal edit foto
    closeEditImageModal = () => {
        this.setState({ isEditImageModalOpen: false });
    };

    // Tutup modal edit video
    closeEditVideoModal = () => {
        this.setState({ isEditVideoModalOpen: false });
    };

    generatePost = () => {
        const post = this.props.post;
        const postData = this.props.post.data();
        let currentUserPost = false;
        if (this.props.user && this.props.user.uid === postData.uid) {
            currentUserPost = true;
        }
        if (postData.type === 'text') {
            return (
                <>
                    {postData.edited ? <span className='edited'>(edited)</span> : null}
                    <div className='postTitle'>
                        {currentUserPost && !this.props.profile ? (
                            <>
                                <button onClick={() => this.editPost('title')}>Edit Title</button>
                                <br></br><br></br>
                            </>
                        ) : null}
                        {this.state.editPost === 'title' ? (
                            <EditLinkPost
                                editField="title"
                                docId={post.id}
                                editPost={() => this.editPost(false)}
                                markAsEdited={this.markAsEdited}
                                updatePosts={this.props.updatePosts}
                                initialValue={postData.title}
                            />
                        ) : (
                            <>
                                {postData.title}
                                <br></br><br></br>
                            </>
                        )}
                    </div>
                    {this.state.editPost === 'body' ? (
                        <EditLinkPost
                            editField="body"
                            docId={post.id}
                            editPost={() => this.editPost(false)}
                            markAsEdited={this.markAsEdited}
                            updatePosts={this.props.updatePosts}
                            initialValue={postData.body}
                        />
                    ) : (
                        <>
                            <p className='postBody'>{postData.body}</p>
                            <br></br>
                        </>
                    )}
                    {currentUserPost && !this.props.profile ? (
                        <div align="right" className='editButton'>
                            <button align="right" onClick={() => this.editPost('body')}>Edit Post</button>
                            </div>
                    ) : null}
                </>
            );
        } else if (postData.type === 'image') {
            return (
                <>
                    {postData.edited ? <span className='edited'>(edited)</span> : null}
                    <div className='postTitle'>
                        {currentUserPost && !this.props.profile ? (
                            <>
                                <button onClick={() => this.editPost('title')}>Edit Title</button>
                                <br></br><br></br>
                            </>
                        ) : null}
                        {this.state.editPost === 'title' ? (
                            <EditLinkPost
                                editField="title"
                                docId={post.id}
                                editPost={() => this.editPost(false)}
                                markAsEdited={this.markAsEdited}
                                updatePosts={this.props.updatePosts}
                                initialValue={postData.title}
                            />
                        ) : (
                            <>
                                {postData.title}
                                <br></br><br></br>
                            </>
                        )}
                    </div>
                    {this.state.editPost === 'image' ? (
                        <Modal isOpen={this.state.isEditImageModalOpen} closeModal={this.closeEditImageModal}>
                            <EditImageModal
                                imageSrc={this.props.post.data().image || this.state.newImageSrc} // Menggunakan URL gambar yang ada atau yang baru diunggah
                                onImageChange={this.handleImageUpload} // Callback untuk mengubah gambar
                                onSaveImage={this.saveNewImageToFirestore} // Callback untuk menyimpan tautan gambar
                            />
                        </Modal>
                    ) : (
                        <div className='imageContainer'>
                            <img width='250px' src={postData.image} alt='Post image'></img>
                            <br></br>
                            {currentUserPost && !this.props.profile ? (
                                <Modal isOpen={this.state.isEditImageModalOpen} closeModal={this.closeEditImageModal}>
                                    <EditImageModal
                                        imageSrc={this.props.post.data().image || this.state.newImageSrc} // Menggunakan URL gambar yang ada atau yang baru diunggah
                                        onImageChange={this.handleImageUpload} // Callback untuk mengubah gambar
                                        onSaveImage={this.saveNewImageToFirestore} // Callback untuk menyimpan tautan gambar
                                    />
                                </Modal>
                            ) : null}
                        </div>
                    )}
                </>
            );
        } else if (postData.type === 'video') {
            return (
                <>
                    {postData.edited ? <span className='edited'>(edited)</span> : null}
                    <div className='postTitle'>
                        {currentUserPost && !this.props.profile ? (
                            <>
                                <button onClick={() => this.editPost('title')}>Edit Title</button>
                                <br></br><br></br>
                            </>
                        ) : null}
                        {this.state.editPost === 'title' ? (
                            <EditLinkPost
                                editField="title"
                                docId={post.id}
                                editPost={() => this.editPost(false)}
                                markAsEdited={this.markAsEdited}
                                updatePosts={this.props.updatePosts}
                                initialValue={postData.title}
                            />
                        ) : (
                            <>
                                {postData.title}
                                <br></br>
                            </>
                        )}
                    </div>
                    <div className='videoContainer'>
                        <video width="750" height="500" controls>
                            <source src={postData.video} type="video/mp4" />
                        </video>
                        {currentUserPost && !this.props.profile ? (
                            <Modal isOpen={this.state.isEditVideoModalOpen} closeModal={this.closeEditVideoModal}>
                            <EditVideoModal
                                videoSrc={this.props.post.data().video || this.state.newVideoSrc} // Menggunakan URL video yang ada atau yang baru diunggah
                                onVideoChange={this.handleVideoUpload} // Callback untuk mengubah video
                                onSaveVideo={this.saveNewVideoToFirestore} // Callback untuk menyimpan tautan video
                            />
                        </Modal>
                        ) : null}
                    </div>
                </>
            );
        } else if (postData.type === 'link') {
            return (
                <>
                    {postData.edited ? <span className='edited'>(edited)</span> : null}
                    <div className='postTitle'>
                        {currentUserPost && !this.props.profile ? (
                            <>
                                <button onClick={() => this.editPost('title')}>Edit Title</button>
                                <br></br><br></br>
                            </>
                        ) : null}
                        {this.state.editPost === 'title' ? (
                            <EditLinkPost
                                editField="title"
                                docId={post.id}
                                editPost={() => this.editPost(false)}
                                markAsEdited={this.markAsEdited}
                                updatePosts={this.props.updatePosts}
                                initialValue={postData.title}
                            />
                        ) : (
                            <>
                                {postData.title}
                                <br></br><br></br>
                            </>
                        )}
                    </div>
                    <div className='postLink'>
                        {this.state.editPost === 'link' ? (
                            <EditLinkPost
                                editField="link"
                                docId={post.id}
                                editPost={() => this.editPost(false)}
                                markAsEdited={this.markAsEdited}
                                updatePosts={this.props.updatePosts}
                                initialValue={postData.link}
                            />
                        ) : (
                            <>
                                {/(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/i.test(postData.link) ? (
                                    <div className='postLink youtube'>
                                        <iframe
                                            title={this.getId(postData.link)}
                                            src={`//www.youtube.com/embed/${this.getId(postData.link)}`}
                                            frameBorder="0"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                ) : (
                                    <>
                                        <a className='postLink' target='_blank' href={postData.link} rel="noopener noreferrer">
                                            {postData.link}
                                        </a>
                                    </>
                                )}
                            </>
                        )}
                        <br></br>
                        {currentUserPost && !this.props.profile ? (
                            <div className='editButtons'>
                                <button onClick={() => this.editPost('link')}>Edit Link</button>
                            </div>
                        ) : null}
                    </div>
                </>
            );
        }
    }

    render() {
        return (
            <div className={`postContainer ${this.props.post.data().type}`}>
                {this.state.location.pathname === '/' || this.state.location.pathname === '/feed' || this.state.location.pathname.includes('/post/') || this.state.location.pathname.includes('/profile/') ?
                    <div className='groupName'>
                        <Link to={`/group/${this.props.post.data().group}`}>{this.props.post.data().group}</Link>
                    </div>
                    : null}
                <div className='postedBy'>
                    <span className='user'>Posted by <Link to={`/profile/${this.props.post.data().username}`}>{this.props.post.data().username}</Link></span>
                    <span className='dividingDot'>·</span>
                    <span className='distanceInWords'>
                        {formatDistanceToNowStrict(this.props.post.data().dateCreated.toDate(), { addSuffix: true })}
                    </span>
                    <br></br>
                </div>
                <br></br>
                {this.props.profile ? null : <VoteButton collection='posts' doc={this.props.post} />}
                {this.generatePost()}
                {(this.props.user && this.props.user.uid === this.props.post.data().uid) || this.state.isAdmin ? <DeletePostButton profile={this.props.profile} updatePosts={this.props.updatePosts} docId={this.props.post.id} /> : null}
                <Link className='commentCount' to={`/group/${this.props.post.data().group}/post/${this.props.post.id}`}>
                    {this.props.post.data().commentCount === 1 ? `${this.props.post.data().commentCount} Comment` : `${this.props.post.data().commentCount} Comments`}
                </Link>
            </div>
        );
    }
}

export default withRouter(PostTemplate);
