//import React from "react";
import AuthService from '../services/auth.service';
import Login from './Login';

const Profile = () => {
  const currentUser = AuthService.getCurrentUser();

  return (
    <div className="container">
      {!currentUser ? (
        <Login></Login>
      ) : (
        <>
          <div>currentUser</div>
        </>
      )}
    </div>
  );
};

export default Profile;
