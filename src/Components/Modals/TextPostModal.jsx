import React from 'react';
import fire from '../../config/Fire';
import { withRouter } from 'react-router-dom';
class TextPostModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            body: '',
            disabled: false,
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const currentUser = fire.auth().currentUser;
        if (!currentUser) {
            alert('Must be logged in to post')
        } else {
            this.setState({disabled: true});
            fire.firestore().collection('posts').add({
                type: 'text',
                body: this.state.body,
                dateCreated: new Date(),
                points: 0,
                title: this.state.title,
                uid: currentUser.uid,
                username: currentUser.displayName,
                group: this.props.selectedGroup,
                commentCount: 0,
                votes: {}
            }).then((post) => {
                this.props.setModal();
                this.props.history.push(`/group/${this.props.selectedGroup}/post/${post.id}`);
            }).catch(error => {
                console.error(error.message);
                this.setState({disabled: false})
            })
        }
    }

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }

    render() {
        return (
            <div id='textModal'>
                <form onSubmit={this.handleSubmit}>
                    <label htmlFor="title">
                        <input maxLength={300} value={this.state.title} onChange={this.handleChange} type="text" name="title" id="titleInput" placeholder='Title' required />
                    </label>
                    <label htmlFor="body">
                        <textarea maxLength={10000} value={this.state.body} onChange={this.handleChange} name="body" id="bodyTextArea" placeholder='Text (optional)' />
                    </label>
                    <input disabled={this.state.disabled} type="submit" value="POST" />
                </form>
            </div>
        );
    }
}

export default withRouter(TextPostModal)