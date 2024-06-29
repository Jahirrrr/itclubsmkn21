import React from 'react';
import fire from '../../config/Fire';

class EditLinkPost extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editedValue: '', // State untuk menyimpan nilai yang akan diedit
        };
        this.wrapperRef = React.createRef();
        this.handleClickOutside = this.handleClickOutside.bind(this);
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
        document.addEventListener('touchstart', this.handleClickOutside);

        // Mengambil nilai yang akan diedit dari Firestore dan mengisinya ke dalam state
        fire.firestore().collection('posts').doc(this.props.docId).get().then(docRef => {
            this.setState({ editedValue: docRef.data()[this.props.editField] });
        });
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
        document.removeEventListener('touchstart', this.handleClickOutside);
    }

    handleClickOutside(event) {
        if (this.wrapperRef && this.wrapperRef.current && !this.wrapperRef.current.contains(event.target)) {
            this.props.editPost(false);
        }
    }

    handleChange = (e) => {
        this.setState({ editedValue: e.target.value });
    }

    submitEdit = (e) => {
        e.preventDefault();

        const { docId, editField } = this.props;

        // Menyiapkan objek untuk mengirimkan perubahan ke Firestore
        const updateData = {};
        updateData[editField] = this.state.editedValue;

        // Mengirimkan perubahan ke Firestore
        fire.firestore().collection('posts').doc(docId).update(updateData).then(() => {
            this.props.markAsEdited();
            this.props.editPost(false);
            this.props.updatePosts();
        });
    }

    render() {
        return (
            <div ref={this.wrapperRef} className='editPostForm'>
                <p>EDIT {this.props.editField.toUpperCase()}</p>
                <textarea maxLength={200} name='editedValue' value={this.state.editedValue} onChange={this.handleChange}></textarea>
                <input type="submit" value="Save" onClick={this.submitEdit} />
                <button onClick={() => this.props.editPost(false)}>Cancel</button>
            </div>
        );
    }
}

export default EditLinkPost;

