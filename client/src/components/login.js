import React, { useState } from "react";
import { withRouter, useHistory } from "react-router-dom";
import { Button, Form, FormGroup, FormControl } from "react-bootstrap";
import { api } from "../apis/apiCalls";
import "../styles/login.css";

const Login = (props) =>{
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [serverReply, setServerReply] = useState("");
  const [isValid, setIsValid] = useState(false);

  let history = useHistory();

  function validateForm() {
    setIsValid(email.length > 0 && password.length > 0);
  }

  const divStyle = {
    fontSize: "14px",
    color: "white",
    textAlign: "left"
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    api().post('/auth', {email, password}).then((resp) => {   
        setServerReply(JSON.stringify(resp, null, 4));
        if(resp.data.accessToken && resp.data.refreshToken){
          localStorage.setItem("jwt-access-token",resp.data.accessToken) // write to local storage
          localStorage.setItem("jwt-refresh-token",resp.data.refreshToken) // write to local storage
          props.handleLogin(true);
          history.push("/");
        }
        else{
          props.handleLogin(false);
        }
    }).catch(err=>console.log("Cannot send auth request.",err))
  }

  return (
    <div className="Login">
      <form onSubmit={handleSubmit}>
        <FormGroup controlId="email">
        <Form.Label>Email</Form.Label>
          <FormControl
            autoFocus
            type="email"
            value={email}
            onChange={e => {
              setEmail(e.target.value)
              validateForm();
            }}
          />
        </FormGroup>
        <FormGroup controlId="password">
        <Form.Label>Password</Form.Label>
          <FormControl
            value={password}
            onChange={e => {
              setPassword(e.target.value);
              validateForm();
            }}
            type="password"
          />
        </FormGroup>
        <Button block disabled={false} type="submit">
          Login
        </Button>
        <pre style={divStyle}><span style={divStyle}>{serverReply}</span></pre>
      </form>
    </div>
  );
}

export default withRouter(Login);