//import React from "react";
import AuthService from '../services/auth.service';

const Profile = () => {
  const currentUser = AuthService.getCurrentUser();

  return (
    <div className="container">
      <header className="jumbotron">
        <h3>
          <strong>{currentUser}</strong> Profile
        </h3>
      </header>
      <p></p>
      <p>
        <strong>Id:</strong> {currentUser}
      </p>
      <p>
        <strong>Email:</strong> {currentUser}
      </p>
      <strong>Authorities:</strong>
    </div>
  );
};

export default Profile;
