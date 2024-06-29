import React from 'react';
import fire from '../../config/Fire';
import firebase from 'firebase/app';
export default class DeleteCommentButton extends React.Component {

    handleClick = () => {
        let confirm = window.confirm("Are you sure you want to delete this comment?");

        if (confirm) {
            
            fire.firestore().collection('comments').doc(this.props.commentId).delete().then(
                fire.firestore().collection('posts').doc(this.props.postId).update({
                    commentCount: firebase.firestore.FieldValue.increment(-1)
                })
            )
                .catch(error => console.error(error.message))
            fire.firestore().collection('comments').where('parents', 'array-contains', this.props.commentId).get().then(replies => {
                replies.forEach(reply => {
                    fire.firestore().collection('comments').doc(reply.id).delete();
                })
                fire.firestore().collection('posts').doc(this.props.postId).update({
                    commentCount: firebase.firestore.FieldValue.increment(-replies.docs.length)
                })
            }).then(this.props.updateComments)

        }
    }

    render() {
        return (
            <button className='deleteCommentButton' onClick={this.handleClick}>
                Delete
            </button>
        );
    }
}