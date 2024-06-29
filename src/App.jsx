import React from 'react';
import fire from './config/Fire';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import Header from './Components/Header';
import Home from './Pages/Home';
import Group from './Pages/Group';
import Login from './Components/Modals/Login';
import Signup from './Components/Modals/Signup';
import UserProfile from './Pages/UserProfile';
import NewPostModal from './Components/Modals/NewPostModal';
import AllGroups from './Pages/AllGroups';
import Post from './Pages/Post';
import NewGroupModal from './Components/Modals/NewGroupModal';
import Settings from './Pages/Settings';
import SubscribedFeed from './Pages/SubscribedFeed';

import { faPlus as NewPostTab } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      currentUser: null,
      modal: null,
      posts: null,
      postLimit: 20,
      postLimitIncrement: 20,
      disableLoadMore: false,
      scrollPostButton: 'hidden',
      scrollY: 0,
      showNote: true
    }
    this.props.hideLoader();
    this.authListener = this.authListener.bind(this);
  }

  componentDidMount() {
    this.authListener();
    this.fetchPosts();
    const darkMode = localStorage.getItem('darkMode');
    darkMode === 'true' ? document.body.classList.add('dark-mode') : document.body.classList.remove('dark-mode')
  }


  authListener() {
    fire.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({ currentUser: user });
      } else {
        this.setState({ currentUser: null });
      }
    });
  }

  setModal = (modal) => {
    if (modal) {
      document.body.style.top = `-${window.scrollY}px`;
      document.body.style.position = 'fixed';
    }

    if (modal === 'login') {
      this.setState({ modal: <Login updateView={this.updateView} setModal={this.setModal} /> })
    } else if (modal === 'signup') {
      this.setState({ modal: <Signup authListener={this.authListener} setModal={this.setModal} /> })
    } else if (modal === 'text' || modal === 'image' || modal === "video" || modal === 'link') {
      if (this.state.currentUser) {
        this.setState({ modal: <NewPostModal updateView={this.updateView} setModal={this.setModal} tab={modal} /> })
      } else {
        alert('Must be signed in')
        this.setState({ modal: null })
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    } else if (modal === 'group') {
      this.setState({ modal: <NewGroupModal setModal={this.setModal} /> })
    } else {
      this.setState({ modal: null })
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
  }

  debounce(func, wait, immediate) {
    var timeout;
    return function () {
      var context = this, args = arguments;
      var later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };

  showNewPostButton = this.debounce(() => {
    
    if (window.scrollY > 200) {
      this.setState({ scrollPostButton: '' })
    } else {
      this.setState({ scrollPostButton: 'hidden' })
    }
  }, 250)

  hideNewPostButton = () => {
    this.setState({ scrollPostButton: 'hidden' });
  }

  fetchPosts = (newLimit) => {
    
    this.props.showLoader();
    fire.firestore().collection('posts').orderBy('dateCreated', 'desc')
      .limit(newLimit || this.state.postLimit).get().then(postsData => {
        
        if ((newLimit && postsData.docs.length === this.state.posts.length) || postsData.docs.length === 0) {
          this.setState({ disableLoadMore: true })
        }
        this.setState({
          posts: postsData.docs
        });
        this.props.hideLoader();
        

      });
    if (newLimit) this.setState({ postLimit: newLimit });
  }

  fetchNextPosts = () => {
    this.fetchPosts(this.state.postLimit + this.state.postLimitIncrement);
  }

  updateView() {
    window.location.reload(false);
  }

  render() {
    return (
      <Router>
        <Header updateView={this.updateView} authListener={this.authListener} user={this.state.currentUser} setModal={this.setModal} />
        {this.state.modal}
        <button id='scrollPostButton' className={this.state.scrollPostButton} onClick={() => this.setModal('text')}><FontAwesomeIcon icon={NewPostTab} /></button>
        <div id="note" className={this.state.showNote ? '' : 'hidden'}>
          Note: If you see any bug, you can contact at {" "}
          <a href="https://instagram.com/itclub.smkn21jkt" target='__blank' rel='noopener noreferrer'>ITClub21 Instagram</a>
          <button onClick={() => this.setState({showNote: false})}>x</button>
        </div>
        <Switch>
          <Route exact path='/'>
            <Home hideNewPostButton={this.hideNewPostButton} showNewPostButton={this.showNewPostButton} showLoader={this.props.showLoader} hideLoader={this.props.hideLoader} updatePosts={this.fetchPosts} disableLoadMore={this.state.disableLoadMore} loadMore={this.fetchNextPosts} posts={this.state.posts ? this.state.posts : null} setModal={this.setModal} />
          </Route>
          <Route exact path='/feed'>
            <SubscribedFeed hideNewPostButton={this.hideNewPostButton} showNewPostButton={this.showNewPostButton} showLoader={this.props.showLoader} hideLoader={this.props.hideLoader} postLimit={this.state.postLimit} setModal={this.setModal} user={this.state.currentUser} />
          </Route>
          <Route exact path='/profile/:userId' render={({ match }) => <UserProfile showLoader={this.props.showLoader} hideLoader={this.props.hideLoader} updatePosts={this.fetchPosts} userId={match.params.userId} />} />
          <Route exact path='/group/:groupId' render={({ match }) => <Group hideNewPostButton={this.hideNewPostButton} showNewPostButton={this.showNewPostButton} showLoader={this.props.showLoader} hideLoader={this.props.hideLoader} postLimit={this.state.postLimit} updatePosts={this.fetchPosts} group={match.params.groupId} setModal={this.setModal} currentUser={this.state.currentUser} />} />
          <Route exact path='/groups'>
            <AllGroups showLoader={this.props.showLoader} hideLoader={this.props.hideLoader} />
          </Route>
          <Route exact path='/group/:groupId/post/:postId' render={({ match }) => <Post showLoader={this.props.showLoader} hideLoader={this.props.hideLoader} currentUser={this.state.currentUser} updatePosts={this.fetchPosts} postId={match.params.postId} />} />
          <Route exact path='/settings'>
            <Settings showLoader={this.props.showLoader} hideLoader={this.props.hideLoader} currentUser={this.state.currentUser} />
          </Route>
          <Route render={() => 

          <h1 style={{ textAlign: 'center' }}>404 Error : Nyari apa kak?</h1>

          } />
        </Switch>


      </Router>
    );
  }
}


