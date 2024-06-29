import React from 'react';
import fire from '../../config/Fire';
import firebase from 'firebase/app'
export default class NewComment extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            comment: '',
            disabled: false
        }
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    handleChange = (e) => {
        if(this._isMounted){
        this.setState({ [e.target.name]: e.target.value });
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();
        
        const currentUser = fire.auth().currentUser;
        if (!currentUser) {
            alert('Must be logged in to comment')
        } else {
            this.setState({ disabled: true })
            fire.firestore().collection('comments').add({
                points: 0,
                creator: currentUser.displayName,
                text: this.state.comment,
                dateCreated: new Date(),
                postId: this.props.postId,
                votes: {},
                directParent: this.props.directParent,
                parents: this.props.parents,
                nestDepth: this.props.nestDepth,
                highestParent: this.props.highestParent
            }).then(() => {
                this.setState({ comment: '' });
                this.props.updateComments();
            }).then(() => {
                fire.firestore().collection('posts').doc(this.props.postId).update({ commentCount: firebase.firestore.FieldValue.increment(1) })
                this.setState({ disabled: false })
                if (this.props.showReplyBox) {
                    this.props.showReplyBox(false)
                }
            }).catch(error => {
                this.setState({ disabled: false });
                console.error(error.message);
            });
        }
    }


    render() {
        return (
            <form onSubmit={this.handleSubmit} className='newCommentForm'>
                <textarea maxLength={10000} required value={this.state.comment} name='comment' onChange={this.handleChange} id="commentTextArea" />
                <input disabled={this.state.disabled} type="submit" value="SUBMIT" />
                {this.props.showReplyBox ? <button onClick={() => this.props.showReplyBox(false)}>Cancel</button> : null}
            </form>
        );
    }
}