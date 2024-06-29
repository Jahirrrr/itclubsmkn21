import React from 'react';
import { Link } from 'react-router-dom';
import DeleteCommentButton from './DeleteCommentButton';
import EditCommentButton from './EditCommentButton';
import fire from '../../config/Fire';
import EditComment from './EditComment';
import VoteButton from '../VoteButton';
import { formatDistanceToNowStrict } from 'date-fns';
import NewComment from './NewComment';

export default class CommentTemplate extends React.Component {
    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = {
            editComment: false,
            reply: false,
            hideReplies: false,
            isAdmin: false,
        };
    }

    componentDidMount() {
        this._isMounted = true;
        this.checkAdminStatus();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    checkAdminStatus = () => {
        const { user } = this.props;

        if (user) {
            fire.firestore().collection('users').doc(user.uid).get().then(userDoc => {
                if (userDoc.exists) {
                    const isAdmin = userDoc.data().admin === true;
                    this.setState({ isAdmin });
                }
            });
        }
    };

    editComment = (value) => {
        this.setState({ editComment: value });
    }

    markAsEdited = () => {
        fire.firestore().collection('comments').doc(this.props.comment.id).update({ edited: true });
    }

    showReplyBox = (bool) => {
        this.setState({ reply: bool });
    }

    generateComment(isAdmin) {
        const { comment, user, postId, profile } = this.props;
        const parents = comment.data().parents || [];
        const nestDepth = comment.data().nestDepth;
        let currentUserComment = false;
        if (user && user.displayName === comment.data().creator) {
            currentUserComment = true;
        }

        return (
            <div style={{ marginLeft: `${nestDepth * 10 + 1}px` }} key={comment.id} className={`comment${nestDepth > 0 ? ' indent' : ''}`}>
                {[...Array(nestDepth).keys()].map(depth => (
                    <div key={`depth${depth + 1}`} className={`divider${depth + 1}`} />
                ))}
                <VoteButton collection='comments' doc={comment} />
                <Link to={`/profile/${comment.data().creator}`} className='user'>{comment.data().creator}</Link>
                <span className='distanceInWords'>{formatDistanceToNowStrict(comment.data().dateCreated.toDate(),
                    { addSuffix: true })}</span>
                {this.state.editComment ? <EditComment updateComments={this.props.updateComments} editComment={this.editComment} markAsEdited={this.markAsEdited} docId={comment.id} /> : <p className='body'>{comment.data().text} {comment.data().edited ? <span className='edited'>(edited)</span> : null}</p>}
                <div className='replyEditDeleteContainer'>
                    {nestDepth >= 4 ? null : <button className='replyButton' onClick={() => {
                        this.showReplyBox(true);
                        this.editComment(false);
                    }}>Reply</button>}
                    {(isAdmin || currentUserComment) ? (
                        <>
                            <EditCommentButton showReplyBox={this.showReplyBox} editComment={this.editComment} />
                            <DeleteCommentButton updateComments={this.props.updateComments} commentId={comment.id} postId={this.props.postId} />
                        </>
                    ) : null}
                </div>
                {this.state.reply ? <NewComment editComment={this.editComment} user={user} updateComments={this.props.updateComments} postId={postId} directParent={comment.id} parents={[...parents, comment.id]} highestParent={comment.data().highestParent || comment.id} nestDepth={nestDepth + 1} showReplyBox={this.showReplyBox} /> : null}
            </div>
        );
    }

    render() {
        const { isAdmin } = this.state;
        return this.generateComment(isAdmin);
    }
}
