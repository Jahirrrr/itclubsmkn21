import React from 'react';
import fire from '../../config/Fire';
import { withRouter } from 'react-router-dom';

class ImageEditModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            disabled: false,
            isEditing: false,
            currentImage: null,
        };

        this.fileInput = React.createRef();
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const currentUser = fire.auth().currentUser;
        const size = this.fileInput.current.files[0].size / Math.pow(1024, 2);
        if (!currentUser) {
            alert('Must be logged in to post');
            return;
        } else if (size > 20) {
            alert('File must be less than 20MB');
            return;
        } else {
            fire
                .firestore()
                .collection('users')
                .doc(currentUser.uid)
                .get()
                .then((userRef) => userRef.data())
                .then((data) => {
                    if (data) {
                        if (!currentUser) {
                            alert('Insufficient user privileges to post images');
                        } else {
                            this.setState({ disabled: true });
                            fire
                                .firestore()
                                .collection('posts')
                                .add({
                                    type: 'image',
                                    dateCreated: new Date(),
                                    points: 0,
                                    title: this.state.title,
                                    uid: currentUser.uid,
                                    username: currentUser.displayName,
                                    group: this.props.selectedGroup,
                                    imageName: this.fileInput.current.files[0].name,
                                    commentCount: 0,
                                    votes: {},
                                })
                                .then((docRef) => {
                                    fire
                                        .storage()
                                        .ref(`users/${currentUser.uid}/${docRef.id}/${this.fileInput.current.files[0].name}`)
                                        .put(this.fileInput.current.files[0])
                                        .then((snapshot) => {
                                            snapshot.ref.getDownloadURL().then((url) => {
                                                docRef.update({
                                                    image: url,
                                                }).then(() => {
                                                    this.props.setModal();
                                                    this.props.history.push(`/group/${this.props.selectedGroup}/post/${docRef.id}`);
                                                });
                                            });
                                        });
                                })
                                .catch((error) => {
                                    console.error(error.message);
                                    this.setState({ disabled: false });
                                });
                        }
                    }
                });
        }
    };

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };

    handleEditImage = () => {
        this.setState({ isEditing: true, currentImage: this.props.post.data().image });
    };

    cancelEditImage = () => {
        this.setState({ isEditing: false, currentImage: null });
    };

    // Fungsi untuk mengganti gambar dalam postingan
    updateImageInFirestore = (downloadURL) => {
        fire
            .firestore()
            .collection('posts')
            .doc(this.props.post.id)
            .update({
                image: downloadURL,
            })
            .then(() => {
                this.setState({ isEditing: false, currentImage: null });
            });
    };

    // Fungsi untuk mengunggah gambar ke Firebase Storage
    uploadImageToStorage = () => {
        const { currentImage } = this.state;
        const { post } = this.props;

        if (currentImage) {
            const storageRef = fire.storage().ref();
            const imageRef = storageRef.child(`users/${post.data().uid}/${post.id}/${currentImage.name}`);

            imageRef.put(currentImage).then((snapshot) => {
                snapshot.ref.getDownloadURL().then((downloadURL) => {
                    this.updateImageInFirestore(downloadURL);
                });
            });
        }
    };

    render() {
        return (
            <div id='imageModal'>
                {this.state.isEditing ? (
                    <form onSubmit={this.uploadImageToStorage}>
                        <label htmlFor="title">
                            <input maxLength={300} value={this.state.title} onChange={this.handleChange} type="text" name="title" id="titleInput" placeholder='Title' required />
                        </label>
                        <label htmlFor="image">
                            <input type='file' accept="image/png, image/jpeg" name="image" id="imageInput" ref={this.fileInput} required />
                        </label>
                        <button onClick={this.cancelEditImage}>Cancel</button>
                        <input disabled={this.state.disabled} type="submit" value="Save Changes" />
                    </form>
                ) : (
                    <div>
                        <button onClick={this.handleEditImage}>Edit Image</button>
                    </div>
                )}
            </div>
        );
    }
}

export default withRouter(ImageEditModal);
